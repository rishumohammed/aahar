import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ok, serverError, badRequest } from "../utils/response.js";
import prisma from "../lib/prisma.js";

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
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB max for photos
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = file.mimetype.startsWith("image/");
    if (ext || mime) return cb(null, true);
    cb(new Error("Only image files (JPEG, JPG, PNG, WEBP) are allowed. Maximum size: 1MB."));
  },
});

// Middleware wrapper for single photo upload error handling
const handleSinglePhoto = (req: any, res: any, next: any) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return badRequest(res, "File size exceeds the maximum allowed limit of 1MB for photos.");
      }
      return badRequest(res, err.message || "Failed to upload image.");
    }
    next();
  });
};

// Middleware wrapper for multiple photos upload error handling
const handleMultiplePhotos = (req: any, res: any, next: any) => {
  upload.array("files", 10)(req, res, (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return badRequest(res, "One or more files exceed the maximum allowed limit of 1MB per photo.");
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return badRequest(res, "Maximum of 10 photos can be uploaded at once.");
      }
      return badRequest(res, err.message || "Failed to upload images.");
    }
    next();
  });
};

// GET /api/upload/provider
router.get("/provider", (req: any, res: any) => {
  return ok(res, { provider: process.env.STORAGE_PROVIDER || "local" });
});

// POST /api/upload/photo
router.post("/photo", verifyToken, handleSinglePhoto, (req: any, res: any) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded. Please select an image file (max 1MB).");
    const url = `/uploads/photos/${req.file.filename}`;
    return ok(res, { url }, "File uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

// POST /api/upload/photos (Multiple)
router.post("/photos", verifyToken, handleMultiplePhotos, (req: any, res: any) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return badRequest(res, "No files uploaded. Please select image files (max 1MB each).");
    }
    const urls = (req.files as any[]).map(f => `/uploads/photos/${f.filename}`);
    return ok(res, { urls }, "Files uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

// Configure document storage
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "documents");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for documents
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype.startsWith("image/");
    if (ext || mime) return cb(null, true);
    cb(new Error("Invalid file type. Allowed formats: PDF, JPG, PNG, WEBP, DOC, DOCX. Maximum size: 5MB."));
  },
});

// Middleware wrapper for document upload error handling
const handleDocUpload = (req: any, res: any, next: any) => {
  uploadDoc.single("file")(req, res, (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return badRequest(res, "File size exceeds the maximum allowed limit of 5MB for documents.");
      }
      return badRequest(res, err.message || "Failed to upload document.");
    }
    next();
  });
};

// POST /api/upload/document/:applicationId
router.post("/document/:applicationId", verifyToken, handleDocUpload, async (req: any, res: any) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded. Please select a document file (max 5MB).");
    const { docType } = req.body;
    const applicationId = req.params.applicationId;
    const url = `/uploads/documents/${req.file.filename}`;

    const document = await prisma.document.create({
      data: {
        applicationId,
        type: docType || "other",
        name: req.file.originalname,
        url,
        size: req.file.size
      }
    });

    return ok(res, { url, document }, "Document uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

// Configure handbook storage
const handbookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "handbooks");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `handbook-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadHandbook = multer({
  storage: handbookStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// POST /api/upload/handbook
router.post("/handbook", verifyToken, (req: any, res: any, next: any) => {
  uploadHandbook.single("file")(req, res, (err: any) => {
    if (err) return badRequest(res, err.message || "Failed to upload handbook.");
    next();
  });
}, (req: any, res: any) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded.");
    const url = `/uploads/handbooks/${req.file.filename}`;
    return ok(res, { url }, "Handbook uploaded successfully");
  } catch (e) {
    return serverError(res, e);
  }
});

export default router;
