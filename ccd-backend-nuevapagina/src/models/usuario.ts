import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const Usuario = db[0].define(
  "Usuario",
  {
    IdUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Usuario: {
      type: DataTypes.STRING,
    },
    Clave: {
      type: DataTypes.STRING,
    },
    ClaveTemporal: {
      type: DataTypes.STRING,
    },
    FcIngreso: {
      type: DataTypes.DATE,
    },
    FcBaja: {
      type: DataTypes.DATE,
    },
    RutaImagen: {
      type: DataTypes.STRING,
    },
    Entidad_id: {
      type: DataTypes.INTEGER,
    },
    Online: {
      type: DataTypes.BOOLEAN,
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
    timestamps: false, // desactiva el uso de createdAt y updatedAt
  }
);

export default Usuario;
