import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "manager", "admin"),
      defaultValue: "user",
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
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

User.belongsTo(User, {
  as: "owner",
  foreignKey: "ownerId",
});

User.hasMany(User, {
  as: "ownedUsers",
  foreignKey: "ownerId",
});

export default User;
