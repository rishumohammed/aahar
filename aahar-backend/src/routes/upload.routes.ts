import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ok, serverError, badRequest } from "../utils/response.js";

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "photos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only images are allowed"));
  },
});

// POST /api/upload/photo
router.post("/photo", verifyToken, upload.single("file"), (req: any, res: any) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded");
    const url = `/uploads/photos/${req.file.filename}`;
    return ok(res, { url }, "File uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

// POST /api/upload/photos (Multiple)
router.post("/photos", verifyToken, upload.array("files", 10), (req: any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) return badRequest(res, "No files uploaded");
    const urls = (req.files as any[]).map(f => `/uploads/photos/${f.filename}`);
    return ok(res, { urls }, "Files uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

export default router;
