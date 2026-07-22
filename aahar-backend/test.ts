import prisma from "./src/lib/prisma.js";
prisma.promotion.findMany().then(promos => {
  console.log("PROMOS:", promos);
});
