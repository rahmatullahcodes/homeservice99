// src/routes/contactRoutes.js
import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  getContactStats,
  deleteContact,
  getUserContacts
} from "../controllers/contactController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// Public route - submit contact form
router.post("/submit", submitContact);

// Get user's own contacts
router.get("/my-contacts", userAuth, getUserContacts);

// Admin routes
router.get("/", adminAuth, requireAdminPermission("contacts"), getAllContacts);
router.get("/stats", adminAuth, requireAdminPermission("contacts"), getContactStats);
router.get("/:id", adminAuth, requireAdminPermission("contacts"), getContactById);
router.patch("/:id/status", adminAuth, requireAdminPermission("contacts"), updateContactStatus);
router.delete("/:id", adminAuth, requireAdminPermission("contacts"), deleteContact);

export default router;
