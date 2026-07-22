import { Router } from "express";
import { 
  listBlogs, 
  getBlog, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// Public routes
router.get("/", listBlogs);
router.get("/:slug", getBlog);

// Admin / Editor routes
router.post("/", verifyToken, requireRole("super_admin", "admin"), createBlog);
router.patch("/:id", verifyToken, requireRole("super_admin", "admin"), updateBlog);
router.delete("/:id", verifyToken, requireRole("super_admin", "admin"), deleteBlog);

export default router;
