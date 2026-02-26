import { Op } from "sequelize";
import Log from "../model/logs.js";
import User from "../model/user.js";

export const getAllLogs = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const logs = await Log.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener logs" });
  }
};

export const getInfoLog = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { id } = req.params;
    const log = await Log.findByPk(id);

    if (!log) return res.status(404).json({ message: "Log no encontrado" });

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener log" });
  }
};

export const getRangeLogs = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: "Debe proporcionar start y end" });

    const logs = await Log.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(start), new Date(end)],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener logs por rango" });
  }
};
