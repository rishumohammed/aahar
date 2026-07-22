import prisma from "../lib/prisma.js";
import { ok, created, badRequest, notFound, serverError } from "../utils/response.js";
import { FNB_CHECKLIST, ACCOMMODATION_CHECKLIST, calculateScore } from "../utils/scoring.js";

// POST /api/audits  (admin assigns auditor)
export const createAudit = async (req: any, res: any) => {
  try {
    const { applicationId, auditorId, scheduledAt } = req.body;
    if (!applicationId || !auditorId || !scheduledAt)
      return badRequest(res, "applicationId, auditorId and scheduledAt are required");

    const app = await prisma.application.findUnique({ where:{ id:applicationId } });
    if (!app) return notFound(res, "Application not found");

    const existingAudit = await prisma.audit.findUnique({ where:{ applicationId } });
    if (existingAudit)
      return badRequest(res, "An audit already exists for this application");

    // Fetch active standard from DB
    const standard = await prisma.standard.findFirst({
      where: { 
        division: app.businessType as string, 
        status: "active" 
      },
      include: { criteria: true },
      orderBy: { createdAt: "desc" }
    });

    if (!standard) return badRequest(res, `No active standard found for ${app.businessType}`);
    
    // Map DB criteria format to the audit checklist format
    const checklist = standard.criteria.map(c => ({
      id: c.id,
      section: c.section,
      criterion: c.criterion,
      weight: c.weight,
      isCritical: c.isCritical
    }));

    const audit = await prisma.audit.create({
      data: {
        applicationId,
        auditorId,
        track:       app.businessType as any,
        scheduledAt: new Date(scheduledAt),
        checklist:   checklist as any,
        status:      "scheduled",
      },
      include: { auditor:{ select:{ id:true, name:true, email:true } }, application:true }
    });

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data:  { status: "audit_scheduled" } as any
    });

    return created(res, audit, "Audit scheduled");
  } catch (e) { return serverError(res, e); }
};

// GET /api/audits  (auditor sees own, admin sees all)
export const listAudits = async (req: any, res: any) => {
  try {
    const isAdmin = ["admin","super_admin"].includes(req.user.role);
    const where: any = {};
    if (!isAdmin) where.auditorId = req.user.id;
    if (req.query.status) where.status = req.query.status;

    const audits = await prisma.audit.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        auditor:     { select:{ id:true, name:true } },
        application: {
          include: {
            restaurant: { select:{ id:true, name:true, city:true, address:true } },
            hotel:      { select:{ id:true, name:true, city:true, address:true } },
            applicant:  { select:{ id:true, name:true, phone:true } },
          }
        }
      }
    });

    return ok(res, audits);
  } catch (e) { return serverError(res, e); }
};

// GET /api/audits/:id
export const getAudit = async (req: any, res: any) => {
  try {
    const audit = await prisma.audit.findUnique({
      where: { id: req.params.id },
      include: {
        auditor:     { select:{ id:true, name:true, email:true } },
        application: {
          include: {
            restaurant: true,
            hotel:      true,
            applicant:  { select:{ id:true, name:true, phone:true, email:true } },
          }
        }
      }
    });
    if (!audit) return notFound(res, "Audit not found");
    return ok(res, audit);
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/audits/:id/submit  (auditor submits completed audit)
export const submitAudit = async (req: any, res: any) => {
  try {
    const { checklist, auditorNotes, sitePhotos, recommendation, lat, lng } = req.body;

    if (!checklist || !Array.isArray(checklist))
      return badRequest(res, "checklist array is required");
    if (!recommendation || !["approve","reject","re_audit","needs_corrections"].includes(recommendation))
      return badRequest(res, "recommendation must be approve, reject, re_audit, or needs_corrections");

    const totalScore = calculateScore(checklist);

    const audit = await prisma.audit.update({
      where: { id: req.params.id },
      data: {
        checklist:    checklist as any,
        auditorNotes: auditorNotes || null,
        sitePhotos:   sitePhotos   || [],
        lat:          lat          || null,
        lng:          lng          || null,
        recommendation: recommendation as any,
        totalScore,
        completedAt: new Date(),
        status: "submitted",
      },
      include: { application:true }
    });

    // Update application status based on recommendation
    const newStatus = recommendation === "needs_corrections" ? "pending_corrections" : "audit_complete";
    
    await prisma.application.update({
      where: { id: audit.applicationId },
      data:  { status: newStatus } as any
    });

    return ok(res, audit, `Audit submitted — score: ${totalScore}/5`);
  } catch (e) { return serverError(res, e); }
};

// GET /api/audits/:id/report
export const downloadAuditReport = async (req: any, res: any) => {
  try {
    const audit = await prisma.audit.findUnique({
      where: { id: req.params.id },
      include: {
        auditor: { select: { name: true } },
        application: {
          include: {
            restaurant: true,
            hotel: true
          }
        }
      }
    });

    if (!audit) return notFound(res, "Audit not found");
    if (audit.status !== "submitted") return badRequest(res, "Audit has not been submitted yet");

    const entity = audit.application.restaurant ?? audit.application.hotel;

    // Dynamic import to avoid circular dependencies if any
    const { generateAuditReportPDF } = await import("../services/auditReport.service.js");

    const pdfBuffer = await generateAuditReportPDF({
      applicationId: audit.applicationId,
      businessName: entity?.name || "Unknown Business",
      businessType: audit.track,
      auditorName: audit.auditor.name,
      date: new Date(audit.completedAt || audit.updatedAt).toLocaleDateString(),
      totalScore: audit.totalScore || 0,
      recommendation: audit.recommendation || "N/A",
      checklist: (audit.checklist as any) || [],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="AuditReport_${audit.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) { return serverError(res, e); }
};
