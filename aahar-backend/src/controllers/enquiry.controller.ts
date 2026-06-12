import prisma from "../lib/prisma.js";
import { getIO }         from "../socket.js";
import {
  ok, created, badRequest, notFound, serverError, forbidden
} from "../utils/response.js";

// POST /api/enquiries
export const createEnquiry = async (req: any, res: any) => {
  try {
    const {
      hotelId, roomTypeId, checkIn, checkOut,
      adults = 2, children = 0, mealPlan,
      specialRequirements
    } = req.body;

    if (!hotelId || !checkIn || !checkOut)
      return badRequest(res, "hotelId, checkIn and checkOut are required");

    if (new Date(checkIn) >= new Date(checkOut))
      return badRequest(res, "checkOut must be after checkIn");

    if (new Date(checkIn) < new Date())
      return badRequest(res, "checkIn cannot be in the past");

    const hotel = await prisma.hotel.findUnique({
      where:   { id: hotelId },
      include: { manager: { select:{ id:true, name:true, phone:true } } }
    });
    if (!hotel) return notFound(res, "Hotel not found");

    // Auto-expire after 72 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const enquiry = await prisma.enquiry.create({
      data: {
        hotelId,
        guestId:            req.user.id,
        roomTypeId:         roomTypeId  || null,
        checkIn:            new Date(checkIn),
        checkOut:           new Date(checkOut),
        adults:             Number(adults),
        children:           Number(children),
        mealPlan:           mealPlan    || null,
        specialRequirements: specialRequirements || null,
        status:             "sent",
        expiresAt,
      },
      include: {
        guest:    { select:{ id:true, name:true, email:true, phone:true } },
        hotel:    { select:{ id:true, name:true, city:true, slug:true } },
        roomType: { select:{ id:true, name:true, bedConfig:true } },
        messages: true,
      }
    });

    // Emit real-time event to hotel manager's room
    const io = getIO();
    io.to(`hotel_${hotelId}`).emit("new_enquiry", {
      enquiry,
      message: `New enquiry from ${enquiry.guest.name} for ${new Date(checkIn).toLocaleDateString("en-IN")}`,
    });

    // Also emit to admin room
    io.to("admin_room").emit("new_enquiry", { enquiry });

    // Save notification in DB
    await prisma.notification.create({
      data: {
        userId:    hotel.manager.id,
        type:      "new_enquiry",
        title:     "New room enquiry",
        message:   `${enquiry.guest.name} enquired for ${new Date(checkIn).toLocaleDateString("en-IN")}`,
        actionUrl: `/hotel-manager/enquiries/${enquiry.id}`,
      }
    });

    // Send email to manager
    const { sendEmail, emailTemplates } = await import("../services/email.service.js");
    const managerUser = await prisma.user.findUnique({ where:{ id:hotel.manager.id } });
    if (managerUser?.email) {
      const tpl = emailTemplates.newEnquiry(
        hotel.manager.name,
        enquiry.guest.name,
        new Date(checkIn),
        new Date(checkOut),
        enquiry.roomType?.name ?? "Any room",
        enquiry.id
      );
      await sendEmail(managerUser.email, tpl.subject, tpl.html);
    }

    // Send WhatsApp to manager
    const { sendWhatsApp, waMessages } = await import("../services/whatsapp.service.js");
    if (hotel.manager.phone) {
      await sendWhatsApp(
        hotel.manager.phone,
        waMessages.newEnquiry(
          enquiry.guest.name,
          new Date(checkIn).toLocaleDateString("en-IN"),
          hotel.name,
          `${process.env.APP_URL}/hotel-manager/enquiries/${enquiry.id}`
        )
      );
    }

    return created(res, enquiry, "Enquiry submitted successfully");
  } catch (e) { return serverError(res, e); }
};

// GET /api/enquiries
export const listEnquiries = async (req: any, res: any) => {
  try {
    const {
      status, hotelId,
      page = 1, limit = 20
    } = req.query;

    const role  = req.user.role;
    const where: any = {};
    const skip  = (Number(page) - 1) * Number(limit);

    // Role-based filtering
    if (role === "consumer") {
      where.guestId = req.user.id;
    } else if (role === "hotel_manager") {
      // Find hotels managed by this user
      const hotels = await prisma.hotel.findMany({
        where:  { managerId: req.user.id },
        select: { id: true }
      });
      where.hotelId = { in: hotels.map(h => h.id) };
    } else if (["admin","super_admin"].includes(role)) {
      if (hotelId) where.hotelId = hotelId;
    } else {
      return forbidden(res, "Not authorized to view enquiries");
    }

    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take:     Number(limit),
        orderBy:  { createdAt: "desc" },
        include: {
          guest:    { select:{ id:true, name:true, email:true, phone:true } },
          hotel:    { select:{ id:true, name:true, city:true, slug:true } },
          roomType: { select:{ id:true, name:true, bedConfig:true } },
          messages: { orderBy:{ sentAt:"asc" }, include:{ sender:{ select:{ id:true, name:true, role:true } } } },
        }
      }),
      prisma.enquiry.count({ where }),
    ]);

    return ok(res, {
      items, total,
      page:       Number(page),
      pageSize:   Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (e) { return serverError(res, e); }
};

// GET /api/enquiries/:id
export const getEnquiry = async (req: any, res: any) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where:   { id: req.params.id },
      include: {
        guest:    { select:{ id:true, name:true, email:true, phone:true } },
        hotel:    { select:{ id:true, name:true, city:true, phone:true, slug:true } },
        roomType: { select:{ id:true, name:true, bedConfig:true, maxOccupancy:true } },
        messages: {
          orderBy: { sentAt: "asc" },
          include: { sender:{ select:{ id:true, name:true, role:true } } }
        },
      }
    });

    if (!enquiry) return notFound(res, "Enquiry not found");

    // Access check
    const role = req.user.role;
    const isGuest   = enquiry.guestId === req.user.id;
    const isAdmin   = ["admin","super_admin"].includes(role);

    let isManager = false;
    if (role === "hotel_manager") {
      const hotel = await prisma.hotel.findUnique({ where:{ id:enquiry.hotelId } });
      isManager = hotel?.managerId === req.user.id;
    }

    if (!isGuest && !isAdmin && !isManager)
      return forbidden(res, "Not authorized to view this enquiry");

    // Mark as viewed if hotel manager opens it
    if (isManager && enquiry.status === "sent") {
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data:  { status: "viewed" }
      });
      enquiry.status = "viewed" as any;

      // Notify guest
      const io = getIO();
      io.to(`user_${enquiry.guestId}`).emit("enquiry_status_changed", {
        enquiryId: enquiry.id,
        status:    "viewed",
      });
    }

    return ok(res, enquiry);
  } catch (e) { return serverError(res, e); }
};

// POST /api/enquiries/:id/messages
export const sendMessage = async (req: any, res: any) => {
  try {
    const { content, isSystem = false } = req.body;
    if (!content?.trim()) return badRequest(res, "Message content is required");

    const enquiry = await prisma.enquiry.findUnique({
      where:   { id: req.params.id },
      include: { hotel: { select:{ managerId:true } } }
    });
    if (!enquiry) return notFound(res, "Enquiry not found");

    if (["confirmed","declined","expired"].includes(enquiry.status))
      return badRequest(res, "Cannot send messages on a closed enquiry");

    const message = await prisma.enquiryMessage.create({
      data: {
        enquiryId: enquiry.id,
        senderId:  req.user.id,
        content:   content.trim(),
        isSystem,
      },
      include: { sender:{ select:{ id:true, name:true, role:true } } }
    });

    // Emit to both parties
    const io = getIO();
    const targetRoom = req.user.id === enquiry.guestId
      ? `hotel_${enquiry.hotelId}`   // manager gets it
      : `user_${enquiry.guestId}`;   // guest gets it

    io.to(targetRoom).emit("new_message", {
      enquiryId: enquiry.id,
      message,
    });

    // Also update the other party's notification
    io.to("admin_room").emit("new_message", { enquiryId:enquiry.id, message });

    return created(res, message, "Message sent");
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/enquiries/:id/status
export const updateEnquiryStatus = async (req: any, res: any) => {
  try {
    const { status, quoteAmount, bookingLink, reason } = req.body;

    const validStatuses = ["viewed","quoted","confirmed","declined"];
    if (!validStatuses.includes(status))
      return badRequest(res, "Invalid status");

    const enquiry = await prisma.enquiry.findUnique({
      where:   { id: req.params.id },
      include: {
        hotel:    { select:{ managerId:true, name:true } },
        guest:    { select:{ id:true, name:true } },
        roomType: { select:{ name:true } },
      }
    });
    if (!enquiry) return notFound(res, "Enquiry not found");

    // Only hotel manager or admin can update status
    const isManager = enquiry.hotel.managerId === req.user.id;
    const isAdmin   = ["admin","super_admin"].includes(req.user.role);
    if (!isManager && !isAdmin)
      return forbidden(res, "Only the property manager can update this enquiry");

    if (status === "quoted" && !quoteAmount)
      return badRequest(res, "quoteAmount is required when sending a quote");

    const updated = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(quoteAmount  && { quoteAmount:  Number(quoteAmount) }),
        ...(bookingLink  && { bookingLink }),
      },
      include: {
        guest:    { select:{ id:true, name:true } },
        hotel:    { select:{ id:true, name:true } },
        roomType: { select:{ id:true, name:true } },
        messages: { orderBy:{ sentAt:"asc" } },
      }
    });

    // Add system message to thread
    const systemMessages: Record<string, string> = {
      quoted:    `Rate quoted: ₹${quoteAmount?.toLocaleString("en-IN")} — ${enquiry.hotel.name}`,
      confirmed: "Booking confirmed by the property. Check your email for details.",
      declined:  reason ? `Enquiry declined: ${reason}` : "Enquiry declined by the property.",
    };
    if (systemMessages[status]) {
      await prisma.enquiryMessage.create({
        data: {
          enquiryId: enquiry.id,
          senderId:  req.user.id,
          content:   systemMessages[status],
          isSystem:  true,
        }
      });
    }

    // Emit real-time status update to guest
    const io = getIO();
    io.to(`user_${enquiry.guestId}`).emit("enquiry_status_changed", {
      enquiryId: enquiry.id,
      status,
      quoteAmount: quoteAmount ?? null,
      bookingLink: bookingLink ?? null,
    });

    // Create DB notifications for the guest
    if (status === "quoted") {
      await prisma.notification.create({
        data: {
          userId:    enquiry.guestId,
          type:      "enquiry_response",
          title:     "Rate quote received",
          message:   `${enquiry.hotel.name} has quoted ₹${quoteAmount?.toLocaleString("en-IN")}`,
          actionUrl: `/enquiries/${enquiry.id}`,
        }
      });
    } else if (status === "confirmed") {
      await prisma.notification.create({
        data: {
          userId:    enquiry.guestId,
          type:      "enquiry_response",
          title:     "Booking confirmed!",
          message:   `Your stay at ${enquiry.hotel.name} is confirmed.`,
          actionUrl: `/enquiries/${enquiry.id}`,
        }
      });
    }

    return ok(res, updated, `Enquiry ${status}`);
  } catch (e) { return serverError(res, e); }
};
