import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
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

router.get("/payment-methods", getPaymentGatewaySettings);
router.patch("/payment-methods", updatePaymentGatewaySettings);
router.get("/homepage", getHomePageSettings);
router.patch("/homepage", updateHomePageSettings);

// GET all settings
router.get("/", async (req, res) => {
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
router.get("/stats", getSettingsStats);

// UPDATE settings
router.patch("/", updateSettings);

// RESET to defaults
router.post("/reset", resetToDefaults);

export default router;
