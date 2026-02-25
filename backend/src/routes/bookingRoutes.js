import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus
} from "../controllers/bookingController.js";

const router = express.Router();

/* Protected routes - require authentication */
router.post("/", auth, createBooking);
router.get("/my-bookings", auth, getUserBookings);
router.get("/:id", auth, getBookingById);
router.patch("/:id/cancel", auth, cancelBooking);
router.patch("/:id/status", auth, updateBookingStatus);

export default router;
