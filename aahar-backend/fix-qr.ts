import prisma from "./src/lib/prisma.js";
import QRCode from "qrcode";

async function run() {
  const tables = await prisma.restaurantTable.findMany({
    include: { restaurant: true }
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  for (const table of tables) {
    if (!table.qrCodeUrl || table.qrCodeUrl.length < 500) {
      const dineInUrl = `${frontendUrl}/restaurant/${table.restaurant.slug}?table=${table.tableNumber}`;
      const qrCodeUrl = await QRCode.toDataURL(dineInUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        color: {
          dark: "#1A2E2E",
          light: "#FFFFFF"
        }
      });
      await prisma.restaurantTable.update({
        where: { id: table.id },
        data: { qrCodeUrl }
      });
      console.log(`Regenerated QR for table ${table.tableNumber}`);
    }
  }
}

run()
  .then(() => console.log("Done!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
