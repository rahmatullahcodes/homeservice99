// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: "user" },
  city: String,
  address: String,
  blocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
