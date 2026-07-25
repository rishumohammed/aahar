import { Router } from "express";
import { 
  createOrder, 
  getOrderDetails, 
  getCustomerOrders,
  getRestaurantOrders, 
  updateOrderStatus, 
  getRestaurantTables, 
  createRestaurantTable 
} from "../controllers/order.controller.js";
import { verifyToken, optionalVerifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

// Public/Optional-auth consumer table order routes
router.post("/", optionalVerifyToken, createOrder);
router.get("/customer/my", verifyToken, getCustomerOrders);
router.get("/:id", getOrderDetails);

// Restaurant specific table & live order management routes (authenticated owner/staff)
router.get("/restaurant/:restaurantId", verifyToken, requireRole("owner", "manager", "admin", "super_admin"), getRestaurantOrders);
router.patch("/:id/status", verifyToken, requireRole("owner", "manager", "admin", "super_admin"), updateOrderStatus);
router.get("/restaurant/:restaurantId/tables", verifyToken, requireRole("owner", "manager", "admin", "super_admin"), getRestaurantTables);
router.post("/restaurant/:restaurantId/tables", verifyToken, requireRole("owner", "manager", "admin", "super_admin"), createRestaurantTable);

export default router;
