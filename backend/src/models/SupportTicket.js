// src/models/SupportTicket.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  from: {
    type: String,
    enum: ["User", "Vendor"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
    default: "Open"
  },
  attachments: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  resolution: String,
  closedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("SupportTicket", supportTicketSchema);
