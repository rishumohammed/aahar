import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import searchRoutes from "./routes/search.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import certificationRoutes from "./routes/certification.routes.js";
import verifyRoutes from "./routes/verify.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes      from "./routes/payment.routes.js";
import analyticsRoutes    from "./routes/analytics.routes.js";
import adminRoutes        from "./routes/admin.routes.js";
import uploadRoutes       from "./routes/upload.routes.js";
import orderRoutes        from "./routes/order.routes.js";
import leadRoutes         from "./routes/lead.routes.js";
import masterRoutes       from "./routes/master.routes.js";
import settingsRoutes     from "./routes/settings.routes.js";
import blogRoutes         from "./routes/blog.routes.js";
import promotionRoutes    from "./routes/promotion.routes.js";
import ownerRoutes        from "./routes/owner.routes.js";
import path from "path";

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    process.env.FRONTEND_URL,
  ].filter((o): o is string => !!o),
  credentials: true,
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Backend is healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments",      paymentRoutes);
app.use("/api",               analyticsRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/upload",        uploadRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/leads",         leadRoutes);
app.use("/api/master",        masterRoutes);
app.use("/api/settings",      settingsRoutes);
app.use("/api/blogs",         blogRoutes);
app.use("/api/promotions",    promotionRoutes);
app.use("/api/owner",         ownerRoutes);

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Express Error:", err);
  if (err?.name === "MulterError" || err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ 
      success: false, 
      message: err.code === "LIMIT_FILE_SIZE" 
        ? "File size exceeds the allowed limit (Maximum: 1MB for photos, 5MB for documents)."
        : err.message || "File upload error."
    });
  }
  if (err?.message && (err.message.includes("allowed") || err.message.includes("Invalid file type"))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err?.message || 'Internal server error' });
});

export default app;
// trigger restart
