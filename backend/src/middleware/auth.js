import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

import { mexicoTime } from "../utils/time.js";

import Log from "../model/logs.js";
import User from "../model/user.js";

const logMiddleware = async ({
  userId = null,
  username = null,
  ip = null,
  status,
  message,
}) => {
  try {
    const now = mexicoTime();

    await Log.create({
      userId,
      username,
      ip,
      status,
      message,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error creando log de middleware:", error);
  }
};

export const authenticate = async (req, res, next) => {
  const ip = req.ip;
  const authHeader = req.headers.authorization;

  if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
    await logMiddleware({
      ip,
      status: false,
      message: "Token no proporcionado o formato incorrecto",
    });

    return res.status(401).json({
      error: "No autorizado",
      detalles: "Se requiere un token Bearer válido.",
    });
  }

  const token = authHeader.split(/\s+/)[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "El token no contiene un identificador válido.",
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "El usuario asociado al token no existe.",
      });
    }

    req.userId = user.id;
    req.userRole = user.role;

    await logMiddleware({
      userId: user.id,
      username: user.name,
      ip,
      status: true,
      message: "Token validado correctamente",
    });

    return next();
  } catch (error) {
    await logMiddleware({
      ip,
      status: false,
      message: "Token inválido o expirado",
    });

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "El token es inválido o ha expirado.",
      });
    }

    console.error("Error autenticando solicitud:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
      detalles: "No fue posible validar la sesión.",
    });
  }
};

export const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "Se requiere autenticación.",
      });
    }

    if (req.userRole !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "Se requieren permisos de administrador.",
      });
    }

    return next();
  } catch (error) {
    console.error("Error verificando permisos:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
      detalles: "No fue posible verificar los permisos.",
    });
  }
};

export const authorizeManager = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "Se requiere autenticación.",
      });
    }

    if (!["manager", "admin"].includes(req.userRole)) {
      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "Se requieren permisos de gerente.",
      });
    }

    return next();
  } catch (error) {
    console.error("Error verificando permisos:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
      detalles: "No fue posible verificar los permisos.",
    });
  }
};
