import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Log = sequelize.define(
    "logs",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        success: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        freezeTableName: true
    }
);

export default Log;