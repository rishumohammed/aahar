import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
prisma.restaurant.update({
  where: { id: "dummy" },
  data: {
    managerId: "test"
  }
}).catch(console.error).finally(() => prisma.$disconnect());
