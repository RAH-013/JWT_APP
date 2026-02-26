import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import { Op } from "sequelize";
import Log from "../model/logs.js";
import { JWT_SECRET } from "../config/env.js";

export const authUser = async (req, res) => {
  const { name, password } = req.body;
  const ip = req.ip;

  try {
    const user = await User.findOne({ where: { name } });

    if (!user) {
      await Log.create({ username: name, status: false, ip, message: "Usuario no encontrado" });
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await Log.create({ username: name, status: false, ip, message: "Contraseña incorrecta" });
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    await Log.create({ username: name, status: true, ip, message: "Login exitoso" });

    res.json({
      token,
    });
  } catch (err) {
    console.error(err);
    await Log.create({ username: name, status: false, ip, message: `Error autenticando usuario: ${err.message}` });
    res.status(500).json({ message: "Error al autenticar usuario" });
  }
};

export const getUsers = async (req, res) => {
  const ip = req.ip;
  try {
    const currentUser = await User.findByPk(req.userId);

    if (!currentUser || (currentUser.role !== "manager" && currentUser.role !== "admin")) {
      await Log.create({
        userId: currentUser?.id || null,
        username: currentUser?.name || null,
        ip,
        status: false,
        message: "Intento de obtener usuarios sin permisos",
      });
      return res.status(403).json({ message: "No autorizado" });
    }

    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: currentUser.id,
        },
      },
      attributes: { exclude: ["passwordHash"] }, // <--- excluye la contraseña
    });

    await Log.create({
      userId: currentUser.id,
      username: currentUser.name,
      ip,
      status: true,
      message: "Obtención de lista de usuarios exitosa",
    });

    res.json({ status: true, users });
  } catch (err) {
    console.error(err);
    await Log.create({
      userId: req.userId,
      username: currentUser?.name || null,
      ip,
      status: false,
      message: `Error al obtener usuarios: ${err.message}`,
    });
    res.status(500).json({ status: false, message: "Error al obtener usuarios" });
  }
};

export const getUserData = async (req, res) => {
  const ip = req.ip;
  try {
    const currentUser = await User.findByPk(req.userId, {
      attributes: { exclude: ["passwordHash"] }, // <--- excluye la contraseña
    });

    if (!currentUser) {
      await Log.create({
        username: null,
        ip,
        status: false,
        message: "Usuario no encontrado al obtener datos",
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await Log.create({
      username: currentUser.name,
      ip,
      status: true,
      message: "Consulta de datos de usuario",
    });

    res.json(currentUser);
  } catch (err) {
    console.error(err);
    await Log.create({
      username: null,
      ip,
      status: false,
      message: `Error al obtener usuario: ${err.message}`,
    });
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

export const addUser = async (req, res) => {
  const ip = req.ip;
  try {
    const currentUser = await User.findByPk(req.userId);
    if (!currentUser || currentUser.role !== "admin") {
      await Log.create({ username: currentUser?.name || null, ip, status: false, message: "Intento de crear usuario sin permisos" });
      return res.status(403).json({ message: "No autorizado" });
    }

    const { name, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, passwordHash, role });

    await Log.create({ username: currentUser.name, ip, status: true, message: `Usuario creado: ${newUser.name}` });

    res.status(201).json({ status: true });
  } catch (err) {
    console.error(err);
    await Log.create({ username: null, ip, status: false, message: `Error creando usuario: ${err.message}` });
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
      await Log.create({ username: currentUser?.name || null, ip, status: false, message: `Intento de actualizar usuario no existente: ${id}` });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (currentUser.role === "admin") {
      if (name) targetUser.name = name;
      if (password) targetUser.passwordHash = await bcrypt.hash(password, 10);
      if (role) targetUser.role = role;
    } else if (currentUser.role === "manager" || currentUser.role === "user") {
      if (currentUser.id !== targetUser.id) {
        await Log.create({ username: currentUser.name, ip, status: false, message: `Intento de actualizar otro usuario sin permisos: ${id}` });
        return res.status(403).json({ message: "No autorizado" });
      }
      if (name) targetUser.name = name;
      if (password) targetUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    await Log.create({ username: currentUser.name, ip, status: true, message: `Usuario actualizado: ${targetUser.name}` });

    res.json({ status: true });
  } catch (err) {
    console.error(err);
    await Log.create({ username: req.userId, ip, status: false, message: `Error actualizando usuario: ${err.message}` });
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
      await Log.create({ username: currentUser?.name || null, ip, status: false, message: `Intento de eliminar usuario no existente: ${id}` });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (currentUser.role !== "admin" && currentUser.id !== targetUser.id) {
      await Log.create({ username: currentUser.name, ip, status: false, message: `Intento de eliminar otro usuario sin permisos: ${id}` });
      return res.status(403).json({ message: "No autorizado" });
    }

    await targetUser.destroy();

    await Log.create({ username: currentUser.name, ip, status: true, message: `Usuario eliminado: ${targetUser.name}` });

    res.json({ status: true });
  } catch (err) {
    console.error(err);
    await Log.create({ username: req.userId, ip, status: false, message: `Error eliminando usuario: ${err.message}` });
    res.status(500).json({ status: false, message: "Error al eliminar usuario" });
  }
};
