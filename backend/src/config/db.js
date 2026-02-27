import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/database.sqlite",
  logging: false,
});

export default sequelize;
