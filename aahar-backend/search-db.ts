import prisma from "./src/lib/prisma.js";

async function search() {
  const models = ['restaurant', 'hotel', 'user', 'roomType', 'promotion', 'blogPost', 'siteSetting'];
  for (const model of models) {
    try {
      // @ts-ignore
      const records = await prisma[model].findMany();
      console.log(`Searching ${model}... (${records.length} records)`);
      for (const r of records) {
        const str = JSON.stringify(r);
        if (str.includes("test-patch-url")) {
          console.log(`FOUND IN ${model}: ID = ${r.id}`);
          if (model === 'promotion') {
             await prisma.promotion.delete({ where: { id: r.id } });
             console.log('Deleted promotion.');
          }
        }
      }
    } catch(e) {}
  }
}

search().then(() => prisma.$disconnect());
