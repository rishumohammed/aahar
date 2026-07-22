import prisma from "./src/lib/prisma.js";
import bcrypt from 'bcryptjs';

async function run() {
  const passwordHash = await bcrypt.hash('Manager@123', 10);
  await prisma.user.update({
    where: { email: 'manager@malabarretreat.in' },
    data: { passwordHash }
  });
  console.log("Password reset successfully!");
}

run().finally(() => prisma.$disconnect());
