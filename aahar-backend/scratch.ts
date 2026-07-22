import prisma from './src/lib/prisma.ts';

async function checkStats() {
  const [
    totalUsers,
    totalCertified,
    pendingApps,
    totalEnquiries,
    monthlyRevenue,
    totalRestaurants,
    totalHotels
  ] = await Promise.all([
    prisma.user.count(),
    prisma.certification.count({ where: { status: "active" } }),
    prisma.application.count({ where: { status: "submitted" } }),
    prisma.enquiry.count(),
    prisma.payment.aggregate({
      where: { status: "captured" },
      _sum: { amount: true }
    }),
    prisma.restaurant.count(),
    prisma.hotel.count()
  ]);

  console.log("Stats from DB:", {
    totalUsers,
    totalCertified,
    pendingApps,
    totalEnquiries,
    monthlyRevenue,
    totalRestaurants,
    totalHotels
  });

  const apps = await prisma.application.findMany({ select: { id: true, status: true } });
  console.log("All applications:", apps);

  await prisma.$disconnect();
}

checkStats().catch(console.error);
