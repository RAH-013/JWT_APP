import express from "express";
import cors from "cors";
import morgan from "morgan";

import { PORT } from "./config/env.js";

import sequelize from "./config/db.js";
import userRoutes from "./routes/users.js";
import logsRoutes from "./routes/logs.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/logs", logsRoutes);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized (SQLite)");

    const { User } = sequelize.models;
    const adminExists = await User.findOne({ where: { username: "admin" } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        username: "admin",
        passwordHash: hashedPassword,
        role: "admin",
      });
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB sync error:", err);
    process.exit(1);
  }
})();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});
