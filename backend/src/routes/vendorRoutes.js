import express from "express";
import { auth } from "../middleware/auth.js";
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
  requestWithdrawal,
  getVendorTransactions,
  getEarningsReport
} from "../controllers/vendorController.js";
import {
  getVendorProfile,
  updateVendorProfile
} from "../controllers/vendorAuthController.js";

const router = express.Router();

/* Protected routes - require vendor authentication */
router.get("/me", auth, getVendorProfile);
router.put("/profile", auth, updateVendorProfile);

// Services routes
router.get("/services", auth, getVendorServices);
router.post("/services", auth, createService);
router.patch("/services/:id", auth, updateService);
router.delete("/services/:id", auth, deleteService);

// Dashboard routes
router.get("/dashboard/stats", auth, getVendorDashboardStats);
router.get("/activity", auth, getVendorActivity);

// Bookings routes
router.get("/bookings", auth, getVendorBookings);
router.get("/bookings/list", auth, getAllVendorBookings);
router.patch("/bookings/:bookingId/status", auth, updateVendorBookingStatus);

// Wallet & Earnings routes
router.get("/wallet/balance", auth, getWalletBalance);
router.post("/wallet/withdraw", auth, requestWithdrawal);
router.get("/transactions", auth, getVendorTransactions);
router.get("/earnings", auth, getEarningsReport);

export default router;
