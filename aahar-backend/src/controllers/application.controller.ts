import prisma from "../lib/prisma.js";
import { ok, created, badRequest, notFound, serverError, forbidden } from "../utils/response.js";

// POST /api/applications
export const submitApplication = async (req: any, res: any) => {
  try {
    const { businessType, restaurantId, hotelId, status } = req.body;

    if (!businessType) return badRequest(res, "businessType is required");
    if (businessType === "fnb" && !restaurantId)
      return badRequest(res, "restaurantId required for F&B application");
    if (businessType === "accommodation" && !hotelId)
      return badRequest(res, "hotelId required for accommodation application");

    // Check no active application already exists
    const existing = await prisma.application.findFirst({
      where: {
        applicantId: req.user.id,
        ...(restaurantId && { restaurantId }),
        ...(hotelId && { hotelId }),
        status: { notIn: ["rejected", "certified"] }
      }
    });

    if (existing) {
      if (existing.status === "draft" && status === "submitted") {
        const updated = await prisma.application.update({
          where: { id: existing.id },
          data: {
            status: "submitted",
            submittedAt: new Date()
          },
          include: { restaurant: true, hotel: true, documents: true } as any
        });
        return ok(res, updated, "Application submitted successfully");
      }
      if (existing.status === "draft" && status === "draft") {
        const app = await prisma.application.findUnique({
          where: { id: existing.id },
          include: { restaurant: true, hotel: true, documents: true } as any
        });
        return ok(res, app, "Active draft application retrieved");
      }
      return badRequest(res, "An active application already exists for this establishment");
    }

    const appStatus = status === "draft" ? "draft" : "submitted";
    const submittedAt = appStatus === "submitted" ? new Date() : null;

    const application = await prisma.application.create({
      data: {
        businessType,
        restaurantId: restaurantId || null,
        hotelId:      hotelId      || null,
        applicantId:  req.user.id,
        status:       appStatus,
        submittedAt:  submittedAt,
      },
      include: { restaurant:true, hotel:true, documents:true } as any
    });

    return created(res, application, appStatus === "draft" ? "Draft application created" : "Application submitted successfully");
  } catch (e) { return serverError(res, e); }
};

// GET /api/applications
export const listApplications = async (req: any, res: any) => {
  try {
    const { status, businessType, page = 1, limit = 20 } = req.query;
    const isAdmin = ["admin","super_admin"].includes(req.user.role);
    const skip    = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (!isAdmin) where.applicantId = req.user.id;
    if (status)       where.status       = status;
    if (businessType) where.businessType = businessType;

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where, skip, take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          applicant:  { select:{ id:true, name:true, email:true, phone:true } },
          restaurant: { select:{ id:true, name:true, city:true, slug:true } },
          hotel:      { select:{ id:true, name:true, city:true, slug:true } },
          documents:  true,
          audit:      { include:{ auditor:{ select:{ id:true, name:true } } } },
          certification: true,
        }
      }),
      prisma.application.count({ where }),
    ]);

    return ok(res, {
      items, total, page: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (e) { return serverError(res, e); }
};

// GET /api/applications/:id
export const getApplication = async (req: any, res: any) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        applicant:  { select:{ id:true, name:true, email:true, phone:true } },
        restaurant: true,
        hotel:      true,
        documents:  true,
        audit:      { include:{ auditor:{ select:{ id:true, name:true, email:true } } } },
        certification: true,
        payments:   true,
      }
    });
    if (!app) return notFound(res, "Application not found");

    const isAdmin = ["admin","super_admin"].includes(req.user.role);
    if (!isAdmin && app.applicantId !== req.user.id)
      return forbidden(res, "Not your application");

    return ok(res, app);
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/applications/:id/status  (admin only)
export const updateApplicationStatus = async (req: any, res: any) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      "submitted","under_review","gap_analysis",
      "audit_scheduled","audit_complete","approved","rejected"
    ];
    if (!validStatuses.includes(status))
      return badRequest(res, "Invalid status");

    const app = await prisma.application.update({
      where: { id: req.params.id },
      data:  { status, adminNotes: notes || undefined } as any,
      include: { restaurant:true, hotel:true, applicant:true }
    });

    return ok(res, app, `Application status updated to ${status}`);
  } catch (e) { return serverError(res, e); }
};

// POST /api/applications/:id/documents
export const uploadDocument = async (req: any, res: any) => {
  try {
    const { name, type, url, size, expiresAt } = req.body;
    if (!name || !url) return badRequest(res, "name and url are required");

    const doc = await prisma.document.create({
      data: {
        applicationId: req.params.id,
        name, type, url,
        size:      size      ? Number(size) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return created(res, doc, "Document uploaded");
  } catch (e) { return serverError(res, e); }
};
