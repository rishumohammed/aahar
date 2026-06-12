import { Router }  from "express";
import { createPaymentOrder, verifyPayment, razorpayWebhook, listPayments }
  from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post( "/create-order", verifyToken, createPaymentOrder);
router.post( "/verify",       verifyToken, verifyPayment);
router.post( "/webhook",      razorpayWebhook);  // no auth — Razorpay calls directly
router.get(  "/",             verifyToken, listPayments);

export default router;
