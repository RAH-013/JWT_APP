import express from "express";
import cors from "cors";
import morgan from "morgan";

import userRoutes from "./routes/users.js";
import logsRoutes from "./routes/logs.js";
import { configurarSwagger } from "./docs/swagger.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

configurarSwagger(app);

app.use("/api/users", userRoutes);
app.use("/api/logs", logsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "No encontrado",
    detalles: "La ruta solicitada no existe.",
  });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "JSON malformado",
      detalles: "El cuerpo de la solicitud no contiene un JSON válido.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Contenido demasiado grande",
      detalles: "El cuerpo de la solicitud supera el tamaño permitido.",
    });
  }

  console.error(err);

  const status = err.status >= 400 && err.status < 500 ? err.status : 500;

  return res.status(status).json({
    error: "Error interno del servidor",
    detalles: "Ocurrió un error al procesar la solicitud.",
  });
});

export default app;
