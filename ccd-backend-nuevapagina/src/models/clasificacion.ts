import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const Clasificacion = db[0].define(
  "Clasificacion",
  {
    IdClasificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Clasificacion: {
      type: DataTypes.STRING,
    },
    TipoProducto_id: {
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

export default Clasificacion;
