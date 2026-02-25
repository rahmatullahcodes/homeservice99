import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  // Basic Information
  id: String,
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    default: null
  },
  icon: String,
  
  // Service Details
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  oldPrice: Number,
  duration: String,
  image: String,
  badge: String,
  
  // Reviews & Ratings
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  
  // Service Information
  features: [String],
  options: Number,
  skinType: String,
  ingredient: String,
  brand: String,
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  },
  vendorName: String,
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active"
  },
  
  // Approval
  approvedByAdmin: {
    type: Boolean,
    default: false
  },
  adminNotes: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
