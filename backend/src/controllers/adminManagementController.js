import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

const ALLOWED_PERMISSIONS = new Set([
  "dashboard",
  "bookings",
  "payments",
  "wallet",
  "users",
  "vendors",
  "services",
  "coupons",
  "reviews",
  "cms",
  "homePage",
  "reports",
  "paymentMethods",
  "settings",
  "support",
  "notifications",
  "contacts",
  "diagnostics"
]);

function toAdminResponse(adminDoc) {
  const data = adminDoc?.toObject ? adminDoc.toObject() : { ...adminDoc };
  if (data?.password) {
    delete data.password;
  }
  return data;
}

function normalizePermissions(value) {
  let list = [];

  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    list = value.split(",");
  } else if (value && typeof value === "object") {
    list = Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  const filtered = list
    .map((item) => String(item).trim())
    .filter((item) => item && ALLOWED_PERMISSIONS.has(item));

  return Array.from(new Set(filtered));
}

export async function getAllAdmins(req, res) {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAdminProfile(req, res) {
  try {
    if (!req.admin) {
      return res.status(404).json({ message: "Admin profile not found" });
    }
    res.json(toAdminResponse(req.admin));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createSubAdmin(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");
    const permissions = normalizePermissions(req.body.permissions);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "subadmin",
      permissions
    });

    res.status(201).json(toAdminResponse(admin));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdmin(req, res) {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "admin") {
      return res.status(403).json({ message: "Cannot modify super admin account" });
    }

    if (req.body.name !== undefined) {
      admin.name = String(req.body.name || "").trim();
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email || "").trim();
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      const exists = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (exists) {
        return res.status(400).json({ message: "Admin with this email already exists" });
      }

      admin.email = email;
    }

    if (req.body.password) {
      const password = String(req.body.password || "");
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      admin.password = await bcrypt.hash(password, 10);
    }

    if (req.body.permissions !== undefined) {
      admin.permissions = normalizePermissions(req.body.permissions);
    }

    await admin.save();
    res.json(toAdminResponse(admin));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "admin") {
      return res.status(403).json({ message: "Cannot delete super admin account" });
    }

    await admin.deleteOne();
    res.json({ message: "Sub admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const ADMIN_PERMISSION_KEYS = Array.from(ALLOWED_PERMISSIONS);
