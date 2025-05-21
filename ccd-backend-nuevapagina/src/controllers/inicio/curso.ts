import { request, response } from "express";
import db from "../../db/connection";
const nodemailer = require("nodemailer");
import {
  inNumberArray,
  isBetween,
  isRequiredAllOrNone,
  validateRequest,
} from "../../utils/validations";
import { KJUR } from "jsrsasign";

// Backend: Obtener detalles del curso por IdCurso
export const getcursodetalle = async (req = request, res = response) => {
  const { IdCurso } = req.body;


  const sql = `

  SELECT 
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'TipoModalidad', "tmo"."TipoModalidad",
      'IdProducto', "pro"."IdProducto",
      'Precio', "ppr"."Precio",
      'PrecioAnterior', "ppr"."PrecioAnterior",
      'FechaInicio', 
        TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' || 
        CASE 
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '01' THEN 'Enero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '02' THEN 'Febrero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '03' THEN 'Marzo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '04' THEN 'Abril'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '05' THEN 'Mayo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '06' THEN 'Junio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '07' THEN 'Julio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '08' THEN 'Agosto'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '09' THEN 'Septiembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '10' THEN 'Octubre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '11' THEN 'Noviembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '12' THEN 'Diciembre'
        END,
        'Horario', "sal"."Horario"
    )
  ) AS "Productos",
  MAX(pat."Descripcion") AS "Descripcion",
  MAX(pat."Calificacion") AS "Calificacion",
  MAX(pat."Seguidores") AS "Seguidores",
  MAX(pat."Nivel") AS "Nivel",
  MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
  MAX(pat."ExamenParcial") AS "ExamenParcial",
  MAX(pat."ExamenFinal") AS "ExamenFinal",
  MAX(pat."Profesores") AS "Profesores",
  MAX(pat."Frecuencia") AS "Frecuencia",
  MAX(pat."HorasAcademicas") AS "HorasAcademicas",
  MAX(pat."Estado_id") AS "Estado_id",
  MAX(pat."UltimaFechMod") AS "UltimaFechMod",
  MAX(pat."NumeroWhatsapp") AS "NumeroWhatsapp",
  "esc"."Escuela" AS "Escuela",
  "esp"."Especializacion" AS "Especializacion",
  "cur"."IdCurso" AS "IdCurso",
  "cur"."Curso" AS "Curso",
  "tpo"."TipoCurso" AS "TipoCurso",
  (SELECT 
      JSON_AGG(CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"))
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
  ) AS "RutaImagen",
  (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
LEFT JOIN "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
    WHERE "cur"."IdCurso" = :IdCurso AND "cur"."Estado_id" = '1' AND "pro"."Estado_id" = '1'
GROUP BY
  "esc"."Escuela",
  "esp"."Especializacion",
  "cur"."IdCurso",
  "cur"."Curso",
  "tpo"."TipoCurso";
  `;

  try {
    const [result] = await db.query(sql, {
      replacements: { IdCurso },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const getcursosfull = async (req = request, res = response) => {
  const sql = `

  SELECT 
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'TipoModalidad', "tmo"."TipoModalidad",
      'IdProducto', "pro"."IdProducto",
      'Precio', "ppr"."Precio",
      'FechaInicio', 
        TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' || 
        CASE 
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '01' THEN 'Enero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '02' THEN 'Febrero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '03' THEN 'Marzo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '04' THEN 'Abril'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '05' THEN 'Mayo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '06' THEN 'Junio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '07' THEN 'Julio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '08' THEN 'Agosto'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '09' THEN 'Septiembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '10' THEN 'Octubre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '11' THEN 'Noviembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '12' THEN 'Diciembre'
        END,
        'Horario', "sal"."Horario"
    )
  ) AS "Productos",
  MAX(pat."Descripcion") AS "Descripcion",
  MAX(pat."Calificacion") AS "Calificacion",
  MAX(pat."Seguidores") AS "Seguidores",
  MAX(pat."Nivel") AS "Nivel",
  MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
  MAX(pat."ExamenParcial") AS "ExamenParcial",
  MAX(pat."ExamenFinal") AS "ExamenFinal",
  MAX(pat."Profesores") AS "Profesores",
  MAX(pat."Frecuencia") AS "Frecuencia",
  MAX(pat."HorasAcademicas") AS "HorasAcademicas",
  MAX(pat."Estado_id") AS "Estado_id",
  MAX(pat."UltimaFechMod") AS "UltimaFechMod",
  MAX(pat."NumeroWhatsapp") AS "NumeroWhatsapp",
  "esc"."Escuela" AS "Escuela",
  "esp"."Especializacion" AS "Especializacion",
  "cur"."IdCurso" AS "IdCurso",
  "cur"."Curso" AS "Curso",
  "tpo"."TipoCurso" AS "TipoCurso",
  (SELECT 
      JSON_AGG(CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"))
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
  ) AS "RutaImagen",
  (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
LEFT JOIN "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
WHERE "cur"."Estado_id" = '1' AND "pro"."Estado_id" = '1'    
GROUP BY
  "esc"."Escuela",
  "esp"."Especializacion",
  "cur"."IdCurso",
  "cur"."Curso",
  "tpo"."TipoCurso";
  `;

  try {
    const [result] = await db.query(sql, {
      replacements: {},
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const getcursosav = async (req = request, res = response) => {
  const sql = `
SELECT  
  JSON_BUILD_OBJECT(
    'Descripcion', MAX(pat."Descripcion"),
    'Calificacion', MAX(pat."Calificacion"),
    'Seguidores', MAX(pat."Seguidores"),
    'Nivel', MAX(pat."Nivel"),
    'MarcasRespaldo', MAX(pat."MarcasRespaldo"),
    'ExamenParcial', MAX(pat."ExamenParcial"),
    'ExamenFinal', MAX(pat."ExamenFinal"),
    'Profesores', MAX(pat."Profesores"),
    'Frecuencia', MAX(pat."Frecuencia"),
    'HorasAcademicas', MAX(pat."HorasAcademicas"),
    'Estado_id', MAX(pat."Estado_id"),
    'UltimaFechMod', MAX(pat."UltimaFechMod"),
    'NumeroWhatsapp', MAX(pat."NumeroWhatsapp"),
    'Escuela', "esc"."Escuela",
    'Especializacion', "esp"."Especializacion",
	'IdProducto', "pro"."IdProducto",
    'IdCurso', "cur"."IdCurso",
    'Curso', "cur"."Curso",
    'TipoCurso', "tpo"."TipoCurso",
	'TipoModalidad', "tmo"."TipoModalidad",
        'Precio', "ppr"."Precio",
        'FechaInicio', 
          CASE 
            WHEN "sal"."FechaInicio" IS NOT NULL THEN 
              TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' || 
              CASE 
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '01' THEN 'Enero'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '02' THEN 'Febrero'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '03' THEN 'Marzo'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '04' THEN 'Abril'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '05' THEN 'Mayo'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '06' THEN 'Junio'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '07' THEN 'Julio'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '08' THEN 'Agosto'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '09' THEN 'Septiembre'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '10' THEN 'Octubre'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '11' THEN 'Noviembre'
                WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '12' THEN 'Diciembre'
              END
            ELSE NULL
          END,
        'FechaInicioSinFormato', "sal"."FechaInicio",
        'Horario', "sal"."Horario",
    'RutaImagen', (
      SELECT 
        JSON_AGG(CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"))
      FROM "ProductoAdjunto" "pad"
      WHERE "pad"."Curso_id" = "cur"."IdCurso"
    ),
    'CantidadModulos', (
      SELECT COUNT(*) 
      FROM "ProductoTemario" 
      WHERE "Curso_id" = "cur"."IdCurso"
    )
  )
FROM 
  "Producto" "pro"
INNER JOIN 
  "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN 
  "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN 
  "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN 
  "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
INNER JOIN 
  "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
LEFT JOIN 
  "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
LEFT JOIN 
  "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN 
  "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
WHERE 
  "cur"."Estado_id" = '1' AND "pro"."Estado_id" = '1'
GROUP BY 
  "esc"."Escuela",
  "esp"."Especializacion",
  "cur"."IdCurso",
  "cur"."Curso",
  "tpo"."TipoCurso",
  "tmo"."TipoModalidad",
  "pro"."IdProducto",
  "ppr"."Precio",
  "sal"."FechaInicio",
  "sal"."Horario"
  `;

  try {
    const [result] = await db.query(sql, {
      replacements: {},
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const frontgetcursodetalle = async (req = request, res = response) => {
  const { Escuela, T1, T2, T4 } = req.body;


  const sql = `
      SELECT 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto",
            'Precio', "ppr"."Precio"
          )
        ) AS "Productos",
        MAX(pat."Descripcion") AS "Descripcion",
        MAX(pat."Calificacion") AS "Calificacion",
        MAX(pat."Seguidores") AS "Seguidores",
        MAX(pat."Nivel") AS "Nivel",
        MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
        MAX(pat."ExamenParcial") AS "ExamenParcial",
        MAX(pat."ExamenFinal") AS "ExamenFinal",
        MAX(pat."Profesores") AS "Profesores",
        MAX(pat."Frecuencia") AS "Frecuencia",
        MAX(pat."HorasAcademicas") AS "HorasAcademicas",
        MAX(pat."Estado_id") AS "Estado_id",
        MAX(pat."UltimaFechMod") AS "UltimaFechMod",
        "esc"."Escuela" AS "Escuela",
        "esp"."Especializacion" AS "Especializacion",
        "cur"."IdCurso" AS "IdCurso",
        "cur"."Curso" AS "Curso",
        "tpo"."TipoCurso" AS "TipoCurso",
        CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
      FROM "Producto" "pro"
      INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
      INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
      INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
      LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
      WHERE "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
      GROUP BY 
        "esc"."Escuela",
        "esp"."Especializacion",
        "cur"."IdCurso",
        "cur"."Curso",
        "tpo"."TipoCurso",
        "pad"."Tipo1",
        "pad"."Tipo2",
        "pad"."Tipo3",
        "pad"."Tipo4",
        "pad"."NombreArchivo"
      LIMIT 4;
    `;

  try {
    const [result] = await db.query(sql, {
      replacements: { Escuela, T1, T2, T4 },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const escuelagetcursodetalle = async (req = request, res = response) => {
  const { Escuela, T1, T2, T4 } = req.body;


  const sql = `
      SELECT 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto",
            'Precio', "ppr"."Precio"
          )
        ) AS "Productos",
        MAX(pat."Descripcion") AS "Descripcion",
        MAX(pat."Calificacion") AS "Calificacion",
        MAX(pat."Seguidores") AS "Seguidores",
        MAX(pat."Nivel") AS "Nivel",
        MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
        MAX(pat."ExamenParcial") AS "ExamenParcial",
        MAX(pat."ExamenFinal") AS "ExamenFinal",
        MAX(pat."Profesores") AS "Profesores",
        MAX(pat."Frecuencia") AS "Frecuencia",
        MAX(pat."HorasAcademicas") AS "HorasAcademicas",
        MAX(pat."Estado_id") AS "Estado_id",
        MAX(pat."UltimaFechMod") AS "UltimaFechMod",
        "esc"."Escuela" AS "Escuela",
        "esp"."Especializacion" AS "Especializacion",
        "cur"."IdCurso" AS "IdCurso",
        "cur"."Curso" AS "Curso",
        "tpo"."TipoCurso" AS "TipoCurso",
        CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
      FROM "Producto" "pro"
      INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
      INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
      INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
      LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
      WHERE "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
      GROUP BY 
        "esc"."Escuela",
        "esp"."Especializacion",
        "cur"."IdCurso",
        "cur"."Curso",
        "tpo"."TipoCurso",
        "pad"."Tipo1",
        "pad"."Tipo2",
        "pad"."Tipo3",
        "pad"."Tipo4",
        "pad"."NombreArchivo";
    `;

  try {
    const [result] = await db.query(sql, {
      replacements: { Escuela, T1, T2, T4 },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const getescuela = async (req = request, res = response) => {
  const sql = `
      SELECT 
        "esc"."Escuela" AS "Escuela"
      FROM "Escuela" "esc" 
      WHERE "Estado_id" = '1'
    `;

  try {
    const [result] = await db.query(sql, {});

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Escuelas encontradas",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar las escuelas",
    });
  }
};

export const frontgetcursodetalleescuela = async (
  req = request,
  res = response
) => {
  const { Escuela, T1, T2, T4 } = req.body;



  const sql = `
      SELECT 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto",
            'Precio', "ppr"."Precio"
          )
        ) AS "Productos",
        MAX(pat."Descripcion") AS "Descripcion",
        MAX(pat."Calificacion") AS "Calificacion",
        MAX(pat."Seguidores") AS "Seguidores",
        MAX(pat."Nivel") AS "Nivel",
        MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
        MAX(pat."ExamenParcial") AS "ExamenParcial",
        MAX(pat."ExamenFinal") AS "ExamenFinal",
        MAX(pat."Profesores") AS "Profesores",
        MAX(pat."Frecuencia") AS "Frecuencia",
        MAX(pat."HorasAcademicas") AS "HorasAcademicas",
        MAX(pat."Estado_id") AS "Estado_id",
        MAX(pat."UltimaFechMod") AS "UltimaFechMod",
        "esc"."Escuela" AS "Escuela",
        "esp"."Especializacion" AS "Especializacion",
        "cur"."IdCurso" AS "IdCurso",
        "cur"."Curso" AS "Curso",
        "tpo"."TipoCurso" AS "TipoCurso",
        CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
      FROM "Producto" "pro"
      INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
      INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
      INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
      LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
      WHERE "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
      GROUP BY 
        "esc"."Escuela",
        "esp"."Especializacion",
        "cur"."IdCurso",
        "cur"."Curso",
        "tpo"."TipoCurso",
        "pad"."Tipo1",
        "pad"."Tipo2",
        "pad"."Tipo3",
        "pad"."Tipo4",
        "pad"."NombreArchivo";
      Limit 4
    `;

  try {
    const [result] = await db.query(sql, {
      replacements: { Escuela, T1, T2, T4 },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const getcursoescuelaespecializacion = async (
  req = request,
  res = response
) => {
  const { Escuela, Especializacion } = req.body;



  const sql = `

  SELECT 
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'TipoModalidad', "tmo"."TipoModalidad",
      'IdProducto', "pro"."IdProducto",
      'Precio', "ppr"."Precio",
      'FechaInicio', 
        TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' || 
        CASE 
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '01' THEN 'Enero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '02' THEN 'Febrero'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '03' THEN 'Marzo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '04' THEN 'Abril'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '05' THEN 'Mayo'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '06' THEN 'Junio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '07' THEN 'Julio'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '08' THEN 'Agosto'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '09' THEN 'Septiembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '10' THEN 'Octubre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '11' THEN 'Noviembre'
          WHEN TO_CHAR("sal"."FechaInicio", 'MM') = '12' THEN 'Diciembre'
        END,
        'Horario', "sal"."Horario"
    )
  ) AS "Productos",
  MAX(pat."Descripcion") AS "Descripcion",
  MAX(pat."Calificacion") AS "Calificacion",
  MAX(pat."Seguidores") AS "Seguidores",
  MAX(pat."Nivel") AS "Nivel",
  MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
  MAX(pat."ExamenParcial") AS "ExamenParcial",
  MAX(pat."ExamenFinal") AS "ExamenFinal",
  MAX(pat."Profesores") AS "Profesores",
  MAX(pat."Frecuencia") AS "Frecuencia",
  MAX(pat."HorasAcademicas") AS "HorasAcademicas",
  MAX(pat."Estado_id") AS "Estado_id",
  MAX(pat."UltimaFechMod") AS "UltimaFechMod",
  MAX(pat."NumeroWhatsapp") AS "NumeroWhatsapp",
  "esc"."Escuela" AS "Escuela",
  "esp"."Especializacion" AS "Especializacion",
  "cur"."IdCurso" AS "IdCurso",
  "cur"."Curso" AS "Curso",
  "tpo"."TipoCurso" AS "TipoCurso",
  (SELECT 
      JSON_AGG(CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"))
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
  ) AS "RutaImagen",
  (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
LEFT JOIN "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
WHERE "esc"."Escuela" = :Escuela AND "esp"."Especializacion" = :Especializacion AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
GROUP BY
  "esc"."Escuela",
  "esp"."Especializacion",
  "cur"."IdCurso",
  "cur"."Curso",
  "tpo"."TipoCurso";
    `;

  try {
    const [result] = await db.query(sql, {
      replacements: { Escuela, Especializacion },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Curso no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar el curso",
    });
  }
};

export const buscarCursosPorPalabra = async (req = request, res = response) => {
  const { Palabra, Escuela, T1, T2, T4 } = req.body;

  // Validación
  if (!Escuela || !Palabra) {
    return res.status(400).json({
      ok: false,
      msg: "Los campos 'Palabra' y 'Escuela' son obligatorios.",
    });
  }

  const palabraBusqueda = `%${Palabra.trim().replace(/\s+/g, "%")}%`; // Corrección del patrón de búsqueda

  const sql = `
      SELECT 
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'TipoModalidad', "tmo"."TipoModalidad",
          'IdProducto', "pro"."IdProducto",
          'Precio', "ppr"."Precio"
        )
      ) AS "Productos",
      MAX(pat."Descripcion") AS "Descripcion",
      MAX(pat."Calificacion") AS "Calificacion",
      MAX(pat."Seguidores") AS "Seguidores",
      MAX(pat."Nivel") AS "Nivel",
      MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
      MAX(pat."ExamenParcial") AS "ExamenParcial",
      MAX(pat."ExamenFinal") AS "ExamenFinal",
      MAX(pat."Profesores") AS "Profesores",
      MAX(pat."Frecuencia") AS "Frecuencia",
      MAX(pat."HorasAcademicas") AS "HorasAcademicas",
      MAX(pat."Estado_id") AS "Estado_id",
      MAX(pat."UltimaFechMod") AS "UltimaFechMod",
      "esc"."Escuela" AS "Escuela",
      "esp"."Especializacion" AS "Especializacion",
      "cur"."IdCurso" AS "IdCurso",
      "cur"."Curso" AS "Curso",
      "tpo"."TipoCurso" AS "TipoCurso",
      CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
      (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
    FROM "Producto" "pro"
    INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
    INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
    INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
    INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
    INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
    WHERE "cur"."Curso" ILIKE :Palabra AND "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
    GROUP BY 
      "esc"."Escuela",
      "esp"."Especializacion",
      "cur"."IdCurso",
      "cur"."Curso",
      "tpo"."TipoCurso",
      "pad"."Tipo1",
      "pad"."Tipo2",
      "pad"."Tipo3",
      "pad"."Tipo4",
      "pad"."NombreArchivo";
    `;
  try {
    const data = await db.query(sql, {
      replacements: { Palabra: palabraBusqueda, Escuela, T1, T2, T4 },
    });

    return res.status(200).json({
      ok: true,
      msg: "Cursos encontrados correctamente",
      total: data[0]?.length || 0, // Total de cursos encontrados
      cursos: data[0], // Lista de cursos
    });
  } catch (err) {
    console.error("Error al buscar los cursos:", err);
    return res.status(500).json({
      ok: false,
      msg: "Error durante la búsqueda de cursos.",
    });
  }
};

export const vercursosespecializacionescuela = async (
  req = request,
  res = response
) => {
  const { Escuela, T1, T2, T4 } = req.body;


  const sql = `
      SELECT 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto",
            'Precio', "ppr"."Precio"
          )
        ) AS "Productos",
        MAX(pat."Descripcion") AS "Descripcion",
        MAX(pat."Calificacion") AS "Calificacion",
        MAX(pat."Seguidores") AS "Seguidores",
        MAX(pat."Nivel") AS "Nivel",
        MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
        MAX(pat."ExamenParcial") AS "ExamenParcial",
        MAX(pat."ExamenFinal") AS "ExamenFinal",
        MAX(pat."Profesores") AS "Profesores",
        MAX(pat."Frecuencia") AS "Frecuencia",
        MAX(pat."HorasAcademicas") AS "HorasAcademicas",
        MAX(pat."Estado_id") AS "Estado_id",
        MAX(pat."UltimaFechMod") AS "UltimaFechMod",
        "esc"."Escuela" AS "Escuela",
        "esp"."Especializacion" AS "Especializacion",
        "cur"."IdCurso" AS "IdCurso",
        "cur"."Curso" AS "Curso",
        "tpo"."TipoCurso" AS "TipoCurso",
        CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
      FROM "Producto" "pro"
      INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
      INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
      INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
      LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
      WHERE "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
      GROUP BY 
        "esc"."Escuela",
        "esp"."Especializacion",
        "cur"."IdCurso",
        "cur"."Curso",
        "tpo"."TipoCurso",
        "pad"."Tipo1",
        "pad"."Tipo2",
        "pad"."Tipo3",
        "pad"."Tipo4",
        "pad"."NombreArchivo";
    `;

  try {
    const data = await db.query(sql, {
      replacements: { Escuela, T1, T2, T4 }, // Reemplazamos las variables con valores dinámicos.
    });
    return res.status(200).json({
      ok: true,
      msg: "Información obtenida correctamente",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al obtener los cursos",
    });
  }
};

//LISTARV2
export const listaespecializacion = async (req = request, res = response) => {
  const { Escuela } = req.body;

  // Ajusta la consulta SQL a tus necesidades
  const sql = `
      SELECT * FROM "Especializacion" "esp"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      WHERE "esc"."Escuela" = :Escuela AND "esp"."Estado_id" = '1'
      ORDER BY "esp"."Especializacion" ASC;
  `;

  try {
    // Ejecutar la consulta SQL directamente usando sequelize.query
    const data = await db.query(sql, {
      replacements: { Escuela },
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

// Endpoint Rutas :)
export const getRutas = async (req = request, res = response) => {
  const sql = `
SELECT 
    "rut"."IdRuta" AS "IdRuta",
    "rut"."Ruta",
    "rut"."ImagenPortada",
    "rut"."Descripcion",
    "esc"."Escuela",
    COALESCE((SELECT COUNT(*) FROM "RutaUsuario" WHERE "Ruta_id" = rut."IdRuta"), 0) AS "Integrantes",

    -- Obtener la escuela general (si todas las escuelas son iguales)
    COALESCE((
        SELECT 
            CASE 
                WHEN COUNT(DISTINCT "esc"."Escuela") = 1 THEN MAX("esc"."Escuela")
                ELSE NULL 
            END
        FROM "Curso" "cur"
        LEFT JOIN "Producto" "pro" ON "pro"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
        LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        WHERE "cur"."IdCurso" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = "rut"."IdRuta")
    ), NULL) AS "EscuelaGeneral",
    
    
    COALESCE((
        SELECT 
            ROUND(AVG(
                CASE 
                    WHEN pat."Seguidores" ~ '^[0-9]+$' AND CAST(pat."Seguidores" AS INTEGER) > 0 
                    THEN (CAST(pat."Calificacion" AS NUMERIC) * 100.0) / CAST(pat."Seguidores" AS NUMERIC)
                    ELSE 0 
                END
            )) || '% (' || ROUND(AVG(CAST(pat."Calificacion" AS NUMERIC))) || ')'
        FROM "ProductoAtributo" pat 
        WHERE pat."Curso_id" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = rut."IdRuta")
    ), '0% (0)') AS "Popularidad",

    -- Obtener los productos asociados a la ruta
    COALESCE((  
        SELECT JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'Curso', "cur"."Curso",
                'IdRuta', "rut"."IdRuta",
                'TipoModalidad', "tmo"."TipoModalidad",
                'HorasAcademicas', "pat"."HorasAcademicas",
                'IdProducto', "pro"."IdProducto",
                'Precio', "ppr"."Precio",
                'Escuela', "esc"."Escuela",
                'FechaInicio', 
                    CASE 
                        WHEN "sal"."FechaInicio" IS NOT NULL THEN 
                            TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' ||
                            CASE TO_CHAR("sal"."FechaInicio", 'MM')  
                                WHEN '01' THEN 'Enero' WHEN '02' THEN 'Febrero' WHEN '03' THEN 'Marzo'
                                WHEN '04' THEN 'Abril' WHEN '05' THEN 'Mayo' WHEN '06' THEN 'Junio'
                                WHEN '07' THEN 'Julio' WHEN '08' THEN 'Agosto' WHEN '09' THEN 'Septiembre'
                                WHEN '10' THEN 'Octubre' WHEN '11' THEN 'Noviembre' WHEN '12' THEN 'Diciembre'
                            END
                        ELSE NULL 
                    END,
                'Horario', "sal"."Horario",
                'CursoImagen', COALESCE((
    SELECT STRING_AGG(
      DISTINCT CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"),
      ', '
    ) 
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
    AND "pad"."NombreArchivo" LIKE '%.png'
), ''),

'CursoBrochure', COALESCE((
    SELECT STRING_AGG(
      DISTINCT CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"),
      ', '
    )
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
    AND "pad"."NombreArchivo" LIKE '%.pdf'
), ''),      
      'CantidadModulos', (SELECT COUNT(1) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso")
            )
        )
        FROM "Curso" "cur"
        LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "Producto" "pro" ON "pro"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
        LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
        LEFT JOIN "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
        LEFT JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
        LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        WHERE "cur"."IdCurso" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = "rut"."IdRuta")
        AND "pro"."Estado_id" = '1'  
        AND "cur"."Estado_id" = '1'  
    ), '[]') AS "Productos"

FROM "Ruta" "rut"
LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = (
    SELECT "esp"."Escuela_id" 
    FROM "Especializacion" "esp"
    LEFT JOIN "Curso" "cur" ON "cur"."Especializacion_id" = "esp"."IdEspecializacion"
    LEFT JOIN "RutaCurso" "ruc" ON "ruc"."Curso_id" = "cur"."IdCurso"
    WHERE "ruc"."Ruta_id" = "rut"."IdRuta"
    LIMIT 1
)
WHERE "rut"."Estado_id" = '1'
ORDER BY "rut"."IdRuta";
  `;

  try {
    const [result] = await db.query(sql, {
      replacements: {},
    });
    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Ruta no encontrado",
      });
    }
    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar la ruta",
    });
  }
};
// Endpoint Rutas :)
export const getRutasDetalle = async (req = request, res = response) => {
  const { Rid } = req.body;


  const sql = `

SELECT 
    "rut"."IdRuta" AS "IdRuta",
    "rut"."Ruta",
    "rut"."ImagenPortada",
    "rut"."Descripcion",
    "esc"."Escuela",
    COALESCE((SELECT COUNT(*) FROM "RutaUsuario" WHERE "Ruta_id" = rut."IdRuta"), 0) AS "Integrantes",

    -- Obtener la escuela general (si todas las escuelas son iguales)
    COALESCE((
        SELECT 
            CASE 
                WHEN COUNT(DISTINCT "esc"."Escuela") = 1 THEN MAX("esc"."Escuela")
                ELSE NULL 
            END
        FROM "Curso" "cur"
        LEFT JOIN "Producto" "pro" ON "pro"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
        LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        WHERE "cur"."IdCurso" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = "rut"."IdRuta")
    ), NULL) AS "EscuelaGeneral",
    
    
    COALESCE((
        SELECT 
            ROUND(AVG(
                CASE 
                    WHEN pat."Seguidores" ~ '^[0-9]+$' AND CAST(pat."Seguidores" AS INTEGER) > 0 
                    THEN (CAST(pat."Calificacion" AS NUMERIC) * 100.0) / CAST(pat."Seguidores" AS NUMERIC)
                    ELSE 0 
                END
            )) || '% (' || ROUND(AVG(CAST(pat."Calificacion" AS NUMERIC))) || ')'
        FROM "ProductoAtributo" pat 
        WHERE pat."Curso_id" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = rut."IdRuta")
    ), '0% (0)') AS "Popularidad",

    -- Obtener los productos asociados a la ruta
    COALESCE((  
        SELECT JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'Curso', "cur"."Curso",
                'IdRuta', "rut"."IdRuta",
                'TipoModalidad', "tmo"."TipoModalidad",
                'HorasAcademicas', "pat"."HorasAcademicas",
                'IdProducto', "pro"."IdProducto",
                'Precio', "ppr"."Precio",
                'Escuela', "esc"."Escuela",
                'FechaInicio', 
                    CASE 
                        WHEN "sal"."FechaInicio" IS NOT NULL THEN 
                            TO_CHAR("sal"."FechaInicio", 'DD') || ' de ' ||
                            CASE TO_CHAR("sal"."FechaInicio", 'MM')  
                                WHEN '01' THEN 'Enero' WHEN '02' THEN 'Febrero' WHEN '03' THEN 'Marzo'
                                WHEN '04' THEN 'Abril' WHEN '05' THEN 'Mayo' WHEN '06' THEN 'Junio'
                                WHEN '07' THEN 'Julio' WHEN '08' THEN 'Agosto' WHEN '09' THEN 'Septiembre'
                                WHEN '10' THEN 'Octubre' WHEN '11' THEN 'Noviembre' WHEN '12' THEN 'Diciembre'
                            END
                        ELSE NULL 
                    END,
                'Horario', "sal"."Horario",
                'CursoImagen', COALESCE((
    SELECT STRING_AGG(
      DISTINCT CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"),
      ', '
    ) 
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
    AND "pad"."NombreArchivo" LIKE '%.png'
), ''),

'CursoBrochure', COALESCE((
    SELECT STRING_AGG(
      DISTINCT CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"),
      ', '
    )
    FROM "ProductoAdjunto" "pad"
    WHERE "pad"."Curso_id" = "cur"."IdCurso"
    AND "pad"."NombreArchivo" LIKE '%.pdf'
), ''),      
      'CantidadModulos', (SELECT COUNT(1) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso")
            )
        )
        FROM "Curso" "cur"
        LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "Producto" "pro" ON "pro"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
        LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
        LEFT JOIN "Sala" "sal" ON "sal"."Producto_id" = "pro"."IdProducto"
        LEFT JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
        LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        WHERE "cur"."IdCurso" IN (SELECT "Curso_id" FROM "RutaCurso" WHERE "Ruta_id" = "rut"."IdRuta")
        AND "pro"."Estado_id" = '1'  
        AND "cur"."Estado_id" = '1'  
    ), '[]') AS "Productos"

FROM "Ruta" "rut"
LEFT JOIN "Escuela" "esc" ON "esc"."IdEscuela" = (
    SELECT "esp"."Escuela_id" 
    FROM "Especializacion" "esp"
    LEFT JOIN "Curso" "cur" ON "cur"."Especializacion_id" = "esp"."IdEspecializacion"
    LEFT JOIN "RutaCurso" "ruc" ON "ruc"."Curso_id" = "cur"."IdCurso"
    WHERE "ruc"."Ruta_id" = "rut"."IdRuta"
    LIMIT 1
)
WHERE "rut"."Estado_id" = '1' AND "rut"."IdRuta" = :Rid
ORDER BY "rut"."IdRuta";
  `;
  try {
    const [result] = await db.query(sql, {
      replacements: { Rid },
    });
    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Ruta Detalle no encontrado",
      });
    }
    return res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Error en la consulta SQL:", err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error al buscar la ruta",
    });
  }
};

export const asignarrutaadmin = async (req = request, res = response) => {
  const { fproducto_id, fusuario_id, fprecio } = req.body; // Añadimos 'Escuela' al body.
  const sql = `Insert INTO "RegistroVenta" ("Usuario_id","Producto_id","PrecioVenta","FechaCompra") values
      (${fusuario_id},${fproducto_id},${fprecio},CURRENT_TIMESTAMP);
  `;
  const sql1 = `
  INSERT INTO "ProductoStock" ("Usuario_id", "Producto_id", "StockDisponible") VALUES
  (${fusuario_id},${fproducto_id},1);
`;
  try {
    const data = await db.query(sql, {});
    const data1 = await db.query(sql1, {});
    return res.status(200).json({
      ok: true,
      msg: "Especializaciones obtenidas correctamente",
      data: data[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al obtener especializaciones",
    });
  }
};

export const ObtenerEspe = async (req = request, res = response) => {
  const { school } = req.body; // Obtener el valor de "school" desde el cuerpo de la solicitud

  // Asegurarse de que "school" se haya enviado en la solicitud
  if (!school) {
    return res.status(400).json({
      ok: false,
      msg: "El parámetro 'school' es obligatorio.",
    });
  }

  const sql = `
    SELECT "IdEspecializacion", "Especializacion"
    FROM "Especializacion"
    WHERE "Escuela_id" = ${school}
  `;

  try {
    const data = await db.query(sql, { replacements: [school] }); // Ejecutamos la consulta directamente

    // Devolvemos los resultados directamente, sin necesidad de acceder a data.rows
    return res.status(200).json({
      ok: true,
      msg: "Información recibida correctamente",
      data: data, // Devolvemos los resultados directamente
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al obtener los datos.",
    });
  }
};

export const asignarxpago = async (req = request, res = response) => {
  const { fproducto_id, fruta_id, fusuario_id, fprecio } = req.body;

  try {
    if (fproducto_id) {
      // Si se está comprando un producto (curso)
      for(const element of fproducto_id){
        
        const sql = `
        INSERT INTO "RegistroVenta" ("Usuario_id", "Producto_id", "PrecioVenta", "FechaCompra")
        VALUES (${fusuario_id}, ${element.IdProducto}, ${fprecio}, NOW());
      `;
      const sql1 = `
        INSERT INTO "ProductoStock" ("Usuario_id", "Producto_id", "StockDisponible")
        VALUES (${fusuario_id}, ${element.IdProducto}, 1);
      `;

      await db.query(sql);
      await db.query(sql1);
      }
      
    }
    if (fruta_id) {
      // Si se está comprando una ruta
      for(const element of fruta_id){
        const sql2 = `
        INSERT INTO "RegistroVenta" ("Usuario_id", "Ruta_id", "PrecioVenta", "FechaCompra")
        VALUES (${fusuario_id}, ${element.IdRuta}, ${fprecio}, NOW());
      `;
      const sql3 = `
        INSERT INTO "RutaUsuario" ("Usuario_id", "Ruta_id")
        VALUES (${fusuario_id}, ${element.IdRuta});
      `;

      await db.query(sql2);
      await db.query(sql3);
      }
      
    }

    return res.status(200).json({
      ok: true,
      msg: "Compra registrada correctamente",
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al registrar la compra",
    });
  }
};

export const listarcursosconpremium = async (req = request, res = response) => {
  const { fusuario_id } = req.body;

  try {
      // Verificar si el usuario tiene un plan premium activo
      const sqlVerificarPremium = `
          SELECT "Premium", "FechaExpiracionPremium"
          FROM "Usuario"
          WHERE "IdUsuario" = ${fusuario_id};
      `;
      const resultPremium = await db.query(sqlVerificarPremium);
      const usuario = resultPremium[0][0];

      if (!usuario) {
          return res.status(400).json({
              ok: false,
              msg: "Usuario no encontrado",
          });
      }

      const usuarioData = usuario as { Premium: number; FechaExpiracionPremium: string };
      const tienePremiumActivo = usuarioData.Premium === 1 && new Date(usuarioData.FechaExpiracionPremium) > new Date();

      console.log("Usuario tiene premium activo:", tienePremiumActivo);

      // Consulta base para obtener cursos
      const baseQuery = `
WITH ProfesoresProcesados AS (
  SELECT
      "pro"."IdProducto",
      UNNEST(string_to_array(MAX("pat"."Profesores"), ',')::int[]) AS "ProfesorId"
  FROM "Producto" "pro"
  LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "pro"."Curso_id"
  GROUP BY "pro"."IdProducto"
)
SELECT
  "pro"."IdProducto",
  "pro"."Nombre",
  "pro"."Descripcion",
  "pro"."Precio",
  "pro"."ImagenPortada",
  "pro"."IdCurso",
  "pro"."Curso",
  "pro"."TipoCurso"
FROM "Producto" "pro"
LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "pro"."Curso_id"
`;

      // Si el usuario tiene un plan premium activo, obtener todos los cursos
      let sql = baseQuery;
      if (!tienePremiumActivo) {
          // Si no tiene premium, obtener solo los cursos comprados
          sql += `
INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
WHERE "pst"."Usuario_id" = ${fusuario_id} AND pad."Tipo4"='PortadaFinal'
`;
      } else {
          // Si tiene premium, obtener todos los cursos
          sql += `
WHERE pad."Tipo4"='PortadaFinal'
`;
      }

      sql += `
GROUP BY
  "pro"."IdProducto",
  "pro"."Nombre",
  "pro"."Descripcion",
  "pro"."Precio",
  "pro"."ImagenPortada",
  "pro"."IdCurso",
  "pro"."Curso",
  "pro"."TipoCurso";
`;

      console.log("Consulta SQL generada:", sql);

      // Ejecutar la consulta SQL
      const data = await db.query(sql, {});
      return res.status(200).json({
          ok: true,
          msg: "Cursos obtenidos correctamente",
          data: data[0],
      });
  } catch (err) {
      console.error(err);
      return res.status(400).json({
          ok: false,
          msg: "Error al obtener los cursos",
      });
  }
};

// Ubigeo
export const listarPaises = async (req = request, res = response) => {
  // Ajusta la consulta SQL a tus necesidades
  const sql = `
     SELECT * FROM "Pais" "p"
  `;  
  try {
      // Ejecutar la consulta SQL directamente usando sequelize.query
      const data = await db.query(sql, {
        replacements: {},
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


export const actualizarEntidad = async (req = request, res = response) => {
  const {
    Nombres,
    Apellidos,
    TipoDocumento_id,
    NroDocumento,
    Pais_id,
    Telefono,
    Direccion,
    FcNacimiento,
    Genero,
    Usuario,
    IdUsuario,
  } = req.body;

  console.log(req.body);

  if (!IdUsuario) {
    return res.status(400).json({
      ok: false,
      msg: "El parámetro 'IdUsuario' es obligatorio.",
    });
  }

  // Consulta SQL con placeholders
  const sql = `
    UPDATE "Entidad"
    SET 
        "Nombres" = :Nombres,
        "Apellidos" = :Apellidos,
        "TipoDocumento_id" = :TipoDocumento_id,
        "NroDocumento" = :NroDocumento,
        "Pais_id" = :Pais_id,
        "Telefono" = :Telefono,
        "Direccion" = :Direccion,
        "FcNacimiento" = :FcNacimiento,
        "Genero" = :Genero,
        "UltimoUserMod" = :Usuario
    WHERE "IdEntidad" = :IdUsuario;
  `;

  try {
    // Ejecutar la consulta SQL con replacements
    const [results, metadata] = await db.query(sql, {
      replacements: {
        Nombres,
        Apellidos,
        TipoDocumento_id,
        NroDocumento,
        Pais_id,
        Telefono,
        Direccion,
        FcNacimiento,
        Genero,
        Usuario,
        IdUsuario,
      },
    });

    return res.status(200).json({
      ok: true,
      msg: "Datos actualizados correctamente",
      data: results,
    });
  } catch (err) {
    console.error("Error en la consulta SQL:", err);
    return res.status(400).json({
      ok: false,
      msg: "Error al actualizar los datos",
    });
  }
};

// Cursos General Tipo Modalidad
export const vercursosespecializacionGeneral = async (
  req = request,
  res = response
) => {
  const { TipoModalidad, T1, T2, T4 } = req.body;


  const sql = `
      SELECT 
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto",
            'Precio', "ppr"."Precio"
          )
        ) AS "Productos",
        MAX(pat."Descripcion") AS "Descripcion",
        MAX(pat."Calificacion") AS "Calificacion",
        MAX(pat."Seguidores") AS "Seguidores",
        MAX(pat."Nivel") AS "Nivel",
        MAX(pat."MarcasRespaldo") AS "MarcasRespaldo",
        MAX(pat."ExamenParcial") AS "ExamenParcial",
        MAX(pat."ExamenFinal") AS "ExamenFinal",
        MAX(pat."Profesores") AS "Profesores",
        MAX(pat."Frecuencia") AS "Frecuencia",
        MAX(pat."HorasAcademicas") AS "HorasAcademicas",
        MAX(pat."Estado_id") AS "Estado_id",
        MAX(pat."UltimaFechMod") AS "UltimaFechMod",
        "esc"."Escuela" AS "Escuela",
        "esp"."Especializacion" AS "Especializacion",
        "cur"."IdCurso" AS "IdCurso",
        "cur"."Curso" AS "Curso",
        "tpo"."TipoCurso" AS "TipoCurso",
        CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") AS "RutaImagen",
        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Curso_id" = "cur"."IdCurso") AS "CantidadModulos"
      FROM "Producto" "pro"
      INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
      INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
      INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
      LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
      WHERE "tmo"."TipoModalidad" = :TipoModalidad AND "pad"."Tipo1" = :T1 AND "pad"."Tipo2" = :T2 AND "pad"."Tipo4" = :T4 AND "pro"."Estado_id" = '1' AND "cur"."Estado_id" = '1'
      GROUP BY 
        "tmo"."TipoModalidad",
        "esc"."Escuela",
        "esp"."Especializacion",
        "cur"."IdCurso",
        "cur"."Curso",
        "tpo"."TipoCurso",
        "pad"."Tipo1",
        "pad"."Tipo2",
        "pad"."Tipo3",
        "pad"."Tipo4",
        "pad"."NombreArchivo";
    `;

  try {
    const data = await db.query(sql, {
      replacements: { TipoModalidad, T1, T2, T4 }, // Reemplazamos las variables con valores dinámicos.
    });
    return res.status(200).json({
      ok: true,
      msg: "Información obtenida correctamente",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al obtener los cursos",
    });
  }
};

export const listaespecializacionGeneral = async (req = request, res = response) => {

  // Ajusta la consulta SQL a tus necesidades
  const sql = `
      SELECT * FROM "Especializacion" "esp"
      WHERE "esp"."Estado_id" = '1'
      ORDER BY "esp"."Especializacion" ASC;
  `;

  try {
    // Ejecutar la consulta SQL directamente usando sequelize.query
    const data = await db.query(sql, {
      replacements: {  },
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

export const obteneridsalav2 = async (req = request, res = response) => {
  const { fproducto_id, fsala } = req.body;


  const sql = `
     select * from "Sala" s where s."Sala" = :fsala and s."Producto_id" = :fproducto_id
    `;

  try {
    const data = await db.query(sql, {
      replacements: { fproducto_id, fsala }, // Reemplazamos las variables con valores dinámicos.
    });
    return res.status(200).json({
      ok: true,
      msg: "Información obtenida correctamente",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      ok: false,
      msg: "Error al obtener los cursos",
    });
  }
};