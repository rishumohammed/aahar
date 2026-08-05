import prisma from "../lib/prisma.js";
import { ok, badRequest, notFound, serverError } from "../utils/response.js";
import bcrypt from "bcryptjs";

// GET /api/admin/users
export const listUsers = async (req: any, res: any) => {
  try {
    const { role, q, page = 1, limit = 100 } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, createdAt: true, phone: true,
          restaurants: { select: { id: true, name: true, city: true, isActive: true } },
          hotels: { select: { id: true, name: true, city: true, isActive: true } }
        }
      }),
      prisma.user.count({ where }),
    ]);

    return ok(res, { items, total });
  } catch (e) { return serverError(res, e); }
};

// GET /api/admin/users/:id
export const getUser = async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, 
        isActive: true, createdAt: true, phone: true,
        restaurants: { select: { id: true, name: true, city: true, isActive: true, email: true, area: true, isVerified: true } },
        hotels: { select: { id: true, name: true, city: true, isActive: true, email: true, area: true, isVerified: true } }
      }
    });
    if (!user) return notFound(res, "User not found");
    return ok(res, user);
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/admin/users/:id
export const updateUser = async (req: any, res: any) => {
  try {
    const { role, isActive, name, email, phone } = req.body;
    const item = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, isActive, name, email, phone },
      select: { id: true, name: true, email: true, role: true, isActive: true, phone: true }
    });
    return ok(res, item, "User updated");
  } catch (e) { return serverError(res, e); }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Prevent deleting self (assuming req.user.id is the admin's id)
    if (req.user && req.user.id === id) {
      return badRequest(res, "Cannot delete your own account");
    }

    // Manually delete associated records to prevent foreign key constraint failures
    await prisma.$transaction([
      prisma.applicationMessage.deleteMany({ where: { senderId: id } }),
      prisma.enquiryMessage.deleteMany({ where: { senderId: id } }),
      prisma.enquiry.deleteMany({ where: { guestId: id } }),
      prisma.audit.deleteMany({ where: { auditorId: id } }),
      prisma.payment.deleteMany({ where: { userId: id } }),
      prisma.blogPost.deleteMany({ where: { authorId: id } }),
      prisma.application.deleteMany({ where: { applicantId: id } }),
      prisma.hotel.deleteMany({ where: { ownerId: id } }),
      prisma.restaurant.deleteMany({ where: { ownerId: id } }),
      prisma.hotel.updateMany({ where: { managerId: id }, data: { managerId: null } }),
      prisma.restaurant.updateMany({ where: { managerId: id }, data: { managerId: null } }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return ok(res, null, "User deleted successfully");
  } catch (e: any) {
    // Handle Prisma Foreign Key Constraint Failure (P2003)
    if (e.code === 'P2003') {
      return badRequest(res, "Cannot delete user. They have associated records (e.g., establishments, applications). Please deactivate them instead.");
    }
    return serverError(res, e);
  }
};

// POST /api/admin/users/:id/reset-password
export const resetUserPassword = async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return notFound(res, "User not found");

    const newPassword = req.body?.newPassword?.trim() || "Admin@123";
    if (newPassword.length < 6) {
      return badRequest(res, "Password must be at least 6 characters long");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash }
    });

    return ok(res, { email: user.email, password: newPassword }, `Password for ${user.name} reset successfully`);
  } catch (e) { return serverError(res, e); }
};

// GET /api/admin/audits
export const listAudits = async (req: any, res: any) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        include: {
          auditor: { select: { id: true, name: true, email: true } },
          application: {
            select: {
              id: true,
              businessType: true,
              restaurant: { select: { name: true, city: true } },
              hotel: { select: { name: true, city: true } }
            }
          }
        },
        orderBy: { scheduledAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.audit.count({ where })
    ]);

    return ok(res, { items, total });
  } catch (e) { return serverError(res, e); }
};

// GET /api/admin/auditors
export const listAuditors = async (req: any, res: any) => {
  try {
    const items = await prisma.user.findMany({
      where: { role: "auditor", isActive: true },
      select: { id: true, name: true, email: true }
    });
    return ok(res, items);
  } catch (e) { return serverError(res, e); }
};

// POST /api/admin/audits
export const assignAudit = async (req: any, res: any) => {
  try {
    const { applicationId, auditorId, scheduledAt } = req.body;

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return notFound(res, "Application not found");

    // Fetch active standard from DB
    const standard = await prisma.standard.findFirst({
      where: {
        division: app.businessType as string,
        status: "active"
      },
      include: { criteria: true },
      orderBy: { createdAt: "desc" }
    });

    let checklist: any = [];
    if (standard) {
      checklist = standard.criteria.map(c => ({
        id: c.id,
        section: c.section,
        criterion: c.criterion,
        weight: c.weight
      }));
    }

    // Create or update audit
    const audit = await prisma.audit.upsert({
      where: { applicationId },
      create: {
        applicationId,
        auditorId,
        track: app.businessType as any,
        checklist,
        scheduledAt: new Date(scheduledAt),
        status: "scheduled"
      },
      update: {
        auditorId,
        scheduledAt: new Date(scheduledAt),
        status: "scheduled"
      }
    });

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "audit_scheduled" }
    });

    return ok(res, audit, "Audit assigned and application updated");
  } catch (e) { return serverError(res, e); }
};
// PATCH /api/admin/audits/:id/reopen
export const reopenAudit = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const audit = await prisma.audit.findUnique({ where: { id } });
    if (!audit) return notFound(res, "Audit not found");

    // Reset audit to in_progress
    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: {
        status: "in_progress",
        completedAt: null, // clear completion date
      }
    });

    // Reset application status to audit_scheduled (or under_review)
    // We will set to audit_scheduled so it falls back out of the completion queue
    await prisma.application.update({
      where: { id: audit.applicationId },
      data: { status: "audit_scheduled" }
    });

    return ok(res, updatedAudit, "Audit has been reopened successfully.");
  } catch (e) {
    return serverError(res, e);
  }
};
