import jwt from "jsonwebtoken";

// Reads "Authorization: Bearer <token>", verifies it, and attaches
// req.userId so route handlers know which user is making the request.
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.userId = payload.userId;
    next();
  });
}