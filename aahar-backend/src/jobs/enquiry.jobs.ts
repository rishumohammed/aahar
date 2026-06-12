import cron          from "node-cron";
import prisma from "../lib/prisma.js";
import { getIO }     from "../socket.js";

export const startCronJobs = () => {

  // Run every hour — expire enquiries with no response after 72hrs
  cron.schedule("0 * * * *", async () => {
    try {
      const expired = await prisma.enquiry.findMany({
        where: {
          status:    { in: ["sent","viewed"] },
          expiresAt: { lt: new Date() },
        },
        include: { guest:{ select:{ id:true } } }
      });

      if (expired.length === 0) return;

      await prisma.enquiry.updateMany({
        where: { id:{ in: expired.map(e => e.id) } },
        data:  { status: "expired" }
      });

      // Notify guests
      const io = getIO();
      for (const e of expired) {
        io.to(`user_${e.guestId}`).emit("enquiry_status_changed", {
          enquiryId: e.id,
          status:    "expired",
        });
        console.log(`Enquiry ${e.id} expired — no response within 72hrs`);
      }

      console.log(`Cron: expired ${expired.length} enquiries`);
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });

  // Run every day at midnight — mark certs as expiring if < 30 days left
  cron.schedule("0 0 * * *", async () => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      await prisma.certification.updateMany({
        where: {
          status:    "active",
          expiresAt: { lt: thirtyDaysFromNow, gt: new Date() },
        },
        data: { status: "expiring" }
      });

      await prisma.certification.updateMany({
        where: {
          status:    { in: ["active","expiring"] },
          expiresAt: { lt: new Date() },
        },
        data: { status: "expired" }
      });

      console.log("Cron: certification statuses updated");
    } catch (err) {
      console.error("Cert cron error:", err);
    }
  });

  console.log("Cron jobs started");
};
