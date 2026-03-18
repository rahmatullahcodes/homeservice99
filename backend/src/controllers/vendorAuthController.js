import Vendor from "../models/Vendor.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function generateToken(vendor) {
  return jwt.sign(
    { id: vendor._id, email: vendor.email, role: "vendor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* VENDOR SIGNUP */
export async function vendorSignup(req, res) {
  try {
    const { businessName, email, phone, city, category, password } = req.body;

    if (!businessName || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const exists = await Vendor.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      businessName,
      email,
      phone,
      city,
      category,
      password: hashed,
      role: "vendor"
    });

    const token = generateToken(vendor);

    // Return vendor without password
    const vendorData = vendor.toObject();
    delete vendorData.password;

    res.json({ token, vendor: vendorData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* VENDOR LOGIN */
export async function vendorLogin(req, res) {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, vendor.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(vendor);
    
    // Return vendor without password
    const vendorData = vendor.toObject();
    delete vendorData.password;
    
    res.json({ token, vendor: vendorData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* GET VENDOR PROFILE */
export async function getVendorProfile(req, res) {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* UPDATE VENDOR PROFILE */
export async function updateVendorProfile(req, res) {
  try {
    const { businessName, phone, city, category, address, kyc } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        businessName,
        phone,
        city,
        category,
        address,
        kyc: kyc || {}
      },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* VERIFY VENDOR */
export async function verifyVendor(req, res) {
  try {
    const vendorId = req.params.vendorId || req.body.vendorId;
    if (!vendorId) {
      return res.status(400).json({ message: "vendorId is required" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { verified: true },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ vendor, message: "Vendor verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
