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
        status:             hotel.approvalPreference === "instant" ? "confirmed" : "sent",
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
      type: hotel.approvalPreference === "manual_30m" ? "review_required_30m" : "instant_approved",
      message: hotel.approvalPreference === "manual_30m" 
        ? `ACTION REQUIRED: You have 30 minutes to review a new booking from ${enquiry.guest.name} for ${new Date(checkIn).toLocaleDateString("en-IN")} before it is auto-verified.`
        : `New auto-verified booking from ${enquiry.guest.name} for ${new Date(checkIn).toLocaleDateString("en-IN")}`,
    });

    // Also emit to admin room
    io.to("admin_room").emit("new_enquiry", { enquiry });

    // Save notification in DB
    if (hotel.manager) {
      await prisma.notification.create({
        data: {
          userId:    hotel.manager.id,
          type:      "new_enquiry",
          title:     hotel.approvalPreference === "manual_30m" ? "Urgent: 30-Min Booking Review" : "New Verified Booking",
          message:   hotel.approvalPreference === "manual_30m"
            ? `${enquiry.guest.name} booked for ${new Date(checkIn).toLocaleDateString("en-IN")}. You have 30 mins to cancel before auto-verification.`
            : `${enquiry.guest.name} booked for ${new Date(checkIn).toLocaleDateString("en-IN")}. Automatically verified.`,
          actionUrl: `/hotel-manager/enquiries/${enquiry.id}`,
        }
      });
    }

    // Send email to manager
    const { sendEmail, emailTemplates } = await import("../services/email.service.js");
    if (hotel.manager) {
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
    }

    // Send WhatsApp to manager
    const { sendWhatsApp, waMessages } = await import("../services/whatsapp.service.js");
    if (hotel.manager?.phone) {
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
      status, hotelId, upcoming,
      page = 1, limit = 20
    } = req.query;

    const role  = req.user.role;
    const where: any = {};
    const skip  = (Number(page) - 1) * Number(limit);

    // Role-based filtering
    if (role === "consumer") {
      where.guestId = req.user.id;
    } else if (role === "manager") {
      // Find hotels managed by this user
      const hotels = await prisma.hotel.findMany({
        where:  { managerId: req.user.id },
        select: { id: true }
      });
      where.hotelId = { in: hotels.map(h => h.id) };
    } else if (role === "owner") {
      const hotels = await prisma.hotel.findMany({
        where:  { ownerId: req.user.id },
        select: { id: true }
      });
      where.hotelId = { in: hotels.map(h => h.id) };
    } else if (["admin","super_admin"].includes(role)) {
      if (hotelId) where.hotelId = hotelId;
    } else {
      return forbidden(res, "Not authorized to view enquiries");
    }

    if (status) where.status = status;

    if (upcoming === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.checkOut = { gte: today };
    }

    const orderBy = upcoming === "true" ? { checkIn: "asc" } : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take:     Number(limit),
        orderBy:  orderBy as any,
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
    if (role === "manager") {
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

    // Hotel manager or admin can update status; guest can cancel (decline) their own booking
    const isManager = enquiry.hotel.managerId === req.user.id;
    const isAdmin   = ["admin","super_admin"].includes(req.user.role);
    const isGuest   = enquiry.guestId === req.user.id;

    if (!isManager && !isAdmin && !(isGuest && status === "declined"))
      return forbidden(res, "Only the property manager or guest (for cancellation) can update this enquiry");

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
      declined:  isGuest
        ? (reason ? `Booking cancelled by guest: ${reason}` : "Booking cancelled by guest.")
        : (reason ? `Enquiry declined: ${reason}` : "Enquiry declined by the property."),
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

    // Emit real-time status update to both guest and hotel rooms
    const io = getIO();
    io.to(`user_${enquiry.guestId}`).emit("enquiry_status_changed", {
      enquiryId: enquiry.id,
      status,
      quoteAmount: quoteAmount ?? null,
      bookingLink: bookingLink ?? null,
      reason: reason ?? null
    });
    io.to(`hotel_${enquiry.hotelId}`).emit("enquiry_status_changed", {
      enquiryId: enquiry.id,
      status,
      reason: reason ?? null
    });

    // Create DB notifications
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
    } else if (status === "declined") {
      if (isGuest && enquiry.hotel.managerId) {
        await prisma.notification.create({
          data: {
            userId:    enquiry.hotel.managerId,
            type:      "enquiry_response",
            title:     "Booking Cancelled by Guest",
            message:   `${enquiry.guest.name} has cancelled their booking for ${enquiry.hotel.name}.`,
            actionUrl: `/manager/enquiries`,
          }
        });
      } else if (!isGuest) {
        await prisma.notification.create({
          data: {
            userId:    enquiry.guestId,
            type:      "enquiry_response",
            title:     "Booking Declined",
            message:   `${enquiry.hotel.name} was unable to confirm your booking.`,
            actionUrl: `/account`,
          }
        });
      }
    }

    return ok(res, updated, isGuest && status === "declined" ? "Booking cancelled successfully" : `Enquiry ${status}`);
  } catch (e) { return serverError(res, e); }
};
