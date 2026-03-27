import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";
import {
  getSettings,
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings,
  getHomePageSettings,
  updateHomePageSettings,
  updateSettings,
  resetToDefaults,
  getSettingsStats
} from "../controllers/settingsController.js";

const router = express.Router();

// Protect all routes with auth middleware
router.use(adminAuth);

router.get("/payment-methods", requireAdminPermission("paymentMethods"), getPaymentGatewaySettings);
router.patch("/payment-methods", requireAdminPermission("paymentMethods"), updatePaymentGatewaySettings);
router.get("/homepage", requireAdminPermission("homePage"), getHomePageSettings);
router.patch("/homepage", requireAdminPermission("homePage"), updateHomePageSettings);

// GET all settings
router.get("/", requireAdminPermission("settings"), async (req, res) => {
  try {
    const result = await getSettings();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET settings statistics
router.get("/stats", requireAdminPermission("settings"), getSettingsStats);

// UPDATE settings
router.patch("/", requireAdminPermission("settings"), updateSettings);

// RESET to defaults
router.post("/reset", requireAdminPermission("settings"), resetToDefaults);

export default router;
