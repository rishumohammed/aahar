import Razorpay from "razorpay";
import crypto   from "crypto";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (
  amountInPaise: number,
  currency = "INR",
  notes: Record<string, string> = {}
) => {
  const order = await razorpay.orders.create({
    amount:   amountInPaise,
    currency,
    notes,
  });
  return order;
};

export const verifyWebhookSignature = (
  body: string, signature: string
): boolean => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
};

export const verifyPaymentSignature = (
  orderId: string, paymentId: string, signature: string
): boolean => {
  const secret  = process.env.RAZORPAY_KEY_SECRET!;
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
};
