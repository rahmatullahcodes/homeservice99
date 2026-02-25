import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
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
  summary: {
    type: String,
    default: ""
  },
  author: {
    type: String,
    default: "Admin"
  },
  category: {
    type: String,
    enum: ["Tips", "Guides", "News", "Updates", "Maintenance"],
    default: "Tips"
  },
  image: {
    type: String,
    default: ""
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ["Draft", "Published", "Archived"],
    default: "Draft"
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
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

export default mongoose.model("Blog", blogSchema);
