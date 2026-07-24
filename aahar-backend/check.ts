import prisma from './src/lib/prisma.js'; async function main() { const users = await prisma.user.findMany(); console.log('Users count:', users.length); } main().finally(() => prisma.$disconnect());
