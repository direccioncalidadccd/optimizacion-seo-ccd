import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const TipoProducto = db[0].define(
  "TipoProducto",
  {
    IdTipoProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TipoProducto: {
      type: DataTypes.STRING,
    },
    Estado_id: {
      type: DataTypes.STRING,
    },
    UltimaFechMod: {
      type: DataTypes.DATE,
    },
    UltimoUserMod: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false, 
  }
);

export default TipoProducto;
