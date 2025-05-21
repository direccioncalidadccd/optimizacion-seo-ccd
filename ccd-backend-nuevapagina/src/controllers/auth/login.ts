
import { request, response } from "express";
import db from "../../db/connection";

export const buscarUsuario = async (req = request, res = response) => {
  const { pUsuario } = req.body;

  // Ajusta la consulta SQL a tus necesidades
  const sql = `
      SELECT  
        us."IdUsuario" AS "uid",
        us."Usuario",
        us."Clave",
        en."Nombres",
        en."Apellidos",
        per."Perfil",
        STRING_AGG(men."IdMenu"::TEXT, ',') AS "IdMenu",
        encl."Cliente_id",
        ar."IdArea",
        us."Premium",
        us."RutaImagenPerfil"  
    FROM "Usuario" us
    LEFT JOIN "Entidad" en ON en."IdEntidad" = us."Entidad_id"
    LEFT JOIN "Empleado" emp ON emp."Entidad_id" = en."IdEntidad"
    LEFT JOIN "Area" ar ON ar."IdArea" = emp."Area_id"
    LEFT JOIN "PerfilUsuario" peru ON peru."Usuario_id" = us."IdUsuario"
    LEFT JOIN "Perfil" per ON per."IdPerfil" = peru."Perfil_id"
    LEFT JOIN "MenuAsignado" me 
        ON me."Usuario_id" = us."IdUsuario" 
        OR me."Perfil_id" = per."IdPerfil"
    LEFT JOIN "Menu" men ON men."IdMenu" = me."Menu_id"
    LEFT JOIN "EntidadCliente" encl ON encl."Entidad_id" = en."IdEntidad"
    WHERE 
        us."Estado_id" IN (1, 15) 
        AND us."Usuario" = '${pUsuario}'
    GROUP BY 
        us."IdUsuario",
        us."Usuario",
        us."Clave",
        en."Nombres",
        en."Apellidos",
        per."Perfil",
        encl."Cliente_id",
        ar."IdArea",
        us."RutaImagenPerfil",
        us."Premium";

    
    `;

  try {
    // Ejecutar la consulta SQL directamente usando sequelize.query
    const data = await db.query(sql, {
      replacements: {}, // Parámetro para evitar inyecciones SQL
    });

    return res.status(200).json({
      ok: true,
      msg: "Información correcta",
      data,
    });

  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error de conexión",
    });
  }
};