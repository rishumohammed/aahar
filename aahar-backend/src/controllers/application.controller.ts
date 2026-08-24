import prisma from "../lib/prisma.js";
import { getIO } from "../socket.js";
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

    const createData: any = {
      businessType,
      applicantId:  req.user.id,
      status:       appStatus,
      submittedAt:  submittedAt,
    };
    if (restaurantId) createData.restaurantId = restaurantId;
    if (hotelId) createData.hotelId = hotelId;

    const application = await prisma.application.create({
      data: createData,
      include: { restaurant:true, hotel:true, documents:true } as any
    });

    if (appStatus === "submitted") {
      const io = getIO();
      io.to("admin_room").emit("new_application", { applicationId: application.id });
      
      const admins = await prisma.user.findMany({
        where: { role: { in: ["admin", "super_admin"] } }
      });
      
      const entityName = (application as any).restaurant?.name || (application as any).hotel?.name || "An establishment";
      
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            type: "new_application",
            title: "New Application Submitted",
            message: `${entityName} has submitted a new application for ${businessType} certification.`,
            actionUrl: `/admin/applications/${application.id}`
          }))
        });
      }
    }

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
      include: { restaurant:true, hotel:true, applicant:true, audit:true } as any
    });

    const io = getIO();
    io.to(`user_${app.applicantId}`).emit("application_status_changed", { applicationId: app.id, status });
    
    // Notify Applicant
    await prisma.notification.create({
      data: {
        userId: app.applicantId,
        type: "application_status_changed",
        title: "Application Status Updated",
        message: `Your application status has been updated to: ${status.replace("_", " ")}.`,
        actionUrl: `/owner/compliance`
      }
    });

    // Notify Auditor if exists
    if ((app as any).audit?.auditorId) {
      io.to(`user_${(app as any).audit.auditorId}`).emit("application_status_changed", { applicationId: app.id, status });
      await prisma.notification.create({
        data: {
          userId: (app as any).audit.auditorId,
          type: "application_status_changed",
          title: "Audit Application Status Updated",
          message: `An application assigned to you is now: ${status.replace("_", " ")}.`,
          actionUrl: `/auditor/audits/${(app as any).audit.id}` // Link to auditor view
        }
      });
    }

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

// PATCH /api/applications/:id/documents/:documentId
export const updateDocument = async (req: any, res: any) => {
  try {
    const { documentId } = req.params;
    const { expiresAt } = req.body;

    const doc = await prisma.document.update({
      where: { id: documentId },
      data: { expiresAt: expiresAt ? new Date(expiresAt) : null }
    });

    return ok(res, doc, "Document updated");
  } catch (e) { return serverError(res, e); }
};

// GET /api/applications/:id/messages
export const getMessages = async (req: any, res: any) => {
  try {
    const messages = await prisma.applicationMessage.findMany({
      where: { applicationId: req.params.id },
      orderBy: { sentAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });
    return ok(res, messages);
  } catch (e) { return serverError(res, e); }
};

// POST /api/applications/:id/messages
export const sendMessage = async (req: any, res: any) => {
  try {
    const { content, attachmentUrl, isSystem = false } = req.body;
    if (!content?.trim() && !attachmentUrl) return badRequest(res, "Message content or attachment is required");

    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        applicant: { select: { id: true } },
        audit: { select: { auditorId: true } }
      }
    });

    if (!app) return notFound(res, "Application not found");

    const isApplicant = app.applicantId === req.user.id;
    const isAuditor = app.audit?.auditorId === req.user.id;
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    if (!isApplicant && !isAuditor && !isAdmin) {
      return forbidden(res, "Not authorized to send messages on this application");
    }

    const message = await prisma.applicationMessage.create({
      data: {
        applicationId: app.id,
        senderId: req.user.id,
        content: content ? content.trim() : "",
        attachmentUrl: attachmentUrl || null,
        isSystem
      },
      include: { sender: { select: { id: true, name: true, role: true } } }
    });

    // Notify the other party via socket
    const io = getIO();
    
    // If applicant sends, notify auditor room and admin
    if (isApplicant) {
      if (app.audit?.auditorId) {
        io.to(`user_${app.audit.auditorId}`).emit("new_application_message", { applicationId: app.id, message });
      }
      io.to("admin_room").emit("new_application_message", { applicationId: app.id, message });
    } else {
      // If auditor/admin sends, notify applicant
      io.to(`user_${app.applicantId}`).emit("new_application_message", { applicationId: app.id, message });
    }

    // DB Notification
    const recipientId = isApplicant ? app.audit?.auditorId : app.applicantId;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "application_message",
          title: "New Application Message",
          message: `You have a new message from ${message.sender.name}`,
          actionUrl: isApplicant ? `/auditor/audits/${app.id}` : `/hotel-manager/compliance`
        }
      });
    }

    return created(res, message, "Message sent");
  } catch (e) { return serverError(res, e); }
};

// POST /api/applications/:id/submit-corrections
export const submitCorrections = async (req: any, res: any) => {
  try {
    const { note } = req.body;
    
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { audit: true }
    });

    if (!app) return notFound(res, "Application not found");
    if (app.applicantId !== req.user.id) return forbidden(res, "Not your application");
    if (app.status !== "pending_corrections") return badRequest(res, "Application is not pending corrections");

    const updatedApp = await prisma.application.update({
      where: { id: app.id },
      data: { status: "under_review" } as any, // Send back to review
    });

    // Add a message for audit trail
    await prisma.applicationMessage.create({
      data: {
        applicationId: app.id,
        senderId: req.user.id,
        content: `Corrections submitted for review. ${note || ""}`,
        isSystem: true
      }
    });

    // Notify auditor and admin
    const io = getIO();
    if (app.audit?.auditorId) {
      io.to(`user_${app.audit.auditorId}`).emit("application_status_changed", { applicationId: app.id, status: "under_review" });
      await prisma.notification.create({
        data: {
          userId: app.audit.auditorId,
          type: "corrections_submitted",
          title: "Corrections Submitted",
          message: `The applicant has submitted corrections for application #${app.id.substring(0, 8)}`,
          actionUrl: `/auditor/audits/${app.id}`
        }
      });
    }

    return ok(res, updatedApp, "Corrections submitted for review");
  } catch (e) { return serverError(res, e); }
};
