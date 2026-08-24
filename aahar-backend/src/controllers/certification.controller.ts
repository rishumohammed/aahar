import prisma from "../lib/prisma.js";
import { getIO } from "../socket.js";
import { generateCertNumber } from "../utils/certId.js";
import { generateQRCode } from "../services/qr.service.js";
import { generateCertPDF } from "../services/pdf.service.js";
import { ok, created, badRequest, notFound, serverError } from "../utils/response.js";
import path from "path";
import fs from "fs";

// POST /api/certifications  (admin issues cert after approved audit)
export const issueCertification = async (req: any, res: any) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) return badRequest(res, "applicationId is required");

    const app = await prisma.application.findUnique({
      where:   { id: applicationId },
      include: {
        restaurant: true,
        hotel:      true,
        audit:      { include:{ auditor:{ select:{ name:true } } } },
      }
    });

    if (!app) return notFound(res, "Application not found");
    if (app.status === "certified")
      return badRequest(res, "Application already certified");
    if (!["audit_complete","approved"].includes(app.status))
      return badRequest(res, "Application must be audit_complete or approved before certifying");

    const entity      = app.restaurant ?? app.hotel;
    const entityType  = app.restaurantId ? "restaurant" : "hotel";
    if (!entity) return badRequest(res, "No linked entity found");

    const certNumber   = generateCertNumber(app.businessType as "fnb" | "accommodation");
    const issuedAt     = new Date();
    const expiresAt    = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(certNumber);

    // Generate PDF
    const pdfBuffer = await generateCertPDF({
      certNumber,
      type:          app.businessType as "fnb" | "accommodation",
      entityName:    entity.name,
      entityAddress: entity.address,
      entityCity:    entity.city,
      issuedAt,
      expiresAt,
      hygieneScore:  app.audit?.totalScore ?? 0,
      starRating:    entityType === "hotel" ? (entity as any).starRating : undefined,
      qrCodeDataUrl,
      auditorName:   app.audit?.auditor?.name ?? "AAHAR Inspector",
    });

    // Save PDF to disk (use S3 in production)
    const pdfDir  = path.join(process.cwd(), "uploads", "certificates");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfFileName = `${certNumber}.pdf`;
    const pdfPath     = path.join(pdfDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);
    const pdfUrl = `/uploads/certificates/${pdfFileName}`;

    // Create certification record in a transaction
    const certification = await prisma.$transaction(async (tx) => {
      const cert = await tx.certification.create({
        data: {
          certNumber,
          type:          app.businessType as any,
          applicationId: app.id,
          restaurantId:  app.restaurantId ?? null,
          hotelId:       app.hotelId      ?? null,
          issuedAt,
          expiresAt,
          status:        "active",
          qrCodeUrl:     qrCodeDataUrl,
          pdfUrl,
          hygieneScore:  app.audit?.totalScore ?? null,
          auditLog: [{
            action:    "issued",
            by:        req.user.name ?? req.user.email,
            at:        new Date().toISOString(),
            note:      "Certificate issued after successful audit",
          }] as any,
        }
      });

      // Mark entity as verified
      if (app.restaurantId) {
        await tx.restaurant.update({
          where: { id: app.restaurantId },
          data:  { isVerified: true }
        });
      } else if (app.hotelId) {
        await tx.hotel.update({
          where: { id: app.hotelId },
          data:  { isVerified: true }
        });
      }

      // Update application status
      await tx.application.update({
        where: { id: app.id },
        data:  { status: "certified" } as any
      });

      return cert;
    });

    // Notify the business owner or manager
    const entityOwnerId = app.restaurant
      ? app.restaurant.ownerId
      : app.hotel?.managerId;

    if (entityOwnerId) {
      const io = getIO();
      io.to(`user_${entityOwnerId}`).emit("cert_issued", { certNumber });

      await prisma.notification.create({
        data: {
          userId:    entityOwnerId,
          type:      "cert_issued",
          title:     "AAHAR Certificate issued",
          message:   `${entity.name} is now AAHAR certified. Certificate: ${certNumber}`,
          actionUrl: app.restaurantId ? "/owner/compliance" : "/hotel-manager/dashboard",
        }
      });
    }

    return created(res, certification, `Certificate ${certNumber} issued successfully`);
  } catch (e) { return serverError(res, e); }
};

// GET /api/verify/:certNumber  (PUBLIC — no auth required)
export const verifyCertificate = async (req: any, res: any) => {
  try {
    const cert = await prisma.certification.findUnique({
      where:   { certNumber: req.params.certNumber },
      include: {
        restaurant: { select:{ id:true, name:true, address:true, city:true, slug:true, category:true } },
        hotel:      { select:{ id:true, name:true, address:true, city:true, slug:true, propertyType:true } },
      }
    });

    if (!cert) return notFound(res, "Certificate not found");

    // Auto-update status if expired
    if (cert.status === "active" && new Date(cert.expiresAt) < new Date()) {
      await prisma.certification.update({
        where: { id: cert.id },
        data:  { status: "expired" } as any
      });
      cert.status = "expired" as any;
    }

    const entity    = cert.restaurant ?? cert.hotel;
    const daysLeft  = Math.ceil(
      (new Date(cert.expiresAt).getTime() - Date.now()) / 86_400_000
    );

    return ok(res, {
      certNumber:   cert.certNumber,
      type:         cert.type,
      status:       cert.status,
      issuedAt:     cert.issuedAt,
      expiresAt:    cert.expiresAt,
      daysRemaining: daysLeft > 0 ? daysLeft : 0,
      hygieneScore: cert.hygieneScore,
      entity: {
        name:    entity?.name,
        address: entity?.address,
        city:    entity?.city,
        slug:    entity?.slug,
        type:    cert.restaurant ? "restaurant" : "hotel",
      },
      pdfUrl: cert.pdfUrl,
    });
  } catch (e) { return serverError(res, e); }
};

// GET /api/verify  (search by name or city — PUBLIC)
export const searchCertificates = async (req: any, res: any) => {
  try {
    const { q, city } = req.query;
    if (!q && !city) return badRequest(res, "Provide q (name) or city to search");

    const certs = await prisma.certification.findMany({
      where: {
        status: { in: ["active","expiring"] },
        OR: [
          { restaurant: { name: { contains: q as string } } },
          { hotel:      { name: { contains: q as string } } },
          { restaurant: { city: { contains: (city ?? q) as string } } },
          { hotel:      { city: { contains: (city ?? q) as string } } },
        ]
      },
      include: {
        restaurant: { select:{ name:true, city:true, slug:true } },
        hotel:      { select:{ name:true, city:true, slug:true } },
      },
      take: 20,
    });

    return ok(res, certs.map(c => ({
      certNumber: c.certNumber,
      type:       c.type,
      status:     c.status,
      expiresAt:  c.expiresAt,
      entity: {
        name: c.restaurant?.name ?? c.hotel?.name,
        city: c.restaurant?.city ?? c.hotel?.city,
        slug: c.restaurant?.slug ?? c.hotel?.slug,
        type: c.restaurant ? "restaurant" : "hotel",
      }
    })));
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/certifications/:id/status  (admin — suspend/revoke/reinstate)
export const updateCertStatus = async (req: any, res: any) => {
  try {
    const { status, reason } = req.body;
    const validActions = ["active","suspended","revoked"];
    if (!validActions.includes(status))
      return badRequest(res, "status must be active, suspended, or revoked");
    if (["suspended","revoked"].includes(status) && !reason)
      return badRequest(res, "reason is required when suspending or revoking");

    const cert = await prisma.certification.findUnique({
      where: { id: req.params.id }
    });
    if (!cert) return notFound(res, "Certificate not found");

    const existingLog = Array.isArray(cert.auditLog) ? cert.auditLog : [];
    const newLogEntry = {
      action: status === "active" ? "reinstated" : status,
      by:     req.user.name ?? req.user.email,
      at:     new Date().toISOString(),
      reason: reason ?? null,
    };

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.certification.update({
        where: { id: req.params.id },
        data: {
          status:        status as any,
          revokedAt:     status === "revoked"  ? new Date() : null,
          revokedReason: status === "revoked"  ? reason      : null,
          auditLog:      [...existingLog, newLogEntry] as any,
        }
      });

      // Sync isVerified on entity and application status
      const isVerified = status === "active";
      if (cert.restaurantId) {
        await tx.restaurant.update({ where:{ id:cert.restaurantId }, data:{ isVerified } });
      } else if (cert.hotelId) {
        await tx.hotel.update({ where:{ id:cert.hotelId }, data:{ isVerified } });
      }

      if (isVerified) {
        await tx.application.update({
          where: { id: cert.applicationId },
          data: { status: "certified" }
        });
      }

      return c;
    });

    return ok(res, updated, `Certificate ${status}`);
  } catch (e) { return serverError(res, e); }
};

// GET /api/certifications/:id/pdf  (regenerate & stream PDF download)
export const downloadCertPDF = async (req: any, res: any) => {
  try {
    const cert = await prisma.certification.findUnique({
      where: { id: req.params.id },
      include: {
        restaurant: true,
        hotel: true,
        application: {
          include: {
            audit: { include: { auditor: { select: { name: true } } } }
          }
        }
      }
    });
    if (!cert) return notFound(res, "Certificate not found");

    const entity = cert.restaurant ?? cert.hotel;
    if (!entity) return notFound(res, "No entity linked to this certificate");

    // Regenerate QR code
    const qrCodeDataUrl = await generateQRCode(cert.certNumber);

    // Regenerate PDF with latest template
    const pdfBuffer = await generateCertPDF({
      certNumber:    cert.certNumber,
      type:          cert.type as "fnb" | "accommodation",
      entityName:    entity.name,
      entityAddress: entity.address,
      entityCity:    entity.city,
      issuedAt:      cert.issuedAt,
      expiresAt:     cert.expiresAt,
      hygieneScore:  cert.hygieneScore ?? undefined,
      starRating:    cert.hotel ? (cert.hotel as any).starRating ?? undefined : undefined,
      qrCodeDataUrl,
      auditorName:   cert.application?.audit?.auditor?.name ?? "AAHAR Inspector",
    });

    // Also overwrite the stored file so future static URLs are also fresh
    const pdfDir = path.join(process.cwd(), "uploads", "certificates");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    fs.writeFileSync(path.join(pdfDir, `${cert.certNumber}.pdf`), pdfBuffer);

    res.setHeader("Content-Type",        "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cert.certNumber}.pdf"`);
    res.end(pdfBuffer);
  } catch (e) { return serverError(res, e); }
};

