import { Router } from "express";
import { listUsers, getUser, updateUser, deleteUser, resetUserPassword, listAuditors, assignAudit, listAudits, reopenAudit } from "../controllers/admin.controller.js";
import { issueCertification } from "../controllers/certification.controller.js";
import { listStandards, createStandard, updateStandard, deleteStandard, addCriterion, deleteCriterion } from "../controllers/standard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// All routes here require super_admin or admin role
router.use(verifyToken, requireRole("admin", "super_admin"));

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/:id/reset-password", resetUserPassword);
router.get("/auditors", listAuditors);
router.get("/audits", listAudits);
router.post("/audits", assignAudit);
router.patch("/audits/:id/reopen", reopenAudit);
router.post("/certify", issueCertification);

// Standards
router.get("/standards", listStandards);
router.post("/standards", createStandard);
router.patch("/standards/:id", updateStandard);
router.delete("/standards/:id", deleteStandard);
router.post("/standards/:id/criteria", addCriterion);
router.delete("/standards/criteria/:criterionId", deleteCriterion);

export default router;
