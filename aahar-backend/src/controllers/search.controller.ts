import prisma from "../lib/prisma.js";
import { ok, serverError } from "../utils/response.js";

export const search = async (req: any, res: any) => {
  try {
    const { mode = "both", q, city, certified, sort, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const isCertified = certified === "true";

    const results: any = { restaurants:[], hotels:[], total:0 };

    if (mode === "eat" || mode === "both") {
      const where: any = { isActive:true };
      if (city) where.city = { contains:city };
      if (isCertified) where.isVerified = true;
      if (q) where.OR = [
        { name:{ contains:q } },
        { area:{ contains:q } },
        { description:{ contains:q } },
      ];
      const orderBy: any = sort === "newest" ? { createdAt: "desc" } : [{ isFeatured:"desc" },{ isSponsored:"desc" }];
      
      results.restaurants = await prisma.restaurant.findMany({
        where, skip, take:Number(limit),
        orderBy,
        select:{ id:true, name:true, slug:true, category:true, cuisineType:true,
          city:true, area:true, priceRange:true, photos:true, isVerified:true,
          isFeatured:true, isSponsored:true, googleRating:true, certification:true, createdAt:true }
      });
    }

    if (mode === "stay" || mode === "both") {
      const where: any = { isActive:true };
      if (city) where.city = { contains:city };
      if (isCertified) where.isVerified = true;
      if (q) where.OR = [
        { name:{ contains:q } },
        { area:{ contains:q } },
        { description:{ contains:q } },
      ];
      const orderBy: any = sort === "newest" ? { createdAt: "desc" } : [{ isFeatured:"desc" },{ isSponsored:"desc" }];

      results.hotels = await prisma.hotel.findMany({
        where, skip, take:Number(limit),
        orderBy,
        select:{ id:true, name:true, slug:true, propertyType:true, starRating:true,
          city:true, area:true, photos:true, isVerified:true, isFeatured:true,
          isSponsored:true, googleRating:true, certification:true, createdAt:true,
          roomTypes:{ take:1, orderBy:{ priceFrom:"asc" }, select:{ priceFrom:true } } }
      });
    }

    results.total = results.restaurants.length + results.hotels.length;
    return ok(res, results);
  } catch (e) { return serverError(res, e); }
};
