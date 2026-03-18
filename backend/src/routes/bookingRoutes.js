import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import {
  createBooking,
  createBookingPaymentOrder,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  verifyBookingPayment
} from "../controllers/bookingController.js";

const router = express.Router();

/* Protected routes - require authentication */
router.post("/", userAuth, createBooking);
router.post("/payment/order", userAuth, createBookingPaymentOrder);
router.post("/payment/verify", userAuth, verifyBookingPayment);
router.get("/my-bookings", userAuth, getUserBookings);
router.get("/:id", userAuth, getBookingById);
router.patch("/:id/cancel", userAuth, cancelBooking);
router.patch("/:id/status", userAuth, updateBookingStatus);

export default router;
