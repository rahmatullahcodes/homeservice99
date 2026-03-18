// src/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  service: String,
  serviceCategory: String,
  price: Number,
  customerName: { type: String, default: "" },
  customerPhone: { type: String, default: "" },
  customerAddress: { type: String, default: "" },
  paymentMethod: { type: String, default: "cod" },
  paymentGateway: { type: String, default: "" },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending"
  },
  paymentOrderId: { type: String, default: "" },
  paymentId: { type: String, default: "" },
  paymentSignature: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "InProgress", "Completed", "Cancelled"],
    default: "Pending"
  },
  scheduledAt: Date,
  acceptanceChargeCoins: { type: Number, default: 0 },
  acceptedAt: Date
}, { timestamps: true });

bookingSchema.index({ vendor: 1, status: 1, createdAt: -1 });
bookingSchema.index({ status: 1, vendor: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
