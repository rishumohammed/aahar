import prisma from "../lib/prisma.js";
import { ok, badRequest, notFound, serverError } from "../utils/response.js";
import * as paymentService from "../services/payment.service.js";

// POST /api/payments/create-order
export const createPaymentOrder = async (req: any, res: any) => {
  try {
    const { amount, type, enquiryId, applicationId } = req.body;

    if (!amount || amount <= 0) return badRequest(res, "Valid amount is required");
    if (!type) return badRequest(res, "Payment type is required");

    // Create a Razorpay order
    const amountInPaise = Math.round(amount * 100);
    const order = await paymentService.createOrder(amountInPaise, "INR", {
      type,
      enquiryId: enquiryId || "",
      applicationId: applicationId || "",
      userId: req.user.id,
    });

    // Create a pending payment record in our DB
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: amount,
        currency: "INR",
        status: "pending",
        provider: "razorpay",
        providerOrderId: order.id,
        enquiryId: enquiryId || null,
        applicationId: applicationId || null,
        description: `Payment for ${type}`,
      }
    });

    return ok(res, {
      orderId: order.id,
      paymentId: payment.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (e) { return serverError(res, e); }
};

// POST /api/payments/verify
export const verifyPayment = async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return badRequest(res, "Missing payment verification details");
    }

    const isValid = paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) return badRequest(res, "Invalid payment signature");

    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: razorpay_order_id }
    });

    if (!payment) return notFound(res, "Payment record not found");

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          providerPaymentId: razorpay_payment_id
        }
      });

      // If it's an enquiry payment, update enquiry status
      if (payment.enquiryId) {
        await tx.enquiry.update({
          where: { id: payment.enquiryId },
          data: { status: "confirmed" }
        });
      }

      // If it's an application payment, update application status
      if (payment.applicationId) {
        await tx.application.update({
          where: { id: payment.applicationId },
          data: { status: "under_review" } // Or whichever status is appropriate
        });
      }
    });

    return ok(res, null, "Payment verified successfully");
  } catch (e) { return serverError(res, e); }
};

// POST /api/payments/webhook
export const razorpayWebhook = async (req: any, res: any) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const bodyString = JSON.stringify(req.body);

    const isValid = paymentService.verifyWebhookSignature(bodyString, signature as string);
    if (!isValid) return res.status(400).send("Invalid signature");

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    if (event === "payment.captured") {
      const orderId = payload.order_id;
      const payment = await prisma.payment.findFirst({ where: { providerOrderId: orderId } });
      
      if (payment && payment.status !== "captured") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "captured", providerPaymentId: payload.id }
          });
          
          if (payment.enquiryId) {
            await tx.enquiry.update({ where: { id: payment.enquiryId }, data: { status: "confirmed" } });
          }
          
          if (payment.applicationId) {
            await tx.application.update({ where: { id: payment.applicationId }, data: { status: "under_review" } });
          }
        });
      }
    }

    return res.status(200).send("OK");
  } catch (e) {
    console.error("Webhook Error:", e);
    return res.status(500).send("Internal Error");
  }
};

// GET /api/payments
export const listPayments = async (req: any, res: any) => {
  try {
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    const where = isAdmin ? {} : { userId: req.user.id };

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        application: { select: { id: true, businessType: true } },
        enquiry: { include: { hotel: { select: { name: true } } } }
      }
    });

    return ok(res, payments);
  } catch (e) { return serverError(res, e); }
};

