import pkg from "@prisma/client";
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { FNB_CHECKLIST, ACCOMMODATION_CHECKLIST } from "../../src/utils/scoring.js";

dotenv.config();

const { PrismaClient } = pkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing standards to avoid duplication during seed
  await prisma.standard.deleteMany({});

  // 1. Create FNB Standard
  const fnbStandard = await prisma.standard.create({
    data: {
      name: "Food & Beverage Master Standard",
      version: "v1.0",
      division: "fnb",
      status: "active",
      criteria: {
        create: FNB_CHECKLIST.map(c => ({
          section: c.section,
          criterion: c.criterion,
          weight: c.weight,
        }))
      }
    }
  });
  console.log(`✅ Seeded FNB Standard: ${fnbStandard.id}`);

  // 2. Create Accommodation Standard
  const accStandard = await prisma.standard.create({
    data: {
      name: "Accommodation Master Standard",
      version: "v1.0",
      division: "accommodation",
      status: "active",
      criteria: {
        create: ACCOMMODATION_CHECKLIST.map(c => ({
          section: c.section,
          criterion: c.criterion,
          weight: c.weight,
        }))
      }
    }
  });
  console.log(`✅ Seeded Accommodation Standard: ${accStandard.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
