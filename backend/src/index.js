import { PORT } from "./config/env.js";
import sequelize from "./config/db.js";
import app from "./app.js";
import crearUsuariosIniciales from "./seed/initialUsers.js";

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await crearUsuariosIniciales();

    console.log("Database synchronized (SQLite)");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/docs`);
      console.log(`OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
    });
  } catch (error) {
    console.error("Error iniciando el servidor:", error);
    process.exit(1);
  }
};

iniciarServidor();
