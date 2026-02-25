// src/models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["Flat", "Percent"],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  usage: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    default: null
  },
  maxUsage: {
    type: Number,
    default: null // null means unlimited
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Coupon", couponSchema);
