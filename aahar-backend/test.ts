import prisma from './src/lib/prisma.js'; 
async function main() { 
  const h = await prisma.hotel.update({
    where: {slug: 'taj'},
    data: {
      lat: 19.0760,
      lng: 72.8777,
      googleLocationLink: "https://maps.app.goo.gl/x"
    }
  }); 
  console.log('Updated', h.lat, h.lng, h.googleLocationLink); 
} 
main().finally(() => prisma.$disconnect());
