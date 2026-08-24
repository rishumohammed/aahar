import prisma from './src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
  console.log('Resetting passwords to "password123"...');
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await prisma.user.updateMany({
      data: {
        passwordHash
      }
    });
    
    console.log('Successfully reset all passwords to "password123"!');
    
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    console.log('Available accounts:');
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
