import { Router } from "express";
import {
  listMasterData,
  createMasterData,
  updateMasterData,
  deleteMasterData
} from "../controllers/master.controller.js";

const router = Router();

router.get("/", listMasterData);
router.post("/", createMasterData);
router.put("/:id", updateMasterData);
router.delete("/:id", deleteMasterData);

export default router;
