import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const Categoria = db[0].define(
  "Categoria",
  {
    IdCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Categoria: {
      type: DataTypes.STRING,
    },
    Clasificacion_id: {
      type: DataTypes.INTEGER,
    },
    Estado_id: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false, // desactiva el uso de createdAt y updatedAt
  }
);

export default Categoria;
