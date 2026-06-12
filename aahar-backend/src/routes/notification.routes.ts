import { Router } from "express";
import { listNotifications, markAllRead, markRead }
  from "../controllers/notification.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get(   "/",            verifyToken, listNotifications);
router.patch( "/read-all",    verifyToken, markAllRead);
router.patch( "/:id/read",    verifyToken, markRead);

export default router;
