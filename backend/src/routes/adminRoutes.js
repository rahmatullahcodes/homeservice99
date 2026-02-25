import express from "express";
import { auth } from "../middleware/auth.js";
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
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  updateBookingStatus,
  updatePaymentStatus,
  updateUser,
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

const router = express.Router();

/* Admin routes - require admin authentication */
router.get("/dashboard", auth, getDashboardStats);

// User routes
router.get("/users", auth, getAllUsers);
router.post("/users", auth, createUser);
router.patch("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);

// Vendor routes
router.get("/vendors", auth, getAllVendors);
router.post("/vendors", auth, createVendor);
router.patch("/vendors/:id/status", auth, updateVendorStatus);
router.delete("/vendors/:id", auth, deleteVendor);

// Booking routes
router.get("/bookings", auth, getAllBookings);
router.patch("/bookings/:id/status", auth, updateBookingStatus);

// Payment routes
router.get("/payments", auth, getAllPayments);
router.patch("/payments/:id/status", auth, updatePaymentStatus);

// Service routes
router.get("/services", auth, getAllServicesAdmin);
router.post("/services", auth, createService);
router.patch("/services/:id", auth, updateService);
router.patch("/services/:id/toggle", auth, toggleServiceStatus);
router.delete("/services/:id", auth, deleteService);

// Coupon routes
router.get("/coupons", auth, getAllCoupons);
router.post("/coupons", auth, createCoupon);
router.patch("/coupons/:id", auth, updateCoupon);
router.patch("/coupons/:id/toggle", auth, toggleCouponStatus);
router.delete("/coupons/:id", auth, deleteCoupon);

// Review routes
router.get("/reviews", auth, getAllReviews);
router.patch("/reviews/:id/status", auth, updateReviewStatus);
router.delete("/reviews/:id", auth, deleteReview);
router.get("/reviews/vendor/:vendorId", getVendorReviews);
router.get("/reviews/user/:userId", getUserReviews);
router.post("/reviews", auth, createReview);

// Public coupon validation (for users)
router.post("/validate-coupon", validateCoupon);

export default router;
