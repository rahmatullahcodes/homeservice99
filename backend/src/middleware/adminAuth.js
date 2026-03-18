import { sendAuthError, verifyRequestToken } from "./auth.js";

export function adminAuth(req, res, next) {
  try {
    const user = verifyRequestToken(req);

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.user = user;
    next();
  } catch (err) {
    sendAuthError(res, err);
  }
}
