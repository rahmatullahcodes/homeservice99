// src/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  audience: {
    type: String,
    enum: ["Users", "Vendors", "Specific"],
    default: "Users"
  },
  type: {
    type: String,
    enum: ["Push", "Email", "In-App", "SMS"],
    default: "Push"
  },
  city: {
    type: String,
    default: "All"
  },
  targetAudience: {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }]
  },
  status: {
    type: String,
    enum: ["Draft", "Sent", "Scheduled"],
    default: "Draft"
  },
  sentAt: Date,
  scheduledFor: Date,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deliveryStatus: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    read: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  imageUrl: String,
  actionUrl: String,
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
