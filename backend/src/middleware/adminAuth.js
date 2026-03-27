import Admin from "../models/Admin.js";
import { sendAuthError, verifyRequestToken } from "./auth.js";

function normalizePermissions(permissions) {
  let list = [];
  if (Array.isArray(permissions)) {
    list = permissions;
  } else if (typeof permissions === "string") {
    list = permissions.split(",");
  } else if (permissions && typeof permissions === "object") {
    list = Object.entries(permissions)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  return list
    .map((permission) => String(permission).trim())
    .filter((permission) => permission.length > 0);
}

export async function adminAuth(req, res, next) {
  try {
    const tokenUser = verifyRequestToken(req);

    if (!tokenUser?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const admin = await Admin.findById(tokenUser.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin account not found" });
    }

    if (!["admin", "subadmin"].includes(admin.role)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const adminPayload = {
      id: admin._id,
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: normalizePermissions(admin.permissions)
    };

    req.user = adminPayload;
    req.admin = admin;
    next();
  } catch (err) {
    sendAuthError(res, err);
  }
}
