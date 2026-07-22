import prisma from "./src/lib/prisma.js";

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'manager@malabarretreat.in' }
  });
  console.log("User found:", user);
  if (!user) {
    console.log("User does not exist in the database!");
  } else {
    console.log("User role:", user.role);
    console.log("Password hash:", user.passwordHash);
  }
}

run().finally(() => prisma.$disconnect());
