import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getSettings,
  updateSettings,
  resetToDefaults,
  getSettingsStats
} from "../controllers/settingsController.js";

const router = express.Router();

// Protect all routes with auth middleware
router.use(auth);

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
