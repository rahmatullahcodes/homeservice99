import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { adminOnly, requireAdminPermission } from "../middleware/adminPermissions.js";
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  getAllVendors,
  createVendor,
  updateVendorStatus,
  deleteVendor,
  getAllBookings,
  getAllPayments,
  getAllServicesAdmin,
  getServiceTaxonomy,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  renameServiceCategory,
  setCategoryStatus,
  renameServiceSubcategory,
  setSubcategoryStatus,
  updateBookingStatus,
  updatePaymentStatus,
  addManualVendorPayment,
  updateUser,
  adjustUserWallet,
  deleteUser,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  createReview,
  getVendorReviews,
  getUserReviews
} from "../controllers/adminController.js";
import {
  getAllAdmins,
  getAdminProfile,
  createSubAdmin,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminManagementController.js";
import {
  getPaymentGatewaySettings,
  getHomePageSettings,
  updateHomePageSettings,
  updatePaymentGatewaySettings
} from "../controllers/settingsController.js";

const router = express.Router();

// Public coupon validation (for users)
router.post("/validate-coupon", validateCoupon);

/* Admin routes - require admin authentication */
router.use(adminAuth);

router.get("/me", getAdminProfile);

// Admin management (super admin only)
router.get("/admins", adminOnly, getAllAdmins);
router.post("/admins", adminOnly, createSubAdmin);
router.patch("/admins/:id", adminOnly, updateAdmin);
router.delete("/admins/:id", adminOnly, deleteAdmin);

router.get("/dashboard", requireAdminPermission("dashboard"), getDashboardStats);
router.get(
  "/settings/payment-methods",
  requireAdminPermission("paymentMethods"),
  getPaymentGatewaySettings
);
router.patch(
  "/settings/payment-methods",
  requireAdminPermission("paymentMethods"),
  updatePaymentGatewaySettings
);
router.get("/settings/homepage", requireAdminPermission("homePage"), getHomePageSettings);
router.patch("/settings/homepage", requireAdminPermission("homePage"), updateHomePageSettings);
router.get("/payment-methods", requireAdminPermission("paymentMethods"), getPaymentGatewaySettings);
router.patch("/payment-methods", requireAdminPermission("paymentMethods"), updatePaymentGatewaySettings);
router.get("/homepage", requireAdminPermission("homePage"), getHomePageSettings);
router.patch("/homepage", requireAdminPermission("homePage"), updateHomePageSettings);

// User routes
router.get("/users", requireAdminPermission("users"), getAllUsers);
router.post("/users", requireAdminPermission("users"), createUser);
router.patch("/users/:id", requireAdminPermission("users"), updateUser);
router.post("/users/:id/wallet-adjust", requireAdminPermission("users"), adjustUserWallet);
router.delete("/users/:id", requireAdminPermission("users"), deleteUser);

// Vendor routes
router.get("/vendors", requireAdminPermission("vendors"), getAllVendors);
router.post("/vendors", requireAdminPermission("vendors"), createVendor);
router.patch("/vendors/:id/status", requireAdminPermission("vendors"), updateVendorStatus);
router.delete("/vendors/:id", requireAdminPermission("vendors"), deleteVendor);

// Booking routes
router.get("/bookings", requireAdminPermission("bookings"), getAllBookings);
router.patch("/bookings/:id/status", requireAdminPermission("bookings"), updateBookingStatus);

// Payment routes
router.get("/payments", requireAdminPermission(["payments", "wallet"]), getAllPayments);
router.patch("/payments/:id/status", requireAdminPermission("payments"), updatePaymentStatus);
router.post("/payments/manual-credit", requireAdminPermission("payments"), addManualVendorPayment);

// Service routes
router.get("/services", requireAdminPermission("services"), getAllServicesAdmin);
router.get("/services/taxonomy", requireAdminPermission("services"), getServiceTaxonomy);
router.patch("/services/category/rename", requireAdminPermission("services"), renameServiceCategory);
router.patch("/services/category/status", requireAdminPermission("services"), setCategoryStatus);
router.patch("/services/subcategory/rename", requireAdminPermission("services"), renameServiceSubcategory);
router.patch("/services/subcategory/status", requireAdminPermission("services"), setSubcategoryStatus);
router.post("/services", requireAdminPermission("services"), createService);
router.patch("/services/:id", requireAdminPermission("services"), updateService);
router.patch("/services/:id/toggle", requireAdminPermission("services"), toggleServiceStatus);
router.delete("/services/:id", requireAdminPermission("services"), deleteService);

// Coupon routes
router.get("/coupons", requireAdminPermission("coupons"), getAllCoupons);
router.post("/coupons", requireAdminPermission("coupons"), createCoupon);
router.patch("/coupons/:id", requireAdminPermission("coupons"), updateCoupon);
router.patch("/coupons/:id/toggle", requireAdminPermission("coupons"), toggleCouponStatus);
router.delete("/coupons/:id", requireAdminPermission("coupons"), deleteCoupon);

// Review routes
router.get("/reviews", requireAdminPermission("reviews"), getAllReviews);
router.patch("/reviews/:id/status", requireAdminPermission("reviews"), updateReviewStatus);
router.delete("/reviews/:id", requireAdminPermission("reviews"), deleteReview);
router.get("/reviews/vendor/:vendorId", requireAdminPermission("reviews"), getVendorReviews);
router.get("/reviews/user/:userId", requireAdminPermission("reviews"), getUserReviews);
router.post("/reviews", requireAdminPermission("reviews"), createReview);

export default router;
