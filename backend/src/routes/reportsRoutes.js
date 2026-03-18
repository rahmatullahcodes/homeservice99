import express from "express";
import {
  getDashboardStats,
  getServicePerformance,
  getTopVendors,
  getCategoryPerformance,
  getRevenueTrend,
  getBookingTrend,
  getUserAnalytics,
  getBookingStatusBreakdown,
  getCompleteReport
} from "../controllers/reportsController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// All report endpoints require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get("/dashboard-stats", getDashboardStats);

// Service performance
router.get("/service-performance", getServicePerformance);

// Top vendors
router.get("/top-vendors", getTopVendors);

// Category performance
router.get("/category-performance", getCategoryPerformance);

// Revenue trend
router.get("/revenue-trend", getRevenueTrend);

// Booking trend
router.get("/booking-trend", getBookingTrend);

// User analytics
router.get("/user-analytics", getUserAnalytics);

// Booking status breakdown
router.get("/booking-status", getBookingStatusBreakdown);

// Complete report (for export)
router.get("/complete-report", getCompleteReport);

export default router;
