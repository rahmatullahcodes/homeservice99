import express from "express";
import { 
  vendorSignup, 
  vendorLogin,
  getVendorProfile,
  updateVendorProfile,
  verifyVendor
} from "../controllers/vendorAuthController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* Public routes */
router.post("/signup", vendorSignup);
router.post("/login", vendorLogin);

/* Protected routes */
router.get("/profile", auth, getVendorProfile);
router.patch("/profile", auth, updateVendorProfile);
router.patch("/verify", auth, verifyVendor);

export default router;
