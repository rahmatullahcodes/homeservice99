import jwt from "jsonwebtoken";

export function getBearerToken(req) {
  return req.headers.authorization?.split(" ")[1];
}

export function verifyRequestToken(req) {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("No token provided. Authentication required.");
    error.status = 401;
    throw error;
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

export function sendAuthError(res, err) {
  if (err.status === 401) {
    return res.status(401).json({ message: err.message });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  return res.status(500).json({ message: "Authentication error", error: err.message });
}

export function auth(req, res, next) {
  try {
    req.user = verifyRequestToken(req);
    next();
  } catch (err) {
    sendAuthError(res, err);
  }
}
