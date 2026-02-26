import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "users",
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "manager", "admin"), defaultValue: "user" },
  },
  {
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
    ],
  },
);

export default User;
