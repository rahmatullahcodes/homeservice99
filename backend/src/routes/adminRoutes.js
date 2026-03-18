import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
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

router.get("/dashboard", getDashboardStats);
router.get("/settings/payment-methods", getPaymentGatewaySettings);
router.patch("/settings/payment-methods", updatePaymentGatewaySettings);
router.get("/settings/homepage", getHomePageSettings);
router.patch("/settings/homepage", updateHomePageSettings);
router.get("/payment-methods", getPaymentGatewaySettings);
router.patch("/payment-methods", updatePaymentGatewaySettings);
router.get("/homepage", getHomePageSettings);
router.patch("/homepage", updateHomePageSettings);

// User routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.post("/users/:id/wallet-adjust", adjustUserWallet);
router.delete("/users/:id", deleteUser);

// Vendor routes
router.get("/vendors", getAllVendors);
router.post("/vendors", createVendor);
router.patch("/vendors/:id/status", updateVendorStatus);
router.delete("/vendors/:id", deleteVendor);

// Booking routes
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Payment routes
router.get("/payments", getAllPayments);
router.patch("/payments/:id/status", updatePaymentStatus);
router.post("/payments/manual-credit", addManualVendorPayment);

// Service routes
router.get("/services", getAllServicesAdmin);
router.get("/services/taxonomy", getServiceTaxonomy);
router.patch("/services/category/rename", renameServiceCategory);
router.patch("/services/category/status", setCategoryStatus);
router.patch("/services/subcategory/rename", renameServiceSubcategory);
router.patch("/services/subcategory/status", setSubcategoryStatus);
router.post("/services", createService);
router.patch("/services/:id", updateService);
router.patch("/services/:id/toggle", toggleServiceStatus);
router.delete("/services/:id", deleteService);

// Coupon routes
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id", updateCoupon);
router.patch("/coupons/:id/toggle", toggleCouponStatus);
router.delete("/coupons/:id", deleteCoupon);

// Review routes
router.get("/reviews", getAllReviews);
router.patch("/reviews/:id/status", updateReviewStatus);
router.delete("/reviews/:id", deleteReview);
router.get("/reviews/vendor/:vendorId", getVendorReviews);
router.get("/reviews/user/:userId", getUserReviews);
router.post("/reviews", createReview);

export default router;
