import prisma from './src/lib/prisma.ts';

async function clearData() {
  console.log('Starting data cleanup (keeping Users and MasterData)...');
  
  try {
    // Delete in reverse dependency order to avoid foreign key constraints
    
    // 1. Delete deeply nested related data
    await prisma.enquiryMessage.deleteMany({});
    await prisma.applicationMessage.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.certification.deleteMany({});
    await prisma.audit.deleteMany({});
    
    // 2. Delete Orders and Payments
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.payment.deleteMany({});
    
    // 3. Delete Menu and Tables
    await prisma.menuItem.deleteMany({});
    await prisma.menuSection.deleteMany({});
    await prisma.tableBooking.deleteMany({});
    await prisma.restaurantTable.deleteMany({});
    
    // 4. Delete Hotel specific data
    await prisma.roomType.deleteMany({});
    
    // 5. Delete Applications and Enquiries
    await prisma.application.deleteMany({});
    await prisma.enquiry.deleteMany({});
    
    // 6. Delete other loose items
    await prisma.notification.deleteMany({});
    await prisma.businessLead.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.promotion.deleteMany({});
    
    // 7. Finally, delete the main entities
    await prisma.restaurant.deleteMany({});
    await prisma.hotel.deleteMany({});
    
    console.log('Successfully cleared all dummy data!');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
