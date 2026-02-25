import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Review from "./src/models/Review.js";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Service from "./src/models/Service.js";

async function seedReviews() {
  try {
    await connectDB();
    
    // Get sample data
    const users = await User.find().limit(2);
    const vendors = await Vendor.find().limit(2);
    const services = await Service.find().limit(2);
    
    if (!users.length || !vendors.length || !services.length) {
      console.log("⚠️  Not enough sample data. Create users, vendors, and services first.");
      process.exit(0);
    }
    
    // Clear existing reviews
    await Review.deleteMany({});
    
    // Sample reviews
    const reviews = [
      {
        user: users[0]._id,
        vendor: vendors[0]._id,
        service: services[0]._id,
        rating: 5,
        title: "Outstanding Service!",
        comment: "The technician was professional and thorough. Work was completed on time.",
        status: "Approved"
      },
      {
        user: users[1]._id,
        vendor: vendors[1]._id,
        service: services[1]._id,
        rating: 4,
        title: "Good Work",
        comment: "Service was good, but could have been a bit faster.",
        status: "Approved"
      },
      {
        user: users[0]._id,
        vendor: vendors[1]._id,
        service: services[0]._id,
        rating: 5,
        title: "Highly Recommended",
        comment: "Excellent attention to detail. Will definitely book again!",
        status: "Approved"
      },
      {
        user: users[1]._id,
        vendor: vendors[0]._id,
        service: services[1]._id,
        rating: 3,
        title: "Average",
        comment: "The work was done but not as expected.",
        status: "Pending"
      }
    ];
    
    const savedReviews = await Review.insertMany(reviews);
    console.log(`✅ ${savedReviews.length} sample reviews seeded successfully`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding reviews:", err.message);
    process.exit(1);
  }
}

seedReviews();
