import pkg from "@prisma/client";
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { FNB_CHECKLIST, ACCOMMODATION_CHECKLIST } from "../src/utils/scoring.js";

dotenv.config();

const { PrismaClient } = pkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const audits = await prisma.audit.findMany();
  for (const audit of audits) {
    if (!audit.checklist || (Array.isArray(audit.checklist) && audit.checklist.length === 0)) {
      const list = audit.track === "fnb" ? FNB_CHECKLIST : ACCOMMODATION_CHECKLIST;
      await prisma.audit.update({
        where: { id: audit.id },
        data: { checklist: list as any }
      });
      console.log(`✅ Fixed checklist for Audit ${audit.id}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
