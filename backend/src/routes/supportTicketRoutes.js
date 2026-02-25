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
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (users and vendors can create tickets)
router.post("/", createTicket);

// Admin-only routes
router.use(auth);

router.get("/", getAllTickets);
router.get("/stats", getTicketStats);
router.get("/:id", getTicket);
router.patch("/:id", updateTicket);
router.patch("/:id/status", updateTicketStatus);
router.delete("/:id", deleteTicket);

export default router;
