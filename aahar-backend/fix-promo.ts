import prisma from "./src/lib/prisma.js";

async function run() {
  const promos = await prisma.promotion.findMany();
  for (const promo of promos) {
    if (!promo.imageUrl.startsWith("http") && !promo.imageUrl.startsWith("/")) {
      console.log(`Deleting bad promotion: ${promo.title} (${promo.imageUrl})`);
      await prisma.promotion.delete({ where: { id: promo.id } });
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
