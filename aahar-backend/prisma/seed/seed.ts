import bcrypt from "bcryptjs";
import prisma from "../../src/lib/prisma.js";

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  // Users
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@aahar.in" },
    update: {},
    create: { email:"admin@aahar.in", passwordHash: await hash("Admin@123"), name:"AAHAR Admin", role:"super_admin", phone:"9876543210" }
  });
  console.log("✅ Seed complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());
