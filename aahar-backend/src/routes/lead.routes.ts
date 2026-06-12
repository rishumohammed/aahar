import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { 
  createLead, 
  listLeads, 
  getLead, 
  updateLeadStatus,
  updateLead,
  deleteLead,
  convertLead
} from "../controllers/lead.controller.js";

const router = Router();

// Public route to submit an enquiry
router.post("/", createLead);

// Protected routes for admins
router.use(verifyToken);
router.get("/", listLeads);
router.get("/:id", getLead);
router.patch("/:id/status", updateLeadStatus);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/convert", convertLead);

export default router;
