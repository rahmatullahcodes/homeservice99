// src/models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true,
    default: "General Inquiry"
  },
  category: {
    type: String,
    enum: ["General Inquiry", "Booking Issue", "Payment Issue", "Service Quality", "Vendor Issue", "Feature Request", "Bug Report", "Other"],
    default: "General Inquiry"
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    minlength: [10, "Message must be at least 10 characters"],
    maxlength: [2000, "Message cannot exceed 2000 characters"]
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["New", "In Progress", "Resolved", "Closed"],
    default: "New"
  },
  userType: {
    type: String,
    enum: ["Customer", "Vendor", "Guest"],
    default: "Guest"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null
  },
  response: {
    type: String,
    default: null
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null
  },
  attachments: [
    {
      url: String,
      filename: String
    }
  ],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ userId: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
