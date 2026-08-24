import prisma from "../lib/prisma.js";
import { ok, badRequest, notFound, serverError, forbidden, created } from "../utils/response.js";
import bcrypt from "bcryptjs";

// GET /api/owner/managers
export const listManagers = async (req: any, res: any) => {
  try {
    const ownerId = req.user.id;

    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId },
      select: { id: true, name: true, manager: { select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true } } }
    });

    const hotels = await prisma.hotel.findMany({
      where: { ownerId },
      select: { id: true, name: true, manager: { select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true } } }
    });

    const managersList: any[] = [];
    
    restaurants.forEach(r => {
      if (r.manager) {
        managersList.push({ ...r.manager, assignedTo: r.name, establishmentId: r.id, type: "restaurant" });
      }
    });

    hotels.forEach(h => {
      if (h.manager) {
        managersList.push({ ...h.manager, assignedTo: h.name, establishmentId: h.id, type: "hotel" });
      }
    });

    return ok(res, managersList);
  } catch (e) {
    return serverError(res, e);
  }
};

export const createManager = async (req: any, res: any) => {
  try {
    const ownerId = req.user.id;
    const { name, email, phone, password, establishmentId, type } = req.body;

    if (!name || !email || !password || !establishmentId || !type) {
      return badRequest(res, "Missing required fields");
    }

    if (type === "restaurant") {
      const rest = await prisma.restaurant.findUnique({ where: { id: establishmentId } });
      if (!rest || rest.ownerId !== ownerId) return forbidden(res, "Not authorized for this restaurant");
    } else if (type === "hotel") {
      const hot = await prisma.hotel.findUnique({ where: { id: establishmentId } });
      if (!hot || hot.ownerId !== ownerId) return forbidden(res, "Not authorized for this hotel");
    } else {
      return badRequest(res, "Invalid establishment type");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email, phone, passwordHash, role: "manager"
      },
      select: { id: true, name: true, email: true }
    });

    if (type === "restaurant") {
      await prisma.restaurant.update({
        where: { id: establishmentId },
        data: { managerId: user.id }
      });
    } else if (type === "hotel") {
      await prisma.hotel.update({
        where: { id: establishmentId },
        data: { managerId: user.id }
      });
    }

    return created(res, user, "Manager created successfully");
  } catch (e: any) {
    if (e.code === 'P2002') {
      return badRequest(res, "Email already exists");
    }
    return serverError(res, e);
  }
};

export const deleteManager = async (req: any, res: any) => {
  try {
    const managerId = req.params.id;
    const ownerId = req.user.id;

    const rest = await prisma.restaurant.findFirst({ where: { managerId, ownerId } });
    if (rest) {
      await prisma.restaurant.update({ where: { id: rest.id }, data: { managerId: null } });
      await prisma.user.delete({ where: { id: managerId } });
      return ok(res, null, "Manager deleted successfully");
    }

    const hot = await prisma.hotel.findFirst({ where: { managerId, ownerId } });
    if (hot) {
      await prisma.hotel.update({ where: { id: hot.id }, data: { managerId: null } });
      await prisma.user.delete({ where: { id: managerId } });
      return ok(res, null, "Manager deleted successfully");
    }

    return forbidden(res, "Not authorized to delete this manager");
  } catch (e) {
    return serverError(res, e);
  }
};

export const resetManagerPassword = async (req: any, res: any) => {
  try {
    const managerId = req.params.id;
    const ownerId = req.user.id;
    const newPassword = req.body?.password?.trim();

    if (!newPassword || newPassword.length < 6) {
      return badRequest(res, "Password must be at least 6 characters long");
    }

    const rest = await prisma.restaurant.findFirst({ where: { managerId, ownerId } });
    const hot = await prisma.hotel.findFirst({ where: { managerId, ownerId } });

    if (!rest && !hot) {
      return forbidden(res, "Not authorized to modify this manager");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: managerId },
      data: { passwordHash }
    });

    return ok(res, null, "Manager password reset successfully");
  } catch (e) {
    return serverError(res, e);
  }
};

export const listEstablishments = async (req: any, res: any) => {
  try {
    const ownerId = req.user.id;
    const restaurants = await prisma.restaurant.findMany({ where: { ownerId }, select: { id: true, name: true, managerId: true, isVerified: true } });
    const hotels = await prisma.hotel.findMany({ where: { ownerId }, select: { id: true, name: true, managerId: true, isVerified: true } });
    
    const establishments = [
      ...restaurants.map(r => ({ id: r.id, name: r.name, type: "restaurant", hasManager: !!r.managerId, isVerified: r.isVerified })),
      ...hotels.map(h => ({ id: h.id, name: h.name, type: "hotel", hasManager: !!h.managerId, isVerified: h.isVerified }))
    ];

    return ok(res, establishments);
  } catch (e) {
    return serverError(res, e);
  }
};
