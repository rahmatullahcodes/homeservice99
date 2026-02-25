import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./src/models/Admin.js";
import { connectDB } from "./src/config/db.js";

async function seedAdmin() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@demo.com" });
    
    if (existingAdmin) {
      console.log("✅ Admin account already exists");
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin
    const admin = new Admin({
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Super Admin",
    });
    
    await admin.save();
    console.log("✅ Admin account created successfully");
    console.log("📧 Email: admin@demo.com");
    console.log("🔐 Password: admin123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();
