import prisma from "./src/lib/prisma.js";

async function run() {
  const r = await prisma.restaurant.findUnique({where:{id:'cmoh9q0w80005wku2jpa1w39k'}});
  if(r && r.photos){
    let p = r.photos as any;
    for (const key of Object.keys(p)) {
      if (Array.isArray(p[key])) {
        p[key] = p[key].filter((x: any) => x !== 'test-patch-url.jpg' && x?.url !== 'test-patch-url.jpg');
      }
    }
    await prisma.restaurant.update({where:{id:r.id}, data:{photos: p}});
    console.log('Fixed restaurant photos!');
  }
}

run().then(() => prisma.$disconnect());
