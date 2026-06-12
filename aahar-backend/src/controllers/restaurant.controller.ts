import prisma from "../lib/prisma.js";
import { ok, created, badRequest, notFound, serverError, forbidden } from "../utils/response.js";
import { uniqueSlug } from "../utils/slugify.js";

const SAFE_SELECT = {
  id:true, name:true, slug:true, description:true, category:true,
  cuisineType:true, dietary:true, priceRange:true, address:true,
  city:true, area:true, lat:true, lng:true, phone:true, email:true,
  website:true, openingHours:true, amenities:true, photos:true,
  googleRating:true, isVerified:true, isActive:true, isFeatured:true,
  isSponsored:true, createdAt:true,
  owner: { select:{ id:true, name:true, email:true } },
  certification: {
    include: {
      application: {
        include: {
          audit: {
            select: { checklist: true, totalScore: true, completedAt: true }
          }
        }
      }
    }
  },
  menu: { include: { items: { orderBy:{ order:"asc" } } }, orderBy:{ order:"asc" } },
};

// GET /api/restaurants
export const listRestaurants = async (req: any, res: any) => {
  try {
    const {
      city, cuisine, category, certified, dietary,
      lat, lng, radius = 10,
      page = 1, limit = 20,
      q, sort = "featured",
      ownerId
    } = req.query;

    const where: any = { isActive: true };
    if (ownerId)  where.ownerId = ownerId;
    if (city)     where.city     = { contains: city };
    if (category) where.category = category;
    if (dietary)  where.dietary  = dietary;
    if (certified === "true") where.isVerified = true;
    if (q) where.OR = [
      { name:        { contains: q } },
      { description: { contains: q } },
      { area:        { contains: q } },
    ];
    if (cuisine) where.cuisineType = { array_contains: cuisine };

    const orderBy: any =
      sort === "featured"  ? [{ isFeatured:"desc" }, { isSponsored:"desc" }, { googleRating:"desc" }] :
      sort === "rating"    ? [{ googleRating:"desc" }] :
      sort === "newest"    ? [{ createdAt:"desc" }] : [];

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.restaurant.findMany({
        where, orderBy, skip, take: Number(limit), select: SAFE_SELECT as any
      }),
      prisma.restaurant.count({ where }),
    ]);

    return ok(res, {
      items, total, page: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (e) { return serverError(res, e); }
};

// GET /api/restaurants/:slug
export const getRestaurant = async (req: any, res: any) => {
  try {
    const item = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { id: req.params.slug },
          { slug: req.params.slug }
        ]
      },
      select: SAFE_SELECT as any,
    });
    if (!item) return notFound(res, "Restaurant not found");
    return ok(res, item);
  } catch (e) { return serverError(res, e); }
};

// POST /api/restaurants
export const createRestaurant = async (req: any, res: any) => {
  try {
    const { name, ownerId, ...rest } = req.body;
    if (!name) return badRequest(res, "Name is required");
    const slug = await uniqueSlug(prisma, "restaurant", name);
    const item = await prisma.restaurant.create({
      data: { name, slug, ownerId: (ownerId || req.user.id), ...rest },
      select: SAFE_SELECT as any,
    });
    return created(res, item, "Restaurant created");
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/restaurants/:id
export const updateRestaurant = async (req: any, res: any) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, "Restaurant not found");
    if (existing.ownerId !== req.user.id && !["admin", "super_admin"].includes(req.user.role))
      return forbidden(res, "Not your restaurant");
    
    const { id, slug, ownerId, createdAt, menu, ...data } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Profile
      const updated = await tx.restaurant.update({
        where: { id: req.params.id },
        data,
        select: SAFE_SELECT as any
      });

      // 2. Update Menu if provided
      if (menu) {
        await tx.menuSection.deleteMany({ where: { restaurantId: req.params.id } });
        for (const s of menu) {
          await tx.menuSection.create({
            data: {
              restaurantId: req.params.id,
              name: s.name,
              order: s.order || 0,
              items: {
                create: s.items.map((item: any, i: number) => ({
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  dietary: item.dietary,
                  isAvailable: item.isAvailable !== false,
                  order: item.order || i,
                }))
              }
            }
          });
        }
      }
      return updated;
    });

    // Re-fetch with full menu
    const final = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      select: SAFE_SELECT as any
    });

    return ok(res, final, "Restaurant updated successfully");
  } catch (e) { return serverError(res, e); }
};

// DELETE /api/restaurants/:id
export const deleteRestaurant = async (req: any, res: any) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, "Restaurant not found");
    if (existing.ownerId !== req.user.id && !["admin", "super_admin"].includes(req.user.role))
      return forbidden(res, "Not authorized");
    
    await prisma.restaurant.delete({ where: { id: req.params.id } });
    return ok(res, null, "Restaurant deleted successfully");
  } catch (e) { return serverError(res, e); }
};

// POST /api/restaurants/:id/menu — upsert full menu
export const upsertMenu = async (req: any, res: any) => {
  try {
    const { sections } = req.body; // MenuSection[]
    const restaurantId = req.params.id;
    await prisma.$transaction(async (tx) => {
      await tx.menuSection.deleteMany({ where: { restaurantId } });
      for (const s of sections) {
        await tx.menuSection.create({
          data: {
            restaurantId, name: s.name, order: s.order,
            items: { create: s.items.map((item: any, i: number) => ({
              name: item.name, description: item.description,
              price: item.price, dietary: item.dietary,
              isAvailable: item.isAvailable, order: i,
            }))},
          }
        });
      }
    });
    const updated = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { menu: { include:{ items:{ orderBy:{ order:"asc" } } }, orderBy:{ order:"asc" } } } as any
    });
    return ok(res, updated?.menu, "Menu updated");
  } catch (e) { return serverError(res, e); }
};
