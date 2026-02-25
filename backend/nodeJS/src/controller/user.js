import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/users.js";
import Log from "../models/logs.js";
import { JWT_SECRET } from "../config/env.js";

// ==========================
// Autenticación (solo id en token)
// ==========================
export const authUser = async (req, res) => {
    const { name, password } = req.body;
    const ip = req.ip;

    try {
        const user = await User.findOne({ where: { name } });

        if (!user) {
            await Log.create({ username: name, success: false, ip, message: "User not found" });
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            await Log.create({ username: name, success: false, ip, message: "Invalid password" });
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Token solo con id
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

        await Log.create({ username: name, success: true, ip, message: "Login successful" });

        res.json({
            id: user.id,
            name: user.name,
            role: user.role,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al autenticar usuario" });
    }
};

// ==========================
// Obtener usuarios según rol
// user → su info, manager → todos, admin → todos
// ==========================
export const getUserData = async (req, res) => {
    try {
        const { userId } = req;

        const currentUser = await User.findByPk(userId);
        if (!currentUser) return res.status(404).json({ message: "Usuario no encontrado" });

        if (currentUser.role === "user") {
            // solo su info
            return res.json(currentUser);
        }

        // manager y admin ven todos
        const users = await User.findAll({
            attributes: ["id", "name", "role", "createdAt", "updatedAt"],
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

// ==========================
// Crear usuario (solo admin)
// ==========================
export const addUser = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.userId);
        if (currentUser.role !== "admin") return res.status(403).json({ message: "No autorizado" });

        const { name, password, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, passwordHash, role });
        res.status(201).json({ id: newUser.id, name: newUser.name, role: newUser.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al crear usuario" });
    }
};

// ==========================
// Actualizar usuario (admin, manager o user sobre sí mismo)
// ==========================
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // id del usuario a modificar
        const { name, password, role } = req.body;
        const currentUser = await User.findByPk(req.userId);
        const targetUser = await User.findByPk(id);

        if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });

        // Validación de permisos
        if (currentUser.role !== "admin" && currentUser.id !== targetUser.id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (name) targetUser.name = name;
        if (password) targetUser.passwordHash = await bcrypt.hash(password, 10);
        if (role && currentUser.role === "admin") targetUser.role = role; // solo admin cambia roles

        await targetUser.save();
        res.json({ id: targetUser.id, name: targetUser.name, role: targetUser.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

// ==========================
// Eliminar usuario (admin o sobre sí mismo)
// ==========================
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findByPk(req.userId);
        const targetUser = await User.findByPk(id);

        if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });

        // Validación de permisos
        if (currentUser.role !== "admin" && currentUser.id !== targetUser.id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        await targetUser.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
};