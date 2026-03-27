import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { vendorAuth } from "../middleware/vendorAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";
import {
  // Public endpoints
  getAllServices,
  getServiceById,
  getServicesByCategory,
  getServicesBySubcategory,
  getAllCategories,
  getSubcategoriesByCategory,
  // Admin endpoints
  adminGetAllServices,
  adminCreateService,
  adminUpdateService,
  adminApproveService,
  adminRejectService,
  adminDeleteService,
  // Vendor endpoints
  vendorGetServices,
  vendorCreateService,
  vendorUpdateService,
  vendorDeleteService,
  vendorGetServiceStats
} from "../controllers/serviceController.js";

const router = express.Router();

/* ============ PUBLIC ENDPOINTS ============ */
router.get("/", getAllServices);
router.get("/categories/all", getAllCategories);
router.get("/categories/:category/subcategories", getSubcategoriesByCategory);
router.get("/:id", getServiceById);
router.get("/category/:category", getServicesByCategory);
router.get("/category/:category/subcategory/:subcategory", getServicesBySubcategory);

/* ============ ADMIN ENDPOINTS ============ */
router.get("/admin/services/all", adminAuth, requireAdminPermission("services"), adminGetAllServices);
router.post("/admin/services/create", adminAuth, requireAdminPermission("services"), adminCreateService);
router.put("/admin/services/:id/update", adminAuth, requireAdminPermission("services"), adminUpdateService);
router.put("/admin/services/:id/approve", adminAuth, requireAdminPermission("services"), adminApproveService);
router.put("/admin/services/:id/reject", adminAuth, requireAdminPermission("services"), adminRejectService);
router.delete("/admin/services/:id/delete", adminAuth, requireAdminPermission("services"), adminDeleteService);

/* ============ VENDOR ENDPOINTS ============ */
router.get("/vendor/my-services", vendorAuth, vendorGetServices);
router.post("/vendor/services/create", vendorAuth, vendorCreateService);
router.put("/vendor/services/:id/update", vendorAuth, vendorUpdateService);
router.delete("/vendor/services/:id/delete", vendorAuth, vendorDeleteService);
router.get("/vendor/services/stats", vendorAuth, vendorGetServiceStats);

export default router;
