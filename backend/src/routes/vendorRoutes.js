import express from "express";
import { vendorAuth } from "../middleware/vendorAuth.js";
import {
  getVendorServices,
  createService,
  updateService,
  deleteService,
  getVendorDashboardStats,
  getVendorBookings,
  getAllVendorBookings,
  updateVendorBookingStatus,
  getVendorActivity,
  getWalletBalance,
  requestWalletTopUp,
  requestWithdrawal,
  getVendorTransactions,
  getEarningsReport,
  getVendorReviews,
  replyToReview
} from "../controllers/vendorController.js";
import {
  getVendorProfile,
  updateVendorProfile
} from "../controllers/vendorAuthController.js";

const router = express.Router();

/* Protected routes - require vendor authentication */
router.get("/me", vendorAuth, getVendorProfile);
router.put("/profile", vendorAuth, updateVendorProfile);

// Services routes
router.get("/services", vendorAuth, getVendorServices);
router.post("/services", vendorAuth, createService);
router.patch("/services/:id", vendorAuth, updateService);
router.delete("/services/:id", vendorAuth, deleteService);

// Dashboard routes
router.get("/dashboard/stats", vendorAuth, getVendorDashboardStats);
router.get("/activity", vendorAuth, getVendorActivity);

// Bookings routes
router.get("/bookings", vendorAuth, getVendorBookings);
router.get("/bookings/list", vendorAuth, getAllVendorBookings);
router.patch("/bookings/:bookingId/status", vendorAuth, updateVendorBookingStatus);

// Wallet & Earnings routes
router.get("/wallet/balance", vendorAuth, getWalletBalance);
router.post("/wallet/topup", vendorAuth, requestWalletTopUp);
router.post("/wallet/withdraw", vendorAuth, requestWithdrawal);
router.get("/transactions", vendorAuth, getVendorTransactions);
router.get("/earnings", vendorAuth, getEarningsReport);

// Reviews routes
router.get("/reviews", vendorAuth, getVendorReviews);
router.patch("/reviews/:id/reply", vendorAuth, replyToReview);

export default router;
