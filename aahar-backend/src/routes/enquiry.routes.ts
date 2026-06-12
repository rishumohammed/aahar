import { Router } from "express";
import {
  createEnquiry, listEnquiries, getEnquiry,
  sendMessage, updateEnquiryStatus
} from "../controllers/enquiry.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post(  "/",                   verifyToken, createEnquiry);
router.get(   "/",                   verifyToken, listEnquiries);
router.get(   "/:id",                verifyToken, getEnquiry);
router.post(  "/:id/messages",       verifyToken, sendMessage);
router.patch( "/:id/status",         verifyToken, updateEnquiryStatus);

export default router;
