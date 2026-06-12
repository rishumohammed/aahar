import twilio from "twilio";

const FROM = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

let client: twilio.Twilio | null = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    if (!process.env.TWILIO_ACCOUNT_SID.startsWith("AC")) return null;
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

export const sendWhatsApp = async (
  to: string, message: string
): Promise<void> => {
  const c = getClient();
  if (!c) {
    console.log(`[WhatsApp skipped — no Twilio keys] To: ${to} | ${message}`);
    return;
  }
  try {
    const toNum = to.startsWith("whatsapp:") ? to : `whatsapp:+91${to.replace(/\D/g,"")}`;
    await c.messages.create({ from: FROM, to: toNum, body: message });
    console.log(`WhatsApp sent to ${to}`);
  } catch (err) {
    console.error("Twilio error:", err);
  }
};

export const waMessages = {
  newEnquiry: (guestName: string, checkIn: string, hotelName: string, enquiryUrl: string) =>
    `🏨 *New AAHAR Enquiry*\n\nGuest: ${guestName}\nCheck-in: ${checkIn}\nProperty: ${hotelName}\n\nReply within 72hrs to avoid expiry.\n👉 ${enquiryUrl}`,

  enquiryQuoted: (hotelName: string, amount: number, enquiryUrl: string) =>
    `✅ *Rate Quote Received*\n\n${hotelName} has quoted ₹${amount.toLocaleString("en-IN")} for your stay.\n\n👉 View & confirm: ${enquiryUrl}`,

  certIssued: (entityName: string, certNumber: string, verifyUrl: string) =>
    `🎉 *AAHAR Certificate Issued*\n\n${entityName} is now AAHAR Certified!\n\nCert #: ${certNumber}\n\n🔍 Verify: ${verifyUrl}`,

  certExpiring: (entityName: string, daysLeft: number, renewUrl: string) =>
    `⚠️ *Certificate Expiring Soon*\n\n${entityName} — ${daysLeft} days remaining.\n\n🔄 Renew now: ${renewUrl}`,

  auditScheduled: (entityName: string, date: string, auditorName: string) =>
    `📅 *Audit Scheduled — AAHAR*\n\n${entityName}\nDate: ${date}\nAuditor: ${auditorName}\n\nEnsure all documents and staff are ready.`,
};
