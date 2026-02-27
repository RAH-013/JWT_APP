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
