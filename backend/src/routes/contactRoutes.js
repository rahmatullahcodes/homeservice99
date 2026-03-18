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
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// Public route - submit contact form
router.post("/submit", submitContact);

// Get user's own contacts
router.get("/my-contacts", userAuth, getUserContacts);

// Admin routes
router.get("/", adminAuth, getAllContacts);
router.get("/stats", adminAuth, getContactStats);
router.get("/:id", adminAuth, getContactById);
router.patch("/:id/status", adminAuth, updateContactStatus);
router.delete("/:id", adminAuth, deleteContact);

export default router;
