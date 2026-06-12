import pkg from "@prisma/client";
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const { PrismaClient } = pkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Find the Auditor
  const auditor = await prisma.user.findFirst({ where: { role: "auditor" } });
  if (!auditor) throw new Error("No auditor found in DB");

  // 2. Find a Restaurant to apply for certification
  const restaurant = await prisma.restaurant.findFirst({ 
    where: { slug: "spice-garden-kozhikode" } 
  });
  if (!restaurant) throw new Error("No restaurant found");

  // 3. Find the owner
  const owner = await prisma.user.findUnique({ where: { id: restaurant.ownerId } });
  if (!owner) throw new Error("No owner found");

  // 4. Create an Application (Under Review)
  const app = await prisma.application.create({
    data: {
      businessType: "fnb",
      restaurantId: restaurant.id,
      applicantId: owner.id,
      status: "audit_scheduled",
      submittedAt: new Date(),
    }
  });
  console.log(`✅ Created Application for ${restaurant.name} (ID: ${app.id})`);

  // 5. Schedule an Audit for this application
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const audit = await prisma.audit.create({
    data: {
      applicationId: app.id,
      auditorId: auditor.id,
      track: "fnb",
      scheduledAt: tomorrow,
      status: "scheduled",
    }
  });

  console.log(`✅ Scheduled Audit assigned to ${auditor.name} (Audit ID: ${audit.id})`);

  // 6. Let's do one for a Hotel as well!
  const hotel = await prisma.hotel.findFirst({ where: { slug: "malabar-retreat-kozhikode" } });
  if (hotel) {
    const hotelApp = await prisma.application.create({
      data: {
        businessType: "accommodation",
        hotelId: hotel.id,
        applicantId: hotel.managerId,
        status: "audit_scheduled",
        submittedAt: new Date(),
      }
    });
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    
    await prisma.audit.create({
      data: {
        applicationId: hotelApp.id,
        auditorId: auditor.id,
        track: "accommodation",
        scheduledAt: nextWeek,
        status: "scheduled",
      }
    });
    console.log(`✅ Scheduled Audit for ${hotel.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
