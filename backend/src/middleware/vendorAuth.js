import Vendor from "../models/Vendor.js";
import { sendAuthError, verifyRequestToken } from "./auth.js";

export async function vendorAuth(req, res, next) {
  try {
    const tokenUser = verifyRequestToken(req);

    if (tokenUser.role && tokenUser.role !== "vendor") {
      return res.status(403).json({ message: "Forbidden: Vendor access required" });
    }

    const vendor = await Vendor.findById(tokenUser.id).select("_id email status verified");
    if (!vendor) {
      return res.status(403).json({ message: "Forbidden: Vendor access required" });
    }

    req.user = {
      ...tokenUser,
      role: "vendor"
    };
    req.vendor = vendor;
    next();
  } catch (err) {
    sendAuthError(res, err);
  }
}
