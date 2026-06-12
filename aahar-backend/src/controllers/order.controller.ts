import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { getIO } from "../socket.js";
import QRCode from "qrcode";

// ── Submit Dine-in Order ──────────────────────────────────
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, tableNumber, customerName, customerPhone, notes, items } = req.body;

    if (!restaurantId || !tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Missing required order parameters." });
      return;
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true, name: true, slug: true }
    });

    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found." });
      return;
    }

    // Calculate prices
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem || !menuItem.isAvailable) {
        res.status(400).json({ success: false, message: `Menu item ${item.menuItemId} is not available.` });
        return;
      }

      totalAmount += menuItem.price * item.quantity;
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || null
      });
    }

    // Create Order in transaction
    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableNumber: String(tableNumber),
        customerName: customerName || "Anonymous Diner",
        customerPhone: customerPhone || null,
        notes: notes || null,
        totalAmount,
        status: "pending",
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Notify owner via Socket.io
    try {
      const io = getIO();
      io.to(`user_${restaurant.ownerId}`).emit("new_order", {
        ...order,
        restaurantName: restaurant.name
      });
    } catch (socketError) {
      console.warn("Could not send real-time socket event (socket.io might not be active):", socketError);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Get Public Order Details (Tracker) ────────────────────
export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        restaurant: {
          select: { name: true, slug: true, phone: true }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Get Live Orders for Restaurant (Owner) ────────────────
export const getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    // Check permissions (the route should have verifyToken so req.user is populated)
    const user = (req as any).user;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId as string },
      select: { ownerId: true }
    });

    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found." });
      return;
    }

    if (restaurant.ownerId !== user.id && !["admin", "super_admin"].includes(user.role)) {
      res.status(403).json({ success: false, message: "Unauthorized access to this restaurant." });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurantId as string },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Update Order Status (Owner) ───────────────────────────
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: "Missing new status." });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        restaurant: {
          select: { ownerId: true }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const user = (req as any).user;
    if ((order as any).restaurant?.ownerId !== user.id && !["admin", "super_admin"].includes(user.role)) {
      res.status(403).json({ success: false, message: "Unauthorized access." });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Notify of status change via Socket.io
    try {
      const io = getIO();
      // Emitting to order-specific room for the diner live tracker
      io.to(`order_${id}`).emit("order_status_update", updatedOrder);
      // Also notify owner room for syncing screens
      io.to(`user_${(order as any).restaurant?.ownerId}`).emit("order_updated", updatedOrder);
    } catch (socketError) {
      // safe fallback
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Get Restaurant Tables ─────────────────────────────────
export const getRestaurantTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: restaurantId as string },
      orderBy: { tableNumber: "asc" }
    });

    res.status(200).json({ success: true, data: tables });
  } catch (error: any) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── Create Restaurant Table & QR Code ─────────────────────
export const createRestaurantTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const { tableNumber, seatingCapacity } = req.body;

    if (!tableNumber) {
      res.status(400).json({ success: false, message: "Table number is required." });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId as string },
      select: { slug: true }
    });

    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found." });
      return;
    }

    // Generate table dine-in URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const dineInUrl = `${frontendUrl}/restaurant/${restaurant.slug}?table=${tableNumber}`;

    // Generate QR code data URL (base64 PNG)
    const qrCodeUrl = await QRCode.toDataURL(dineInUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#1A2E2E", // Aahar Dark color
        light: "#FFFFFF"
      }
    });

    const table = await prisma.restaurantTable.upsert({
      where: {
        restaurantId_tableNumber: {
          restaurantId: restaurantId as string,
          tableNumber: String(tableNumber)
        }
      },
      update: {
        seatingCapacity: seatingCapacity ? Number(seatingCapacity) : 4,
        qrCodeUrl
      },
      create: {
        restaurantId: restaurantId as string,
        tableNumber: String(tableNumber),
        seatingCapacity: seatingCapacity ? Number(seatingCapacity) : 4,
        qrCodeUrl
      }
    });

    res.status(201).json({ success: true, data: table });
  } catch (error: any) {
    console.error("Error creating table and QR:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
