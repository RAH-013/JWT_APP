import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

import { mexicoTime } from "../utils/time.js"

import User from "../model/user.js";
import Log from "../model/logs.js";

export const authUser = async (req, res) => {
  const { name, password } = req.body;
  const ip = req.ip;

  try {
    const user = await User.findOne({ where: { name } });

    if (!user) {
      await Log.create({
        userId: null,
        username: name ?? null,
        ip,
        status: false,
        message: "Usuario no encontrado",
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await Log.create({
        userId: user.id,
        username: user.name,
        ip,
        status: false,
        message: "Contraseña incorrecta",
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    await Log.create({
      userId: user.id,
      username: user.name,
      ip,
      status: true,
      message: "Login exitoso",
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });

    res.json({ token });
  } catch (err) {
    await Log.create({
      userId: null,
      username: name ?? null,
      ip,
      status: false,
      message: `Error autenticando usuario: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ message: "Error al autenticar usuario" });
  }
};

export const getUsers = async (req, res) => {
  const ip = req.ip;

  try {
    const currentUser = await User.findByPk(req.userId);

    if (!currentUser || !["admin", "manager", "user"].includes(currentUser.role)) {
      await Log.create({
        userId: currentUser?.id ?? null,
        username: currentUser?.name ?? null,
        ip,
        status: false,
        message: "Intento de obtener usuarios sin permisos",
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(403).json({ message: "No autorizado" });
    }

    let users;

    if (currentUser.role === "admin" || currentUser.role === "manager") {
      users = await User.findAll({
        attributes: { exclude: ["passwordHash"] },
      });
      users = users.filter(user => user.id !== currentUser.id);
    } else {
      users = [{
        id: "Oculto",
        name: currentUser.name,
        role: currentUser.role
      }];
    }

    res.json({ status: true, users });
  } catch (err) {
    await Log.create({
      userId: req.userId ?? null,
      username: null,
      ip,
      status: false,
      message: `Error al obtener usuarios: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ status: false, message: "Error al obtener usuarios" });
  }
};

export const getUserData = async (req, res) => {
  const ip = req.ip;

  try {
    const currentUser = await User.findByPk(req.userId, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!currentUser) {
      await Log.create({
        userId: null,
        username: null,
        ip,
        status: false,
        message: "Usuario no encontrado al obtener datos",
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await Log.create({
      userId: currentUser.id,
      username: currentUser.name,
      ip,
      status: true,
      message: "Consulta de datos de usuario",
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });

    res.json(currentUser);
  } catch (err) {
    await Log.create({
      userId: null,
      username: null,
      ip,
      status: false,
      message: `Error al obtener usuario: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

export const addUser = async (req, res) => {
  const ip = req.ip;

  try {
    const currentUser = await User.findByPk(req.userId);
    if (!currentUser || currentUser.role !== "admin") {
      await Log.create({
        userId: currentUser?.id ?? null,
        username: currentUser?.name ?? null,
        ip,
        status: false,
        message: "Intento de crear usuario sin permisos",
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(403).json({ message: "No autorizado" });
    }

    const { name, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, passwordHash, role });

    await Log.create({
      userId: currentUser.id,
      username: currentUser.name,
      ip,
      status: true,
      message: `Usuario creado: ${newUser.name}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });

    res.status(201).json({ status: true });
  } catch (err) {
    await Log.create({
      userId: null,
      username: null,
      ip,
      status: false,
      message: `Error creando usuario: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ status: false, message: "Error al crear usuario" });
  }
};

export const updateUser = async (req, res) => {
  const ip = req.ip;

  try {
    const { id } = req.params;
    const { name, password, role } = req.body;

    const currentUser = await User.findByPk(req.userId);
    const targetUser = await User.findByPk(id);

    if (!targetUser) {
      await Log.create({
        userId: currentUser?.id ?? null,
        username: currentUser?.name ?? null,
        ip,
        status: false,
        message: `Intento de actualizar usuario no existente: ${id}`,
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (currentUser.role === "admin") {
      if (name) targetUser.name = name;
      if (password) targetUser.passwordHash = await bcrypt.hash(password, 10);
      if (role) targetUser.role = role;
    } else {
      if (currentUser.id !== targetUser.id) {
        await Log.create({
          userId: currentUser.id,
          username: currentUser.name,
          ip,
          status: false,
          message: `Intento de actualizar otro usuario sin permisos: ${id}`,
          createdAt: mexicoTime(),
          updatedAt: mexicoTime()
        });
        return res.status(403).json({ message: "No autorizado" });
      }
      if (name) targetUser.name = name;
      if (password) targetUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    await Log.create({
      userId: currentUser.id,
      username: currentUser.name,
      ip,
      status: true,
      message: `Usuario actualizado: ${targetUser.name}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });

    res.json({ status: true });
  } catch (err) {
    await Log.create({
      userId: req.userId ?? null,
      username: null,
      ip,
      status: false,
      message: `Error actualizando usuario: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ status: false, message: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req, res) => {
  const ip = req.ip;

  try {
    const { id } = req.params;

    const currentUser = await User.findByPk(req.userId);
    const targetUser = await User.findByPk(id);

    if (!targetUser) {
      await Log.create({
        userId: currentUser?.id ?? null,
        username: currentUser?.name ?? null,
        ip,
        status: false,
        message: `Intento de eliminar usuario no existente: ${id}`,
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (currentUser.role !== "admin" && currentUser.id !== targetUser.id) {
      await Log.create({
        userId: currentUser.id,
        username: currentUser.name,
        ip,
        status: false,
        message: `Intento de eliminar otro usuario sin permisos: ${id}`,
        createdAt: mexicoTime(),
        updatedAt: mexicoTime()
      });
      return res.status(403).json({ message: "No autorizado" });
    }

    await targetUser.destroy();

    await Log.create({
      userId: currentUser.id,
      username: currentUser.name,
      ip,
      status: true,
      message: `Usuario eliminado: ${targetUser.name}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });

    res.json({ status: true });
  } catch (err) {
    await Log.create({
      userId: req.userId ?? null,
      username: null,
      ip,
      status: false,
      message: `Error eliminando usuario: ${err.message}`,
      createdAt: mexicoTime(),
      updatedAt: mexicoTime()
    });
    res.status(500).json({ status: false, message: "Error al eliminar usuario" });
  }
};