import { Router } from "express";
import {
  submitApplication, listApplications, getApplication,
  updateApplicationStatus, uploadDocument,
  getMessages, sendMessage, submitCorrections
} from "../controllers/application.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(   "/",                  verifyToken, submitApplication);
router.get(    "/",                  verifyToken, listApplications);
router.get(    "/:id",               verifyToken, getApplication);
router.patch(  "/:id/status",        verifyToken, requireRole("admin","super_admin"), updateApplicationStatus);
router.post(   "/:id/documents",     verifyToken, uploadDocument);
router.get(    "/:id/messages",      verifyToken, getMessages);
router.post(   "/:id/messages",      verifyToken, sendMessage);
router.post(   "/:id/submit-corrections", verifyToken, submitCorrections);

export default router;
