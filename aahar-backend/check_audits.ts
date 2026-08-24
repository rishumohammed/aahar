import prisma from './src/lib/prisma.ts';

async function main() {
  const audits = await prisma.audit.findMany({
    include: { application: true }
  });
  console.log("Audits:");
  for (const a of audits) {
    const checklist: any = a.checklist || [];
    console.log(`- ID: ${a.id}, Track: ${a.track}, Checklist items: ${checklist.length}, App BusinessType: ${a.application.businessType}, Status: ${a.status}`);
  }

  const standards = await prisma.standard.findMany({
    include: { criteria: true }
  });
  console.log("\nStandards:");
  for (const s of standards) {
    console.log(`- ID: ${s.id}, Division: ${s.division}, Status: ${s.status}, Criteria count: ${s.criteria.length}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
