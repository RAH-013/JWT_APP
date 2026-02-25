import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token." });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
};