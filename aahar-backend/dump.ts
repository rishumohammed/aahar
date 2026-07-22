import prisma from "./src/lib/prisma.js";

async function dump() {
  const r = await prisma.restaurant.findUnique({where:{id:'cmoh9q0w80005wku2jpa1w39k'}});
  console.log(JSON.stringify(r, null, 2));
}

dump().finally(() => prisma.$disconnect());
