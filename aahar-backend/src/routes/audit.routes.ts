import { Router } from "express";
import { createAudit, listAudits, getAudit, submitAudit, downloadAuditReport } from "../controllers/audit.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(  "/",           verifyToken, requireRole("admin","super_admin"), createAudit);
router.get(   "/",           verifyToken, listAudits);
router.get(   "/:id",        verifyToken, getAudit);
router.patch( "/:id/submit", verifyToken, requireRole("auditor"), submitAudit);
router.get(   "/:id/report", verifyToken, downloadAuditReport);

export default router;
