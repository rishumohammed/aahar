import prisma from "../lib/prisma.js";
import { ok, serverError } from "../utils/response.js";

// GET /api/notifications
export const listNotifications = async (req: any, res: any) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take:    50,
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return ok(res, { notifications, unreadCount });
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: any, res: any) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });
    return ok(res, null, "All notifications marked as read");
  } catch (e) { return serverError(res, e); }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: any, res: any) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data:  { isRead: true },
    });
    return ok(res, null, "Notification marked as read");
  } catch (e) { return serverError(res, e); }
};
