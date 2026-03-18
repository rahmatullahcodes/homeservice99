// src/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    default: ""
  },
  comment: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Approved", "Pending", "Hidden", "Rejected"],
    default: "Pending"
  },
  images: [{
    type: String
  }],
  helpful: {
    type: Number,
    default: 0
  },
  vendorReply: {
    message: {
      type: String,
      default: ""
    },
    repliedAt: {
      type: Date,
      default: null
    }
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

export default mongoose.model("Review", reviewSchema);
