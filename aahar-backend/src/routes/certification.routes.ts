import { Router } from "express";
import {
  issueCertification, downloadCertPDF, updateCertStatus
} from "../controllers/certification.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(  "/",              verifyToken, requireRole("admin","super_admin"), issueCertification);
router.patch( "/:id/status",    verifyToken, requireRole("admin","super_admin"), updateCertStatus);
router.get(   "/:id/pdf",       verifyToken, downloadCertPDF);

export default router;
