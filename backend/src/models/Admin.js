// src/models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "admin" }, // admin / subadmin
  permissions: { type: [String], default: [] }
});

export default mongoose.model("Admin", adminSchema);
