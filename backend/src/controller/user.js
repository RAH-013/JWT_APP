import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

import { mexicoTime } from "../utils/time.js";

import User from "../model/user.js";
import Log from "../model/logs.js";

const ROLES = ["user", "manager", "admin"];

const usuarioPublico = (user) => ({
  id: user.id,
  name: user.name,
  password: user.password,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registrarLog = async ({
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
    console.error("Error al registrar actividad:", error);
  }
};

const responderError = (res, error, mensaje) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Conflicto",
      detalles: "El nombre de usuario ya está registrado.",
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(422).json({
      error: "Datos inválidos",
      detalles: error.errors.map((item) => item.message),
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      error: "Conflicto",
      detalles: "El registro está relacionado con otros datos.",
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Error interno del servidor",
    detalles: mensaje,
  });
};

const obtenerUsuarioAutenticado = async (req) => {
  if (!req.userId) return null;
  return User.findByPk(req.userId);
};

const esAdministrador = (user) => user?.role === "admin";

export const authUser = async (req, res) => {
  const { name, password } = req.body ?? {};
  const ip = req.ip;

  try {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalles: "Nombre y contraseña son obligatorios.",
      });
    }

    const user = await User.findOne({
      where: { name: name.trim() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      await registrarLog({
        userId: user?.id ?? null,
        username: name.trim(),
        ip,
        status: false,
        message: "Intento de inicio de sesión fallido",
      });

      return res.status(401).json({
        error: "No autorizado",
        detalles: "Usuario o contraseña incorrectos.",
      });
    }

    const access_token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    await registrarLog({
      userId: user.id,
      username: user.name,
      ip,
      status: true,
      message: "Inicio de sesión exitoso",
    });

    return res.status(200).json({
      access_token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    await registrarLog({
      username: typeof name === "string" ? name : null,
      ip,
      status: false,
      message: `Error de autenticación: ${error.message}`,
    });

    return responderError(res, error, "No fue posible autenticar al usuario.");
  }
};

export const getUsers = async (req, res) => {
  try {
    const currentUser = await obtenerUsuarioAutenticado(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "La sesión no es válida.",
      });
    }

    if (!esAdministrador(currentUser)) {
      await registrarLog({
        userId: currentUser.id,
        username: currentUser.name,
        ip: req.ip,
        status: false,
        message: "Consulta de usuarios sin permisos",
      });

      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "Se requieren permisos de administrador.",
      });
    }

    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });

    await registrarLog({
      userId: currentUser.id,
      username: currentUser.name,
      ip: req.ip,
      status: true,
      message: "Consulta de usuarios",
    });

    return res.status(200).json({
      status: true,
      users: users.map(usuarioPublico),
    });
  } catch (error) {
    return responderError(res, error, "No fue posible obtener los usuarios.");
  }
};

export const getUserData = async (req, res) => {
  try {
    const currentUser = await obtenerUsuarioAutenticado(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "La sesión no es válida.",
      });
    }

    const userId = req.params.id || currentUser.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "No encontrado",
        detalles: "El usuario solicitado no existe.",
      });
    }

    const esPropietario =
      String(user.id) === String(currentUser.id) ||
      String(user.ownerId) === String(currentUser.id);

    if (!esPropietario && !esAdministrador(currentUser)) {
      await registrarLog({
        userId: currentUser.id,
        username: currentUser.name,
        ip: req.ip,
        status: false,
        message: `Consulta no autorizada del usuario ${userId}`,
      });

      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "No puedes consultar un registro que no te pertenece.",
      });
    }

    await registrarLog({
      userId: currentUser.id,
      username: currentUser.name,
      ip: req.ip,
      status: true,
      message: `Consulta de usuario ${user.name}`,
    });

    return res.status(200).json(usuarioPublico(user));
  } catch (error) {
    return responderError(res, error, "No fue posible obtener el usuario.");
  }
};

export const addUser = async (req, res) => {
  try {
    const currentUser = await obtenerUsuarioAutenticado(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "La sesión no es válida.",
      });
    }

    const { name, password, role = "user" } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(422).json({
        error: "Datos inválidos",
        detalles: "Nombre y contraseña son obligatorios.",
      });
    }

    if (!ROLES.includes(role)) {
      return res.status(422).json({
        error: "Datos inválidos",
        detalles: "El rol proporcionado no es válido.",
      });
    }

    const administrador = esAdministrador(currentUser);

    if (!administrador && role !== "user") {
      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "No puedes asignar roles privilegiados.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      password,
      passwordHash: await bcrypt.hash(password, 10),
      role: administrador ? role : "user",
      ownerId: administrador ? null : currentUser.id,
    });

    await registrarLog({
      userId: currentUser.id,
      username: currentUser.name,
      ip: req.ip,
      status: true,
      message: `Usuario creado: ${user.name}`,
    });

    return res.status(201).json(usuarioPublico(user));
  } catch (error) {
    return responderError(res, error, "No fue posible crear el usuario.");
  }
};

export const updateUser = async (req, res) => {
  try {
    const currentUser = await obtenerUsuarioAutenticado(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "La sesión no es válida.",
      });
    }

    if (!esAdministrador(currentUser)) {
      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "Se requieren permisos de administrador.",
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "No encontrado",
        detalles: "El usuario solicitado no existe.",
      });
    }

    const { name, password, role } = req.body ?? {};

    if (name === undefined && password === undefined && role === undefined) {
      return res.status(400).json({
        error: "Solicitud inválida",
        detalles: "Debes proporcionar al menos un campo para actualizar.",
      });
    }

    const changes = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(422).json({
          error: "Datos inválidos",
          detalles: "El nombre no puede estar vacío.",
        });
      }

      const normalizedName = name.trim();

      if (normalizedName !== user.name) {
        changes.name = normalizedName;
      }
    }

    if (password !== undefined) {
      if (typeof password !== "string" || !password) {
        return res.status(422).json({
          error: "Datos inválidos",
          detalles: "La contraseña no es válida.",
        });
      }

      if (password !== user.password) {
        changes.password = password;
        changes.passwordHash = await bcrypt.hash(password, 10);
      }
    }

    if (role !== undefined) {
      if (!ROLES.includes(role)) {
        return res.status(422).json({
          error: "Datos inválidos",
          detalles: "El rol proporcionado no es válido.",
        });
      }

      if (role !== user.role) {
        changes.role = role;
      }
    }

    if (Object.keys(changes).length > 0) {
      await user.update(changes);
    }

    await registrarLog({
      userId: currentUser.id,
      username: currentUser.name,
      ip: req.ip,
      status: true,
      message: `Usuario actualizado: ${user.name}`,
    });

    return res.status(200).json(usuarioPublico(user));
  } catch (error) {
    return responderError(res, error, "No fue posible actualizar el usuario.");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const currentUser = await obtenerUsuarioAutenticado(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "No autorizado",
        detalles: "La sesión no es válida.",
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "No encontrado",
        detalles: "El usuario solicitado no existe.",
      });
    }

    const esDueno = String(user.ownerId) === String(currentUser.id);

    if (!esAdministrador(currentUser) && !esDueno) {
      await registrarLog({
        userId: currentUser.id,
        username: currentUser.name,
        ip: req.ip,
        status: false,
        message: `Eliminación no autorizada del usuario ${user.name}`,
      });

      return res.status(403).json({
        error: "Acceso denegado",
        detalles: "Se requieren permisos de administrador o ser el propietario del registro.",
      });
    }

    await user.destroy();

    await registrarLog({
      userId: currentUser.id,
      username: currentUser.name,
      ip: req.ip,
      status: true,
      message: `Usuario eliminado: ${user.name}`,
    });

    return res.status(200).json({
      message: "Usuario eliminado correctamente",
      id: user.id,
    });
  } catch (error) {
    return responderError(res, error, "No fue posible eliminar el usuario.");
  }
};
