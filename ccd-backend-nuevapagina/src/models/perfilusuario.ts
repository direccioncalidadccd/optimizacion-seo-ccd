import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const PerfilUsuario = db[0].define(
  "PerfilUsuario",
  {
    IdPerfilUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Perfil_id: {
      type: DataTypes.INTEGER,
    },
    Usuario_id: {
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

export default PerfilUsuario;
