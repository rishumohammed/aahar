import prisma from './src/lib/prisma.ts';

async function main() {
  const audits = await prisma.audit.findMany({
    include: { application: true }
  });
  
  for (const a of audits) {
    const checklist: any = a.checklist || [];
    if (checklist.length === 0) {
      const standard = await prisma.standard.findFirst({
        where: {
          division: a.application.businessType as string,
          status: "active"
        },
        include: { criteria: true },
        orderBy: { createdAt: "desc" }
      });
      if (standard && standard.criteria.length > 0) {
        const newChecklist = standard.criteria.map(c => ({
          id: c.id,
          section: c.section,
          criterion: c.criterion,
          weight: c.weight
        }));
        await prisma.audit.update({
          where: { id: a.id },
          data: { checklist: newChecklist }
        });
        console.log(`Updated audit ${a.id} with ${newChecklist.length} items`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
