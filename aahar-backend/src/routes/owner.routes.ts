import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { listManagers, createManager, deleteManager, listEstablishments } from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/managers", verifyToken, requireRole("owner"), listManagers);
router.post("/managers", verifyToken, requireRole("owner"), createManager);
router.delete("/managers/:id", verifyToken, requireRole("owner"), deleteManager);
router.get("/establishments", verifyToken, requireRole("owner"), listEstablishments);

export default router;
