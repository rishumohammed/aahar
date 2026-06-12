import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL ?? "noreply@aahar.in",
  name:  process.env.SENDGRID_FROM_NAME  ?? "AAHAR",
};

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// ── Email templates ───────────────────────────────────
const templates = {

  applicationReceived: (name: string, entityName: string, appId: string) => ({
    subject: "AAHAR — Application Received",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A7B7B;padding:16px 24px;border-radius:10px 10px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">AAHAR</h1>
        </div>
        <div style="background:#fff;border:1px solid #DDE8E8;border-top:none;padding:28px 24px;border-radius:0 0 10px 10px">
          <p style="color:#1A2E2E;font-size:16px">Hi ${name},</p>
          <p style="color:#4A6464;line-height:1.7">
            We've received your accreditation application for <strong style="color:#1A2E2E">${entityName}</strong>.
            Our team will review your submission within 2–3 business days.
          </p>
          <div style="background:#E6F4F4;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#0A7B7B;font-size:13px;margin:0">
              Application ID: <strong>${appId}</strong>
            </p>
          </div>
          <a href="${APP_URL}/owner/application"
             style="display:inline-block;background:#0A7B7B;color:#fff;padding:10px 24px;
                    border-radius:8px;text-decoration:none;font-weight:500;margin-top:8px">
            Track your application
          </a>
          <p style="color:#4A6464;font-size:12px;margin-top:24px">
            Questions? Reply to this email or WhatsApp us at +91 98765 43210.
          </p>
        </div>
        <p style="color:#7A9494;font-size:11px;text-align:center;margin-top:16px">
          AAHAR — Trust Every Meal. Verify Every Stay.
        </p>
      </div>`,
  }),

  auditScheduled: (name: string, entityName: string, scheduledAt: Date, auditorName: string) => ({
    subject: "AAHAR — Audit Scheduled",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A7B7B;padding:16px 24px;border-radius:10px 10px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">AAHAR</h1>
        </div>
        <div style="background:#fff;border:1px solid #DDE8E8;border-top:none;padding:28px 24px;border-radius:0 0 10px 10px">
          <p style="color:#1A2E2E;font-size:16px">Hi ${name},</p>
          <p style="color:#4A6464;line-height:1.7">
            Your site audit for <strong style="color:#1A2E2E">${entityName}</strong> has been scheduled.
          </p>
          <div style="background:#E6F4F4;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 6px;color:#4A6464;font-size:13px">
              📅 Date: <strong style="color:#1A2E2E">
                ${scheduledAt.toLocaleDateString("en-IN",{ weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              </strong>
            </p>
            <p style="margin:0;color:#4A6464;font-size:13px">
              👤 Auditor: <strong style="color:#1A2E2E">${auditorName}</strong>
            </p>
          </div>
          <p style="color:#4A6464;line-height:1.7;font-size:13px">
            Please ensure all documents are available and key staff are present on the day.
            Download our audit preparation guide from your dashboard.
          </p>
          <a href="${APP_URL}/owner/application"
             style="display:inline-block;background:#0A7B7B;color:#fff;padding:10px 24px;
                    border-radius:8px;text-decoration:none;font-weight:500;margin-top:8px">
            View application
          </a>
        </div>
      </div>`,
  }),

  certificationIssued: (name: string, entityName: string, certNumber: string, expiresAt: Date, pdfUrl: string) => ({
    subject: "🎉 AAHAR Certification Issued",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A7B7B;padding:16px 24px;border-radius:10px 10px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">AAHAR</h1>
        </div>
        <div style="background:#fff;border:1px solid #DDE8E8;border-top:none;padding:28px 24px;border-radius:0 0 10px 10px">
          <p style="color:#1A2E2E;font-size:16px">Congratulations, ${name}!</p>
          <p style="color:#4A6464;line-height:1.7">
            <strong style="color:#1A2E2E">${entityName}</strong> has been officially
            <strong style="color:#0A7B7B">AAHAR Certified</strong>.
            Your certificate is now active and publicly verifiable.
          </p>
          <div style="background:#E6F4F4;border-1.5px solid #0A7B7B;border-radius:10px;padding:20px;margin:20px 0;text-align:center">
            <p style="font-size:11px;color:#4A6464;letter-spacing:2px;margin:0 0 4px">CERTIFICATE NUMBER</p>
            <p style="font-size:20px;font-weight:700;color:#0A7B7B;font-family:monospace;margin:0 0 8px">${certNumber}</p>
            <p style="font-size:12px;color:#4A6464;margin:0">
              Valid until ${expiresAt.toLocaleDateString("en-IN",{ day:"2-digit", month:"long", year:"numeric" })}
            </p>
          </div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <a href="${APP_URL}/verify/${certNumber}"
               style="flex:1;display:inline-block;background:#0A7B7B;color:#fff;padding:10px 16px;
                      border-radius:8px;text-decoration:none;font-weight:500;text-align:center">
              View live badge
            </a>
            <a href="${process.env.API_URL}/uploads/certificates/${certNumber}.pdf"
               style="flex:1;display:inline-block;background:#F7EDEB;color:#B5766A;padding:10px 16px;
                      border-radius:8px;text-decoration:none;font-weight:500;text-align:center;
                      border:1px solid #B5766A">
              Download PDF
            </a>
          </div>
        </div>
      </div>`,
  }),

  newEnquiry: (managerName: string, guestName: string, checkIn: Date, checkOut: Date, roomType: string, enquiryId: string) => ({
    subject: `New Room Enquiry — ${guestName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="background:#0A7B7B;padding:16px 24px;border-radius:10px 10px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">AAHAR</h1>
        </div>
        <div style="background:#fff;border:1px solid #DDE8E8;border-top:none;padding:28px 24px;border-radius:0 0 10px 10px">
          <p style="color:#1A2E2E;font-size:16px">Hi ${managerName},</p>
          <p style="color:#4A6464;line-height:1.7">
            You have a new room enquiry from <strong style="color:#1A2E2E">${guestName}</strong>.
          </p>
          <div style="background:#E6F4F4;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 6px;color:#4A6464;font-size:13px">
              📅 Check-in: <strong style="color:#1A2E2E">
                ${checkIn.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" })}
              </strong>
            </p>
            <p style="margin:0 0 6px;color:#4A6464;font-size:13px">
              📅 Check-out: <strong style="color:#1A2E2E">
                ${checkOut.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" })}
              </strong>
            </p>
            <p style="margin:0;color:#4A6464;font-size:13px">
              🛏 Room type: <strong style="color:#1A2E2E">${roomType}</strong>
            </p>
          </div>
          <p style="color:#854F0B;font-size:13px;background:#FAEEDA;padding:10px 14px;border-radius:6px">
            ⏰ Please respond within 72 hours to avoid the enquiry expiring.
          </p>
          <a href="${APP_URL}/hotel-manager/enquiries/${enquiryId}"
             style="display:inline-block;background:#0A7B7B;color:#fff;padding:10px 24px;
                    border-radius:8px;text-decoration:none;font-weight:500;margin-top:16px">
            Respond to enquiry
          </a>
        </div>
      </div>`,
  }),

  certExpiring: (name: string, entityName: string, certNumber: string, daysLeft: number) => ({
    subject: `⚠️ AAHAR Certificate Expiring in ${daysLeft} days`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <div style="background:#854F0B;padding:16px 24px;border-radius:10px 10px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:2px">AAHAR</h1>
        </div>
        <div style="background:#fff;border:1px solid #DDE8E8;border-top:none;padding:28px 24px;border-radius:0 0 10px 10px">
          <p style="color:#1A2E2E;font-size:16px">Hi ${name},</p>
          <p style="color:#4A6464;line-height:1.7">
            Your AAHAR certificate for <strong style="color:#1A2E2E">${entityName}</strong>
            is expiring in <strong style="color:#854F0B">${daysLeft} days</strong>.
            Renew now to keep your verified badge active.
          </p>
          <div style="background:#FAEEDA;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;color:#4A6464;font-size:13px">
              Certificate: <strong style="color:#1A2E2E;font-family:monospace">${certNumber}</strong>
            </p>
          </div>
          <a href="${APP_URL}/owner/application/renew"
             style="display:inline-block;background:#B5766A;color:#fff;padding:10px 24px;
                    border-radius:8px;text-decoration:none;font-weight:500">
            Start renewal now
          </a>
        </div>
      </div>`,
  }),
};

// ── Send functions ────────────────────────────────────
export const sendEmail = async (
  to: string, subject: string, html: string
): Promise<void> => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith("SG.")) {
    console.log(`[Email skipped — no valid API key] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await sgMail.send({ to, from: FROM, subject, html });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err: any) {
    console.error("SendGrid error:", err?.response?.body ?? err);
  }
};

export const emailTemplates = templates;
