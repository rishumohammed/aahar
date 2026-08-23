import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Starting to clear database (keeping Users, MasterData, SiteSettings)...');

  try {
    // Delete in order to avoid foreign key constraint violations
    
    // 1. Delete standalone / leaf nodes
    await prisma.promotion.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.businessLead.deleteMany();
    await prisma.notification.deleteMany();
    
    // 2. Delete payments and messages
    await prisma.payment.deleteMany();
    await prisma.enquiryMessage.deleteMany();
    await prisma.applicationMessage.deleteMany();
    
    // 3. Delete order related data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    
    // 4. Delete restaurant related leaves
    await prisma.restaurantTable.deleteMany();
    await prisma.tableBooking.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuSection.deleteMany();
    
    // 5. Delete application / audit / certification data
    await prisma.certification.deleteMany();
    await prisma.audit.deleteMany();
    await prisma.document.deleteMany();
    await prisma.application.deleteMany();
    
    // 6. Delete hotel related leaves
    await prisma.enquiry.deleteMany();
    await prisma.roomType.deleteMany();
    
    // 7. Delete main entities
    await prisma.restaurant.deleteMany();
    await prisma.hotel.deleteMany();
    
    // 8. Delete standards (if we want to clear them)
    await prisma.criterion.deleteMany();
    await prisma.standard.deleteMany();

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
