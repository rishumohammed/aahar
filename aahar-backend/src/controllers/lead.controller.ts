import prisma from "../lib/prisma.js";
import { getIO } from "../socket.js";
import { ok, created, badRequest, serverError, forbidden, notFound } from "../utils/response.js";
import bcrypt from "bcryptjs";
import { uniqueSlug } from "../utils/slugify.js";

// POST /api/leads
export const createLead = async (req: any, res: any) => {
  try {
    const {
      enquiryType, entityType, entityName, address,
      location, city, district, state,
      applicantName, email, phone, secondaryPhone
    } = req.body;

    if (!enquiryType || !entityType || !entityName || !applicantName || !email || !phone) {
      return badRequest(res, "Missing required fields");
    }

    const lead = await prisma.businessLead.create({
      data: {
        enquiryType,
        entityType,
        entityName,
        address,
        location,
        city,
        district,
        state,
        applicantName,
        email,
        phone,
        secondaryPhone,
        status: "pending",
      }
    });

    // Emit real-time event to admin
    const io = getIO();
    io.to("admin_room").emit("new_lead", {
      lead,
      message: `New ${enquiryType === "get_certified" ? "certification" : "listing"} enquiry from ${applicantName} (${entityName})`,
    });

    return created(res, lead, "Enquiry submitted successfully");
  } catch (e) {
    return serverError(res, e);
  }
};

// GET /api/leads
export const listLeads = async (req: any, res: any) => {
  try {
    const { status, enquiryType, page = 1, limit = 20, search } = req.query;
    
    // Only admins can view leads
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to view leads");
    }

    const where: any = {};
    if (status) where.status = status;
    if (enquiryType) where.enquiryType = enquiryType;
    if (search) {
      where.OR = [
        { entityName: { contains: search } },
        { applicantName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.businessLead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.businessLead.count({ where }),
    ]);

    return ok(res, {
      items,
      total,
      page: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (e) {
    return serverError(res, e);
  }
};

// GET /api/leads/:id
export const getLead = async (req: any, res: any) => {
  try {
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to view leads");
    }

    const lead = await prisma.businessLead.findUnique({
      where: { id: req.params.id }
    });

    if (!lead) return notFound(res, "Lead not found");

    return ok(res, lead);
  } catch (e) {
    return serverError(res, e);
  }
};

// PATCH /api/leads/:id/status
export const updateLeadStatus = async (req: any, res: any) => {
  try {
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to update leads");
    }

    const { status } = req.body;
    const validStatuses = ["pending", "contacted", "converted", "rejected"];
    if (!validStatuses.includes(status)) {
      return badRequest(res, "Invalid status");
    }

    const lead = await prisma.businessLead.update({
      where: { id: req.params.id },
      data: { status }
    });

    return ok(res, lead, `Lead status updated to ${status}`);
  } catch (e) {
    return serverError(res, e);
  }
};

// PATCH /api/leads/:id
export const updateLead = async (req: any, res: any) => {
  try {
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to update leads");
    }

    const {
      enquiryType, entityType, entityName, address,
      location, city, district, state,
      applicantName, email, phone, secondaryPhone
    } = req.body;

    const lead = await prisma.businessLead.update({
      where: { id: req.params.id },
      data: {
        enquiryType, entityType, entityName, address,
        location, city, district, state,
        applicantName, email, phone, secondaryPhone
      }
    });

    return ok(res, lead, "Lead updated successfully");
  } catch (e) {
    return serverError(res, e);
  }
};

// DELETE /api/leads/:id
export const deleteLead = async (req: any, res: any) => {
  try {
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to delete leads");
    }

    await prisma.businessLead.delete({
      where: { id: req.params.id }
    });

    return ok(res, null, "Lead deleted successfully");
  } catch (e) {
    return serverError(res, e);
  }
};

// POST /api/leads/:id/convert
export const convertLead = async (req: any, res: any) => {
  try {
    const role = req.user.role;
    if (!["admin", "super_admin"].includes(role)) {
      return forbidden(res, "Not authorized to convert leads");
    }

    const lead = await prisma.businessLead.findUnique({
      where: { id: req.params.id }
    });

    if (!lead) return notFound(res, "Lead not found");
    if (lead.status === "converted") return badRequest(res, "Lead is already converted");

    const defaultPassword = "Aahar@12345";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find User
      let user = await tx.user.findUnique({ where: { email: lead.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: lead.email,
            name: lead.applicantName,
            phone: lead.phone,
            passwordHash,
            role: lead.entityType === "hotel" ? "hotel_manager" : "owner",
          }
        });
      }

      // 2. Create or Find Establishment
      let restaurant = null;
      let hotel = null;

      if (lead.entityType === "restaurant") {
        restaurant = await tx.restaurant.findFirst({
          where: { ownerId: user.id, phone: lead.phone }
        });

        if (!restaurant) {
          const slug = await uniqueSlug(tx as any, "restaurant", lead.entityName);
          restaurant = await tx.restaurant.create({
            data: {
              name: lead.entityName,
              slug,
              address: lead.address,
              city: lead.city,
              area: lead.location,
              phone: lead.phone,
              email: lead.email,
              ownerId: user.id,
            }
          });
        }
      } else {
        hotel = await tx.hotel.findFirst({
          where: { managerId: user.id, phone: lead.phone }
        });

        if (!hotel) {
          const slug = await uniqueSlug(tx as any, "hotel", lead.entityName);
          hotel = await tx.hotel.create({
            data: {
              name: lead.entityName,
              slug,
              address: lead.address,
              city: lead.city,
              area: lead.location,
              phone: lead.phone,
              email: lead.email,
              managerId: user.id,
            }
          });
        }
      }

      // 3. Optional Draft Application
      let application = null;
      if (lead.enquiryType === "get_certified") {
        // Check if application already exists for this establishment
        application = await tx.application.findFirst({
          where: {
            applicantId: user.id,
            ...(restaurant ? { restaurantId: restaurant.id } : {}),
            ...(hotel ? { hotelId: hotel.id } : {})
          }
        });

        if (!application) {
          application = await tx.application.create({
            data: {
              businessType: lead.entityType === "restaurant" ? "fnb" : "accommodation",
              restaurantId: restaurant?.id || null,
              hotelId: hotel?.id || null,
              applicantId: user.id,
              status: "draft",
            }
          });
        }
      }

      // 4. Update Lead Status
      const updatedLead = await tx.businessLead.update({
        where: { id: lead.id },
        data: { status: "converted" }
      });

      return { user, restaurant, hotel, application, updatedLead };
    });

    return ok(res, {
      credentials: {
        email: result.user.email,
        password: defaultPassword,
      },
      message: `Successfully provisioned ${lead.entityType} and user account.`,
      applicationId: result.application?.id
    }, "Lead converted and provisioned successfully");

  } catch (e) {
    return serverError(res, e);
  }
};

