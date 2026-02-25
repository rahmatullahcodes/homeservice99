import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.warn("⚠️  MongoDB connection warning:", err.message);
    console.log("Server will continue without database. Some features may not work.");
    // Don't exit - let server start anyway
  }
}
