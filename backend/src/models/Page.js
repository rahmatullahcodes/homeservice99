import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  metaTitle: {
    type: String,
    default: ""
  },
  metaDescription: {
    type: String,
    default: ""
  },
  metaKeywords: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  },
  template: {
    type: String,
    enum: ["Standard", "Landing", "Custom"],
    default: "Standard"
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

export default mongoose.model("Page", pageSchema);
