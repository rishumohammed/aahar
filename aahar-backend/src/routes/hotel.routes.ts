import { Router } from "express";
import { listHotels, getHotel, createHotel, updateHotel, deleteHotel, upsertRoom, deleteRoom } from "../controllers/hotel.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get("/",                      listHotels);
router.get("/:slug",                 getHotel);
router.post("/",                     verifyToken, requireRole("owner","manager","admin","super_admin"), createHotel);
router.patch("/:id",                 verifyToken, requireRole("owner","manager","admin","super_admin"), updateHotel);
router.delete("/:id",                verifyToken, requireRole("owner","manager","admin","super_admin"), deleteHotel);
router.post("/:id/rooms",            verifyToken, requireRole("owner","manager","admin","super_admin"), upsertRoom);
router.delete("/:id/rooms/:roomId",  verifyToken, requireRole("owner","manager","admin","super_admin"), deleteRoom);

export default router;
