import { Sequelize } from "sequelize";
import path from "node:path";
import fs from "node:fs";

const storage = "/node_app/data/database.sqlite";

fs.mkdirSync(path.dirname(storage), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage,
  logging: false,
});

export default sequelize;
