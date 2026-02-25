import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function generateToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ADMIN LOGIN */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(admin);
    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
