import { Router } from "express";
import {
  submitApplication, listApplications, getApplication,
  updateApplicationStatus, uploadDocument
} from "../controllers/application.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(   "/",                  verifyToken, submitApplication);
router.get(    "/",                  verifyToken, listApplications);
router.get(    "/:id",               verifyToken, getApplication);
router.patch(  "/:id/status",        verifyToken, requireRole("admin","super_admin"), updateApplicationStatus);
router.post(   "/:id/documents",     verifyToken, uploadDocument);

export default router;
