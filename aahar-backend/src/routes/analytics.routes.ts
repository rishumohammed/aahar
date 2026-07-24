import { Router } from "express";
import { getAdminStats, getOwnerStats } from "../controllers/analytics.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get("/admin/dashboard", verifyToken, requireRole("admin", "super_admin"), getAdminStats);
router.get("/owner/stats", verifyToken, requireRole("owner", "manager"), getOwnerStats);

export default router;

