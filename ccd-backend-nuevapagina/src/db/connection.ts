import { Sequelize } from "sequelize";
export const db: Sequelize[] = [];
import dotenv from "dotenv";
import pg from 'pg';

dotenv.config();

const SiscardRevolution = new Sequelize(
  process.env.NombreBD1 || "",
  process.env.UsuarioBD1 || "",
  process.env.ClaveBD1 || "",

  {
    dialectModule: pg,
    dialect: 'postgres',
    host: process.env.IpBD1 || "",
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true, // Esto asegura que SSL se usa
        rejectUnauthorized: false // Esto desactiva la validación del certificado (opcional, solo si confías en la conexión)
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  }
);

db.push(SiscardRevolution);

export default SiscardRevolution;

export const connect = async () => {
  // De la base Halcon se consultan los autorizadores
  try {
    await SiscardRevolution.authenticate();
    console.log("Base de datos CCD online");
  } catch (error) {
    console.log("Base de datos CCD offline");
    throw error;
  }
};
