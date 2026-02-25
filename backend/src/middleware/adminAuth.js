// src/middleware/adminAuth.js
import jwt from "jsonwebtoken";

export function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided. Authentication required." });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Authentication error", error: err.message });
  }
}
