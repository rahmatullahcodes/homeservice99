import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Import models
import Admin from "./src/models/Admin.js";
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Service from "./src/models/Service.js";
import Booking from "./src/models/Booking.js";
import Transaction from "./src/models/Transaction.js";

import { connectDB } from "./src/config/db.js";

async function seedData() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Create Admin
    const adminExists = await Admin.findOne({ email: "admin@demo.com" });
    let admin = adminExists;
    if (!admin) {
      console.log("📝 Creating admin account...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = await Admin.create({
        name: "Super Admin",
        email: "admin@demo.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("✅ Admin created: admin@demo.com / admin123");
    }

    // Create Users
    console.log("📝 Creating sample users...");
    const users = await User.insertMany([
      {
        name: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "9999000001",
        password: await bcrypt.hash("password123", 10)
      },
      {
        name: "Pooja Singh",
        email: "pooja@example.com",
        phone: "9999000002",
        password: await bcrypt.hash("password123", 10)
      },
      {
        name: "Ankit Patel",
        email: "ankit@example.com",
        phone: "9999000003",
        password: await bcrypt.hash("password123", 10)
      },
      {
        name: "Nisha Sharma",
        email: "nisha@example.com",
        phone: "9999000004",
        password: await bcrypt.hash("password123", 10)
      },
      {
        name: "Vikram Rao",
        email: "vikram@example.com",
        phone: "9999000005",
        password: await bcrypt.hash("password123", 10)
      }
    ], { ordered: false }).catch(() => null);
    console.log("✅ Users created");

    // Create Vendors
    console.log("📝 Creating sample vendors...");
    const vendors = await Vendor.insertMany([
      {
        businessName: "AC Experts",
        email: "acexperts@example.com",
        phone: "9998000001",
        password: await bcrypt.hash("password123", 10),
        category: "AC Repair"
      },
      {
        businessName: "CleanPro",
        email: "cleanpro@example.com",
        phone: "9998000002",
        password: await bcrypt.hash("password123", 10),
        category: "Cleaning"
      },
      {
        businessName: "Plumb Masters",
        email: "plumbmasters@example.com",
        phone: "9998000003",
        password: await bcrypt.hash("password123", 10),
        category: "Plumbing"
      },
      {
        businessName: "Beauty Pro",
        email: "beautypro@example.com",
        phone: "9998000004",
        password: await bcrypt.hash("password123", 10),
        category: "Salon"
      },
      {
        businessName: "ElectroTech",
        email: "electrotech@example.com",
        phone: "9998000005",
        password: await bcrypt.hash("password123", 10),
        category: "Electrical"
      }
    ], { ordered: false }).catch(() => null);
    console.log("✅ Vendors created");

    // Create Services
    console.log("📝 Creating sample services...");
    if (vendors && vendors.length > 0) {
      const services = await Service.insertMany([
        {
          title: "AC Repair & Service",
          category: "AC Repair",
          price: 699,
          description: "Professional AC repair and maintenance",
          vendor: vendors[0]._id
        },
        {
          title: "Home Deep Cleaning",
          category: "Cleaning",
          price: 1999,
          description: "Complete home cleaning service",
          vendor: vendors[1]._id
        },
        {
          title: "Plumbing Installation",
          category: "Plumbing",
          price: 2299,
          description: "Expert plumbing services",
          vendor: vendors[2]._id
        },
        {
          title: "Salon Services",
          category: "Salon",
          price: 899,
          description: "Professional salon and spa services",
          vendor: vendors[3]._id
        },
        {
          title: "Electrical Installation",
          category: "Electrical",
          price: 3499,
          description: "Professional electrical work",
          vendor: vendors[4]._id
        }
      ], { ordered: false }).catch(() => null);
      console.log("✅ Services created");

      // Create Bookings
      console.log("📝 Creating sample bookings...");
      if (users && users.length > 0) {
        const bookings = await Booking.insertMany([
          {
            user: users[0]._id,
            vendor: vendors[0]._id,
            service: "AC Repair & Service",
            price: 699,
            status: "Completed",
            scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          },
          {
            user: users[1]._id,
            vendor: vendors[1]._id,
            service: "Home Deep Cleaning",
            price: 1999,
            status: "Pending",
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days later
          },
          {
            user: users[2]._id,
            vendor: vendors[2]._id,
            service: "Plumbing Installation",
            price: 2299,
            status: "InProgress",
            scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            user: users[3]._id,
            vendor: vendors[3]._id,
            service: "Salon Services",
            price: 899,
            status: "Completed",
            scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            user: users[4]._id,
            vendor: vendors[4]._id,
            service: "Electrical Installation",
            price: 3499,
            status: "InProgress",
            scheduledAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
          }
        ], { ordered: false }).catch(() => null);
        console.log("✅ Bookings created");

        // Create Transactions
        console.log("📝 Creating sample transactions...");
        const transactions = await Transaction.insertMany([
          {
            vendor: vendors[0]._id,
            type: "Credit",
            amount: 699,
            source: "Booking #1",
            status: "Success"
          },
          {
            vendor: vendors[1]._id,
            type: "Credit",
            amount: 1999,
            source: "Booking #2",
            status: "Pending"
          },
          {
            vendor: vendors[2]._id,
            type: "Credit",
            amount: 2299,
            source: "Booking #3",
            status: "Success"
          },
          {
            vendor: vendors[3]._id,
            type: "Debit",
            amount: 899,
            source: "Refund",
            status: "Failed"
          },
          {
            vendor: vendors[4]._id,
            type: "Credit",
            amount: 3499,
            source: "Booking #5",
            status: "Success"
          }
        ], { ordered: false }).catch(() => null);
        console.log("✅ Transactions created");
      }
    }

    console.log("\n✅ All sample data created successfully!");
    console.log("\n📊 Sample Data Summary:");
    console.log("   • Admin Account: admin@demo.com / admin123");
    console.log("   • Users: 5 sample users");
    console.log("   • Vendors: 5 service providers");
    console.log("   • Services: 5 services");
    console.log("   • Bookings: 5 bookings (various statuses)");
    console.log("   • Transactions: 5 transactions");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    process.exit(1);
  }
}

seedData();
