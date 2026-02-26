import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import Log from "../model/logs.js";
import User from "../model/user.js";

const logMiddleware = async ({ userId = null, username = null, ip, status, message }) => {
  try {
    await Log.create({ userId, username, ip, status, message });
  } catch (err) {
    console.error("Error creando log de middleware:", err);
  }
};

export const authenticate = async (req, res, next) => {
  const ip = req.ip;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    await logMiddleware({ ip, status: false, message: "No se proporcionó token" });
    return res.status(401).json({ error: "No se proporcionó token." });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      await logMiddleware({ ip, status: false, message: "Token inválido" });
      return res.status(401).json({ error: "Token inválido." });
    }

    req.userId = decoded.id;

    const user = await User.findByPk(req.userId);
    req.userRole = user?.role || null;

    await logMiddleware({
      userId: user?.id || null,
      username: user?.name || null,
      ip,
      status: true,
      message: "Token validado correctamente",
    });

    next();
  });
};

export const authorizeAdmin = async (req, res, next) => {
  const ip = req.ip;
  const user = await User.findByPk(req.userId);

  if (!user || user.role !== "admin") {
    await logMiddleware({
      userId: user?.id || null,
      username: user?.name || null,
      ip,
      status: false,
      message: "Intento de acceso a admin no autorizado",
    });
    return res.status(403).json({ error: "No autorizado." });
  }

  await logMiddleware({
    userId: user.id,
    username: user.name,
    ip,
    status: true,
    message: "Acceso a admin autorizado",
  });

  next();
};

export const authorizeManager = async (req, res, next) => {
  const ip = req.ip;
  const user = await User.findByPk(req.userId);

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    await logMiddleware({
      userId: user?.id || null,
      username: user?.name || null,
      ip,
      status: false,
      message: "Intento de acceso a manager no autorizado",
    });
    return res.status(403).json({ error: "No autorizado." });
  }

  await logMiddleware({
    userId: user.id,
    username: user.name,
    ip,
    status: true,
    message: "Acceso a manager autorizado",
  });

  next();
};
