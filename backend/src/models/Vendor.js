// src/models/Vendor.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  businessName: String,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  city: String,
  category: String,
  service: String,
  address: String,
  password: String,
  
  kyc: {
    pan: String,
    aadhaar: String,
    panVerified: Boolean,
    aadhaarVerified: Boolean
  },

  status: { type: String, enum: ["Active", "Pending", "Rejected"], default: "Pending" },
  verified: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Vendor", vendorSchema);
