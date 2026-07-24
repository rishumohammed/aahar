import prisma from "../lib/prisma.js";
import { ok, created, badRequest, notFound, serverError, forbidden } from "../utils/response.js";
import { uniqueSlug } from "../utils/slugify.js";

const HOTEL_SELECT = {
  id:true, name:true, slug:true, description:true, propertyType:true,
  starRating:true, address:true, city:true, area:true, lat:true, lng:true,
  phone:true, email:true, website:true, checkInTime:true, checkOutTime:true,
  cancellationPolicy:true, mealPlans:true, amenities:true, photos:true,
  googleRating:true, isVerified:true, isActive:true, isFeatured:true,
  isSponsored:true, createdAt:true,
  ownerId:true,
  managerId:true,
  owner: { select:{ id:true, name:true, email:true } },
  manager: { select:{ id:true, name:true, email:true } },
  roomTypes: { orderBy:{ order:"asc" } },
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
};

// GET /api/hotels
export const listHotels = async (req: any, res: any) => {
  try {
    const {
      city, propertyType, starMin, budgetMax, certified,
      amenities, page = 1, limit = 20, q, sort = "featured",
      ownerId, managerId
    } = req.query;

    const where: any = { isActive: true };
    if (ownerId)      where.ownerId      = ownerId;
    if (managerId)    where.managerId    = managerId;
    if (city)         where.city         = { contains: city };
    if (propertyType) where.propertyType = propertyType;
    if (certified === "true") where.isVerified = true;
    if (starMin)      where.starRating   = { gte: Number(starMin) };
    if (q) where.OR = [
      { name:        { contains: q } },
      { description: { contains: q } },
      { area:        { contains: q } },
    ];

    const orderBy: any =
      sort === "featured" ? [{ isFeatured:"desc" }, { isSponsored:"desc" }] :
      sort === "rating"   ? [{ googleRating:"desc" }] :
      sort === "newest"   ? [{ createdAt:"desc" }] : [];

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.hotel.findMany({ where, orderBy, skip, take:Number(limit), select:HOTEL_SELECT as any }),
      prisma.hotel.count({ where }),
    ]);

    return ok(res, { items, total, page:Number(page), pageSize:Number(limit), totalPages:Math.ceil(total/Number(limit)) });
  } catch (e) { return serverError(res, e); }
};

// GET /api/hotels/:slug
export const getHotel = async (req: any, res: any) => {
  try {
    const item = await prisma.hotel.findFirst({
      where: { 
        OR: [
          { id: req.params.slug },
          { slug: req.params.slug }
        ]
      }, 
      select: HOTEL_SELECT as any
    });
    if (!item) return notFound(res, "Hotel not found");
    return ok(res, item);
  } catch (e) { return serverError(res, e); }
};

// POST /api/hotels
export const createHotel = async (req: any, res: any) => {
  try {
    const { name, ownerId, roomTypes, ...rest } = req.body;
    if (!name) return badRequest(res, "Name is required");
    const slug = await uniqueSlug(prisma, "hotel", name);
    const item = await prisma.hotel.create({
      data: { 
        name, slug, ownerId: (ownerId || req.user.id), ...rest,
        roomTypes: roomTypes && roomTypes.length > 0 ? {
          create: roomTypes.map((r: any) => ({
            name: r.name,
            description: r.description,
            bedConfig: r.bedConfig || "Standard",
            maxOccupancy: Number(r.maxOccupancy) || 2,
            priceFrom: Number(r.priceFrom) || 0,
            priceNote: r.priceNote,
            totalRooms: Number(r.totalRooms) || 1,
            amenities: r.amenities || [],
            isPopular: r.isPopular === true,
            order: r.order || 0
          }))
        } : undefined
      },
      select: HOTEL_SELECT as any,
    });
    return created(res, item, "Hotel created");
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/hotels/:id
export const updateHotel = async (req: any, res: any) => {
  try {
    const existing = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, "Hotel not found");
    if (existing.ownerId !== req.user.id && existing.managerId !== req.user.id && !["admin", "super_admin"].includes(req.user.role))
      return forbidden(res, "Not your property");
    
    const { id, slug, ownerId, createdAt, roomTypes, owner, manager, certification, ...data } = req.body;

    if (ownerId && ["admin", "super_admin"].includes(req.user.role)) {
      (data as any).ownerId = ownerId;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Profile
      await tx.hotel.update({
        where: { id: req.params.id },
        data
      });

      // 2. Update Room Types if provided
      if (roomTypes) {
        await tx.roomType.deleteMany({ where: { hotelId: req.params.id } });
        for (const r of roomTypes) {
          await tx.roomType.create({
            data: {
              hotelId: req.params.id,
              name: r.name,
              description: r.description,
              bedConfig: r.bedConfig,
              maxOccupancy: r.maxOccupancy,
              priceFrom: Number(r.priceFrom) || 0,
              priceNote: r.priceNote,
              totalRooms: Number(r.totalRooms) || 1,
              amenities: r.amenities || [],
              isPopular: r.isPopular === true,
              order: r.order || 0
            }
          });
        }
      }
    });

    const final = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      select: HOTEL_SELECT as any
    });

    return ok(res, final, "Hotel updated successfully");
  } catch (e) { return serverError(res, e); }
};

// DELETE /api/hotels/:id
export const deleteHotel = async (req: any, res: any) => {
  try {
    const existing = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!existing) return notFound(res, "Hotel not found");
    if (existing.ownerId !== req.user.id && !["admin", "super_admin"].includes(req.user.role))
      return forbidden(res, "Not authorized");
    
    await prisma.hotel.delete({ where: { id: req.params.id } });
    return ok(res, null, "Hotel deleted successfully");
  } catch (e) { return serverError(res, e); }
};

// POST /api/hotels/:id/rooms
export const upsertRoom = async (req: any, res: any) => {
  try {
    const { id: roomId, ...data } = req.body;
    let room;
    if (roomId) {
      room = await prisma.roomType.update({ where:{ id:roomId }, data });
    } else {
      room = await prisma.roomType.create({ data:{ ...data, hotelId:req.params.id } });
    }
    return ok(res, room, roomId ? "Room updated" : "Room created");
  } catch (e) { return serverError(res, e); }
};

// DELETE /api/hotels/:id/rooms/:roomId
export const deleteRoom = async (req: any, res: any) => {
  try {
    await prisma.roomType.delete({ where:{ id:req.params.roomId } });
    return ok(res, null, "Room deleted");
  } catch (e) { return serverError(res, e); }
};
