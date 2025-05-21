import { DataTypes } from "sequelize";
import { db } from "../db/connection";

const Entidad = db[0].define(
  "Entidad",
  {
    IdEntidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nombres: {
      type: DataTypes.STRING,
    },
    Apellidos: {
      type: DataTypes.STRING,
    },
    TipoDocumento_id: {
      type: DataTypes.NUMBER,
    },
    NroDocumento: {
      type: DataTypes.STRING,
    },
    Correo: {
      type: DataTypes.STRING,
    },
    Telefono: {
      type: DataTypes.STRING,
    },
    Ubigeo: {
      type: DataTypes.STRING,
    },
    Direccion: {
      type: DataTypes.STRING,
    },
    Genero: {
      type: DataTypes.STRING,
    },
    FcNacimiento: {
      type: DataTypes.DATE,
    },
    TipoEntidad_id: {
      type: DataTypes.INTEGER,
    },
    EntidadRelacion_id: {
      type: DataTypes.INTEGER,
    },
    FcIngreso: {
      type: DataTypes.DATE,
    },
    FcBaja: {
      type: DataTypes.DATE,
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

export default Entidad;
