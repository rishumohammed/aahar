import { Router } from "express";
import { 
  listPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from "../controllers/promotion.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// Public routes
router.get("/", listPromotions);

// Admin / Editor routes
router.post("/", verifyToken, requireRole("super_admin", "admin"), createPromotion);
router.patch("/:id", verifyToken, requireRole("super_admin", "admin"), updatePromotion);
router.delete("/:id", verifyToken, requireRole("super_admin", "admin"), deletePromotion);

export default router;
