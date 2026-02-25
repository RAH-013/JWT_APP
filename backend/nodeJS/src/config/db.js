import { Sequelize } from "sequelize";
import { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } from "./env";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

export default sequelize;