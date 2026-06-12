import { Router } from "express";
import { listRestaurants, getRestaurant, createRestaurant, updateRestaurant, upsertMenu, deleteRestaurant } from "../controllers/restaurant.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get("/",          listRestaurants);
router.get("/:slug",     getRestaurant);
router.post("/",         verifyToken, requireRole("owner","admin","super_admin"), createRestaurant);
router.patch("/:id",     verifyToken, requireRole("owner","admin","super_admin"), updateRestaurant);
router.delete("/:id",    verifyToken, requireRole("owner","admin","super_admin"), deleteRestaurant);
router.post("/:id/menu", verifyToken, requireRole("owner","admin","super_admin"), upsertMenu);

export default router;
