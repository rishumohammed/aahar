import { Router } from "express";
import { verifyCertificate, searchCertificates } from "../controllers/certification.controller.js";

const router = Router();

router.get("/",           searchCertificates);  // GET /api/verify?q=Spice Garden
router.get("/:certNumber", verifyCertificate);  // GET /api/verify/AHR-FB-2025-12345

export default router;
