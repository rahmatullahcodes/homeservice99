import express from "express";
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
// These should be protected by admin middleware
router.get("/admin/services/all", adminGetAllServices);
router.post("/admin/services/create", adminCreateService);
router.put("/admin/services/:id/update", adminUpdateService);
router.put("/admin/services/:id/approve", adminApproveService);
router.put("/admin/services/:id/reject", adminRejectService);
router.delete("/admin/services/:id/delete", adminDeleteService);

/* ============ VENDOR ENDPOINTS ============ */
// These should be protected by vendor middleware
router.get("/vendor/my-services", vendorGetServices);
router.post("/vendor/services/create", vendorCreateService);
router.put("/vendor/services/:id/update", vendorUpdateService);
router.delete("/vendor/services/:id/delete", vendorDeleteService);
router.get("/vendor/services/stats", vendorGetServiceStats);

export default router;
