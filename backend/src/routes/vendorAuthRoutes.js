import express from "express";
import {
  vendorSignup, 
  vendorLogin,
  getVendorProfile,
  updateVendorProfile,
  verifyVendor
} from "../controllers/vendorAuthController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { vendorAuth } from "../middleware/vendorAuth.js";

const router = express.Router();

/* Public routes */
router.post("/signup", vendorSignup);
router.post("/login", vendorLogin);

/* Protected routes */
router.get("/profile", vendorAuth, getVendorProfile);
router.patch("/profile", vendorAuth, updateVendorProfile);
router.patch("/verify", adminAuth, verifyVendor);

export default router;
