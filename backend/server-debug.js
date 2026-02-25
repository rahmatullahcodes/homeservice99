#!/usr/bin/env node
import dotenv from "dotenv";
import fs from "fs";

// Load env
dotenv.config();

// Log to file
const logFile = fs.createWriteStream("server.log", { flags: "a" });

console.log = function (...args) {
  logFile.write(new Date().toISOString() + " - " + args.join(" ") + "\n");
  process.stdout.write(new Date().toISOString() + " - " + args.join(" ") + "\n");
};

console.log("Starting backend server...");

try {
  const app = await import("./src/app.js");
  const { connectDB } = await import("./src/config/db.js");

  console.log("Imports loaded successfully");

  const PORT = process.env.PORT || 5000;

  connectDB();

  app.default.listen(PORT, () => {
    console.log("🚀 Backend running on port " + PORT);
  });
} catch (err) {
  console.log("ERROR: " + err.message);
  console.log(err.stack);
  process.exit(1);
}
