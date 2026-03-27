// src/routes/notificationRoutes.js
import express from "express";
import {
  getAllNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getNotificationStats
} from "../controllers/notificationController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";

const router = express.Router();

// All notification routes require admin auth
router.use(adminAuth, requireAdminPermission("notifications"));

router.get("/", getAllNotifications);
router.get("/stats", getNotificationStats);
router.post("/", createNotification);
router.get("/:id", getNotification);
router.patch("/:id", updateNotification);
router.post("/:id/send", sendNotification);
router.delete("/:id", deleteNotification);

export default router;
