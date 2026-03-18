import User from "../models/User.js";
import { sendAuthError, verifyRequestToken } from "./auth.js";

export async function userAuth(req, res, next) {
  try {
    const tokenUser = verifyRequestToken(req);

    if (tokenUser.role && tokenUser.role !== "user") {
      return res.status(403).json({ message: "Forbidden: User access required" });
    }

    const user = await User.findById(tokenUser.id).select("_id email blocked role");
    if (!user) {
      return res.status(403).json({ message: "Forbidden: User access required" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Account is blocked. Please contact support." });
    }

    req.user = {
      ...tokenUser,
      role: "user"
    };
    req.account = user;
    next();
  } catch (err) {
    sendAuthError(res, err);
  }
}
