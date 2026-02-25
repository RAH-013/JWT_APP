import express from "express";
import cors from "cors";
import morgan from "morgan";

import { sequelize } from "./models/index.js";
import { PORT } from "./config/env.js";

import userRoutes from "./routes/users.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Rutas
app.use("/api/users", userRoutes);

// Inicialización de Sequelize + servidor
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized (development)");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [development]`);
    });
  } catch (err) {
    console.error("DB sync error:", err);
    process.exit(1);
  }
})();

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});