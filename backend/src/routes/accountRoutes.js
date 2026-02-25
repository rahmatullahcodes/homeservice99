import express from "express";
import {
  getDashboard,
  getBookings,
  getReviews,
  getProfile,
  updateProfile,
  getAddresses,
  getPayments,
  getCoupons,
  getWallet,
  getReferral,
  getSettings,
  cancelBooking,
  downloadInvoice
} from "../controllers/accountController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All account routes require authentication
router.use(auth);

// Dashboard Routes
router.get("/dashboard", getDashboard);
router.get("/bookings", getBookings);
router.get("/reviews", getReviews);
router.get("/profile", getProfile);
router.post("/profile", updateProfile);

// Account Management Routes
router.get("/addresses", getAddresses);
router.get("/payments", getPayments);
router.get("/coupons", getCoupons);
router.get("/wallet", getWallet);
router.get("/referral", getReferral);
router.get("/settings", getSettings);

// Action Routes
router.post("/bookings/:bookingId/cancel", cancelBooking);
router.get("/bookings/:bookingId/invoice", downloadInvoice);

export default router;
