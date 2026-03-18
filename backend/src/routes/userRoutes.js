import express from "express";
import {
  getMe,
  getDashboard,
  getUserBookings,
  cancelUserBooking,
  getBookingInvoice,
  updateProfile,
  updatePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getWallet,
  createWalletTopupOrder,
  verifyWalletTopup,
  topupWallet,
  getCoupons,
  getUserReviews,
  getReviewableBookings,
  createReview,
  getReferral
} from "../controllers/userController.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/me", userAuth, getMe);
router.get("/dashboard", userAuth, getDashboard);
router.patch("/profile", userAuth, updateProfile);
router.put("/profile", userAuth, updateProfile);
router.post("/profile", userAuth, updateProfile);
router.patch("/update", userAuth, updateProfile);
router.patch("/password", userAuth, updatePassword);
router.put("/password", userAuth, updatePassword);
router.post("/password", userAuth, updatePassword);
router.delete("/account", userAuth, deleteAccount);

router.get("/bookings", userAuth, getUserBookings);
router.patch("/bookings/:bookingId/cancel", userAuth, cancelUserBooking);
router.get("/bookings/:bookingId/invoice", userAuth, getBookingInvoice);

router.get("/addresses", userAuth, getAddresses);
router.post("/addresses", userAuth, addAddress);
router.patch("/addresses/:addressId", userAuth, updateAddress);
router.patch("/addresses/:addressId/default", userAuth, setDefaultAddress);
router.delete("/addresses/:addressId", userAuth, deleteAddress);

router.get("/payment-methods", userAuth, getPaymentMethods);
router.post("/payment-methods", userAuth, addPaymentMethod);
router.patch("/payment-methods/:methodId/default", userAuth, setDefaultPaymentMethod);
router.delete("/payment-methods/:methodId", userAuth, deletePaymentMethod);

router.get("/wallet", userAuth, getWallet);
router.post("/wallet/topup/order", userAuth, createWalletTopupOrder);
router.post("/wallet/topup/verify", userAuth, verifyWalletTopup);
router.post("/wallet/topup", userAuth, topupWallet);

router.get("/coupons", userAuth, getCoupons);

router.get("/reviews", userAuth, getUserReviews);
router.get("/reviews/reviewable-bookings", userAuth, getReviewableBookings);
router.post("/reviews", userAuth, createReview);

router.get("/referral", userAuth, getReferral);

export default router;
