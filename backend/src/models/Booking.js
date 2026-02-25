// src/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  service: String,
  price: Number,
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"],
    default: "Pending"
  },
  scheduledAt: Date
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
