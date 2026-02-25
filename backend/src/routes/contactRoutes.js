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
import { auth } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public route - submit contact form
router.post("/submit", submitContact);

// Get user's own contacts
router.get("/my-contacts", auth, getUserContacts);

// Admin routes
router.get("/", adminAuth, getAllContacts);
router.get("/stats", adminAuth, getContactStats);
router.get("/:id", adminAuth, getContactById);
router.patch("/:id/status", adminAuth, updateContactStatus);
router.delete("/:id", adminAuth, deleteContact);

export default router;
