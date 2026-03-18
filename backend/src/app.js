import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userAuthRoutes from "./routes/userAuthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import vendorAuthRoutes from "./routes/vendorAuthRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import supportTicketRoutes from "./routes/supportTicketRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { getLatestPopupNotification } from "./controllers/notificationController.js";
import { getPublicHomePageSettings, getPublicPaymentOptions } from "./controllers/settingsController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", timestamp: new Date() });
});
app.get("/api/public/broadcast-popup", getLatestPopupNotification);
app.get("/api/settings/payment-methods", getPublicPaymentOptions);
app.get("/api/settings/homepage", getPublicHomePageSettings);

app.use("/api/auth/user", userAuthRoutes);
app.use("/api/auth/vendor", vendorAuthRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/admin/support-tickets", supportTicketRoutes);
app.use("/api/contact", contactRoutes);

console.log("📋 About to mount CMS routes");
console.log("cmsRoutes type:", typeof cmsRoutes);
console.log("cmsRoutes:", cmsRoutes);

app.use("/api/cms", cmsRoutes);

console.log("✅ CMS routes mounted");
console.log("✅ All routes registered successfully");

// Account panel routes (server-rendered)
app.use("/account", accountRoutes);

app.get("/", (req, res) => {
  res.send("HomeService99 Backend Live 🚀");
});

// 404 handler for unmatched routes (must be before error handler)
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

// Generic error handler (must be last)
app.use((err, req, res, next) => {
  console.error("Error handler:", err);
  
  // Check if it's a JSON parsing error
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON in request body", error: err.message });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : undefined
  });
});

export default app;

