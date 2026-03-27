// src/routes/supportTicketRoutes.js
import express from "express";
import {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketStats
} from "../controllers/supportTicketController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireAdminPermission } from "../middleware/adminPermissions.js";

const router = express.Router();

// Public routes (users and vendors can create tickets)
router.post("/", createTicket);

// Admin-only routes
router.use(adminAuth, requireAdminPermission("support"));

router.get("/", getAllTickets);
router.get("/stats", getTicketStats);
router.get("/:id", getTicket);
router.patch("/:id", updateTicket);
router.patch("/:id/status", updateTicketStatus);
router.delete("/:id", deleteTicket);

export default router;
