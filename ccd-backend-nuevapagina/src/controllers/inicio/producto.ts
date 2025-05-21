import { request, response } from "express";
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import * as XLSX from 'xlsx';
import path from 'path';
import db from "../../db/connection";
import ExcelJS from "exceljs";
import { QueryTypes } from "sequelize";

const nodemailer = require("nodemailer");
import {
    inNumberArray,
    isBetween,
    isRequiredAllOrNone,
    validateRequest,
} from "../../utils/validations";
import { KJUR } from "jsrsasign";



export const loginUsuario = async (req = request, res = response) => {
    const { pUsuario, pClave } = req.body;

    const sql = `
      SELECT "IdUsuario", "Clave", "Usuario"
      FROM "Usuario"
      WHERE "Usuario" = :pUsuario
    `;

    try {
        // Buscar usuario en la base de datos
        const [data]: any = await db.query(sql, {
            replacements: { pUsuario },
        });


        // Verificar si el usuario existe
        if (!data || data.length === 0) {
            return res.status(401).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos.",
            });
        }

        const usuario = data[0];

        // Comparar la contraseña en texto plano
        if (pClave !== usuario.Clave) {
            return res.status(401).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos.",
            });
        }

        return res.status(200).json({
            ok: true,
            msg: "Login exitoso",
            data: {
                uid: usuario.IdUsuario,
                usuario: usuario.Usuario,
            },
        });

    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).json({
            ok: false,
            msg: "Error en el servidor. Intenta nuevamente.",
        });
    }
};


export const listarProductoBusqueda = async (req = request, res = response) => {
    const { pmodelo } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select STRING_AGG("tp"."IdTipoProducto"::TEXT, ',') AS "cIdTipoProducto","Clasificacion","Categoria","SubCategoria","Modelo",
        STRING_AGG((select COUNT(*) from "ProductoTemario" where "Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont1",
        STRING_AGG((select COUNT(*) from "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont2",
        STRING_AGG(COALESCE((SELECT SUM((CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER))/3600 AS total_segundos FROM "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto"),0) ::TEXT, ',') AS "Cont3",
        STRING_AGG(COALESCE(((select "Precio" from "ProductoPrecio" where "Producto_id"="pro"."IdProducto" LIMIT 1)),0)::TEXT, ',') as "Precio",
        (select CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" from "ProductoAdjunto" "pa" 
        where "pa"."Producto_id"="pro"."IdProducto" and "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada' Limit 1) as "RutaImagen"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        inner join "ProductoAdjunto" "pa" on "pa"."Producto_id"="pro"."IdProducto"
        where "pro"."Estado_id"='1'
        group by "Clasificacion","Categoria","SubCategoria","Modelo","RutaImagen"
       
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarProductoBusquedaCatalogo = async (
    req = request,
    res = response
) => {
    const { pmodelo } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "pro"."IdProducto","Clasificacion","Categoria","SubCategoria","Modelo",
        STRING_AGG((select COUNT(*) from "ProductoTemario" where "Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont1",
        STRING_AGG((select COUNT(*) from "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont2",
        STRING_AGG(COALESCE((SELECT SUM((CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER))/3600 AS total_segundos FROM "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto"),0) ::TEXT, ',') AS "Cont3",
        STRING_AGG(COALESCE(((select "Precio" from "ProductoPrecio" where "Producto_id"="pro"."IdProducto" LIMIT 1)),0)::TEXT, ',') as "Precio",
        (select CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" from "ProductoAdjunto" "pa" 
        where "pa"."Producto_id"="pro"."IdProducto" and "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada' Limit 1) as "RutaImagen"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        inner join "ProductoAdjunto" "pa" on "pa"."Producto_id"="pro"."IdProducto"
        where "pro"."IdProducto" in (147,146,165,302,155,161,168,156,148,158,302,164,160,169,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322)
        group by "Clasificacion","Categoria","SubCategoria","Modelo","RutaImagen","pro"."IdProducto"    
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarProductoBusquedaDetalles = async (
    req = request,
    res = response
) => {
    const { pmodelo } = req.body;

    const Modelo =
        pmodelo === "DEFAULT" || pmodelo === undefined
            ? ""
            : `AND "mod"."Modelo" Like '%${pmodelo}%'`;

    const { fsubcategoria } = req.body;
    const checkboxsubcategoria: string[] = fsubcategoria || [];
    const are = checkboxsubcategoria.map((num) => `'${num}'`).join(",");
    const Subcategoria =
        fsubcategoria == undefined ||
            fsubcategoria.length < 1 ||
            fsubcategoria == ""
            ? ""
            : `AND "sub"."SubCategoria" IN (${are})`;

    const { fcategoria } = req.body;
    const checkboxsubcategoria1: string[] = fcategoria || [];
    const are2 = Array.isArray(checkboxsubcategoria1)
        ? checkboxsubcategoria1.map((num) => `'${num}'`).join(",")
        : `'${fcategoria}'`;
    const Subcategoria1 =
        fcategoria == undefined || fcategoria.length < 1 || fcategoria == ""
            ? ""
            : `AND "cat"."Categoria" IN (${are2})`;

    const { fclasificacion } = req.body;
    const checkboxsubcategoria2: string[] = fclasificacion || [];
    const are3 = Array.isArray(checkboxsubcategoria2)
        ? checkboxsubcategoria2.map((num) => `'${num}'`).join(",")
        : `'${fclasificacion}'`;
    const Subcategoria2 =
        fclasificacion == undefined ||
            fclasificacion.length < 1 ||
            fclasificacion == ""
            ? ""
            : `AND "cla"."Clasificacion" IN (${are3})`;

    const { ppagina } = req.body;
    const Pagina =
        ppagina === "DEFAULT" || ppagina === undefined
            ? ""
            : `offset ${12 * (ppagina - 1)}`;


    // Ajusta la consulta SQL a tus necesidades
    const sql = `    
        SELECT 
    "Clasificacion",
    "Categoria",
    "SubCategoria",
    "IdModelo",
    "Modelo",
    MAX("pp"."Precio") AS "Precio",
	STRING_AGG(("RutaImagen")::TEXT, ',') AS "RutaImagen",
	STRING_AGG(("Cont1")::TEXT, ',') AS "Cont1"
FROM 
    "Producto" "pro"
INNER JOIN 
    "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
INNER JOIN 
    "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
INNER JOIN 
    "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
INNER JOIN 
    "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
INNER JOIN 
    "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
LEFT JOIN 
    (SELECT "Producto_id", MAX("Precio") AS "Precio"
     FROM "ProductoPrecio"
     GROUP BY "Producto_id") AS "pp" ON "pp"."Producto_id" = "pro"."IdProducto"
LEFT JOIN 
    (SELECT "Producto_id",CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" 
     FROM "ProductoAdjunto" "pa" where "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'
     GROUP BY "Producto_id","pa"."Tipo1","pa"."Tipo2","pa"."Tipo3","pa"."Tipo4","pa"."NombreArchivo") AS "pad" ON "pad"."Producto_id" = "pro"."IdProducto"	 
LEFT JOIN 
    (SELECT "Producto_id", Count("ProductoTemario") as "Cont1"
     FROM "ProductoTemario"
     GROUP BY "Producto_id") AS "pte" ON "pte"."Producto_id" = "pro"."IdProducto"
WHERE 
    "pro"."Estado_id" = '1' ${Modelo} ${Subcategoria} ${Subcategoria1} ${Subcategoria2}
GROUP BY 
    "Clasificacion", 
    "Categoria", 
    "SubCategoria", 
    "Modelo", 
    "IdModelo"
    Limit 12 ${Pagina};
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarFiltroClasificacion = async (
    req = request,
    res = response
) => {
    const { pmodelo } = req.body;

    const Modelo =
        pmodelo === "DEFAULT" || pmodelo === undefined
            ? ""
            : `AND "mod"."Modelo" Like '%${pmodelo}%'`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
                    WITH Productos123 AS (
                SELECT
                    STRING_AGG("tp"."IdTipoProducto"::TEXT, ',') AS "cIdTipoProducto",
                    "Clasificacion",
                    "Categoria",
                    "SubCategoria",
                    "Modelo",
                    STRING_AGG(
                        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Producto_id" = "pro"."IdProducto")::TEXT, ','
                    ) AS "Cont1",
                    STRING_AGG(
                        (SELECT COUNT(*) FROM "ProductoTemarioContenido" "ptc"
                        INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
                        WHERE "pt"."Producto_id" = "pro"."IdProducto")::TEXT, ','
                    ) AS "Cont2",
                    STRING_AGG(
                        COALESCE(
                            (
                                SELECT SUM(
                                    (CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER)
                                ) / 3600 AS total_segundos
                                FROM "ProductoTemarioContenido" "ptc"
                                INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
                                WHERE "pt"."Producto_id" = "pro"."IdProducto"
                            ), 0
                        )::TEXT, ','
                    ) AS "Cont3",
                    STRING_AGG(
                        COALESCE(
                            ((SELECT "Precio" FROM "ProductoPrecio" WHERE "Producto_id" = "pro"."IdProducto" LIMIT 1)), 0
                        )::TEXT, ','
                    ) AS "Precio"
                FROM "Producto" "pro"
                INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
                INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
                INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
                INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
                INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
                WHERE "pro"."Estado_id" = '1' ${Modelo}
                GROUP BY "Clasificacion", "Categoria", "SubCategoria", "Modelo"
            )
            SELECT
                "Clasificacion",COUNT(*) AS "Cantidad"
            FROM Productos123
            GROUP BY "Clasificacion"
            ORDER BY "Clasificacion";
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarFiltroCategoria = async (req = request, res = response) => {
    const { pmodelo } = req.body;
    const { fclasificacion } = req.body;
    const Modelo =
        pmodelo === "DEFAULT" ? "" : `AND "mod"."Modelo" Like '%${pmodelo}%'`;

    const checkboxsubcategoria: string[] = fclasificacion || [];

    const are = checkboxsubcategoria.map((num) => `'${num}'`).join(",");

    const Subcategoria =
        fclasificacion == undefined || fclasificacion.length < 1
            ? ""
            : `AND "cla"."Clasificacion" IN (${are})`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
                    WITH Productos123 AS (
                SELECT
                    STRING_AGG("tp"."IdTipoProducto"::TEXT, ',') AS "cIdTipoProducto",
                    "Clasificacion",
                    "Categoria",
                    "SubCategoria",
                    "Modelo",
                    STRING_AGG(
                        (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Producto_id" = "pro"."IdProducto")::TEXT, ','
                    ) AS "Cont1",
                    STRING_AGG(
                        (SELECT COUNT(*) FROM "ProductoTemarioContenido" "ptc"
                        INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
                        WHERE "pt"."Producto_id" = "pro"."IdProducto")::TEXT, ','
                    ) AS "Cont2",
                    STRING_AGG(
                        COALESCE(
                            (
                                SELECT SUM(
                                    (CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER)
                                ) / 3600 AS total_segundos
                                FROM "ProductoTemarioContenido" "ptc"
                                INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
                                WHERE "pt"."Producto_id" = "pro"."IdProducto"
                            ), 0
                        )::TEXT, ','
                    ) AS "Cont3",
                    STRING_AGG(
                        COALESCE(
                            ((SELECT "Precio" FROM "ProductoPrecio" WHERE "Producto_id" = "pro"."IdProducto" LIMIT 1)), 0
                        )::TEXT, ','
                    ) AS "Precio"
                FROM "Producto" "pro"
                INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
                INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
                INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
                INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
                INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
                WHERE  "pro"."Estado_id" = '1' ${Subcategoria}  ${Modelo}
                GROUP BY "Clasificacion", "Categoria", "SubCategoria", "Modelo"
            )
            SELECT
                "Categoria",COUNT(*) AS "Cantidad"
            FROM Productos123
            GROUP BY "Categoria"
            ORDER BY "Categoria";
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarFiltroSubCategoria = async (
    req = request,
    res = response
) => {
    const { pmodelo } = req.body;
    const Modelo =
        pmodelo === "DEFAULT" ? "" : `AND "mod"."Modelo" Like '%${pmodelo}%'`;

    const { fclasificacion } = req.body;
    const checkboxsubcategoria: string[] = fclasificacion || [];

    const are = checkboxsubcategoria.map((num) => `'${num}'`).join(",");

    const Subcategoria =
        fclasificacion == undefined || fclasificacion.length < 1
            ? ""
            : `AND "cla"."Clasificacion" IN (${are})`;

    const { fcategoria } = req.body;

    const checkboxcategoria: string[] = fcategoria || [];

    const are1 = checkboxcategoria.map((num) => `'${num}'`).join(",");

    const Subcategoria1 =
        fcategoria == undefined || fcategoria.length < 1
            ? ""
            : `AND "cat"."Categoria" IN (${are1})`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        WITH Productos123 AS (
    SELECT
        STRING_AGG("tp"."IdTipoProducto"::TEXT, ',') AS "cIdTipoProducto",
        "Clasificacion",
        "Categoria",
        "SubCategoria",
        "Modelo",
        STRING_AGG(
            (SELECT COUNT(*) FROM "ProductoTemario" WHERE "Producto_id" = "pro"."IdProducto")::TEXT, ','
        ) AS "Cont1",
        STRING_AGG(
            (SELECT COUNT(*) FROM "ProductoTemarioContenido" "ptc"
             INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
             WHERE "pt"."Producto_id" = "pro"."IdProducto")::TEXT, ','
        ) AS "Cont2",
        STRING_AGG(
            COALESCE(
                (
                    SELECT SUM(
                        (CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER)
                    ) / 3600 AS total_segundos
                    FROM "ProductoTemarioContenido" "ptc"
                    INNER JOIN "ProductoTemario" "pt" ON "pt"."IdProductoTemario" = "ptc"."ProductoTemario_id"
                    WHERE "pt"."Producto_id" = "pro"."IdProducto"
                ), 0
            )::TEXT, ','
        ) AS "Cont3",
                STRING_AGG(
                    COALESCE(
                        ((SELECT "Precio" FROM "ProductoPrecio" WHERE "Producto_id" = "pro"."IdProducto" LIMIT 1)), 0
                    )::TEXT, ','
                ) AS "Precio"
            FROM "Producto" "pro"
            INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
            INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
            INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
            INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
            INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
            WHERE "pro"."Estado_id" = '1' ${Subcategoria}  ${Subcategoria1} ${Modelo}   
            GROUP BY "Clasificacion", "Categoria", "SubCategoria", "Modelo"
        )
        SELECT
            "SubCategoria",COUNT(*) AS "Cantidad"
        FROM Productos123
        GROUP BY "SubCategoria"
        ORDER BY "SubCategoria";
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarAdministrarCursos = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
            select "pro"."IdProducto","Clasificacion","Categoria","SubCategoria","mod"."IdModelo","Modelo" from "Producto" "pro"
            inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
            inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
            inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
            inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
            inner JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
			where   "tp"."IdTipoProducto"=2
            group by "Clasificacion","Categoria","SubCategoria","Modelo","IdModelo","IdProducto"
            order by "IdModelo"     
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

export const listarTableTipoProducto = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select * from "TipoProducto" "tp"
		inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"    
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

export const listarTableClasificacion = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        	select * from "Clasificacion" "cla"
		inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
		inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"
		  
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

export const listarSelectNaturaleza = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
            select * from "Naturaleza"
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

export const listarSelectTipoProducto = async (
    req = request,
    res = response
) => {
    const { pnaturaleza } = req.body;
    const naturaleza =
        pnaturaleza == undefined || pnaturaleza.length < 1 ? "" : pnaturaleza;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
            select * from "TipoProducto" "tp"
		    inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"
            where "na"."IdNaturaleza"=${naturaleza}
		
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
export const listarSelectClasificacion = async (
    req = request,
    res = response
) => {
    const { pnaturaleza } = req.body;
    const { ptipoproducto } = req.body;

    const naturaleza =
        pnaturaleza == undefined || pnaturaleza.length < 1 ? "" : pnaturaleza;
    const tipoproducto =
        ptipoproducto == undefined || ptipoproducto.length < 1 ? "" : ptipoproducto;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
		select * from "Clasificacion" "cla"
		inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
		inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"
        where "na"."IdNaturaleza"=${naturaleza} and "tp"."IdTipoProducto"=${tipoproducto} 
		
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
export const listarSelectCategoria = async (req = request, res = response) => {
    const { pnaturaleza } = req.body;
    const { ptipoproducto } = req.body;
    const { pclasificacion } = req.body;

    const naturaleza =
        pnaturaleza == undefined || pnaturaleza.length < 1 ? "" : pnaturaleza;
    const tipoproducto =
        ptipoproducto == undefined || ptipoproducto.length < 1 ? "" : ptipoproducto;
    const clasificacion =
        pclasificacion == undefined || pclasificacion.length < 1
            ? ""
            : pclasificacion;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
	    select * from "Categoria" "cat"
		inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
		inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
		inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"
        where "na"."IdNaturaleza"=${naturaleza} and "tp"."IdTipoProducto"=${tipoproducto} and "cla"."IdClasificacion"=${clasificacion} 
		
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

export const listarSelectSubCategoria = async (
    req = request,
    res = response
) => {
    const { pnaturaleza } = req.body;
    const { ptipoproducto } = req.body;
    const { pclasificacion } = req.body;
    const { pcategoria } = req.body;

    const naturaleza =
        pnaturaleza == undefined || pnaturaleza.length < 1 ? "" : pnaturaleza;
    const tipoproducto =
        ptipoproducto == undefined || ptipoproducto.length < 1 ? "" : ptipoproducto;
    const clasificacion =
        pclasificacion == undefined || pclasificacion.length < 1
            ? ""
            : pclasificacion;
    const categoria =
        pcategoria == undefined || pcategoria.length < 1 ? "" : pcategoria;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
	    select * from "SubCategoria" "sub"
		inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
		inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
		inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
		inner join "Naturaleza" "na" on "na"."IdNaturaleza"="tp"."Naturaleza_id"
        where "na"."IdNaturaleza"=${naturaleza} and "tp"."IdTipoProducto"=${tipoproducto} and "cla"."IdClasificacion"=${clasificacion}
        and "cat"."IdCategoria"=${categoria} 
		
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

export const listarSelectCliente = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
	    		select * from "Cliente"	
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

export const listarEditarCursoGeneral = async (
    req = request,
    res = response
) => {
    const { pcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
    SELECT DISTINCT ON ("cur"."IdCurso")
    "cur"."Curso","cur"."CodigoCurso","pat"."Descripcion", "pat"."Calificacion", "pat"."Seguidores", "pat"."Nivel", "pat"."MarcasRespaldo",
    "pat"."ExamenParcial", "pat"."ExamenFinal", "pat"."Profesores", "pat"."Frecuencia", "pat"."HorasAcademicas", 
    "pat"."NumeroWhatsapp"
    FROM "Producto" "pro"
    INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
    INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
    INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    WHERE "cur"."IdCurso" = ${pcurso_id}
    ORDER BY "cur"."IdCurso";

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyeccione   s SQL
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

export const listarCursoAdjuntos = async (req = request, res = response) => {
    const { pcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
          	 select 
		CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen"
        from "Producto" "pro"
			inner join "Curso" "cur" on "cur"."IdCurso"="pro"."Curso_id"
	        inner join "Especializacion" "esp" on  "esp"."IdEspecializacion"="cur"."Especializacion_id"
            INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        left join "ProductoAdjunto" "pa" on "pa"."Curso_id"="cur"."IdCurso"
		 where "cur"."IdCurso"=${pcurso_id}
        group by "RutaImagen","IdCurso"
        order by "IdCurso"    
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
//--------------------------
export const listarSelectTipoDocumento = async (req = request, res = response) => {
    const { ptipodocumento } = req.body;
    if (!ptipodocumento || typeof ptipodocumento !== "string") {
        return res.status(400).json({
            ok: false,
            msg: "El campo 'ptipodocumento' es obligatorio y debe ser un texto válido.",
        });
    }
    const sql = `   
        SELECT * FROM "TipoDocumento"
        WHERE "Agrupacion" = :ptipodocumento
    `;

    try {
        const data = await db.query(sql, {
            replacements: { ptipodocumento },

        });
        return res.status(200).json({
            ok: true,
            msg: "Información correcta",
            data,
        });
    } catch (err) {
        console.error("Error en listarSelectTipoDocumento:", err);
        return res.status(500).json({
            ok: false,
            msg: "Error de conexión con la base de datos.",
        });
    }
};


export const EnviarCorreoPago = async (req = request, res = response) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método No permitido" });
    }

    const { pdestinatario, pmensaje } = req.body;


    // Validación del destinatario y mensaje
    if (
        !pdestinatario ||
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(pdestinatario)
    ) {
        return res
            .status(400)
            .json({ error: "El destinatario no es un correo válido" });
    }

    if (!pmensaje || pmensaje.trim().length === 0) {
        return res.status(400).json({ error: "El mensaje no puede estar vacío" });
    }

    try {
        // Configuración de nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true para puerto 465, false para otros puertos
            auth: {
                user: "paginawebccd@gmail.com", // Tu email
                pass: "iplg sjuy hapk azsv", // Tu contraseña o contraseña de aplicación
            },
        });

        const mailOptions = {
            from: '"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>',
            to: pdestinatario,
            subject: "CCD-Bienvenida",
            html: pmensaje,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Correo enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar el correo:", error); // Log del error

        // Respuesta de error al frontend
        return res
            .status(500)
            .json({ error: "Error al enviar el correo. Inténtelo más tarde." });
    }
};

export const EnviarCorreoPagoConArchivo = async (req = request, res = response) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método No permitido" });
    }

    const form = formidable({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // Límite de tamaño de archivo: 5MB
        maxTotalFileSize: 5 * 1024 * 1024, // Límite total si hay varios archivos
    });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: "El archivo es demasiado grande. El límite es de 6MB." });
            }
            return res.status(500).json({ message: "El archivo es demasiado grande. El límite es de 5MB." });
        }

        // Depuración para verificar los campos recibidos

        const pcorreoReferencia = Array.isArray(fields.pcorreoReferencia) ? fields.pcorreoReferencia[0] : fields.pcorreoReferencia;

        if (!pcorreoReferencia) {
            return res.status(400).json({ error: "El correo de referencia es necesario" });
        }

        const file = files.file && Array.isArray(files.file) ? files.file[0] : files.file;

        // Verificar archivo
        if (!file) {
            return res.status(400).json({ error: "Debe adjuntar un archivo" });
        }

        const fileData = await fs.promises.readFile(file.filepath);

        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "paginawebccd@gmail.com",
                    pass: "iplg sjuy hapk azsv",  // Asegúrate de proteger estas credenciales.
                },
            });

            const destinatarioEncargado = "seleccion2023@gmail.com";

            const mailOptions = {
                from: '"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>',
                to: destinatarioEncargado,
                subject: "Archivo para revisión",
                html: `<p>Correo de referencia: ${pcorreoReferencia}</p><p>Se adjunta un archivo para revisión.</p>`,
                attachments: [
                    {
                        filename: file.originalFilename,
                        content: fileData,
                    },
                ],
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: "Correo enviado con éxito" });
        } catch (error) {
            console.error("Error al enviar el correo:", error);
            return res.status(500).json({ error: "Error al enviar el correo. Inténtelo más tarde." });
        }
    });
};
export const EnviarCorreoCorp = async (req = request, res = response) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método No permitido" });
    }

    const { nombres, apellidos, organizacion, cargo, movil, correo, mensaje } = req.body;

    // Validar campos requeridos
    if (!nombres || !apellidos || !organizacion || !cargo || !movil || !correo || !mensaje) {
        return res.status(400).json({ error: "Todos los Campos son obligatorios" });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "paginawebccd@gmail.com",
                pass: "iplg sjuy hapk azsv",  // Asegúrate de proteger estas credenciales.
            },
        });

        const destinatarioEncargado = "info@ccdcapacitacion.edu.pe";

        const mailOptions = {
            from: `"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>`,
            to: destinatarioEncargado,
            subject: "Empresas interesadas",
            html: `
                <p><strong>Nombres:</strong> ${nombres}</p>
                <p><strong>Apellidos:</strong> ${apellidos}</p>
                <p><strong>Organización:</strong> ${organizacion}</p>
                <p><strong>Cargo:</strong> ${cargo}</p>
                <p><strong>Móvil:</strong> ${movil}</p>
                <p><strong>Correo:</strong> ${correo}</p>
                <p><strong>Mensaje:</strong> ${mensaje}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Correo enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        return res.status(500).json({ error: "Error al enviar el correo. Inténtelo más tarde." });
    }
};
export const EnviarCorreoPromo = async (req = request, res = response) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método No permitido" });
    }

    const { nombres, apellidos, movil, correo } = req.body;


    // Validar campos requeridos
    if (!nombres || !apellidos || !movil || !correo) {
        return res.status(400).json({ error: "Todos los Campos son obligatorios" });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "paginawebccd@gmail.com",
                pass: "iplg sjuy hapk azsv",  // Asegúrate de proteger estas credenciales.
            },
        });

        const destinatarioEncargado = "corporativo2@ccdcapacitacion.com";

        const mailOptions = {
            from: `"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>`,
            to: destinatarioEncargado,
            subject: "Clientes Interesados",
            html: `
                <p><strong>Nombres:</strong> ${nombres}</p>
                <p><strong>Apellidos:</strong> ${apellidos}</p>
                <p><strong>Móvil:</strong> ${movil}</p>
                <p><strong>Correo:</strong> ${correo}</p>
               
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Correo enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        return res.status(500).json({ error: "Error al enviar el correo. Inténtelo más tarde." });
    }
};


export const config = {
    api: {
        bodyParser: false, // Necesario para manejar archivos con formidable
    },
};

export const crearUsuario = async (req = request, res = response) => {
    const { pnombres } = req.body;
    const { papellidos } = req.body;
    const { pcorreo } = req.body;
    const { pclave } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `  
            INSERT INTO "Entidad"("Nombres","Apellidos","Correo") values ('${pnombres}','${papellidos}','${pcorreo}') RETURNING "IdEntidad" 
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });

        const sql1 = `   
        INSERT INTO "Usuario"("Usuario","Clave","Entidad_id") values ('${pcorreo}','${pclave}',${data[0][0].IdEntidad})  RETURNING "IdUsuario"
        `;

        const data1: any = await db.query(sql1, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        const sql2 = `   
        INSERT INTO "EntidadCliente"("Cliente_id","Entidad_id") values (1,${data[0][0].IdEntidad})    
         `;
        const data2 = await db.query(sql2, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });

        return res.status(200).json({
            ok: true,
            msg: "Usuario registrado exitosamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};

export const listarProductoDetallesTop = async (
    req = request,
    res = response
) => {
    const { fcategoria } = req.body;
    const checkboxsubcategoria1: string[] = fcategoria || [];
    const are2 = Array.isArray(checkboxsubcategoria1)
        ? checkboxsubcategoria1.map((num) => `'${num}'`).join(",")
        : `'${fcategoria}'`;
    const Subcategoria1 =
        fcategoria == undefined || fcategoria.length < 1
            ? ""
            : `AND "cat"."Categoria" IN (${are2})`;

    const { fclasificacion } = req.body;
    const checkboxsubcategoria2: string[] = fclasificacion || [];
    const are3 = Array.isArray(checkboxsubcategoria2)
        ? checkboxsubcategoria2.map((num) => `'${num}'`).join(",")
        : `'${fclasificacion}'`;
    const Subcategoria2 =
        fclasificacion == undefined || fclasificacion.length < 1
            ? ""
            : `AND "cla"."Clasificacion" IN (${are3})`;

    const { fsubcategoria } = req.body;
    const checkboxsubcategoria: string[] = fsubcategoria || [];
    const are = checkboxsubcategoria.map((num) => `'${num}'`).join(",");
    const Subcategoria =
        fsubcategoria == undefined || fsubcategoria.length < 1
            ? ""
            : `AND "sub"."SubCategoria" IN (${are})`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `

     SELECT 
    "Clasificacion",
    "Categoria",
    "SubCategoria",
    "IdModelo",
    "Modelo",
    MAX("pp"."Precio") AS "Precio",
	STRING_AGG(("RutaImagen")::TEXT, ',') AS "RutaImagen",
	STRING_AGG(("Cont1")::TEXT, ',') AS "Cont1"
FROM 
    "Producto" "pro"
INNER JOIN 
    "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
INNER JOIN 
    "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
INNER JOIN 
    "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
INNER JOIN 
    "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
INNER JOIN 
    "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
LEFT JOIN 
    (SELECT "Producto_id", MAX("Precio") AS "Precio"
     FROM "ProductoPrecio"
     GROUP BY "Producto_id") AS "pp" ON "pp"."Producto_id" = "pro"."IdProducto"
LEFT JOIN 
    (SELECT "Producto_id",CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" 
     FROM "ProductoAdjunto" "pa" where "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'
     GROUP BY "Producto_id","pa"."Tipo1","pa"."Tipo2","pa"."Tipo3","pa"."Tipo4","pa"."NombreArchivo") AS "pad" ON "pad"."Producto_id" = "pro"."IdProducto"	 
LEFT JOIN 
    (SELECT "Producto_id", Count("ProductoTemario") as "Cont1"
     FROM "ProductoTemario"
     GROUP BY "Producto_id") AS "pte" ON "pte"."Producto_id" = "pro"."IdProducto"
WHERE 
    "pro"."Estado_id" = '1' ${Subcategoria} ${Subcategoria1} ${Subcategoria2}
GROUP BY 
    "Clasificacion", 
    "Categoria", 
    "SubCategoria", 
    "Modelo", 
    "IdModelo"
    Limit 6;

       
        
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarProductoBusquedaDetallesTotal = async (
    req = request,
    res = response
) => {
    const { pmodelo } = req.body;
    const { fsubcategoria } = req.body;
    const { fcategoria } = req.body;
    const { fclasificacion } = req.body;

    const Modelo =
        pmodelo === "DEFAULT" || pmodelo === undefined
            ? ""
            : `AND "mod"."Modelo" Like '%${pmodelo}%'`;
    const Subcategoria =
        fsubcategoria === "DEFAULT" || fsubcategoria === undefined
            ? ""
            : `AND "sub"."SubCategoria" Like '%${fsubcategoria}%'`;
    const Subcategoria1 =
        fcategoria === "DEFAULT" || fcategoria === undefined
            ? ""
            : `AND "cat"."Categoria" Like '%${fcategoria}%'`;
    const Subcategoria2 =
        fclasificacion === "DEFAULT" || fclasificacion === undefined
            ? ""
            : `AND "cla"."Clasificacion" Like '%${fclasificacion}%'`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*)
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        where "pro"."Estado_id"='1' AND "tp"."IdTipoProducto"=2 ${Modelo} ${Subcategoria} ${Subcategoria1} ${Subcategoria2}
        
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
            replacements: { pmodelo: `%${pmodelo || ""}%` }, // Parámetro para evitar inyecciones SQL
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

export const listarProductoClasificacionTop = async (
    req = request,
    res = response
) => {
    const { fclasificacion } = req.body;
    const checkboxsubcategoria2: string[] = fclasificacion || [];
    const are3 = Array.isArray(checkboxsubcategoria2)
        ? checkboxsubcategoria2.map((num) => `'${num}'`).join(",")
        : `'${fclasificacion}'`;
    const Subcategoria2 =
        fclasificacion == undefined || fclasificacion.length < 1
            ? ""
            : `AND "cla"."Clasificacion" IN (${are3})`;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select STRING_AGG("tp"."IdTipoProducto"::TEXT, ',') AS "cIdTipoProducto","Clasificacion","Categoria","SubCategoria","Modelo",
        STRING_AGG((select COUNT(*) from "ProductoTemario" where "Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont1",
        STRING_AGG((select COUNT(*) from "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto")::TEXT, ',') AS "Cont2",
        STRING_AGG(COALESCE((SELECT SUM((CAST(SPLIT_PART("Duracion", ':', 1) AS INTEGER) * 60) + CAST(SPLIT_PART("Duracion", ':', 2) AS INTEGER))/3600 AS total_segundos FROM "ProductoTemarioContenido" "ptc"
        inner join "ProductoTemario" "pt" on "pt"."IdProductoTemario"="ptc"."ProductoTemario_id"
        where "pt"."Producto_id"="pro"."IdProducto"),0) ::TEXT, ',') AS "Cont3",
        STRING_AGG(COALESCE(((select "Precio" from "ProductoPrecio" where "Producto_id"="pro"."IdProducto" LIMIT 1)),0)::TEXT, ',') as "Precio",
        (select CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" from "ProductoAdjunto" "pa" 
        where "pa"."Producto_id"="pro"."IdProducto" and "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada' Limit 1) as "RutaImagen"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        inner join "ProductoStock" "ps" on "ps"."Producto_id"="pro"."IdProducto"
        where "pro"."Estado_id"='1' AND "tp"."IdTipoProducto"=2  ${Subcategoria2}
        group by "Clasificacion","Categoria","SubCategoria","Modelo","RutaImagen","StockDisponible"
		order by "StockDisponible" desc
        Limit 10
        
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const buscarCupon = async (req = request, res = response) => {
    const { fcupon } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       
        SELECT * FROM "Cupon" where "CodigoCupon"='${fcupon}'
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

/*Catalogo*/
export const lstprodxclaxcat = async (req = request, res = response) => {
    const { fclasificacion } = req.body;
    const { fcategoria } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "IdProducto","mod"."Modelo",
        CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        inner join "ProductoAdjunto" "pa" on "pa"."Producto_id"="pro"."IdProducto" 
        where "tp"."IdTipoProducto"=2 and "cla"."Clasificacion"='${fclasificacion}' 
		and "pro"."Estado_id"='1' AND "cat"."Categoria"='${fcategoria}' and "pro"."IdProducto" in (147,146,165,302,155,161,168,156,148,158,302,164,160,169,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322)
        and "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarProductoBeneficio = async (
    req = request,
    res = response
) => {
    const { pclasificacion } = req.body;
    const { pmodelo } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
         select "pb"."Titulo","pb"."Descripcion","pb"."Orden"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
		inner join "ProductoBeneficio" "pb" on "pb"."Producto_id"="pro"."IdProducto" 
        where  "tp"."IdTipoProducto"=2 and "mod"."IdModelo"=${pmodelo} and "cla"."Clasificacion"=${"'" + pclasificacion + "'"
        }
	    order by "Orden" ASC

        
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarDocentes = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
  		 select "us"."IdUsuario","en"."Nombres","en"."Apellidos","pu"."Puesto" from "Usuario" "us"
		inner join "Entidad" "en" on "en"."IdEntidad"="us"."Entidad_id"
		inner join "Empleado" "em" on "em"."Entidad_id"="en"."IdEntidad"
		inner join "Area" "ar" on  "ar"."IdArea"="em"."Area_id"
		inner join "Puesto" "pu" on  "pu"."IdPuesto"="em"."Puesto_id"
		where "Area"='Docentes'
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarTemario = async (req = request, res = response) => {
    const { fproductoid } = req.body;
    // Ajusta la consulta SQL a tus necesidades
    const sql = `



    SELECT
    pt."Curso_id",
    pt."IdProductoTemario" AS id,
    pt."ProductoTemario" AS nombre,
    pt."Numeracion",   
    jsonb_agg(DISTINCT jsonb_build_object(
        'nombre', ptc."ProductoTemarioContenido",
        'tiempo', ptc."Duracion"
    )) AS temas,
    
    -- SOLO VIDEOS
    jsonb_agg(DISTINCT jsonb_build_object(
        'ruta', CONCAT(
            '/', COALESCE(pta."Tipo1", ''), 
            '/', COALESCE(pta."Tipo2", ''), 
            '/', COALESCE(pta."Tipo3", ''), 
            '/', COALESCE(pta."Tipo4", ''), 
            '/', COALESCE(pta."NombreArchivo", '')
        ),
        'tipo', pta."Tipo2",
        'nombre', pta."NombreFinal",
        'orden', pta."Orden"
    ) 
    ) FILTER (WHERE pta."Tipo2" = 'Video' and pta."Tipo4"='ModulosFinal') AS videos,

    -- SOLO ADJUNTOS (NO VIDEOS)
    jsonb_agg(DISTINCT jsonb_build_object(
        'ruta', CONCAT(
            '/', COALESCE(pta."Tipo1", ''), 
            '/', COALESCE(pta."Tipo2", ''), 
            '/', COALESCE(pta."Tipo3", ''), 
            '/', COALESCE(pta."Tipo4", ''), 
            '/', COALESCE(pta."NombreArchivo", '')
        ),
        'tipo', pta."Tipo2",
        'nombre', pta."NombreFinal",
        'orden', pta."Orden"
    ) 
    ) FILTER (WHERE pta."Tipo2" !='Video') AS adjuntos

FROM "ProductoTemario" pt
LEFT JOIN "ProductoTemarioContenido" ptc 
    ON pt."IdProductoTemario" = ptc."ProductoTemario_id"
LEFT JOIN "ProductoTemarioAdjunto" pta 
    ON pt."IdProductoTemario" = pta."ProductoTemario_id"
    AND pta."Sala_id" IS NULL
WHERE pt."Curso_id" = (
    SELECT "Curso_id" FROM "Producto" WHERE "IdProducto" =  ${fproductoid}
)
GROUP BY
    pt."Curso_id",
    pt."IdProductoTemario",
    pt."ProductoTemario",
    pt."Numeracion"
;
 `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const listarTemarioVivov2 = async (req = request, res = response) => {
    const { fproductoid, fsala_id } = req.body;
    // Ajusta la consulta SQL a tus necesidades

    const sql1 = `
   select "IdSala" from "Sala" where "Producto_id"=${fproductoid} and "Sala"='${fsala_id}'
   `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql1, {});
        const sql = `



        SELECT
        pt."Curso_id",
        pt."IdProductoTemario" AS id,
        pt."ProductoTemario" AS nombre,
        pt."Numeracion",   
        jsonb_agg(DISTINCT jsonb_build_object(
            'nombre', ptc."ProductoTemarioContenido",
            'tiempo', ptc."Duracion"
        )) AS temas,
        
        -- SOLO VIDEOS
        jsonb_agg(DISTINCT jsonb_build_object(
            'ruta', CONCAT(
                '/', COALESCE(pta."Tipo1", ''), 
                '/', COALESCE(pta."Tipo2", ''), 
                '/', COALESCE(pta."Tipo3", ''), 
                '/', COALESCE(pta."Tipo4", ''), 
                '/', COALESCE(pta."NombreArchivo", '')
            ),
            'tipo', pta."Tipo2",
            'nombre', pta."NombreFinal",
            'orden', pta."Orden"
        ) 
        ) FILTER (WHERE pta."Tipo2" = 'Video' and pta."Tipo4"='ModulosVivo') AS videos,
    
        -- SOLO ADJUNTOS (NO VIDEOS)
        jsonb_agg(DISTINCT jsonb_build_object(
            'ruta', CONCAT(
                '/', COALESCE(pta."Tipo1", ''), 
                '/', COALESCE(pta."Tipo2", ''), 
                '/', COALESCE(pta."Tipo3", ''), 
                '/', COALESCE(pta."Tipo4", ''), 
                '/', COALESCE(pta."NombreArchivo", '')
            ),
            'tipo', pta."Tipo2",
            'nombre', pta."NombreFinal",
            'orden', pta."Orden"
        ) 
        ) FILTER (WHERE pta."Tipo2" !='Video') AS adjuntos
    
    FROM "ProductoTemario" pt
    LEFT JOIN "ProductoTemarioContenido" ptc 
        ON pt."IdProductoTemario" = ptc."ProductoTemario_id"
    LEFT JOIN "ProductoTemarioAdjunto" pta 
        ON pt."IdProductoTemario" = pta."ProductoTemario_id"
         AND pta."Sala_id" = ${data[0][0].IdSala}

    WHERE pt."Curso_id" = (
        SELECT "Curso_id" FROM "Producto" WHERE "IdProducto" = ${fproductoid}
    )
    GROUP BY
        pt."Curso_id",
        pt."IdProductoTemario",
        pt."ProductoTemario",
        pt."Numeracion"
    ;
    

       `;
        const data1: any = await db.query(sql, {});



        return res.status(200).json({
            ok: true,
            msg: "Información correcta",
            data: data1,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};

export const listarProductoId = async (req = request, res = response) => {
    const { pcurso_id } = req.body;


    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       	select "IdProducto" from "Producto" "pro"
       inner join "Curso" "cur" on "cur"."IdCurso"="pro"."Curso_id"
		 where "cur"."IdCurso"=${pcurso_id}
        order by "pro"."IdProducto"
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

//UBIGEOOOOO
export const listarPais = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       select * from "Pais"
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarDepartamento = async (req = request, res = response) => {
    const { fpais } = req.body;
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       select * from "Departamento" where "Pais_id"=${fpais} order by "Departamento" asc
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const listarProvincia = async (req = request, res = response) => {
    const { fdepartamento } = req.body;
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       select * from "Provincia" where "Departamento_id"=${fdepartamento}  order by "Provincia" asc
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const listarDistrito = async (req = request, res = response) => {
    const { fprovincia } = req.body;
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       select * from "Distrito" where "Provincia_id"=${fprovincia}  order by "Distrito" asc
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const listarMisDatos = async (req = request, res = response) => {
    const { fusuario } = req.body;

    if (!fusuario || typeof fusuario !== "string") {
        return res.status(400).json({
            ok: false,
            msg: "El campo 'fusuario' es requerido y debe ser un texto válido",
        });
    }
    const sql = `
        SELECT 
            "us"."IdUsuario",
            "us"."Usuario",
            "us"."FcIngreso",
            "us"."FcBaja",
            "us"."RutaImagenPerfil",
            "us"."RutaImagenCuerpo",
            "us"."Entidad_id",
            "us"."Online",
            "us"."Estado_id",
            "us"."UltimaFechMod",
            "us"."UltimoUserMod",
            "us"."Premium",
            "us"."FechaExpiracionPremium",
            "us"."FechaExpiracion",
            "en"."IdEntidad",
            "en"."Nombres",
            "en"."Apellidos",
            "en"."TipoDocumento_id",
            "en"."NroDocumento",
            "en"."Correo",
            "en"."Telefono",
            "en"."Ubigeo",
            "en"."Direccion",
            "en"."Genero",
            "en"."FcNacimiento",
            "en"."Pais_id"
        FROM "Usuario" "us"
        INNER JOIN "Entidad" "en" ON "en"."IdEntidad" = "us"."Entidad_id"
        WHERE "us"."Usuario" = :fusuario
    `;

    try {
        const data = await db.query(sql, {
            replacements: { fusuario },
        });

        return res.status(200).json({
            ok: true,
            msg: "Información correcta",
            data,
        });
    } catch (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({
            ok: false,
            msg: "Error de conexión con la base de datos",
        });
    }
};

export const listarCatalogoP1 = async (req = request, res = response) => {
    const { fproductoid } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       select "pa"."Producto_id","pa"."Frecuencia","pa"."HorasAcademicas" from "ProductoAtributo" "pa"
       inner join "Producto" "pro" on "pro"."IdProducto"="pa"."Producto_id"
       where "pa"."Producto_id"=${fproductoid}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const listarCursoAdjuntosCatalogo = async (
    req = request,
    res = response
) => {
    const { fproductoid } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
        select "Clasificacion","Categoria","SubCategoria","IdModelo","Modelo",
		CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen"
        from "Producto" "pro"
		inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        left join "ProductoAdjunto" "pa" on "pa"."Producto_id"="pro"."IdProducto"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        where "pro"."IdProducto"=${fproductoid}
        group by "Clasificacion","Categoria","SubCategoria","Modelo","RutaImagen","IdModelo"
        order by "IdModelo"      
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

export const listarmoduloprofesores = async (req = request, res = response) => {
    const { fproductoid } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
        select "Nombres","Apellidos","RutaImagenPerfil","Descripcion","Puesto" from "Usuario" "us"
        inner join "Entidad" "en" on "en"."IdEntidad"="us"."Entidad_id"
        inner join "Empleado" "em" on "em"."IdEmpleado"="en"."EntidadRelacion_id"
        inner join "Puesto" "pu" on "pu"."IdPuesto"="em"."Puesto_id"
        where "us"."IdUsuario" in 
        (SELECT UNNEST(STRING_TO_ARRAY("pa"."Profesores", ',')::int[])
        from "ProductoAtributo" "pa"where "pa"."Producto_id"=${fproductoid})    
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
export const listarprofesoreslanding = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
        SELECT "Nombres", "Apellidos", "RutaImagenPerfil", "Descripcion", "Puesto"
    FROM "Usuario" "us"
    INNER JOIN "Entidad" "en" ON "en"."IdEntidad" = "us"."Entidad_id"
    INNER JOIN "Empleado" "em" ON "em"."IdEmpleado" = "en"."EntidadRelacion_id"
    INNER JOIN "Puesto" "pu" ON "pu"."IdPuesto" = "em"."Puesto_id"
    where "Descripcion"!=''
    ORDER BY RANDOM()
    LIMIT 9;
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

export const listarproductoscatalogo = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "IdProducto","mod"."Modelo",
        CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen"
        from "Producto" "pro"
        inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
        inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
        inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
        inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
        inner join "TipoProducto" "tp" on "tp"."IdTipoProducto"="cla"."TipoProducto_id"
        inner join "ProductoAdjunto" "pa" on "pa"."Producto_id"="pro"."IdProducto" 
        where "tp"."IdTipoProducto"=2 and "pro"."IdProducto" in (147,146,165,302,155,161,168,156,148,158,302,164,160,169,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322)
        and "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const obtenerModalidadesDisponibles = async (
    req = request,
    res = response
) => {
    const { fmodelo } = req.body;
    const { fclasificacion } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    		    SELECT "tp"."IdTipoProducto","IdProducto", CASE
				 when "tp"."IdTipoProducto"=1 then 'Online'
				 when "tp"."IdTipoProducto"=2 then 'Asincrono'
				 when "tp"."IdTipoProducto"=3 then 'Mixto'
				 end as "Nombre"
				 FROM "Producto" "pro"
                INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
                INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
                INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
                INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
                INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
                WHERE "pro"."Estado_id" = '1' and "mod"."Modelo" like '${fmodelo}' and "cla"."Clasificacion" like '${fclasificacion}'

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const obtenerFechasCurso = async (req = request, res = response) => {
    const { fmodelo } = req.body;
    const { fclasificacion } = req.body;
    const { ftipoproducto } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    		    SELECT "pf"."IdProductoFecha","pf"."Fecha" FROM "Producto" "pro"
                INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
                INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
                INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
                INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
                INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
				INNER JOIN "ProductoFecha" "pf" ON "pf"."Producto_id" = "pro"."IdProducto"
                WHERE "pro"."Estado_id" = '1' and "mod"."Modelo" like '${fmodelo}' and "cla"."Clasificacion" like '${fclasificacion}'
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const crearClasificacion = async (req = request, res = response) => {
    const { ftipoproducto_id } = req.body;
    const { fclasificacion } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*) from "Clasificacion" where "TipoProducto_id"=${ftipoproducto_id} and "Clasificacion"='${fclasificacion}'
    `;
    const sql1 = `
        INSERT INTO "Clasificacion" ("Clasificacion","TipoProducto_id") VALUES ('${fclasificacion}',${ftipoproducto_id})
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count == 1) {
        } else {
            const data1: any = await db.query(sql1, {});
        }

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

export const crearCategoria = async (req = request, res = response) => {
    const { fclasificacion_id } = req.body;
    const { fcategoria } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*) from "Categoria" where "Clasificacion_id"=${fclasificacion_id} and "Categoria"='${fcategoria}'
    `;
    const sql1 = `
        INSERT INTO "Categoria" ("Categoria","Clasificacion_id") VALUES ('${fcategoria}',${fclasificacion_id})
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count == 1) {
        } else {
            const data1: any = await db.query(sql1, {});
        }

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

export const crearSubCategoria = async (req = request, res = response) => {
    const { fcategoria_id } = req.body;
    const { fsubcategoria } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*) from "SubCategoria" where "Categoria_id"=${fcategoria_id} and "SubCategoria"='${fsubcategoria}'
    `;
    const sql1 = `
        INSERT INTO "SubCategoria" ("SubCategoria","Categoria_id") VALUES ('${fsubcategoria}',${fcategoria_id})
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count == 1) {
        } else {
            const data1: any = await db.query(sql1, {});
        }

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

export const crearModelo = async (req = request, res = response) => {
    const { fmarca_id } = req.body;
    const { fmodelo } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*) from "Modelo" where "Marca_id"=${fmarca_id} and "Modelo"='${fmodelo}'
    `;
    const sql1 = `
        INSERT INTO "Modelo" ("Modelo","Marca_id") VALUES ('${fmodelo}',${fmarca_id})
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count == 1) {
        } else {
            const data1: any = await db.query(sql1, {});
        }

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

export const listarSelectModelo = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select * from "Modelo" 
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
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

export const crearProductoFinal = async (req = request, res = response) => {
    const { fmodelo_id } = req.body;
    const { fsubcategoria_id } = req.body;
    const { ftipoproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select count(*) from "Producto" where "SubCategoria_id"=${fsubcategoria_id} and "Modelo_id"='${fmodelo_id}'
    `;
    const sql1 = `
        INSERT INTO "Producto" ("Cliente_id","Modelo_id","SubCategoria_id","Area_id") VALUES (1,${fmodelo_id},${fsubcategoria_id},1) RETURNING "IdProducto" 
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
        const sql2 = `
        INSERT INTO "ProductoPrecio" ("Producto_id","Tiempo","Precio") VALUES (${data[0][0].IdProducto},1,0) 
        `;
        const data3: any = await db.query(sql2, {});
        if (data[0][0].count == 1) {
        } else {
            const data1: any = await db.query(sql1, {});
            if (ftipoproducto_id == 2) {
                const sqla = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Multimedia','Imagen','Cursos','CertificadoAdelante','')
                `;
                const sqlb = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Multimedia','Imagen','Cursos','CertificadoAtras','')
                `;
                const sqlc = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Documentos','Pdf','Cursos','Brochure','')
                `;
                const sqld = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Multimedia','Video','Cursos','Profesor','')
                `;
                const sqle = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Multimedia','Video','Cursos','Presentacion','')
                `;
                const sqlf = `
                INSERT INTO "ProductoAdjunto"("Producto_id","Tipo1","Tipo2","Tipo3","Tipo4","NombreArchivo")
                values(${data1[0][0].IdProducto},'Multimedia','Imagen','Cursos','Portada','')
                `;
                const sqlg = `
                INSERT INTO "ProductoAtributo"("Producto_id")
                values(${data1[0][0].IdProducto})
                `;
                const sqlh = `
                INSERT INTO "ProductoBeneficio"("Producto_id","Titulo","Descripcion","Orden")
                values(${data1[0][0].IdProducto},'','',1)
                `;
                const sqli = `
                INSERT INTO "ProductoBeneficio"("Producto_id","Titulo","Descripcion","Orden")
                values(${data1[0][0].IdProducto},'','',2)
                `;
                const sqlj = `
                 INSERT INTO "ProductoFecha" ("Producto_id", "Fecha") VALUES (${data1[0][0].IdProducto}, 'Inmediato');
                `;
                await db.query(sqla, {});
                await db.query(sqlb, {});
                await db.query(sqlc, {});
                await db.query(sqld, {});
                await db.query(sqle, {});
                await db.query(sqlf, {});
                await db.query(sqlg, {});
                await db.query(sqlh, {});
                await db.query(sqli, {});
                await db.query(sqlj, {});
            }
        }

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

export const datatableusuario = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
         select "us"."IdUsuario","us"."Usuario","us"."RutaImagen","us"."RutaImagenPerfil","en"."Nombres","en"."Apellidos","ar"."Area","pu"."Puesto" from "Usuario" "us"
		inner join "Entidad" "en" on "en"."IdEntidad"="us"."Entidad_id"
		inner join "Empleado" "em" on "em"."IdEmpleado"="en"."EntidadRelacion_id"
		inner join "Area" "ar" on  "ar"."IdArea"="em"."Area_id"
		inner join "Puesto" "pu" on  "pu"."IdPuesto"="em"."Puesto_id"
  order by "IdUsuario"			
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

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

export const listarArea = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `select * from "Area"`;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
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

export const listarPuesto = async (req = request, res = response) => {
    const { fArea_id } = req.body;
    // Ajusta la consulta SQL a tus necesidades
    const sql = `select * from "Puesto" where "Area_id"=${fArea_id}`;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
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

export const alternarestadomodalidad = async (
    req = request,
    res = response
) => {
    const { pidproducto, pmodo } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql1 = `update "Producto" set "Estado_id"=1 where "IdProducto"=${pidproducto}`;
    const sql2 = `update "Producto" set "Estado_id"=0 where "IdProducto"=${pidproducto}`;

    try {
        if (pmodo == "1") {
            const data: any = await db.query(sql1, {});
            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data,
            });
        } else {
            const data: any = await db.query(sql2, {});
            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};

export const obtenerFechasCursoxId = async (req = request, res = response) => {
    const { fproductoid } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    		    select * from "ProductoFecha" where "Producto_id"=${fproductoid}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const listaultimahora = async (req = request, res = response) => {
    const { fproductoid } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    	SELECT 
    "Clasificacion",
    "Categoria",
    "SubCategoria",
    "IdModelo",
    "Modelo",
    MAX("pp"."Precio") AS "Precio",
	STRING_AGG(("RutaImagen")::TEXT, ',') AS "RutaImagen",
	STRING_AGG(("Cont1")::TEXT, ',') AS "Cont1"
FROM 
    "Producto" "pro"
INNER JOIN 
    "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
INNER JOIN 
    "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
INNER JOIN 
    "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
INNER JOIN 
    "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
INNER JOIN 
    "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
LEFT JOIN 
    (SELECT "Producto_id", MAX("Precio") AS "Precio"
     FROM "ProductoPrecio"
     GROUP BY "Producto_id") AS "pp" ON "pp"."Producto_id" = "pro"."IdProducto"
LEFT JOIN 
    (SELECT "Producto_id",CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" 
     FROM "ProductoAdjunto" "pa" where "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'
     GROUP BY "Producto_id","pa"."Tipo1","pa"."Tipo2","pa"."Tipo3","pa"."Tipo4","pa"."NombreArchivo") AS "pad" ON "pad"."Producto_id" = "pro"."IdProducto"	 
LEFT JOIN 
    (SELECT "Producto_id", Count("ProductoTemario") as "Cont1"
     FROM "ProductoTemario"
     GROUP BY "Producto_id") AS "pte" ON "pte"."Producto_id" = "pro"."IdProducto"
WHERE 
    "pro"."Estado_id" = '1' and "IdProducto"=${fproductoid}
GROUP BY 
    "Clasificacion", 
    "Categoria", 
    "SubCategoria", 
    "Modelo", 
    "IdModelo";
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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
export const concretarventa = async (req = request, res = response) => {
    const { fproductoid, fusuarioid, fprecio } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    INSERT INTO "ProductoStock"("Producto_id","Usuario_id","StockDisponible")
     values (${fproductoid},${fusuarioid},1)
    `;
    const sql1 = `
    INSERT INTO "RegistroVenta"("Producto_id","Usuario_id","Cantidad","Precio")
     values (${fproductoid},${fusuarioid},1,${fprecio})
    `;
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
        const data1 = await db.query(sql1, {});
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
export const rellenarcarritodatos = async (req = request, res = response) => {
    const { fmodelo } = req.body;
    const { fclasificacion } = req.body;
    const { fprecio } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    		    SELECT "Precio","tp"."IdTipoProducto","IdProducto"
				 FROM "Producto" "pro"
                INNER JOIN "Modelo" "mod" ON "mod"."IdModelo" = "pro"."Modelo_id"
                INNER JOIN "SubCategoria" "sub" ON "sub"."IdSubCategoria" = "pro"."SubCategoria_id"
                INNER JOIN "Categoria" "cat" ON "cat"."IdCategoria" = "sub"."Categoria_id"
                INNER JOIN "Clasificacion" "cla" ON "cla"."IdClasificacion" = "cat"."Clasificacion_id"
                INNER JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
				LEFT JOIN "ProductoPrecio" "pp" ON "pp"."IdProductoPrecio" = "pro"."IdProducto"
                WHERE "pro"."Estado_id" = '1' and "mod"."Modelo" like '${fmodelo}' and "cla"."Clasificacion" like '${fclasificacion}'
                AND "Precio"=${fprecio}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});

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

export const fanadircursosusuario = async (req = request, res = response) => {
    const { fusuario_id } = req.body;
    const { fmodelo_id } = req.body;
    const { fsubcategoria_id } = req.body;
    const { fprecio } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    Select "IdProducto" from "Producto" where "SubCategoria_id"=${fsubcategoria_id}
    and "Modelo_id"=${fmodelo_id} 

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
        const sql1 = `
        Select Count(*) from "ProductoStock" where "Usuario_id"=${fusuario_id} and "Producto_id"=${data[0][0].IdProducto}
        `;
        const data1: any = await db.query(sql1, {});

        if (data1[0][0].count > 0) {
            return res.status(400).json({
                ok: false,
                msg: "Error de conexión",
            });
        } else {
            const sql2 = `
            Insert into "ProductoStock"("Producto_id","Usuario_id","StockDisponible") values (${data[0][0].IdProducto},${fusuario_id},1)
                `;
            const data2: any = await db.query(sql2, {});
            const sql3 = `
            Insert into "RegistroVenta"("Producto_id","Usuario_id","Cantidad","Precio") values (${data[0][0].IdProducto},${fusuario_id},1,${fprecio})
                `;
            const data3: any = await db.query(sql3, {});
        }

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

//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//#GESTION CURSO
export const listaradministrarcursosv2 = async (
    req = request,
    res = response
) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "Escuela","Especializacion","IdCurso","CodigoCurso","Curso","TipoCurso",cur."Estado_id" from "Curso" "cur"
        inner join "Especializacion" "esp" on "esp"."IdEspecializacion"="cur"."Especializacion_id"
        inner join "Escuela" "esc" on "esc"."IdEscuela"="esp"."Escuela_id"
        inner join "TipoCurso" "tpo" on "tpo"."IdTipoCurso"="cur"."TipoCurso_id"
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarclientev2 = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT * FROM "Cliente"
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

//LISTARV2
export const listarescuelav2 = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT * FROM "Escuela"
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarespecializacionxescuelav2 = async (
    req = request,
    res = response
) => {
    const { fescuela_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT * FROM "Especializacion" "esp"
        where "esp"."Escuela_id"=${fescuela_id}
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarcursoxespecializacionv2 = async (
    req = request,
    res = response
) => {
    const { fespecializacion_id, ftipocurso_id, fcliente_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT * FROM "Curso" where "Especializacion_id"=${fespecializacion_id} and "TipoCurso_id"=${ftipocurso_id} and "Cliente_id"=${fcliente_id}
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listartipocursov2 = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    SELECT * FROM "TipoCurso";

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const crearescuelav2 = async (req = request, res = response) => {
    const { fescuela } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT Count(*) FROM "Escuela" where "Escuela"='${fescuela}'
        `;
    const sql1 = `
        Insert into "Escuela"("Escuela") values
        ('${fescuela}')
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count < 0) {
            return res.status(400).json({
                ok: false,
                msg: "Error de conexión",
            });
        } else {
            const data1 = await db.query(sql1, {});
            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data1,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};
export const crearespecializacionv2 = async (req = request, res = response) => {
    const { fescuela_id, fespecializacion } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT Count(*) FROM "Especializacion" where "Especializacion"='${fespecializacion}'
        `;
    const sql1 = `
        INSERT INTO "Especializacion" ("Especializacion","Escuela_id") VALUES
        ('${fespecializacion}',${fescuela_id});
  
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});

        if (data[0][0].count < 0) {
            return res.status(400).json({
                ok: false,
                msg: "Error de conexión",
            });
        } else {
            const data1 = await db.query(sql1, {});
            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data1,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};
export const crearcursov2 = async (req = request, res = response) => {
    const { ftipocurso_id, fespecializacion_id, fcliente_id, fcurso } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT Count(*) FROM "Curso" where "Curso"='${fcurso}' and "Especializacion_id"=${fespecializacion_id} and "TipoCurso_id"=${ftipocurso_id} and "Cliente_id"=${fcliente_id}
        `;
    const sql1 = `
        INSERT INTO "Curso" ("Curso","Especializacion_id","TipoCurso_id","Cliente_id") VALUES
        ('${fcurso}',${fespecializacion_id},${ftipocurso_id},${fcliente_id});
  
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
        if (data[0][0].count < 0) {
            return res.status(400).json({
                ok: false,
                msg: "Error de conexión",
            });
        } else {
            const data1 = await db.query(sql1, {});
            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data1,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};
export const crearproductov2 = async (req = request, res = response) => {
    const { fcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT Count(*) FROM "Producto" where "Curso_id"='${fcurso_id}'
        `;
    const sql1 = `
        INSERT INTO "Producto" ("Curso_id","TipoModalidad_id") VALUES
        (${fcurso_id},1) RETURNING "IdProducto";
    `;
    const sql2 = `
        INSERT INTO "Producto" ("Curso_id","TipoModalidad_id") VALUES
        (${fcurso_id},2) RETURNING "IdProducto";
    `;


    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
        if (data[0][0].count == 0) {
            const data1: any = await db.query(sql1, {});
            const data2: any = await db.query(sql2, {});

            const sql4 = `
            INSERT INTO "ProductoPrecio" ( "Tiempo","Producto_id", "Precio") VALUES
            (1,${data1[0][0].IdProducto},100),
            (1,${data2[0][0].IdProducto},100),
            `;
            const data4: any = await db.query(sql4, {});

            return res.status(200).json({
                ok: true,
                msg: "Información correcta",
                data1,
            });

        } else {
            return res.status(400).json({
                ok: false,
                msg: "Error de conexión",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
};

export const listarevaluacionesxcursov2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select * from "Evaluacion" ev
        where "Curso_id"=(select "Curso_id" from "Producto" where "IdProducto"=${fproducto_id})
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarevaluacionesvivoxcursov2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT * FROM "Evaluacion" ev
        INNER JOIN "EvaluacionVivo" evv  ON evv."Evaluacion_id"=ev."IdEvaluacion"
		WHERE "Curso_id" = (
		    SELECT "Curso_id" FROM "Producto" WHERE "IdProducto" = ${fproducto_id}
		) AND "Sala_id" = (select "IdSala" from "Sala" where "Producto_id"=${fproducto_id} and "Sala"='${fsala_id}');
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarevaluacionesnotaxusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fevaluacion_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
         select "TipoEvaluacion","IdEvaluacion","eno"."IdEvaluacionNota","Nota","Intento",eno."Producto_id","Evaluacion","eva"."Duracion","eva"."Intentos" from "Evaluacion" "eva"
        inner join "EvaluacionNota" "eno"  on "eno"."Evaluacion_id"="eva"."IdEvaluacion"
        where "Usuario_id"=${fusuario_id}	and "IdEvaluacion"=${fevaluacion_id} and eno."Sala_id" is null
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarevaluacionesnotavivoxusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fevaluacion_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
           select "TipoEvaluacion","IdEvaluacion","eno"."IdEvaluacionNota","Nota","Intento",
   eno."Producto_id","Evaluacion","ev"."Duracion","ev"."Intentos",evv.* from "Evaluacion" "ev"
        inner join "EvaluacionNota" "eno"  on "eno"."Evaluacion_id"="ev"."IdEvaluacion"
		INNER JOIN "EvaluacionVivo" evv 
		ON evv."IdEvaluacionVivo" = ANY(string_to_array(ev."EvaluacionVivo_id", ',')::INTEGER[])
        where "Usuario_id"=${fusuario_id}	and "IdEvaluacion"=${fevaluacion_id} and eno."Sala_id"=${fsala_id}
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarpreguntasxevaluacionv2 = async (
    req = request,
    res = response
) => {
    const { fevaluacion_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `


SELECT
eva."IdEvaluacion" AS "id",
eva."Evaluacion" AS "title",
eva."Descripcion" AS "description",
eva."Duracion" AS "duration",
JSON_AGG(
  JSON_BUILD_OBJECT(
    'id', pre."IdPregunta",
    'question', pre."Pregunta",
    'options', options_array,
    'correctAnswer', correct_answer."Respuesta" -- El texto de la respuesta correcta
  )
) AS "questions"
FROM "Evaluacion" eva
INNER JOIN "BancoPregunta" bp on bp."IdBancoPregunta"=eva."BancoPregunta_id"
INNER JOIN "Pregunta" pre
ON bp."IdBancoPregunta" = pre."BancoPregunta_id"
LEFT JOIN (
SELECT
  res."Pregunta_id",
  JSON_AGG(JSON_BUILD_OBJECT(
    'option', res."Respuesta",
    'idoption', res."IdRespuesta",
    'orden', res."Orden"
  )) AS options_array -- Solo incluye el texto de las respuestas
FROM "Respuesta" res
GROUP BY res."Pregunta_id"
) sub_res
ON sub_res."Pregunta_id" = pre."IdPregunta"
LEFT JOIN "Respuesta" correct_answer
ON correct_answer."Pregunta_id" = pre."IdPregunta"
AND correct_answer."Orden" = pre."RespuestaCorrecta"::INTEGER -- Conversión explícita
WHERE eva."IdEvaluacion"=${fevaluacion_id}
GROUP BY eva."IdEvaluacion", eva."Evaluacion", eva."Descripcion", eva."Duracion";

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarpreguntasmarcadasxevaluacionv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fevaluacion_id, fevaluacionnota_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `

    SELECT
    evno."IdEvaluacionNota",
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', pre."IdPregunta",
        'question', pre."Pregunta",
        'options', sub_res.options_array,
        'marcado', epre."Marcado",
        'correctAnswer', pre."RespuestaCorrecta"
      )
    ) AS "questions"
  FROM "Evaluacion" eva
  Inner join "BancoPregunta" bp on bp."IdBancoPregunta"=eva."BancoPregunta_id"
  INNER JOIN "Pregunta" pre 
    ON pre."BancoPregunta_id" = eva."BancoPregunta_id"
  LEFT JOIN (
    SELECT
      res."Pregunta_id",
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'option', res."Respuesta",
          'idoption', res."IdRespuesta",
          'orden', res."Orden"
        )
      ) AS options_array
    FROM "Respuesta" res
    GROUP BY res."Pregunta_id"
  ) sub_res 
    ON sub_res."Pregunta_id" = pre."IdPregunta"
  INNER JOIN "EvaluacionNota" evno 
    ON evno."Evaluacion_id" = eva."IdEvaluacion"
  INNER JOIN "EvaluacionPregunta" epre 
    ON epre."EvaluacionNota_id" = evno."IdEvaluacionNota" 
    AND epre."Pregunta_id" = pre."IdPregunta" -- Asegura que la unión es consistente
  LEFT JOIN "Respuesta" correct_answer 
    ON correct_answer."Pregunta_id" = pre."IdPregunta" 
    AND correct_answer."Orden" = pre."RespuestaCorrecta"::INTEGER -- Conversión explícita
  WHERE 
     evno."IdEvaluacionNota" =${fevaluacionnota_id}
  GROUP BY 
    evno."IdEvaluacionNota";

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const guardarevaluacionv2 = async (req = request, res = response) => {
    const { fusuario_id, fevaluacion_id, fnota, fduracionev, respuestas, fproducto_id } =
        req.body;

    // Consulta para contar intentos previos del usuario en esta evaluación
    const sqlIntento = `
        SELECT COUNT(*) AS count FROM "EvaluacionNota" 
        WHERE "Evaluacion_id" = ${fevaluacion_id} AND "Usuario_id" = ${fusuario_id} and "Sala_id" is null;
    `;

    try {
        // Ejecutar la consulta para contar intentos
        const data: any = await db.query(sqlIntento);
        const intento = Number(data[0][0].count) + 1;

        // Insertar en "EvaluacionNota" y obtener su ID generado
        const sqlInsertNota = `
            INSERT INTO "EvaluacionNota" ("Usuario_id", "Nota", "Intento", "FechaInicio","FechaFin", "Evaluacion_id", "Duracion","Producto_id")
            VALUES (${fusuario_id}, ${fnota}, ${intento}, CURRENT_TIMESTAMP,CURRENT_TIMESTAMP, ${fevaluacion_id}, ${fduracionev},${fproducto_id})
            RETURNING "IdEvaluacionNota";
        `;
        const [evaluacionNotaResult]: any = await db.query(sqlInsertNota);
        const evaluacionNotaId = evaluacionNotaResult[0].IdEvaluacionNota;

        // Construir múltiples valores para el INSERT en "EvaluacionPregunta"
        const values = Object.entries(respuestas).map(
            ([preguntaId, respuesta]: any) => {
                return `(${preguntaId}, ${respuesta.orden}, ${evaluacionNotaId})`;
            }
        );

        const sqlInsertPreguntas = `
            INSERT INTO "EvaluacionPregunta" ("Pregunta_id", "Marcado", "EvaluacionNota_id")
            VALUES ${values.join(", ")};
        `;

        // Ejecutar la inserción en "EvaluacionPregunta"
        await db.query(sqlInsertPreguntas);

        return res.status(200).json({
            ok: true,
            msg: "Evaluación guardada correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al guardar evaluación",
        });
    }
};
export const guardarevaluacionvivov2 = async (req = request, res = response) => {
    const { fusuario_id, fevaluacion_id, fnota, fduracionev, respuestas, fsala_id, fproducto_id } =
        req.body;

    // Consulta para contar intentos previos del usuario en esta evaluación
    const sqlIntento = `
        SELECT COUNT(*) AS count FROM "EvaluacionNota" 
        WHERE "Evaluacion_id" = ${fevaluacion_id} AND "Usuario_id" = ${fusuario_id} 
        and "Sala_id"=(select "IdSala" from "Sala" where "Producto_id"=${fproducto_id} and "Sala"='${fsala_id}');
    `;

    try {
        // Ejecutar la consulta para contar intentos
        const data: any = await db.query(sqlIntento);
        const intento = Number(data[0][0].count) + 1;

        // Insertar en "EvaluacionNota" y obtener su ID generado
        const sqlInsertNota = `
            INSERT INTO "EvaluacionNota" ("Usuario_id", "Nota", "Intento", "FechaInicio","FechaFin", "Evaluacion_id", "Duracion","Sala_id","Producto_id")
            VALUES (${fusuario_id}, ${fnota}, ${intento}, CURRENT_TIMESTAMP,CURRENT_TIMESTAMP, ${fevaluacion_id}, ${fduracionev},${fsala_id},${fproducto_id})
            RETURNING "IdEvaluacionNota";
        `;
        const [evaluacionNotaResult]: any = await db.query(sqlInsertNota);
        const evaluacionNotaId = evaluacionNotaResult[0].IdEvaluacionNota;

        // Construir múltiples valores para el INSERT en "EvaluacionPregunta"
        const values = Object.entries(respuestas).map(
            ([preguntaId, respuesta]: any) => {
                return `(${preguntaId}, ${respuesta.orden}, ${evaluacionNotaId})`;
            }
        );

        const sqlInsertPreguntas = `
            INSERT INTO "EvaluacionPregunta" ("Pregunta_id", "Marcado", "EvaluacionNota_id")
            VALUES ${values.join(", ")};
        `;

        // Ejecutar la inserción en "EvaluacionPregunta"
        await db.query(sqlInsertPreguntas);

        return res.status(200).json({
            ok: true,
            msg: "Evaluación guardada correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al guardar evaluación",
        });
    }
};
export const listarescuelasxusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    select esc."IdEscuela",esc."Escuela",esc."Descripcion" from "ProductoStock" ps
    inner join "Producto" pr on ps."Producto_id"=pr."IdProducto"
    inner join "Curso" cu on cu."IdCurso"=pr."Curso_id"
    inner join "Especializacion" esp on esp."IdEspecializacion"=cu."Especializacion_id"
    inner join "Escuela" esc on esc."IdEscuela"=esp."Escuela_id"
    where "Usuario_id"=${fusuario_id}
    group by esc."IdEscuela",esc."Escuela"
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarespecializacionesxusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select esp."IdEspecializacion",esp."Especializacion",esp."Descripcion",esc."Escuela" from "ProductoStock" ps
    inner join "Producto" pr on ps."Producto_id"=pr."IdProducto"
    inner join "Curso" cu on cu."IdCurso"=pr."Curso_id"
    inner join "Especializacion" esp on esp."IdEspecializacion"=cu."Especializacion_id"
    inner join "Escuela" esc on esc."IdEscuela"=esp."Escuela_id"
    where "Usuario_id"=${fusuario_id}
    group by esp."IdEspecializacion",esp."Especializacion",esc."Escuela"
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarrutasxusuariov2 = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        	select "IdRuta","Ruta","Descripcion","ImagenPortada" from "RutaUsuario" eus 
        inner join "Ruta" esc on esc."IdRuta"=eus."Ruta_id"
        where "Usuario_id"=${fusuario_id}

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarespecializacionesxescuelav2 = async (
    req = request,
    res = response
) => {
    const { fescuela_id, fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "IdEspecializacion","Especializacion",esp."Descripcion" from "ProductoStock" ps
        inner join "Producto" pr on ps."Producto_id"=pr."IdProducto"
        inner join "Curso" cu on cu."IdCurso"=pr."Curso_id"
        inner join "Especializacion" esp on esp."IdEspecializacion"=cu."Especializacion_id"
        inner join "Escuela" esc on esc."IdEscuela"=esp."Escuela_id"
        where  ps."Usuario_id"=${fusuario_id} and esc."IdEscuela"=${fescuela_id}
        group by "IdEspecializacion","Especializacion",esp."Descripcion"
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarcursoxusuariov2 = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `

    WITH ProfesoresProcesados AS (
    SELECT
        "pro"."IdProducto",
        UNNEST(string_to_array(MAX("pat"."Profesores"), ',')::int[]) AS "ProfesorId"
    FROM "Producto" "pro"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "pro"."Curso_id"
    GROUP BY "pro"."IdProducto"
),
SalaUsuarioUnica AS (
    SELECT DISTINCT ON (sa."Producto_id")
        sa."Producto_id",
        sau."Sala_id",
        sa."Sala"
    FROM "SalaUsuario" sau
    INNER JOIN "Sala" sa ON sa."IdSala" = sau."Sala_id"
    WHERE sau."Usuario_id" = ${fusuario_id}
    ORDER BY sa."Producto_id", sau."Sala_id" DESC
)
SELECT
    COALESCE(
        (
            -- Examen Parcial (45%)
            SUM(
                CASE 
                    WHEN tmo."TipoModalidad" = 'En Vivo' THEN
                        (SELECT COUNT(DISTINCT ev."IdEvaluacion") * 45.0
                         FROM "Evaluacion" ev
                         LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                         WHERE ev."Curso_id" = cur."IdCurso"
                         AND ev."Evaluacion" = 'Evaluacion de Media'
                         AND evn."IdEvaluacionNota" IS NOT NULL
                         AND evn."Usuario_id" = ${fusuario_id}
                         AND evn."Sala_id" = su."Sala_id")
                    WHEN tmo."TipoModalidad" = 'Asincrónico' THEN
                        (SELECT COUNT(DISTINCT ev."IdEvaluacion") * 45.0
                         FROM "Evaluacion" ev
                         LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                         WHERE ev."Curso_id" = cur."IdCurso"
                         AND ev."Evaluacion" = 'Evaluacion de Media'
                         AND evn."IdEvaluacionNota" IS NOT NULL
                         AND evn."Usuario_id" = ${fusuario_id}
                         AND evn."Sala_id" IS NULL)
                    ELSE 0
                END
            )
            +
            -- Examen Final (50%)
            SUM(
                CASE 
                    WHEN tmo."TipoModalidad" = 'En Vivo' THEN
                        (SELECT COUNT(DISTINCT ev."IdEvaluacion") * 50.0
                         FROM "Evaluacion" ev
                         LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                         WHERE ev."Curso_id" = cur."IdCurso"
                         AND ev."Evaluacion" = 'Evaluacion Final'
                         AND evn."IdEvaluacionNota" IS NOT NULL
                         AND evn."Usuario_id" = ${fusuario_id}
                         AND evn."Sala_id" = su."Sala_id")
                    WHEN tmo."TipoModalidad" = 'Asincrónico' THEN
                        (SELECT COUNT(DISTINCT ev."IdEvaluacion") * 50.0
                         FROM "Evaluacion" ev
                         LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                         WHERE ev."Curso_id" = cur."IdCurso"
                         AND ev."Evaluacion" = 'Evaluacion Final'
                         AND evn."IdEvaluacionNota" IS NOT NULL
                         AND evn."Usuario_id" = ${fusuario_id}
                         AND evn."Sala_id" IS NULL)
                    ELSE 0
                END
            )
            +
            -- Encuestas (2.5% each)
            (SELECT COUNT(DISTINCT e."IdEncuesta") * 2.5
             FROM "Encuesta" e
             LEFT JOIN "EncuestaRespondida" er ON er."Encuesta_id" = e."IdEncuesta"
             WHERE er."Producto_id" = "pro"."IdProducto"
             AND er."Usuario_id" = ${fusuario_id})
        ), 0
    ) AS "Progreso",
    100.0 AS "ProgresoTotal",
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'TipoModalidad', tmo."TipoModalidad",
            'IdProducto', pro."IdProducto",
            'Sala', CASE 
                      WHEN tmo."TipoModalidad" = 'En Vivo' THEN su."Sala"
                      ELSE NULL
                    END
        )
    ) AS "Productos",
    (
        SELECT JSON_AGG("RutaImagenPerfil")
        FROM "Usuario"
        WHERE "IdUsuario" IN (
            SELECT "ProfesorId"
            FROM ProfesoresProcesados pp
            WHERE pp."IdProducto" = "pro"."IdProducto"
        )
    ) AS "RutaImagenPerfil",
    (SELECT COUNT(*) FROM "SalaUsuario" WHERE "Usuario_id" = ${fusuario_id} AND "Sala_id" = su."Sala_id") AS "Inscrito",
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
    CONCAT(
        '/', COALESCE(pad."Tipo1", ''),
        '/', COALESCE(pad."Tipo2", ''),
        '/', COALESCE(pad."Tipo3", ''),
        '/', COALESCE(pad."Tipo4", ''),
        '/', COALESCE(pad."NombreArchivo", '')
    ) AS "RutaImagen",
    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso",
    "pro"."IdProducto"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
LEFT JOIN SalaUsuarioUnica "su" ON su."Producto_id" = pro."IdProducto"
WHERE "pst"."Usuario_id" = ${fusuario_id} 
AND pad."Tipo4" = 'PortadaFinal' 
AND cur."Estado_id" = '1'
GROUP BY
    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso",
    "pro"."IdProducto",
    pad."Tipo1",
    pad."Tipo2",
    pad."Tipo3",
    pad."Tipo4",
    pad."NombreArchivo",
    su."Sala_id"; -- Añadir su."Sala_id" al GROUP BY
    

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarfullaccessv2 = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `

   WITH ProfesoresProcesados AS (
    SELECT
        pro."IdProducto",
        UNNEST(string_to_array(MAX(pat."Profesores"), ',')::int[]) AS "ProfesorId"
    FROM "Producto" pro
    LEFT JOIN "ProductoAtributo" pat ON pat."Curso_id" = pro."Curso_id"
    GROUP BY pro."IdProducto"
)
SELECT
    SUM(
        CASE 
            WHEN tmo."TipoModalidad" = 'En Vivo' THEN (
                SELECT COUNT(DISTINCT ev."IdEvaluacion")
                FROM "Evaluacion" ev
                LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" = sa."IdSala"
                  AND evn."Usuario_id" = ${fusuario_id}
            )
            WHEN tmo."TipoModalidad" = 'Asincrónico' THEN (
                SELECT COUNT(DISTINCT ev."IdEvaluacion")
                FROM "Evaluacion" ev
                LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" IS NULL
                  AND evn."Usuario_id" = ${fusuario_id}
            )
            ELSE 0
        END
    ) +
    (
        SELECT COUNT(DISTINCT e."IdEncuesta")
        FROM "Encuesta" e
        LEFT JOIN "EncuestaRespondida" er ON er."Encuesta_id" = e."IdEncuesta"
        WHERE er."Producto_id" = pro."IdProducto" AND er."Usuario_id" = ${fusuario_id}
    ) AS "Progreso",
    
    (
        SELECT COUNT(*)
        FROM "Evaluacion" eval
        WHERE eval."Curso_id" = cur."IdCurso"
    ) +
    (
        SELECT COUNT(*)
        FROM "Encuesta"
    ) AS "ProgresoTotal",

    (
        SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'TipoModalidad', sub."TipoModalidad",
            'IdProducto', sub."IdProducto",
            'Sala', sub."Sala"
        ))
        FROM (
            SELECT DISTINCT
                tmo2."TipoModalidad",
                pro2."IdProducto",
                sa2."Sala"
            FROM "Producto" pro2
            INNER JOIN "TipoModalidad" tmo2 ON tmo2."IdTipoModalidad" = pro2."TipoModalidad_id"
            LEFT JOIN "Sala" sa2 ON sa2."Producto_id" = pro2."IdProducto"
            WHERE pro2."IdProducto" = pro."IdProducto"
        ) AS sub
    ) AS "Productos",

    (
        SELECT JSON_AGG("RutaImagenPerfil")
        FROM "Usuario"
        WHERE "IdUsuario" IN (
            SELECT "ProfesorId"
            FROM ProfesoresProcesados pp
            WHERE pp."IdProducto" = pro."IdProducto"
        )
    ) AS "RutaImagenPerfil",

    (
        SELECT COUNT(*)
        FROM "SalaUsuario"
        WHERE "Usuario_id" = ${fusuario_id} AND "Sala_id" = MAX(sa."IdSala")
    ) AS "Inscrito",

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

    CONCAT(
        '/', COALESCE(pad."Tipo1", ''), 
        '/', COALESCE(pad."Tipo2", ''), 
        '/', COALESCE(pad."Tipo3", ''), 
        '/', COALESCE(pad."Tipo4", ''), 
        '/', COALESCE(pad."NombreArchivo", '')
    ) AS "RutaImagen",

    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso",
    pro."IdProducto"
FROM "Producto" pro
INNER JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
INNER JOIN "Especializacion" esp ON esp."IdEspecializacion" = cur."Especializacion_id"
INNER JOIN "Escuela" esc ON esc."IdEscuela" = esp."Escuela_id"
INNER JOIN "TipoCurso" tpo ON tpo."IdTipoCurso" = cur."TipoCurso_id"
LEFT JOIN "ProductoAdjunto" pad ON pad."Curso_id" = cur."IdCurso"
LEFT JOIN "ProductoAtributo" pat ON pat."Curso_id" = cur."IdCurso"
LEFT JOIN "ProductoStock" pst ON pst."Producto_id" = pro."IdProducto"
INNER JOIN "TipoModalidad" tmo ON tmo."IdTipoModalidad" = pro."TipoModalidad_id"
LEFT JOIN "Sala" sa ON sa."Producto_id" = pro."IdProducto"
WHERE pad."Tipo4" = 'PortadaFinal' and cur."Estado_id"='1'
GROUP BY
    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso",
    pro."IdProducto",
    pad."Tipo1",
    pad."Tipo2",
    pad."Tipo3",
    pad."Tipo4",
    pad."NombreArchivo";


    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarcursosxespecializacionv2 = async (
    req = request,
    res = response
) => {
    const { fespecializacion_id, fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `


    WITH ProfesoresProcesados AS (
        SELECT
            "pro"."IdProducto",
            UNNEST(string_to_array(MAX("pat"."Profesores"), ',')::int[]) AS "ProfesorId"
        FROM "Producto" "pro"
        LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "pro"."Curso_id"
        GROUP BY "pro"."IdProducto"
    )
    SELECT
        SUM(
        CASE 
            WHEN tmo."TipoModalidad" = 'En Vivo' 
            THEN (SELECT count(distinct ev."IdEvaluacion")
                  FROM "Evaluacion" ev
                  LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                  WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" = sa."IdSala"
                  AND evn."Usuario_id"=${fusuario_id})
            WHEN tmo."TipoModalidad" = 'Asincrónico' 
            THEN (SELECT count(distinct ev."IdEvaluacion")
                  FROM "Evaluacion" ev
                  LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                  WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" IS NULL
                   AND evn."Usuario_id"=${fusuario_id})
            ELSE 0
        END
    )+( SELECT COUNT(DISTINCT e."IdEncuesta")
               FROM "Encuesta" e
               LEFT JOIN "EncuestaRespondida" er 
                 ON er."Encuesta_id" = e."IdEncuesta"
               WHERE er."Producto_id" ="pro"."IdProducto" and er."Usuario_id"=${fusuario_id}) AS "Progreso",
    
        (
            SELECT COUNT(*)
            FROM "Evaluacion" eval
            WHERE eval."Curso_id" =  cur."IdCurso"
        ) +
        (
            SELECT COUNT(*)
            FROM "Encuesta"
        ) AS "ProgresoTotal",
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'TipoModalidad', "tmo"."TipoModalidad",
                'IdProducto', "pro"."IdProducto",
                'Sala', "sa"."Sala"
            )
        ) AS "Productos",
        (
            SELECT JSON_AGG("RutaImagenPerfil")
            FROM "Usuario"
            WHERE "IdUsuario" IN (
                SELECT "ProfesorId"
                FROM ProfesoresProcesados pp
                WHERE pp."IdProducto" = "pro"."IdProducto"
            )
        ) AS "RutaImagenPerfil",
    (select Count(*) from "SalaUsuario" where "Usuario_id"=${fusuario_id}  and "Sala_id"=MAX("sa"."IdSala")) as "Inscrito",
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
        CONCAT(
                    '/', COALESCE(pad."Tipo1", ''), 
                    '/', COALESCE(pad."Tipo2", ''), 
                    '/', COALESCE(pad."Tipo3", ''), 
                    '/', COALESCE(pad."Tipo4", ''), 
                    '/', COALESCE(pad."NombreArchivo", '')) as "RutaImagen",
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto"
    FROM "Producto" "pro"
    INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
    INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
    INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
    INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
    LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
    INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
    LEFT JOIN "Sala" "sa" ON "sa"."Producto_id" = "pro"."IdProducto"
    WHERE "pst"."Usuario_id" = ${fusuario_id} and pad."Tipo4"='PortadaFinal' and esp."IdEspecializacion"=${fespecializacion_id}
    GROUP BY
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto",
        pad."Tipo1",
        pad."Tipo2",
        pad."Tipo3",
        pad."Tipo4",
        pad."NombreArchivo";
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarnotasproductosv2 = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       SELECT 
    cur."Curso",
    JSON_AGG(
        JSON_BUILD_OBJECT(
          'Evaluacion', ev."Evaluacion",
          'Nota', max_notas."Nota",
          'FechaInicio', max_notas."FechaInicio",
          'FechaFin', max_notas."FechaFin"
        )
    ) AS "questions",
    ROUND(AVG(max_notas."PromedioFinal")::numeric, 2) AS "PromedioFinal" -- Cálculo del promedio final
FROM "Evaluacion" ev
INNER JOIN (
    SELECT evn."Evaluacion_id", 
           evn."Producto_id", 
           evn."Usuario_id", 
           MAX(evn."Nota") AS "Nota",
           MAX(evn."FechaInicio") AS "FechaInicio", 
           MAX(evn."FechaFin") AS "FechaFin",
           AVG(evn."Nota") AS "PromedioFinal" 
    FROM "EvaluacionNota" evn
    WHERE "Sala_id" IS NULL
    GROUP BY evn."Evaluacion_id", evn."Producto_id",evn."Usuario_id"
) max_notas ON max_notas."Evaluacion_id" = ev."IdEvaluacion"
INNER JOIN "Curso" cur ON cur."IdCurso" = ev."Curso_id"
where   max_notas."Usuario_id"=${fusuario_id}
GROUP BY cur."Curso"
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarnotasproductosxproidv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `

    SELECT 
    cur."Curso",
    JSON_AGG(
        JSON_BUILD_OBJECT(
          'Evaluacion', ev."Evaluacion",
          'Nota', max_notas."Nota",
          'FechaInicio', max_notas."FechaInicio",
          'FechaFin', max_notas."FechaFin"
        )
    ) AS "questions",
    ROUND(AVG(max_notas."PromedioFinal")::numeric, 2) AS "PromedioFinal" -- Cálculo del promedio final
FROM "Evaluacion" ev
INNER JOIN (
    SELECT evn."Evaluacion_id", 
           evn."Producto_id", 
           evn."Usuario_id", 
           MAX(evn."Nota") AS "Nota",
           MAX(evn."FechaInicio") AS "FechaInicio", 
           MAX(evn."FechaFin") AS "FechaFin",
           AVG(evn."Nota") AS "PromedioFinal" 
    FROM "EvaluacionNota" evn
    WHERE "Sala_id" IS NULL
    GROUP BY evn."Evaluacion_id", evn."Producto_id",evn."Usuario_id"
) max_notas ON max_notas."Evaluacion_id" = ev."IdEvaluacion"
INNER JOIN "Curso" cur ON cur."IdCurso" = ev."Curso_id"
where max_notas."Producto_id"=${fproducto_id} and max_notas."Usuario_id"=${fusuario_id}
GROUP BY cur."Curso"

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarnotasvivoproductosxproidv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        SELECT 
    cur."Curso",
    JSON_AGG(
        JSON_BUILD_OBJECT(
          'Evaluacion', ev."Evaluacion",
          'Nota', max_notas."Nota",
          'FechaInicio', max_notas."FechaInicio",
          'FechaFin', max_notas."FechaFin"
        )
    ) AS "questions",
    ROUND(AVG(max_notas."PromedioFinal")::numeric, 2) AS "PromedioFinal" -- Cálculo del promedio final
FROM "Evaluacion" ev
INNER JOIN (
    -- Subconsulta para obtener la nota máxima, fechas asociadas y promedio por Evaluacion_id
    SELECT evn."Evaluacion_id", 
           MAX(evn."Nota") AS "Nota",
           MAX(evn."FechaInicio") AS "FechaInicio", 
           MAX(evn."FechaFin") AS "FechaFin",
           AVG(evn."Nota") AS "PromedioFinal" -- Cálculo del promedio por evaluación
    FROM "EvaluacionNota" evn
    where "Sala_id"=${fsala_id}
    GROUP BY evn."Evaluacion_id"
) max_notas ON max_notas."Evaluacion_id" = ev."IdEvaluacion"
INNER JOIN "Producto" pro ON pro."IdProducto" = ev."Producto_id"
INNER JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
WHERE ev."Producto_id" IN (
    SELECT unnest(string_to_array(
        (SELECT string_agg("Producto_id"::text, ',') 
         FROM "ProductoStock" ps
         WHERE ps."Usuario_id" = ${fusuario_id} and  ps."Producto_id"=(select "Curso_id" from "Producto" where "IdProducto"=${fproducto_id})), 
        ','))::integer
) 
GROUP BY cur."Curso";

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarcursosxrutasv2 = async (req = request, res = response) => {
    const { fruta_id, fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    SELECT 
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'TipoModalidad', "tmo"."TipoModalidad",
            'IdProducto', "pro"."IdProducto"
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
    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
inner join "RutaCurso" esc1 on esc1."Curso_id"=cur."IdCurso"
WHERE esc1."Ruta_id"=${fruta_id} and pst."Usuario_id"=${fusuario_id}
GROUP BY
    "Escuela",
    "Especializacion",
    "IdCurso",
    "Curso",
    "TipoCurso";

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarcursoslimitadosv2 = async (
    req = request,
    res = response
) => {
    const { fruta_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
          select "IdProducto","Escuela","TipoModalidad","Especializacion","IdCurso","Curso","TipoCurso","pat".* from "Producto" "pro"
        inner join "Curso" "cur" on "cur"."IdCurso"="pro"."Curso_id"
        inner join "Especializacion" "esp" on "esp"."IdEspecializacion"="cur"."Especializacion_id"
        inner join "Escuela" "esc" on "esc"."IdEscuela"="esp"."Escuela_id"
        inner join "TipoCurso" "tpo" on "tpo"."IdTipoCurso"="cur"."TipoCurso_id"
        inner join "ProductoAtributo" "pat" on "pat"."Curso_id"="cur"."IdCurso"
        inner join "ProductoStock" "pst" on "pst"."Producto_id"="pro"."IdProducto"
		inner join "TipoModalidad" "tmo" on "tmo"."IdTipoModalidad"="pro"."TipoModalidad_id"
        
	Limit 6

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const listarcursostotalesv2 = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `
            select "IdProducto","Escuela","TipoModalidad","Especializacion","IdCurso","Curso","TipoCurso","pat".* from "Producto" "pro"
        inner join "Curso" "cur" on "cur"."IdCurso"="pro"."Curso_id"
        inner join "Especializacion" "esp" on "esp"."IdEspecializacion"="cur"."Especializacion_id"
        inner join "Escuela" "esc" on "esc"."IdEscuela"="esp"."Escuela_id"
        inner join "TipoCurso" "tpo" on "tpo"."IdTipoCurso"="cur"."TipoCurso_id"
		inner join "TipoModalidad" "tmo" on "tmo"."IdTipoModalidad"="pro"."TipoModalidad_id"
        inner join "ProductoAtributo" "pat" on "pat"."Curso_id"="cur"."IdCurso"
        inner join "ProductoStock" "pst" on "pst"."Producto_id"="pro"."IdProducto"

        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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



export const listarvideointrov2 = async (req = request, res = response) => {
    const { fcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
         select CONCAT(
                '/', COALESCE(pta."Tipo1", ''), 
                '/', COALESCE(pta."Tipo2", ''), 
                '/', COALESCE(pta."Tipo3", ''), 
                '/', COALESCE(pta."Tipo4", ''), 
                '/', COALESCE(pta."NombreArchivo", '')
            ) from "ProductoIntroduccion" pta where "Curso_id"=${fcurso_id}
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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



export const listarproductospreciov2 = async (req = request, res = response) => {

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
 SELECT 
    pro."IdProducto",
    cur."IdCurso",
    cur."Curso",
    esp."Especializacion",
    esc."Escuela",
    tpo."TipoCurso",
    tmo."TipoModalidad",
    pp."Precio",
    CASE 
        WHEN tmo."TipoModalidad" = 'En Vivo' THEN
            CASE 
                WHEN COUNT(s."IdSala") > 0 THEN
                    json_agg(
                        json_build_object(
                            'IdSala', s."IdSala",
                            'Sala', s."Sala",
                            'Horario', s."Horario",
                            'NumeroReunion', s."NumeroReunion",
                            'ClaveReunion', s."ClaveReunion",
                            'NumeroWhatsapp', s."NumeroWhatsapp"
                        )
                    ) FILTER (WHERE s."IdSala" IS NOT NULL)
                ELSE NULL
            END
        ELSE NULL
    END AS sala
FROM "Producto" pro
JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
JOIN "Especializacion" esp ON esp."IdEspecializacion" = cur."Especializacion_id"
JOIN "Escuela" esc ON esc."IdEscuela" = esp."Escuela_id"
JOIN "TipoCurso" tpo ON tpo."IdTipoCurso" = cur."TipoCurso_id"
JOIN "TipoModalidad" tmo ON tmo."IdTipoModalidad" = pro."TipoModalidad_id"
JOIN "ProductoPrecio" pp ON pp."Producto_id" = pro."IdProducto"
LEFT JOIN "Sala" s ON s."Producto_id" = pro."IdProducto"
WHERE pro."Estado_id" = '1'
GROUP BY 
    pro."IdProducto",
    cur."IdCurso",
    cur."Curso",
    esp."Especializacion",
    esc."Escuela",
    tpo."TipoCurso",
    tmo."TipoModalidad",
    pp."Precio";
        `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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


export const listarpreguntasxencuestav2 = async (req = request, res = response) => {
    const { fencuesta_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades

    const sql = `
     select ep."IdEncuestaPregunta",ep."Pregunta",tep."TipoEncuestaPregunta" from "EncuestaPregunta" ep
	  inner join "TipoEncuestaPregunta" tep on tep."IdTipoEncuestaPregunta"=ep."TipoEncuestaPregunta_id"
      where "Encuesta_id"=${fencuesta_id}
      order by "Orden" asc
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const listarencuestasalumnoobligatoriov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    SELECT (select Count(*) from "EncuestaRespondida" er
    where "Usuario_id"=${fusuario_id} and er."Encuesta_id"=ec."IdEncuesta" and er."Producto_id"=${fproducto_id}) as "Respondida",(select Count(*) from "EncuestaPregunta" ep
    where ep."Encuesta_id"=ec."IdEncuesta") as "Preguntas",* FROM "Encuesta" ec
    where "Obligatorio"=1 
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const responderencuestav2 = async (req = request, res = response) => {
    const { fusuario_id, fencuesta_id, frespuestas, fproducto_id } = req.body;

    // Consulta SQL para insertar en EncuestaRespondida
    const sql = `
        INSERT INTO "EncuestaRespondida"("Encuesta_id","Producto_id", "Usuario_id") 
        VALUES (${fencuesta_id}, ${fproducto_id}, ${fusuario_id}) 
        RETURNING "IdEncuestaRespondida"
    `;

    try {
        // Ejecutar la primera consulta para obtener "IdEncuestaRespondida"
        const rows: any = await db.query(sql);
        const encuestaRespondidaId = rows[0][0].IdEncuestaRespondida;

        // Generar los valores dinámicos para la segunda inserción
        const valores = Object.entries(frespuestas)
            .filter(([_, respuesta]) => respuesta !== false) // Filtrar respuestas válidas
            .map(
                ([preguntaId, respuesta]) =>
                    `(${preguntaId}, ${encuestaRespondidaId}, '${respuesta}')`
            )
            .join(", ");

        // Consulta SQL para insertar en EncuestaRespuesta
        const sql1 = `
            INSERT INTO "EncuestaRespuesta"("EncuestaPregunta_id", "EncuestaRespondida_id", "Respuesta") 
            VALUES ${valores}
        `;

        // Ejecutar la consulta de inserción
        await db.query(sql1);

        return res.status(200).json({
            ok: true,
            msg: "Encuesta respondida con éxito",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al procesar la encuesta",
        });
    }
};

export const versalasdisponiblesv2 = async (req = request, res = response) => {
    const { fproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
 SELECT *,(select Count(*) from "SalaUsuario" where "Sala_id"=sa."IdSala")  as "CantidadActualAlumnos" FROM "Sala" sa
    where "Producto_id"=${fproducto_id}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const validarpertenenciasalav2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    SELECT Count(*) FROM "SalaUsuario" sau
inner join "Sala" sa on sa."IdSala"=sau."Sala_id"
where sa."Producto_id"=${fproducto_id} and "Usuario_id"=${fusuario_id}


    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const integrarsesalav2 = async (req = request, res = response) => {
    const { fusuario_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        Insert into "SalaUsuario"("Usuario_id","Sala_id") values
        (${fusuario_id},${fsala_id});
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
export const vercursosplataformatiendaxtopv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
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
    MAX(pat."NumeroWhatsapp") AS "NumeroWhatsapp",
    MAX(pat."UltimaFechMod") AS "UltimaFechMod",
    "esc"."IdEscuela",
    "esc"."Escuela",
    "esp"."IdEspecializacion",
    "esp"."Especializacion",
    "cur"."IdCurso",
    "cur"."Curso",
    "tpo"."TipoCurso",
    (SELECT 
        JSON_AGG(CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo"))
     FROM "ProductoAdjunto" "pad"
     WHERE "pad"."Curso_id" = "cur"."IdCurso"
    ) AS "RutaImagen",
    (SELECT COUNT(*) 
     FROM "ProductoTemario" 
     WHERE "Curso_id" = "cur"."IdCurso"
    ) AS "CantidadModulos"
FROM "Producto" "pro"
INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
INNER JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
where pro."Estado_id"='1' and cur."Estado_id"='1'
GROUP BY 
    "esc"."IdEscuela",
    "esp"."IdEspecializacion",
    "esc"."Escuela",
    "esp"."Especializacion",
    "cur"."IdCurso",
    "cur"."Curso",
    "tpo"."TipoCurso"
ORDER BY "cur"."IdCurso";

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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

export const vercursosplataformatiendaxtop1v2 = async (req = request, res = response) => {
    const { fusuario_id, fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
    WITH ProductosNumerados AS (
        SELECT 
            "tmo"."TipoModalidad", 
            "pro"."IdProducto", 
            "ppr"."Precio",
            "ppr"."PrecioAnterior",
            "pat"."Descripcion",
            "pat"."Calificacion",
            "pat"."Seguidores",
            "pat"."Nivel",
            "pat"."MarcasRespaldo",
            "pat"."ExamenParcial",
            "pat"."ExamenFinal",
            "pat"."Profesores",
            "pat"."Frecuencia",
            "pat"."HorasAcademicas",
            "pat"."Estado_id",
            "pat"."NumeroWhatsapp",
            "pat"."UltimaFechMod",
            "esc"."IdEscuela",
            "esc"."Escuela",
            "esp"."IdEspecializacion",
            "esp"."Especializacion",
            "cur"."IdCurso",
            "cur"."Curso",
            "tpo"."TipoCurso",
            -- Usamos STRING_AGG para concatenar las rutas en una cadena separada por comas y envolvemos cada ruta con comillas dobles
            (SELECT 
                STRING_AGG('"' || CONCAT('/', "pad"."Tipo1", '/', "pad"."Tipo2", '/', "pad"."Tipo3", '/', "pad"."Tipo4", '/', "pad"."NombreArchivo") || '"', ',')
             FROM "ProductoAdjunto" "pad"
             WHERE "pad"."Curso_id" = "cur"."IdCurso"
            ) AS "RutaImagen",
            (SELECT COUNT(*) 
             FROM "ProductoTemario" 
             WHERE "Curso_id" = "cur"."IdCurso"
            ) AS "CantidadModulos",
            ROW_NUMBER() OVER (PARTITION BY "esc"."IdEscuela" ORDER BY "pro"."IdProducto") AS rn -- Numeración de productos por escuela
        FROM "Producto" "pro"
        INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
        INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
        INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
        INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
        INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
        INNER JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
        LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
        WHERE "pro"."Estado_id" = '1' -- Movemos el filtro aquí
    )
    SELECT 
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'TipoModalidad', "TipoModalidad",
                'IdProducto', "IdProducto",
                'Precio', "Precio",
                'PrecioAnterior', "PrecioAnterior"
            )
        ) AS "Productos",
        MAX("Descripcion") AS "Descripcion",
        MAX("Calificacion") AS "Calificacion",
        MAX("Seguidores") AS "Seguidores",
        MAX("Nivel") AS "Nivel",
        MAX("MarcasRespaldo") AS "MarcasRespaldo",
        MAX("ExamenParcial") AS "ExamenParcial",
        MAX("ExamenFinal") AS "ExamenFinal",
        MAX("Profesores") AS "Profesores",
        MAX("Frecuencia") AS "Frecuencia",
        MAX("HorasAcademicas") AS "HorasAcademicas",
        MAX("Estado_id") AS "Estado_id",
        MAX("NumeroWhatsapp") AS "NumeroWhatsapp",
        MAX("UltimaFechMod") AS "UltimaFechMod",
        "IdEscuela",
        "Escuela",
        "IdEspecializacion",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        -- Agregamos las rutas correctamente formateadas en JSON
        '[' || STRING_AGG("RutaImagen", ',') || ']' AS "RutaImagen",  
        MAX("CantidadModulos") AS "CantidadModulos"
    FROM ProductosNumerados
    WHERE rn <= 4 and "IdEscuela" in (1,2,3) -- Limitamos a los primeros 4 productos por escuela
    GROUP BY 
        "IdEscuela", 
        "Escuela", 
        "IdEspecializacion", 
        "Especializacion", 
        "IdCurso", 
        "Curso", 
        "TipoCurso"
    ORDER BY "IdEscuela";    
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
        });
        return res.status(200).json({
            ok: true,
            msg: "Información correcta",
            data,
        });

    } catch (err) {
        console.error("Error al ejecutar la consulta:", err);
        return res.status(400).json({
            ok: false,
            msg: "Error de conexión",
        });
    }
}


export const obtenersalasv2 = async (req = request, res = response) => {
    const { fcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `   
     SELECT * ,(select Count(*) from "SalaUsuario" where "Sala_id"=sa."IdSala")  as "CantidadActualAlumnos"
            FROM "Sala" sa			
            WHERE "Producto_id" IN (
            SELECT pro."IdProducto"
            FROM "Producto" pro
            INNER JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
            WHERE cur."IdCurso" = ${fcurso_id}
            );

            
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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
}


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

export const obtenersalasusuariosv2 = async (req = request, res = response) => {
    const { fsala_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `     
            SELECT * FROM "SalaUsuario" where "Sala_id"=${fsala_id}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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
}


export const crearsalav2 = async (req = request, res = response) => {
    const { fsala, fproducto_id, ffechainicio, ffechafin, fhorario, fmaximoalumnos, ffrecuencia,
        flinkwhatsapp, fnumeroreunion, fclavereunion
    } = req.body;

    // Asegurarse de que las fechas están en el formato correcto para PostgreSQL
    const fechaInicio = new Date(ffechainicio); // Esto convierte la cadena YYYY-MM-DD en un objeto Date
    const fechaFin = new Date(ffechafin);



    // Ajusta la consulta SQL a tus necesidades
    const sql = `     
         Insert into "Sala"("Sala","Producto_id","FechaInicio","FechaFin","Horario","MaximoAlumnos","Frecuencia","NumeroReunion",
         "ClaveReunion","NumeroWhatsapp") values
         ('${fsala}',${fproducto_id},'${fechaInicio.toISOString().split('T')[0]}',
         '${fechaFin.toISOString().split('T')[0]}','${fhorario}',${fmaximoalumnos},'${ffrecuencia}'
         ,'${fnumeroreunion}','${fclavereunion}','${flinkwhatsapp}')  
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
}

export const obteneridproductoxcursov2 = async (req = request, res = response) => {
    const { fcurso_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `     
         select pro."IdProducto","IdTipoModalidad" from "Producto" pro
        inner join "Curso" cur on cur."IdCurso"=pro."Curso_id"
        inner join "TipoModalidad" tpm on tpm."IdTipoModalidad"=pro."TipoModalidad_id"
        where pro."Curso_id"=${fcurso_id}
    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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
}


export const crearAreav2 = async (req = request, res = response) => {
    const { farea } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `     
        Insert into "Area" ("Area") values ('${farea}')

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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
}

export const crearPuestov2 = async (req = request, res = response) => {
    const { farea_id, fpuesto } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `     
        Insert into "Puesto" ("Area_id","Puesto") values (${farea_id},'${fpuesto}')

    `;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {
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
}

//#GESTION USUARIO
export const listaradministrarusuariov2 = async (req = request, res = response) => {
    // Ajusta la consulta SQL a tus necesidades
    const sql = `

         SELECT 
    "us"."IdUsuario",
    "us"."Usuario",
    "us"."RutaImagenPerfil",
    "us"."RutaImagenCuerpo",
    "en"."Nombres",
    "en"."Apellidos",
    COALESCE("ar"."Area", 'Externo') AS "Area",
    COALESCE("pu"."Puesto", 'Cliente') AS "Puesto",
    us."Estado_id"
FROM "Usuario" "us"
INNER JOIN "Entidad" "en" ON "en"."IdEntidad" = "us"."Entidad_id"
LEFT JOIN "Empleado" "em" ON "em"."Entidad_id" = "en"."IdEntidad"
LEFT JOIN "Area" "ar" ON "ar"."IdArea" = "em"."Area_id"
LEFT JOIN "Puesto" "pu" ON "pu"."IdPuesto" = "em"."Puesto_id"
ORDER BY "us"."IdUsuario"`
    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data = await db.query(sql, {});
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
//#GESTION USUARIO

export const insertarusuariomasivov2 = async (
    req = request,
    res = response
) => {
    const rows = req.body.data; // Asegúrate de que el frontend envíe un array de objetos
    if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: "No se recibieron datos para insertar",
        });
    }

    // Inserta en la tabla Entidad y captura los IDs generados
    const entidadSql = `
        INSERT INTO "Entidad" ("Nombres", "Apellidos", "TipoDocumento_id", "NroDocumento", "Correo", "Pais_id")
        VALUES ${rows
            .map(
                (_, index) =>
                    `(:Nombres${index}, :Apellidos${index}, 1, :NroDocumento${index}, :Correo${index}, 1)`
            )
            .join(", ")}
        RETURNING "IdEntidad";
    `;

    const entidadReplacements: Record<string, string | number> = {};
    rows.forEach((row, index) => {
        entidadReplacements[`Nombres${index}`] = row.Nombres;
        entidadReplacements[`Apellidos${index}`] = row.Apellidos;
        entidadReplacements[`NroDocumento${index}`] = row.NroDocumento;
        entidadReplacements[`Correo${index}`] = row.Correo;
    });

    try {
        // Ejecuta la inserción en Entidad
        const entidadResult = await db.query(entidadSql, {
            replacements: entidadReplacements,
        });

        const entidadIds = entidadResult[0].map((row: any) => row.IdEntidad); // Captura los IDs generados

        // Inserta en la tabla Usuario
        const usuarioSql = `
            INSERT INTO "Usuario" ("Usuario", "Clave", "FcIngreso", "Entidad_id")
            VALUES ${rows
                .map(
                    (_, index) =>
                        `(:Usuario${index}, :NroDocumento${index}, :FcIngreso${index}, :Entidad_id${index})`
                )
                .join(", ")};
        `;

        const usuarioReplacements: Record<string, string | number> = {};
        rows.forEach((row, index) => {
            usuarioReplacements[`Usuario${index}`] = row.Usuario;
            usuarioReplacements[`NroDocumento${index}`] = row.NroDocumento;
            const fechaIngreso = new Date(row.FcIngreso); // Convierte a objeto Date
            usuarioReplacements[`FcIngreso${index}`] = fechaIngreso
                .toISOString()
                .split("T")[0]; // Obtiene formato YYYY-MM-DD
            usuarioReplacements[`Entidad_id${index}`] = entidadIds[index]; // Usa el ID generado
        });

        // Ejecuta la inserción en Usuario
        await db.query(usuarioSql, {
            replacements: usuarioReplacements,
        });

        return res.status(200).json({
            ok: true,
            msg: "Inserción masiva completada",
        });
    } catch (err) {
        console.error("Error en la inserción masiva:", err);
        return res.status(500).json({
            ok: false,
            msg: "Error durante la inserción masiva",
        });
    }
};
export const crearsignaturezoomv2 = async (req = request, res = response) => {
    const schemaValidations = [isRequiredAllOrNone(["meetingNumber", "role"])];

    const propValidations = {
        role: inNumberArray([0, 1]),
        expirationSeconds: isBetween(1800, 172800),
    };

    const coerceRequestBody = (body: any) => ({
        ...body,
        ...["role", "expirationSeconds"].reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: typeof body[cur] === "string" ? parseInt(body[cur]) : body[cur],
            }),
            {}
        ),
    });

    const requestBody = coerceRequestBody(req.body);
    const validationErrors = validateRequest(
        requestBody,
        propValidations,
        schemaValidations
    );

    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const { meetingNumber, role, expirationSeconds } = requestBody;
    const iat = Math.floor(Date.now() / 1000);
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
    const oHeader = { alg: "HS256", typ: "JWT" };

    const oPayload = {
        appKey: process.env.ZOOM_MEETING_SDK_KEY,
        sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
        mn: meetingNumber,
        role,
        iat,
        exp,
        tokenExp: exp,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const sdkJWT = KJUR.jws.JWS.sign(
        "HS256",
        sHeader,
        sPayload,
        process.env.ZOOM_MEETING_SDK_SECRET
    );
    return res.json({ signature: sdkJWT });
};








// New Endpoints

export const vercursosplataformamineria = async (
    req = request,
    res = response
) => {
    const { IdEspecializacion, Escuela, TipoCurso, Palabra } = req.body;

    if (!Escuela) {
        return res.status(400).json({
            ok: false,
            msg: "El campo 'Escuela' es obligatorio.",
        });
    }

    // Construcción dinámica de condiciones
    const whereClauses = [`"esc"."Escuela" = :Escuela`]; // Siempre filtramos por escuela

    if (IdEspecializacion && IdEspecializacion.length > 0) {
        whereClauses.push(`"cur"."Especializacion_id" IN (:IdEspecializacion) AND "pad"."Tipo1" = "Multimedia" AND "pad"."Tipo2" = "Imagen"`);
    }

    if (TipoCurso) {
        whereClauses.push(`"tpo"."TipoCurso" = :TipoCurso AND "pad"."Tipo1" = "Multimedia" AND "pad"."Tipo2" = "Imagen"`);
    }

    if (Palabra) {
        whereClauses.push(`"cur"."Curso" ILIKE :Palabra AND "pad"."Tipo1" = "Multimedia" AND "pad"."Tipo2" = "Imagen"`);
    }

    const whereClause = whereClauses.join(" AND ");

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
LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
WHERE ${whereClause} 
GROUP BY
  "esc"."Escuela",
  "esp"."Especializacion",
  "cur"."IdCurso",
  "cur"."Curso",
  "tpo"."TipoCurso";

        `;

    try {
        const data = await db.query(sql, {
            replacements: {
                IdEspecializacion: IdEspecializacion || [],
                Escuela,
                TipoCurso,
                Palabra: `%${Palabra || ""}%`,
            },
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

// Especializaciones de Minería
export const verespecializacionesmineria = async (
    req = request,
    res = response
) => {
    const { Escuela } = req.body; // Añadimos 'Escuela' al body.

    const sql = `
      SELECT
        "esp"."IdEspecializacion",
        "esp"."Especializacion",
        COUNT("cur"."IdCurso") AS "CantidadCursos"
      FROM "Especializacion" "esp"
      INNER JOIN "Curso" "cur" ON "cur"."Especializacion_id" = "esp"."IdEspecializacion"
      INNER JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
      INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
      WHERE "esp"."Estado_id" = '1' AND "esc"."Escuela" = :Escuela AND "pad"."Tipo1" = 'Multimedia' AND "pad"."Tipo2" = 'Imagen'
      GROUP BY "esp"."IdEspecializacion", "esp"."Especializacion"
      ORDER BY "esp"."IdEspecializacion";
    `;

    try {
        const data = await db.query(sql, {
            replacements: { Escuela }, // Reemplazamos 'Escuela'.
        });
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

// Backend: Obtener detalles del curso por IdCurso
export const getcursodetalle = async (req = request, res = response) => {
    const { IdCurso } = req.body;

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
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoPrecio" "ppr" ON "ppr"."Producto_id" = "pro"."IdProducto"
   WHERE "cur"."IdCurso" = :IdCurso
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
            replacements: { IdCurso },
        });

        if (!data.length) {
            return res.status(404).json({
                ok: false,
                msg: "Curso no encontrado",
            });
        }

        return res.status(200).json({
            ok: true,
            data: data[0], // Enviar solo el primer curso
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            msg: "Error al buscar el curso",
        });
    }
};




// Backend: Obtener IdCurso por Slug
interface Curso {
    IdCurso: number
}

export const getidcursoporslug = async (req: any, res: any) => {
    const { Slug } = req.body;

    try {
        const findIdSql = `SELECT IdCurso FROM Curso WHERE Curso = :Slug`;

        // Hacemos la consulta, el primer elemento es el resultado de la consulta
        const result: [unknown[], unknown] = await db.query(findIdSql, { replacements: { Slug } });

        // Hacemos un type assertion para convertir 'result[0]' en un arreglo de tipo 'Curso[]'
        const results = result[0] as Curso[];

        // Verifica si los resultados están vacíos
        if (!results || results.length === 0) {
            return res.status(404).json({ ok: false, msg: "Curso no encontrado" });
        }

        const IdCurso = results[0].IdCurso; // Accede al IdCurso del primer resultado
        return res.status(200).json({ ok: true, IdCurso });
    } catch (err) {
        console.error("Error al ejecutar la consulta:", err);
        return res.status(500).json({ ok: false, msg: "Error al buscar el curso" });
    }
};


export const getCursoDetalleBySlug = async (req = request, res = response) => {
    const { slug } = req.body;

    if (!slug) {
        return res.status(400).json({
            ok: false,
            msg: "El campo 'slug' es obligatorio.",
        });
    }

    try {
        // Normalizamos el slug para obtener el nombre del curso
        const normalizedSlug = slug
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/-/g, " ");

        // Query para obtener los detalles del curso
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
        WHERE LOWER("cur"."Curso") = :normalizedSlug
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

        const data = await db.query(sql, {
            replacements: { normalizedSlug },
        });

        if (data[0].length === 0) {
            return res.status(404).json({
                ok: false,
                msg: "Curso no encontrado.",
            });
        }

        return res.status(200).json({
            ok: true,
            msg: "Detalles del curso obtenidos correctamente.",
            data: data[0][0],
        });
    } catch (error) {
        console.error("Error al obtener los detalles del curso:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor.",
        });
    }
};




export const listartemariointrov2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id } = req.body; // Añadimos 'Escuela' al body.

    const sql = `
    select CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo") as "RutaVideo",pa."Curso_id" from "ProductoIntroduccion" pa
    inner join "Producto" pro on pro."Curso_id"=pa."Curso_id"
    where pro."IdProducto"=${fproducto_id}
    `;

    try {
        const data = await db.query(sql, {
        });
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
export const listardatoscertificadogenerarv2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id, fusuario_id } = req.body; // Añadimos 'Escuela' al body.

    const sql = `

    SELECT 
    AVG(evn."Nota") AS NotaFinal,
    cur."Curso" AS "Curso",
    cur."IdCurso",
    pta."HorasAcademicas",
    tpr."TipoCurso",
    cer."CodigoCertificado",
    json_agg(
        DISTINCT jsonb_build_object(
            'id', pt."IdProductoTemario",
            'nombre', pt."ProductoTemario",
            'numeracion', pt."Numeracion"
        )
    ) AS TemarioArray
FROM 
    "Producto" pro
INNER JOIN 
    "Curso" cur ON cur."IdCurso" = pro."Curso_id"
INNER JOIN 
    "ProductoTemario" pt ON pt."Curso_id" = cur."IdCurso"
INNER JOIN 
    "ProductoAtributo" pta ON pta."Curso_id" = cur."IdCurso"
INNER JOIN 
    "TipoCurso" tpr ON tpr."IdTipoCurso" = cur."TipoCurso_id"
INNER JOIN 
    "Evaluacion" ev ON ev."Curso_id" = pro."Curso_id"
INNER JOIN 
    "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
LEFT JOIN 
    "Certificado" cer ON cer."Producto_id" = pro."IdProducto"
WHERE 
    pro."IdProducto" = ${fproducto_id}
    AND evn."Usuario_id" = ${fusuario_id}   
    AND evn."Sala_id" IS NULL
GROUP BY 
    cur."Curso", cur."IdCurso", pta."HorasAcademicas", tpr."TipoCurso", cer."CodigoCertificado";

    `;

    try {
        const data = await db.query(sql, {
        });
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
export const listardatoscertificadogenerarvivov2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id, fusuario_id, psala_id } = req.body; // Añadimos 'Escuela' al body.

    const sql = `
SELECT 
    AVG(evn."Nota") AS NotaFinal,
    cur."Curso" AS "Curso",
    cur."IdCurso",
    pta."HorasAcademicas",
    tpr."TipoCurso",
    cer."CodigoCertificado",
    json_agg(
        DISTINCT jsonb_build_object(
            'id', pt."IdProductoTemario",
            'nombre', pt."ProductoTemario",
            'numeracion', pt."Numeracion"
        )
    ) AS TemarioArray
FROM 
    "Producto" pro
INNER JOIN 
    "Curso" cur ON cur."IdCurso" = pro."Curso_id"
INNER JOIN 
    "ProductoTemario" pt ON pt."Curso_id" = cur."IdCurso"
INNER JOIN 
    "ProductoAtributo" pta ON pta."Curso_id" = cur."IdCurso"
INNER JOIN 
    "TipoCurso" tpr ON tpr."IdTipoCurso" = cur."TipoCurso_id"
INNER JOIN 
    "Evaluacion" ev ON ev."Producto_id" = pro."IdProducto"
INNER JOIN 
    "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
LEFT JOIN 
    "Certificado" cer ON cer."Curso_id" = pro."Curso_id"
WHERE 
    pro."Curso_id" = (SELECT "Curso_id" FROM "Producto" WHERE "IdProducto" = ${fproducto_id}  ) 
    AND evn."Usuario_id" = ${fusuario_id}   
    AND evn."Sala_id"=${psala_id}
GROUP BY 
    cur."Curso", cur."IdCurso", pta."HorasAcademicas", tpr."TipoCurso", cer."CodigoCertificado";

    `;

    try {
        const data = await db.query(sql, {
        });
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
export const guardarcertificadov2 = async (
    req = request,
    res = response
) => {
    const { fcodigocertificado, fusuario_id, fproducto_id, ftipo } = req.body; // Añadimos 'Escuela' al body.

    const sql = `

INSERT into "Certificado" ("CodigoCertificado","Usuario_id","Producto_id","Tipo") values 
	('${fcodigocertificado}',${fusuario_id},${fproducto_id},'${ftipo}')
    `;

    try {
        const data = await db.query(sql, {
        });
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


export const asignarcursoadminv2 = async (req = request, res = response) => {
  const { fproducto_id, fusuario_id, fprecio, fsala_id } = req.body;
  try {
    // Validar si el usuario ya tiene el curso
    const sqlValidar = `
      SELECT COUNT(*) AS count FROM "ProductoStock"
      WHERE "Usuario_id" = :usuarioId AND "Producto_id" = :productoId
    `;
    if (fsala_id) {
      // Validar si el usuario ya tiene el curso y sala
      const sqlValidarSala = `
        SELECT COUNT(*) AS count
        FROM "ProductoStock" pst
        INNER JOIN "SalaUsuario" sau ON sau."Usuario_id" = pst."Usuario_id"
        WHERE pst."Usuario_id" = :usuarioId AND pst."Producto_id" = :productoId AND sau."Sala_id" = :salaId
      `;
      const resultado2: any = await db.query(sqlValidarSala, {
        replacements: { usuarioId: fusuario_id, productoId: fproducto_id, salaId: fsala_id },
      });
      if (resultado2[0][0].count > 0) {
        return res.status(400).json({
          ok: false,
          msg: "El usuario ya tiene asignado este curso con la sala seleccionada.",
        });
      }
    } else {
      const resultado: any = await db.query(sqlValidar, {
        replacements: { usuarioId: fusuario_id, productoId: fproducto_id },
      });
      if (resultado[0][0].count > 0) {
        return res.status(400).json({
          ok: false,
          msg: "El usuario ya tiene asignado este curso.",
        });
      }
    }
    // Insertar el curso
    const sqlInsertVenta = `
      INSERT INTO "RegistroVenta" ("Usuario_id","Producto_id","PrecioVenta","FechaCompra")
      VALUES (:usuarioId, :productoId, :precio, CURRENT_TIMESTAMP)
    `;
    await db.query(sqlInsertVenta, {
      replacements: { usuarioId: fusuario_id, productoId: fproducto_id, precio: fprecio },
    });
    const sqlInsertStock = `
      INSERT INTO "ProductoStock" ("Usuario_id", "Producto_id", "StockDisponible")
      VALUES (:usuarioId, :productoId, 1)
    `;
    await db.query(sqlInsertStock, {
      replacements: { usuarioId: fusuario_id, productoId: fproducto_id },
    });
    // Insertar la sala si aplica
    if (fsala_id) {
      const sqlInsertSala = `
        INSERT INTO "SalaUsuario" ("Usuario_id", "Sala_id", "Estado_id")
        VALUES (:usuarioId, :salaId, 1)
      `;
      await db.query(sqlInsertSala, {
        replacements: { usuarioId: fusuario_id, salaId: fsala_id },
      });
    }
    return res.status(200).json({
      ok: true,
      msg: "Curso asignado correctamente.",
    });
  } catch (err) {
    console.error("Error al asignar curso:", err);
    return res.status(500).json({
      ok: false,
      msg: "Error al asignar curso.",
    });
  }
};

export const acreditacionescertificadosv2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id } = req.body; // Añadimos 'Escuela' al body.
    const sql = `
        select "MarcasRespaldo" from "ProductoAtributo" pat 
        inner join "Producto" pro on pro."Curso_id"=pat."Curso_id"
        where pro."IdProducto"=${fproducto_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const asignarcursocarritov2 = async (req = request, res = response) => {
    const { fdata, fusuario_id } = req.body; // fdata es un array con los datos a insertar.

    // Validar datos básicos
    if (!fdata || !Array.isArray(fdata) || fdata.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: "El campo fdata debe ser un array con al menos un elemento.",
        });
    }

    if (!fusuario_id) {
        return res.status(400).json({
            ok: false,
            msg: "El campo fusuario_id es obligatorio.",
        });
    }

    // SQL para inserciones
    const sqlRegistroVenta = `
        INSERT INTO "RegistroVenta" ("Usuario_id", "Producto_id", "PrecioVenta", "FechaCompra")
        VALUES (:usuarioId, :productoId, :precioVenta, CURRENT_TIMESTAMP);
    `;
    const sqlProductoStock = `
        INSERT INTO "ProductoStock" ("Usuario_id", "Producto_id", "StockDisponible")
        VALUES (:usuarioId, :productoId, 1);
    `;

    try {
        // Iniciar una transacción
        const transaction = await db.transaction();

        try {
            // Mapear fdata e insertar datos
            for (const item of fdata) {
                const { IdProducto, Precio } = item;

                if (!IdProducto || !Precio) {
                    throw new Error(
                        `Los campos IdProducto y Precio son obligatorios en cada elemento de fdata.`
                    );
                }

                // Inserción en RegistroVenta
                await db.query(sqlRegistroVenta, {
                    replacements: {
                        usuarioId: fusuario_id,
                        productoId: IdProducto,
                        precioVenta: Precio,
                    },
                    transaction,
                });

                // Inserción en ProductoStock
                await db.query(sqlProductoStock, {
                    replacements: {
                        usuarioId: fusuario_id,
                        productoId: IdProducto,
                    },
                    transaction,
                });
            }

            // Confirmar transacción
            await transaction.commit();

            return res.status(200).json({
                ok: true,
                msg: "Todos los productos fueron asignados correctamente.",
            });
        } catch (err) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Error durante la transacción:", err);
        return res.status(400).json({
            ok: false,
            msg: "Ocurrió un error al asignar los productos.",
        });
    }
};


export const comprarplannopremiumv2 = async (req = request, res = response) => {
    const { fdata, fusuario_id, fplan_id, fprecioplan } = req.body; // fdata es un array con los datos a insertar.

    // Validar datos básicos
    if (!fdata || !Array.isArray(fdata) || fdata.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: "El campo fdata debe ser un array con al menos un elemento.",
        });
    }

    if (!fusuario_id) {
        return res.status(400).json({
            ok: false,
            msg: "El campo fusuario_id es obligatorio.",
        });
    }

    // SQL para inserciones
    const sqlRegistroVenta = `
        INSERT INTO "RegistroVenta" ("Usuario_id", "Plan_id", "PrecioVenta", "FechaCompra")
        VALUES (:usuarioId, :plan_id, :precioVenta, CURRENT_TIMESTAMP) RETURNING "IdRegistroVenta";
    `;
    const sqlProductoStock = `
        INSERT INTO "ProductoStock" ("Usuario_id", "Producto_id", "StockDisponible","RegistroVenta_id")
        VALUES (:usuarioId, :productoId, 1,:registroventaid);
    `;

    try {
        // Iniciar una transacción
        const transaction = await db.transaction();

        try {
            // Mapear fdata e insertar datos
            for (const item of fdata) {
                const { IdProducto, Precio } = item;

                if (!IdProducto || !Precio) {
                    throw new Error(
                        `Los campos IdProducto y Precio son obligatorios en cada elemento de fdata.`
                    );
                }

                // Inserción en RegistroVenta
                const resultRegistroVenta = await db.query(sqlRegistroVenta, {
                    replacements: {
                        usuarioId: fusuario_id,
                        plan_id: fplan_id,
                        precioVenta: fprecioplan,
                    },
                    transaction,
                });

                const registroVentaId = (resultRegistroVenta as any)[0][0].IdRegistroVenta;
                // Inserción en ProductoStock
                await db.query(sqlProductoStock, {
                    replacements: {
                        usuarioId: fusuario_id,
                        productoId: IdProducto,
                        registroventaid: registroVentaId, // Usar el id obtenido de RegistroVenta
                    },
                    transaction,
                });
            }

            // Confirmar transacción
            await transaction.commit();

            return res.status(200).json({
                ok: true,
                msg: "Todos los productos fueron asignados correctamente.",
            });
        } catch (err) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Error durante la transacción:", err);
        return res.status(400).json({
            ok: false,
            msg: "Ocurrió un error al asignar los productos.",
        });
    }
};


export const comprarplanpremiumv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fplan_id, fprecioplan } = req.body; // fdata es un array con los datos a insertar.
    const sql = `
        Insert INTO "RegistroVenta" ("Usuario_id","Plan_id","PrecioVenta","FechaCompra") values
        (${fusuario_id},${fplan_id},${fprecioplan},CURRENT_TIMESTAMP);
    `;
    const sql1 = `
    update  "Usuario" set "Premium"=1 where "IdUsuario"=${fusuario_id};
`;
    try {
        const data = await db.query(sql, {
        });
        const data1 = await db.query(sql1, {
        });
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

export const listarplanv2 = async (
    req = request,
    res = response
) => {
    const sql = `
       SELECT * FROM "Plan";
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};



export const vermodalidadescursov2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id, } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
        select "IdProducto","Precio","TipoModalidad",pro."Estado_id" from "Producto" pro 
        inner join "ProductoPrecio" pre on pre."Producto_id"=pro."IdProducto"
        inner join "TipoModalidad" tp on tp."IdTipoModalidad"=pro."TipoModalidad_id"
        where "Curso_id"=${fcurso_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const administradoractualizarmodalidadesv2 = async (
    req = request,
    res = response
) => {
    const { fdata }: { fdata: any[] } = req.body; // Definir fdata como un array de tipo any

    try {
        // Iniciar una transacción
        await db.transaction(async (t) => {
            for (const item of fdata) {
                await db.query(
                    `UPDATE "Producto" SET "Estado_id" = $1 WHERE "IdProducto" = $2`,
                    {
                        bind: [item.Estado_id, item.IdProducto],
                        transaction: t,
                    }
                );
                await db.query(
                    `UPDATE "ProductoPrecio" SET "Precio" = $1 WHERE "Producto_id" = $2`,
                    {
                        bind: [item.Precio, item.IdProducto],
                        transaction: t,
                    }
                );
            }
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const verevaluacionescursov2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
        select * from "Evaluacion"  where "Curso_id"=${fcurso_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const verpreguntasxtipoxcursov2 = async (
    req = request,
    res = response
) => {
    const { fbancopregunta_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
    SELECT
  pre."IdPregunta",
  pre."Pregunta",
  pre."TipoPregunta",
  pre."RespuestaCorrecta",
  json_agg(
    DISTINCT jsonb_build_object(
      'IdRespuesta', res."IdRespuesta",
      'Respuesta', res."Respuesta",
      'Orden', res."Orden"
    )
  ) AS Respuestas
FROM "Pregunta" pre
INNER JOIN "Respuesta" res ON res."Pregunta_id" = pre."IdPregunta"
INNER JOIN "BancoPregunta" bp ON bp."IdBancoPregunta" = pre."BancoPregunta_id"
where pre."BancoPregunta_id"=${fbancopregunta_id}
GROUP BY pre."IdPregunta";
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const guardarpreguntasadmin = async (req = request,
    res = response) => {
    const { preguntas, fbancopregunta_id } = req.body; // preguntas es un array de preguntas y sus respuestas.

    try {
        // Iteramos sobre las preguntas y las insertamos o actualizamos.
        for (let i = 0; i < preguntas.length; i++) {
            const pregunta = preguntas[i];

            if (pregunta.IdPregunta == 0) {
                const resultPregunta: any = await db.query(
                    `INSERT INTO "Pregunta" ("Pregunta", "TipoPregunta", "RespuestaCorrecta", "BancoPregunta_id")
                    VALUES ('${pregunta.Pregunta}', '${pregunta.TipoPregunta}', '${pregunta.RespuestaCorrecta}', ${fbancopregunta_id})   
                    RETURNING "IdPregunta"`
                );
                console.log(resultPregunta)
                for (let j = 0; j < pregunta.respuestas.length; j++) {
                    const respuesta = pregunta.respuestas[j];
                    await db.query(
                        `INSERT INTO "Respuesta" ("Respuesta", "Orden", "Pregunta_id")
                        VALUES ('${respuesta.Respuesta}',${respuesta.Orden}, ${resultPregunta[0][0].IdPregunta})`
                    );
                }
            }

        }

        return res.status(200).json({
            ok: true,
            msg: "Preguntas y respuestas guardadas correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al guardar preguntas y respuestas",
        });
    }
};

export const listarcertificadoacreditaciones = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
  WITH ProfesoresProcesados AS (
        SELECT
            "pro"."IdProducto",
            UNNEST(string_to_array(MAX("pat"."Profesores"), ',')::int[]) AS "ProfesorId"
        FROM "Producto" "pro"
        LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "pro"."Curso_id"
        GROUP BY "pro"."IdProducto"
    )
    SELECT
        SUM(
        CASE 
            WHEN tmo."TipoModalidad" = 'En Vivo' 
            THEN (SELECT count(distinct ev."IdEvaluacion")
                  FROM "Evaluacion" ev
                  LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                  WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" = sa."IdSala"
                  AND evn."Usuario_id"=${fusuario_id})
            WHEN tmo."TipoModalidad" = 'Asincrónico' 
            THEN (SELECT count(distinct ev."IdEvaluacion")
                  FROM "Evaluacion" ev
                  LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
                  WHERE ev."Curso_id" = cur."IdCurso"
                  AND evn."IdEvaluacionNota" IS NOT NULL 
                  AND evn."Sala_id" IS NULL
                   AND evn."Usuario_id"=${fusuario_id})
            ELSE 0
        END
    )+( SELECT COUNT(DISTINCT e."IdEncuesta")
               FROM "Encuesta" e
               LEFT JOIN "EncuestaRespondida" er 
                 ON er."Encuesta_id" = e."IdEncuesta"
               WHERE er."Producto_id" ="pro"."IdProducto" and er."Usuario_id"=${fusuario_id}) AS "Progreso",
    
        (
            SELECT COUNT(*)
            FROM "Evaluacion" eval
            WHERE eval."Curso_id" =  cur."IdCurso"
        ) +
        (
            SELECT COUNT(*)
            FROM "Encuesta"
        ) AS "ProgresoTotal",
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'TipoModalidad', "tmo"."TipoModalidad",
                'IdProducto', "pro"."IdProducto",
                'Sala', "sa"."Sala"
            )
        ) AS "Productos",
        (
            SELECT JSON_AGG("RutaImagenPerfil")
            FROM "Usuario"
            WHERE "IdUsuario" IN (
                SELECT "ProfesorId"
                FROM ProfesoresProcesados pp
                WHERE pp."IdProducto" = "pro"."IdProducto"
            )
        ) AS "RutaImagenPerfil",
    (select Count(*) from "SalaUsuario" where "Usuario_id"=${fusuario_id}  and "Sala_id"=MAX("sa"."IdSala")) as "Inscrito",
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
        CONCAT(
                    '/', COALESCE(pad."Tipo1", ''), 
                    '/', COALESCE(pad."Tipo2", ''), 
                    '/', COALESCE(pad."Tipo3", ''), 
                    '/', COALESCE(pad."Tipo4", ''), 
                    '/', COALESCE(pad."NombreArchivo", '')) as "RutaImagen",
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto"
    FROM "Producto" "pro"
    INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
    INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
    INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
    INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
    LEFT JOIN "ProductoAdjunto" "pad" ON "pad"."Curso_id" = "cur"."IdCurso"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
    INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
    LEFT JOIN "Sala" "sa" ON "sa"."Producto_id" = "pro"."IdProducto"
    WHERE "pst"."Usuario_id" = ${fusuario_id} and "pro"."IdProducto"=${fproducto_id}
    GROUP BY
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto",
        pad."Tipo1",
        pad."Tipo2",
        pad."Tipo3",
        pad."Tipo4",
        pad."NombreArchivo";


    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const listarcertificadoacreditacionesvivo = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id, psala_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `


    WITH ProfesoresProcesados AS (
        SELECT
        "pro"."IdProducto",
        UNNEST(string_to_array(MAX("pat"."Profesores"), ',')::int[]) AS "ProfesorId"
    FROM "Producto" "pro"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "pro"."Curso_id"
    GROUP BY "pro"."IdProducto"
    )
   SELECT SUM(
    CASE 
        WHEN tmo."TipoModalidad" = 'En Vivo' 
        THEN (SELECT count(distinct ev."IdEvaluacion")
              FROM "Evaluacion" ev
              LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
              WHERE ev."Producto_id" = (SELECT "Curso_id" FROM "Producto" WHERE "IdProducto"="pro"."IdProducto")
              AND evn."IdEvaluacionNota" IS NOT NULL 
              AND evn."Sala_id" = sa."IdSala")
        WHEN tmo."TipoModalidad" = 'Asincrónico' 
        THEN (SELECT count(distinct ev."IdEvaluacion")
              FROM "Evaluacion" ev
              LEFT JOIN "EvaluacionNota" evn ON evn."Evaluacion_id" = ev."IdEvaluacion"
              WHERE ev."Producto_id" = (SELECT "Curso_id" FROM "Producto" WHERE "IdProducto"="pro"."IdProducto")
              AND evn."IdEvaluacionNota" IS NOT NULL 
              AND evn."Sala_id" IS NULL)
        ELSE 0
    END
)+( SELECT COUNT(DISTINCT e."IdEncuesta")
           FROM "Encuesta" e
           LEFT JOIN "EncuestaRespondida" er 
             ON er."Encuesta_id" = e."IdEncuesta"
           WHERE er."Producto_id" =${fproducto_id} and er."Usuario_id"=${fusuario_id}) AS "Progreso",

    (
        SELECT COUNT(*)
        FROM "Evaluacion"
        WHERE "Producto_id" = (select "Curso_id" from "Producto" where "IdProducto"="pro"."IdProducto")
    ) +
    (
        SELECT COUNT(*)
        FROM "Encuesta"
    ) AS "ProgresoTotal",
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'TipoModalidad', "tmo"."TipoModalidad",
                'IdProducto', "pro"."IdProducto",
                'Sala', "sa"."Sala"
            )
        ) AS "Productos",
        (
            SELECT "RutaImagenPerfil"
            FROM "Usuario"
            WHERE "IdUsuario" IN (
                SELECT "ProfesorId"
                FROM ProfesoresProcesados pp
                WHERE pp."IdProducto" = "pro"."IdProducto"
            )
        ) AS "RutaImagenPerfil",
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
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto"
    FROM "Producto" "pro"
    INNER JOIN "Curso" "cur" ON "cur"."IdCurso" = "pro"."Curso_id"
    INNER JOIN "Especializacion" "esp" ON "esp"."IdEspecializacion" = "cur"."Especializacion_id"
    INNER JOIN "Escuela" "esc" ON "esc"."IdEscuela" = "esp"."Escuela_id"
    INNER JOIN "TipoCurso" "tpo" ON "tpo"."IdTipoCurso" = "cur"."TipoCurso_id"
    LEFT JOIN "ProductoAtributo" "pat" ON "pat"."Curso_id" = "cur"."IdCurso"
    INNER JOIN "ProductoStock" "pst" ON "pst"."Producto_id" = "pro"."IdProducto"
    INNER JOIN "TipoModalidad" "tmo" ON "tmo"."IdTipoModalidad" = "pro"."TipoModalidad_id"
    LEFT JOIN "Sala" "sa" ON "sa"."Producto_id" = "pro"."IdProducto"
    WHERE "pst"."Usuario_id" = ${fusuario_id} 
	and "pro"."Curso_id" = (SELECT "Curso_id" FROM "Producto" WHERE "IdProducto"=${fproducto_id})
	and sa."IdSala"=${psala_id}
    GROUP BY 
        "Escuela",
        "Especializacion",
        "IdCurso",
        "Curso",
        "TipoCurso",
        "pro"."IdProducto";

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarinputlayoutv2 = async (
    req = request,
    res = response
) => {
    const sql = `
      	select "Curso", CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" from "Curso" cur
	inner join "ProductoAdjunto" pa on pa."Curso_id"=cur."IdCurso" 
	where "Tipo4"='PortadaFinal'
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarpreguntasyrespuestasv2 = async (
    req = request,
    res = response
) => {
    const { fproductotemario_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
    SELECT 
    -- Usuario de la pregunta
    initcap(en."Nombres" || ' ' || en."Apellidos") AS "UsuarioPregunta",
    us."RutaImagenPerfil" AS "RutaImagenPerfilPregunta",
    vp."Pregunta",
    vp."Fecha" AS "FechaPregunta",
    vp."IdVideoPregunta",
    -- Respuestas
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'Respuesta', vr."Respuesta",
                'FechaRespuesta', vr."Fecha",
                'UsuarioRespuesta_id', vr."Usuario_id",
                'RutaImagenPerfilRespuesta', u2."RutaImagenPerfil", 
                'UsuarioRespuesta', initcap(en2."Nombres" || ' ' || en2."Apellidos")  
            )
        ) FILTER (WHERE vr."IdVideoRespuesta" IS NOT NULL), '[]'
    ) AS "Respuestas",
    vp."Usuario_id" AS "UsuarioPreguntaId"
FROM 
    "VideoPregunta" vp
LEFT JOIN 
    "Usuario" us ON us."IdUsuario" = vp."Usuario_id"
LEFT JOIN 
    "Entidad" en ON en."IdEntidad" = us."Entidad_id"
LEFT JOIN 
    "VideoRespuesta" vr ON vr."VideoPregunta_id" = vp."IdVideoPregunta"
LEFT JOIN 
    "Usuario" u2 ON u2."IdUsuario" = vr."Usuario_id"
LEFT JOIN 
    "Entidad" en2 ON en2."IdEntidad" = u2."Entidad_id"
WHERE 
    vp."ProductoTemario_id" = ${fproductotemario_id}
GROUP BY 
    us."RutaImagenPerfil", vp."Pregunta", vp."Fecha", vp."Usuario_id", 
    en."Nombres", en."Apellidos", vp."IdVideoPregunta"
ORDER BY 
    "FechaPregunta" DESC;

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const insertarpreguntav2 = async (
    req = request,
    res = response
) => {
    const { fpregunta, fusuario_id, fproductotemario_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
      INSERT INTO "VideoPregunta" (
    "Pregunta", 
    "Usuario_id", 
    "ProductoTemario_id", 
    "Fecha"
) VALUES 
(
    '${fpregunta}', 
    ${fusuario_id}, 
    ${fproductotemario_id}, 
    CURRENT_TIMESTAMP
    
);
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const insertarrespuestav2 = async (
    req = request,
    res = response
) => {
    const { frespuesta, fusuario_id, fvideopregunta_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
      INSERT INTO "VideoRespuesta" (
    "Respuesta", 
    "Usuario_id", 
    "VideoPregunta_id", 
    "Fecha"
) VALUES 
(
    '${frespuesta}', 
    ${fusuario_id}, 
    ${fvideopregunta_id}, 
    CURRENT_TIMESTAMP
    
);
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listardatosalasv2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id, fsala_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
     select * from "Sala" where "Producto_id"=${fproducto_id} and "Sala"='${fsala_id}'
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listarProductoTemariov2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
     select * from "ProductoTemario"
     where "Curso_id"=${fcurso_id} 
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listardocentesv2 = async (
    req = request,
    res = response
) => {

    const sql = `
     select * from "Usuario" us
    inner join "Entidad" en on en."IdEntidad"=us."Entidad_id"
    inner join "Empleado" em on em."Entidad_id"=en."IdEntidad"
    where "Area_id"=1


    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const agregardocentesalav2 = async (
    req = request,
    res = response
) => {
    const { fsala_id, fusuario_id } = req.body; // fdata es un array con los datos a insertar.
    const sqlCheck = `
        SELECT COUNT(*) FROM "SalaUsuario" 
        WHERE "Usuario_id" = ${fusuario_id} AND "Sala_id" = ${fsala_id};
    `;

    try {
        const countResult: any = await db.query(sqlCheck);
        const count = parseInt(countResult[0][0].count, 10);

        if (count == 0) {
            const sqlInsert = `
            INSERT INTO "SalaUsuario" ("Usuario_id", "Sala_id") 
            VALUES (${fusuario_id}, ${fsala_id});
        `;

            await db.query(sqlInsert);
        }



        return res.status(200).json({
            ok: true,
            msg: "Usuario agregado correctamente a la sala.",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            msg: "Error al agregar usuario a la sala.",
        });
    }
};
export const listardocentesalav2 = async (
    req = request,
    res = response
) => {
    const { fsala_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
select * from "Usuario" us
inner join "Entidad" en on en."IdEntidad"=us."Entidad_id"
inner join "Empleado" em on em."Entidad_id"=en."IdEntidad"
inner join "SalaUsuario" sau on sau."Usuario_id"=us."IdUsuario"
where "Area_id"=1 and "Sala_id"=${fsala_id}


    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarcalendariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
    select * from "Sala" sa 
    inner join "SalaUsuario" sau on sau."Sala_id"=sa."IdSala"
    inner join "Producto" pro on pro."IdProducto"=sa."Producto_id"
    inner join "Curso" cur on cur."IdCurso"=pro."Curso_id"
    where sau."Usuario_id"=${fusuario_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listarevaluacionvivov2 = async (
    req = request,
    res = response
) => {
    const { fevaluacion_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
        SELECT evv.* 
		FROM "Evaluacion" ev
		INNER JOIN "Producto" pro ON pro."IdProducto" = ev."Producto_id"
		INNER JOIN "EvaluacionVivo" evv 
		ON evv."IdEvaluacionVivo" = ANY(string_to_array(ev."EvaluacionVivo_id", ',')::INTEGER[])
		WHERE ev."IdEvaluacion"=${fevaluacion_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarsalasevaluacionv2 = async (
    req = request,
    res = response
) => {
    const { fevaluacion_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
       SELECT * FROM "Evaluacion" ev
        inner join "Sala" sa on (select "Curso_id" from "Producto" where "IdProducto"=sa."Producto_id")=(select "Curso_id" from "Producto" where "IdProducto"=ev."Producto_id")
        where ev."IdEvaluacion"=${fevaluacion_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const agregarsalaevaluacionv2 = async (req = request, res = response) => {
    const { fsala_id, ffechainicio, ffechafin, fevaluacion_id } = req.body;

    try {
        // 1. Verificar si ya existe un registro en "EvaluacionVivo" con la misma "Sala_id"
        const sqlCheckSala = `
           SELECT evv.* 
		FROM "Evaluacion" ev
		inner JOIN "EvaluacionVivo" evv 
		ON evv."IdEvaluacionVivo" = ANY(string_to_array(ev."EvaluacionVivo_id", ',')::INTEGER[])
		WHERE evv."Sala_id" = ${fsala_id} and ev."IdEvaluacion"=${fevaluacion_id};
        `;

        const checkSalaResult: any = await db.query(sqlCheckSala);

        if (checkSalaResult[0].length > 0) {

            const existingId = checkSalaResult[0][0].IdEvaluacionVivo;


            // 2. Verificar si este "IdEvaluacionVivo" ya está en "EvaluacionVivo_id"
            const sqlCheckEvaluacion = `
                SELECT "EvaluacionVivo_id" 
                FROM "Evaluacion" 
                WHERE "IdEvaluacion" = ${fevaluacion_id} 
                AND ("EvaluacionVivo_id" IS NOT NULL AND "EvaluacionVivo_id" <> '')
                AND "EvaluacionVivo_id" LIKE '%,${existingId},%' 
                    OR "EvaluacionVivo_id" LIKE '${existingId},%' 
                    OR "EvaluacionVivo_id" LIKE '%,${existingId}' 
                    OR "EvaluacionVivo_id" = '${existingId}';
            `;

            const checkEvaluacionResult: any = await db.query(sqlCheckEvaluacion);

            if (checkEvaluacionResult[0].length > 0) {
                return res.status(400).json({
                    ok: false,
                    msg: "La sala ya está registrada en la evaluación en vivo.",
                });
            }

            // 3. Si la sala ya existe en EvaluacionVivo pero no en Evaluacion, actualizar sin insertar
            const sqlUpdateExisting = `
                UPDATE "Evaluacion" 
                SET "EvaluacionVivo_id" = 
                    CASE 
                        WHEN "EvaluacionVivo_id" IS NULL OR "EvaluacionVivo_id" = '' 
                        THEN '${existingId}'
                        ELSE "EvaluacionVivo_id" || ',${existingId}'
                    END
                WHERE "IdEvaluacion" = ${fevaluacion_id};
            `;
            await db.query(sqlUpdateExisting);

            return res.status(200).json({
                ok: true,
                msg: "Sala existente vinculada correctamente a la evaluación.",
                existingId: existingId,
            });
        }

        // 4. Si la sala no existe en EvaluacionVivo, insertarla
        const sqlInsert = `
            INSERT INTO "EvaluacionVivo" ("Sala_id", "FechaInicio", "FechaFin") 
            VALUES (${fsala_id}, '${ffechainicio}', '${ffechafin}') 
            RETURNING "IdEvaluacionVivo";
        `;

        const insertResult: any = await db.query(sqlInsert);
        const newId = insertResult[0][0].IdEvaluacionVivo;

        // 5. Actualizar Evaluacion con el nuevo IdEvaluacionVivo
        const sqlUpdate = `
            UPDATE "Evaluacion" 
            SET "EvaluacionVivo_id" = 
                CASE 
                    WHEN "EvaluacionVivo_id" IS NULL OR "EvaluacionVivo_id" = '' 
                    THEN '${newId}'
                    ELSE "EvaluacionVivo_id" || ',${newId}'
                END
            WHERE "IdEvaluacion" = ${fevaluacion_id};
        `;

        await db.query(sqlUpdate);

        return res.status(200).json({
            ok: true,
            msg: "Nueva evaluación en vivo agregada correctamente.",
            newId: newId,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al agregar evaluación en vivo.",
        });
    }
};
export const desactivaractivarusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, festado_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
       
update "Usuario"  set "Estado_id"=${festado_id} where  "IdUsuario"=${fusuario_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const eliminarusuariov2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
       Delete from "Usuario" where  "IdUsuario"=${fusuario_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listaralumnospuntajev2 = async (
    req = request,
    res = response
) => {

    const sql = `
      SELECT 
    us."IdUsuario", 
    us."Usuario",
    us."RutaImagenPerfil",
    CONCAT(en."Nombres", ' ', en."Apellidos") AS "NombreCompleto",
    us."FcIngreso",
    -- Calculo del puntaje
    SUM(ps."StockDisponible") * 50 + 
    (
        -- Años de antigüedad multiplicados por 12 (meses)
        (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM us."FcIngreso")) * 4 +
        -- Meses de antigüedad (diferencia entre el mes actual y el mes de ingreso)
        (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM us."FcIngreso")) * 3 +
        -- Días de antigüedad (si el mes no está completo, calculamos los días
        -- multiplicado por un valor muy pequeño para que impacte ligeramente)
        (EXTRACT(DAY FROM CURRENT_DATE) - EXTRACT(DAY FROM us."FcIngreso")) * 2
    ) AS "Puntaje"
FROM "Usuario" us
INNER JOIN "Entidad" en ON en."IdEntidad" = us."Entidad_id"
INNER JOIN "ProductoStock" ps ON ps."Usuario_id" = us."IdUsuario"
GROUP BY us."IdUsuario", us."Usuario", us."RutaImagenPerfil", us."FcIngreso", CONCAT(en."Nombres", ' ', en."Apellidos")
HAVING 
    -- Excluimos los registros donde el Puntaje sea nulo o 0
    SUM(ps."StockDisponible") * 50 + 
    (
        (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM us."FcIngreso")) * 4 +
        (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM us."FcIngreso")) * 3 +
        (EXTRACT(DAY FROM CURRENT_DATE) - EXTRACT(DAY FROM us."FcIngreso")) * 2
    ) > 0
ORDER BY "Puntaje" DESC;

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const listaralumnospuntaje10v2 = async (
    req = request,
    res = response
) => {

    const sql = `
      SELECT 
    us."IdUsuario", 
    us."RutaImagenPerfil",
    CONCAT(en."Nombres", ' ', en."Apellidos") AS "NombreCompleto",
        -- Calculo del puntaje
    SUM(ps."StockDisponible") * 50 + 
    (
        -- Años de antigüedad multiplicados por 12 (meses)
        (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM us."FcIngreso")) * 4 +
        -- Meses de antigüedad (diferencia entre el mes actual y el mes de ingreso)
        (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM us."FcIngreso")) * 3 +
        -- Días de antigüedad (si el mes no está completo, calculamos los días
        -- multiplicado por un valor muy pequeño para que impacte ligeramente)
        (EXTRACT(DAY FROM CURRENT_DATE) - EXTRACT(DAY FROM us."FcIngreso")) * 2
    ) AS "Puntaje"
FROM "Usuario" us
INNER JOIN "Entidad" en ON en."IdEntidad" = us."Entidad_id"
INNER JOIN "ProductoStock" ps ON ps."Usuario_id" = us."IdUsuario"
GROUP BY us."IdUsuario", us."Usuario", us."RutaImagenPerfil", us."FcIngreso", CONCAT(en."Nombres", ' ', en."Apellidos")
HAVING 
    -- Excluimos los registros donde el Puntaje sea nulo o 0
    SUM(ps."StockDisponible") * 50 + 
    (
        (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM us."FcIngreso")) * 4 +
        (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM us."FcIngreso")) * 3 +
        (EXTRACT(DAY FROM CURRENT_DATE) - EXTRACT(DAY FROM us."FcIngreso")) * 2
    ) > 0
    ORDER BY "Puntaje" DESC
    LIMIT 10;

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listaranunciosxcursov2 = async (
    req = request,
    res = response
) => {
    const { fproducto_id, fsala_id } = req.body; // fdata es un array con los datos a insertar.

    const sql = `
   SELECT 
    an.*, 
    INITCAP(SPLIT_PART(en."Nombres", ' ', 1)) || ' ' || INITCAP(SPLIT_PART(en."Apellidos", ' ', 1)) AS "NombreFormateado"
FROM "Anuncio" an
INNER JOIN "Usuario" us ON us."IdUsuario" = an."Usuario_id"
INNER JOIN "Entidad" en ON en."IdEntidad" = us."Entidad_id"
     where "Producto_id"=${fproducto_id} and "Sala_id"=${fsala_id}
     ORDER BY "Fecha" DESC

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const listarreportesv2 = async (
    req = request,
    res = response
) => {

    const sql = `
SELECT * FROM "Reporte";
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const exportarReportesAExcel = async (req = request, res = response) => {
    const { fsql } = req.body;
    const sql = `${fsql}`;

    try {
        const reportes: any = await db.query(sql);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte");

        worksheet.columns = Object.keys(reportes[0][0]).map((key) => ({
            header: key,
            key,
            width: 20,
        }));

        reportes[0].forEach((row: any) => worksheet.addRow(row));

        // Configurar cabeceras para la descarga del archivo
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte.xlsx"
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        await workbook.xlsx.write(res);
        res.end(); // Finalizar la respuesta correctamente

    } catch (err) {
        console.error("❌ Error al generar el archivo Excel:", err);
        return res.status(500).json({
            ok: false,
            msg: "Error al generar el archivo Excel",
        });
    }
};


export const listarsalaxidv2 = async (
    req = request,
    res = response
) => {
    const { fsala_id } = req.body;

    const sql = `
select "NumeroReunion","ClaveReunion" from "Sala"
where "IdSala"=${fsala_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const guardarabrireditarvaloresv2 = async (
    req = request,
    res = response
) => {
    const { fsala_id, fnumero_reunion, fclave_reunion } = req.body;

    const sql = `
    update "Sala" set "NumeroReunion"='${fnumero_reunion}',"ClaveReunion"='${fclave_reunion}'
    where "IdSala"=${fsala_id}
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarpermisosv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body;

    const sql = `


SELECT
    m."IdMenu",
    m."Menu",
    m."Ruta",
    m."RutaImagen",
    m."Comando",
    m."TipoMenu_id",
    m."Padre_id",
    m."Estado_id",
    CASE
        WHEN ma."Menu_id" IS NOT NULL and ma."Estado_id"='1' THEN 1
        ELSE 0
    END AS "posesion"
FROM "Menu" m
LEFT JOIN "MenuAsignado" ma
    ON m."IdMenu" = ma."Menu_id"
    AND ma."Usuario_id" = ${fusuario_id} AND ma."Estado_id"='1'
WHERE m."TipoMenu_id" = 5  ;
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const guardarpermisosv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, permisos } = req.body;
    try {
        // Obtener los permisos actuales asignados al usuario con Estado_id '1'
        const permisosActuales = await db.query(
            `SELECT "Menu_id" FROM "MenuAsignado" WHERE "Usuario_id" = :usuarioId AND "Estado_id" = '1'`,
            {
                replacements: { usuarioId: fusuario_id },
            }
        );

        // Convertir los resultados en un Set para una rápida búsqueda
        const permisosActualesSet = new Set(permisosActuales[0].map((p: any) => p.Menu_id));


        // Iterar sobre cada permiso enviado para determinar si se inserta o actualiza
        for (const permiso of permisos) {
            const { Menu_id, asignado } = permiso;

            if (asignado === 1 && !permisosActualesSet.has(Menu_id)) {
                // Insertar nuevo permiso si no existe
                await db.query(
                    `INSERT INTO "MenuAsignado" ("Usuario_id", "Menu_id", "Estado_id") VALUES (:usuarioId, :menuId, '1')`,
                    {
                        replacements: { usuarioId: fusuario_id, menuId: Menu_id },
                    }
                );
            } else if (asignado === 0 && permisosActualesSet.has(Menu_id)) {
                // Actualizar permiso existente para marcarlo como inactivo
                await db.query(
                    `UPDATE "MenuAsignado" SET "Estado_id" = '0' WHERE "Usuario_id" = :usuarioId AND "Menu_id" = :menuId`,
                    {
                        replacements: { usuarioId: fusuario_id, menuId: Menu_id },
                    }
                );
            }
        }
        return res.status(200).json({
            ok: true,
            msg: "Permisos actualizados correctamente",
        });
    } catch (err) {
        console.error("Error al actualizar permisos:", err);
        return res.status(400).json({
            ok: false,
            msg: "Error al actualizar permisos",
        });
    }
};
// bruno


export const actualizarClaveTemporal = async (req = request, res = response) => {
    const { correo } = req.body; // Obtén el correo del cuerpo de la solicitud

    // Función para generar una clave temporal numérica de 6 dígitos
    const generarClaveTemporal = () => {
        let clave = '';
        for (let i = 0; i < 6; i++) {
            clave += Math.floor(Math.random() * 10); // Genera un dígito aleatorio entre 0 y 9
        }
        return clave;
    };

    if (!correo) {
        return res.status(400).json({
            ok: false,
            msg: 'El correo electrónico es requerido.',
        });
    }

    try {
        // Paso 1: Verificar si el correo existe en la tabla "Usuario"
        const consultaVerificacion = `
            SELECT "Usuario"
            FROM "Usuario"
            WHERE "Usuario" = '${correo}';
        `;

        const resultadoVerificacion = await db.query(consultaVerificacion, {
            // replacements: { correo }, // Pasa los parámetros aquí
        });

        if (resultadoVerificacion[0].length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo electrónico no existe en la base de datos.',
            });
        }

        // Paso 2: Generar una clave temporal numérica de 6 dígitos
        const nuevaClaveTemporal = generarClaveTemporal();

        // Paso 3: Actualizar el campo "ClaveTemporal"
        const consultaActualizacion = `
            UPDATE "Usuario"
            SET 
                "ClaveTemporal" = ${nuevaClaveTemporal},
                "UltimaFechMod" = NOW(),
                "FechaExpiracion" = NOW() + INTERVAL '5 minutes'
            WHERE "Usuario" = '${correo}';
        `;

        await db.query(consultaActualizacion, {
            // replacements: { claveTemporal: nuevaClaveTemporal, correo }, // Pasa los parámetros aquí

        });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "paginawebccd@gmail.com",
                pass: "iplg sjuy hapk azsv",  // Asegúrate de proteger estas credenciales.
            },
        });



        const mailOptions = {
            from: `"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>`,
            to: correo,
            subject: "codigo de verificacion",
            html: `
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Codigo:</strong> ${nuevaClaveTemporal}</p>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Correo enviado exitosamente");
        } catch (emailError) {
            console.error("Error al enviar el correo:", emailError);
            return res.status(500).json({
                ok: false,
                msg: "Error al enviar el correo.",
                error: (emailError as Error).message, // Para depuración
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al actualizar la clave temporal.',
        });
    }
};
export const listarproductotemariomodulov2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id } = req.body;

    const sql = `
	SELECT
    pt."Curso_id",
    pt."IdProductoTemario" AS id,
    pt."ProductoTemario" AS nombre,
    pt."Numeracion" AS Numeracion,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'id_ptc', ptc."IdProductoTemarioContenido",
                'nombre_ptc', ptc."ProductoTemarioContenido",
                'tiempo_ptc', ptc."Duracion"
            )
        ) FILTER (WHERE ptc."IdProductoTemarioContenido" IS NOT NULL),
        '[]'::jsonb
    ) AS temas,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'id_pta', pta."IdProductoTemarioAdjunto",
                'ruta_pta', CONCAT(
                    '/', COALESCE(pta."Tipo1", ''), 
                    '/', COALESCE(pta."Tipo2", ''), 
                    '/', COALESCE(pta."Tipo3", ''), 
                    '/', COALESCE(pta."Tipo4", ''), 
                    '/', COALESCE(pta."NombreArchivo", '')
                ),
                'tipo_pta', pta."Tipo2",
                'nombre_pta', pta."NombreArchivo"
            )
        ) FILTER (WHERE pta."IdProductoTemarioAdjunto" IS NOT NULL),
        '[]'::jsonb
    ) AS adjuntos,
    string_agg(
        DISTINCT CONCAT(
            '/', COALESCE(pta."Tipo1", ''), 
            '/', COALESCE(pta."Tipo2", ''), 
            '/', COALESCE(pta."Tipo3", ''), 
            '/', COALESCE(pta."Tipo4", ''), 
            '/', COALESCE(pta."NombreArchivo", '')
        ),
        ', '
    ) FILTER (WHERE pta."Tipo2" = 'Video' AND pta."Tipo4" = 'Modulos') AS rutas_videos
FROM "Producto" pro
INNER JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
INNER JOIN "ProductoTemario" pt ON pt."Curso_id" = cur."IdCurso"
LEFT JOIN "ProductoTemarioContenido" ptc ON pt."IdProductoTemario" = ptc."ProductoTemario_id"
LEFT JOIN "ProductoTemarioAdjunto" pta ON pta."ProductoTemario_id" = pt."IdProductoTemario"
WHERE cur."IdCurso" = ${fcurso_id} AND pta."Sala_id" IS NULL
GROUP BY
    pt."Curso_id",
    pt."IdProductoTemario",
    pt."ProductoTemario",
    pt."Numeracion"
ORDER BY pt."IdProductoTemario" ASC;

    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",

        });
    }
};
export const verificarCode = async (req = request, res = response) => {
    const { correo, codigo } = req.body; // Obtén el correo y el código del cuerpo de la solicitud

    if (!correo || !codigo) {
        return res.status(400).json({
            ok: false,
            msg: 'El correo electrónico y el código son requeridos.',
        });
    }

    try {
        // Paso 1: Verificar si el correo existe en la tabla "Usuario"
        const consultaVerificacion = `
     SELECT "ClaveTemporal", "FechaExpiracion"
     FROM "Usuario"
     WHERE "Usuario" = '${correo}';
 `;

        const resultadoVerificacion = await db.query(consultaVerificacion);

        if (resultadoVerificacion[0].length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo electrónico no existe en la base de datos.',
            });
        }

        const { ClaveTemporal, FechaExpiracion } = resultadoVerificacion[0][0] as { ClaveTemporal: string, FechaExpiracion: Date }; // Extrae los datos

        // Paso 2: Verificar si el código coincide
        if (codigo !== ClaveTemporal) {
            return res.status(400).json({
                ok: false,
                msg: 'El código proporcionado no es válido.',
            });
        }

        // Paso 3: Verificar si el código ha expirado
        const fechaActual = new Date(); // Fecha y hora actual
        const fechaExpiracion = new Date(FechaExpiracion); // Convertir a objeto Date (si no lo es ya)

        if (fechaActual > fechaExpiracion) {
            return res.status(400).json({
                ok: false,
                msg: 'El código  ha expirado por favor solicita uno nuevo.',
            });
        }

        // Paso 4: Calcular los minutos restantes hasta la expiración
        const diferenciaEnMilisegundos = fechaExpiracion.getTime() - fechaActual.getTime(); // Diferencia en milisegundos
        const minutosRestantes = Math.floor(diferenciaEnMilisegundos / (1000 * 60)); // Convertir a minutos


        const consultaActualizacion = `
         UPDATE "Usuario"
         SET
             "FechaExpiracion" = NULL
         WHERE "Usuario" = '${correo}';
     `;

        await db.query(consultaActualizacion, {
            // replacements: { claveTemporal: nuevaClaveTemporal, correo }, // Pasa los parámetros aquí

        });

        // Respuesta exitosa
        return res.status(200).json({
            ok: true,
            msg: 'El código OTP es válido.',
            minutosRestantes: minutosRestantes, // Opcional: Devuelve los minutos restantes
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al verificar el código y el tiempo.',
        });
    }
};
export const actualizarnombretemario = async (req = request, res = response) => {
    const { data } = req.body;

    // Verificamos que data tenga elementos
    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: "No se recibieron datos válidos",

        });
    }


    try {
        for (const item of data) {
            const { id, nombre, numeracion } = item;

            // Validamos que los datos requeridos estén presentes
            if (!id || !nombre || !numeracion) {
                continue;
            }

            const sql = `
                UPDATE "ProductoTemario"
                SET "ProductoTemario" = :nombre, "Numeracion" = :numeracion
                WHERE "IdProductoTemario" = :id
            `;

            await db.query(sql, {
                replacements: { nombre, numeracion, id },
            });
        }

        return res.status(200).json({
            ok: true,
            msg: "Temario actualizado correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al actualizar el temario",
        });
    }
};
export const actualizarcontenidotemario = async (req = request, res = response) => {
    const { data } = req.body;

    // Verificamos que data tenga elementos
    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: "No se recibieron datos válidos",
        });
    }

    try {
        for (const item of data) {

            for (const item1 of item.temas) {
                const { id_ptc, nombre_ptc } = item1;


                const sql = `
                    UPDATE "ProductoTemarioContenido"
                    SET "ProductoTemarioContenido" = :nombre_ptc
                    WHERE "IdProductoTemarioContenido" = :id_ptc
                `;

                await db.query(sql, {
                    replacements: { nombre_ptc, id_ptc },
                });
            }
        }

        return res.status(200).json({
            ok: true,
            msg: "Temario actualizado correctamente",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al actualizar el temario",
        });
    }
};
export const crearproductotemariov2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id, fproductotemario, fnumeracion } = req.body;

    const sql = `
Insert into "ProductoTemario" ("Curso_id","ProductoTemario","Numeracion") values 
(${fcurso_id},'${fproductotemario}','${fnumeracion}')
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const crearproductotemariocontenidov2 = async (
    req = request,
    res = response
) => {
    const { fproductotemario_id, fproductotemariocontenido } = req.body;

    const sql = `
Insert into "ProductoTemarioContenido" ("ProductoTemario_id","ProductoTemarioContenido") values 
(${fproductotemario_id},'${fproductotemariocontenido}')
    `;

    try {
        const data = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const cambiarestadoadmincursosv2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id, festado_id } = req.body;

    const sql = `
        update "Curso" set "Estado_id"=0 where "IdCurso"=${fcurso_id};
        update "Producto" set "Estado_id"=0 where "Curso_id"=${fcurso_id};
    `;
    const sql1 = `
        update "Curso" set "Estado_id"=1 where "IdCurso"=${fcurso_id};
        update "Producto" set "Estado_id"=1 where "Curso_id"=${fcurso_id};
    `;

    try {
        if (festado_id == '1') {
            const data = await db.query(sql, {
            });
            return res.status(200).json({
                ok: true,
                msg: "Especializaciones obtenidas correctamente",
                data: data,
            });
        } else {
            const data = await db.query(sql1, {
            });
            return res.status(200).json({
                ok: true,
                msg: "Especializaciones obtenidas correctamente",
                data: data,
            });
        }

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const crearevaluacionv2 = async (
    req = request,
    res = response
) => {
    const { fevaluacion, fdescripcion, ftipoevaluacion, fduracion, fintentos, fcurso_id } = req.body;

    const sql = `
       INSERT INTO "Evaluacion" (
    "Evaluacion", 
    "Descripcion", 
    "TipoEvaluacion", 
    "Duracion", 
    "Intentos", 
    "Curso_id"
    ) VALUES (
        '${fevaluacion}', 
        '${fdescripcion}', 
        '${ftipoevaluacion}', 
        ${fduracion}, 
        ${fintentos}, 
        ${fcurso_id}
    ) RETURNING "IdEvaluacion"; `;




    try {

        const data: any = await db.query(sql, {
        });


        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const crearbancopreguntasv2 = async (
    req = request,
    res = response
) => {
    const { fbancopregunta, ftipoevaluacion, fcurso_id } = req.body;

    const sql = `
       INSERT INTO "BancoPregunta" (
    "BancoPregunta", 
    "TipoEvaluacion", 
    "Curso_id"
    ) VALUES (
        '${fbancopregunta}', 
        '${ftipoevaluacion}', 
        ${fcurso_id}
    )`;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const verbancopreguntasv2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id } = req.body;

    const sql = `
      select * from "BancoPregunta" where "Curso_id"=${fcurso_id}
    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const verbancosxevaluacionv2 = async (
    req = request,
    res = response
) => {
    const { fcurso_id, ftipoevaluacion } = req.body;

    const sql = `
     select * from "BancoPregunta" where "Curso_id"=${fcurso_id} and "TipoEvaluacion"='${ftipoevaluacion}'

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const listaradministraracreditacionv2 = async (
    req = request,
    res = response
) => {

    const sql = `
     select * from "Acreditacion";

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const crearacreditacionv2 = async (
    req = request,
    res = response
) => {
    const { facreditacion, fcodigo, fprecio } = req.body;

    const sql = `
    Insert into "Acreditacion"("Acreditacion","Codigo","Precio") values
    ('${facreditacion}','${fcodigo}',${fprecio});

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const editaracreditacionv2 = async (
    req = request,
    res = response
) => {
    const { facreditacion_id, facreditacion, fcodigo, fprecio } = req.body;

    const sql = `
    Update "Acreditacion" set "Acreditacion"='${facreditacion}',"Codigo"='${fcodigo}',"Precio"=${fprecio}
    where "IdAcreditacion"=${facreditacion_id}

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};
export const updatePassword = async (req = request, res = response) => {

    const { correo, clave } = req.body;

    if (!correo || !clave) {
        return res.status(400).json({
            ok: false,
            msg: 'El correo electrónico y la clave son requeridos.',
        });
    }

    try {
        // Paso 1: Verificar si el correo existe en la tabla "Usuario"
        const consultaVerificacion = `
            SELECT "Usuario"
            FROM "Usuario"
            WHERE "Usuario" = '${correo}';
        `;

        const resultadoVerificacion = await db.query(consultaVerificacion);

        if (resultadoVerificacion[0].length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo electrónico no existe en la base de datos.',
            });
        }

        // Paso 2: Actualizar la clave
        const consultaActualizacion = `
            UPDATE "Usuario"
            SET
                "Clave" = '${clave}'
            WHERE "Usuario" = '${correo}';
        `;

        await db.query(consultaActualizacion, {
            // replacements: { clave, correo }, // Pasa los parámetros aquí

        });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "paginawebccd@gmail.com",
                pass: "iplg sjuy hapk azsv",  // Asegúrate de proteger estas credenciales.
            },
        });



        const mailOptions = {
            from: `"Centro de Capacitación y Desarrollo" <CcdEmpresas@ccd.edu.pe>`,
            to: correo,
            subject: "codigo de verificacion",
            html: `
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Codigo:</strong> ${clave}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            ok: true,
            msg: 'Clave actualizada correctamente.',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al actualizar la clave.',
        });
    }

}

export const vercertificadosv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id, fproducto_id } = req.body;

    const sql = `
    select * from "Certificado"
    where "Usuario_id"=${fusuario_id} and "Producto_id"=${fproducto_id}

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const vercertificadosxcodigov2 = async (
    req = request,
    res = response
) => {
    const { fcodigo } = req.body;

    const sql = `
    select * from "Certificado"
    where "CodigoCertificado"= :fcodigo
    `;

    try {

        const data: any = await db.query(sql, {
            replacements: { fcodigo },
            type: QueryTypes.SELECT,
        });

        if (!data || data.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontraron certificados",
                data: [],
            });
        }


        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: [data],
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};

export const listarnotasalumnosv2 = async (
    req = request,
    res = response
) => {
    const { fusuario_id } = req.body;

    const sql = `
    SELECT 
	pro."IdProducto",
	tm."TipoModalidad",
	en."Usuario_id",
    cur."Curso",
    json_agg(
        json_build_object(
            'IdEvaluacion', ev."IdEvaluacion",
            'Evaluacion', ev."Evaluacion",
            'TipoEvaluacion', 
                CASE 
                    WHEN ev."TipoEvaluacion" = '1' THEN 'Parcial'
                    WHEN ev."TipoEvaluacion" = '2' THEN 'Final'
                    ELSE 'Otro'
                END,
            'Nota', en."Nota"
        )
    ) AS Evaluaciones
    FROM "EvaluacionNota" en
    INNER JOIN "Evaluacion" ev ON ev."IdEvaluacion" = en."Evaluacion_id"
    INNER JOIN "Producto" pro ON pro."IdProducto" = en."Producto_id"
    INNER JOIN "Curso" cur ON cur."IdCurso" = pro."Curso_id"
    INNER JOIN "TipoModalidad" tm ON tm."IdTipoModalidad" = pro."TipoModalidad_id"
    WHERE "Usuario_id"=${fusuario_id}
    GROUP BY cur."Curso",en."Usuario_id",pro."IdProducto",tm."TipoModalidad";
    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};


export const guardarnotasalumnosv2 = async (req = request, res = response) => {
    const { data } = req.body;
    try {
        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: "Datos inválidos",
            });
        }


        for (const curso of data) {

            for (const evaluacion of curso.evaluaciones) {
                const sql = `
                    UPDATE "EvaluacionNota"
                    SET "Nota" = ${evaluacion.Nota}
                    WHERE "Evaluacion_id" = ${evaluacion.IdEvaluacion}
                    AND "Usuario_id" = ${curso.Usuario_id}
                    AND "Producto_id" = ${curso.IdProducto}
                `;
                await db.query(sql);
            }
        }


        return res.status(200).json({
            ok: true,
            msg: "Notas actualizadas correctamente",
        });

    } catch (err) {
        console.error("Error al guardar notas:", err);

        // Revertir cambios en caso de error
        await db.query("ROLLBACK");

        return res.status(500).json({
            ok: false,
            msg: "Error al guardar notas",
        });
    }
};

export const listarencuesta = async (
    req = request,
    res = response
) => {

    const sql = `
     select * from "Encuesta";

    `;

    try {

        const data: any = await db.query(sql, {
        });

        return res.status(200).json({
            ok: true,
            msg: "Especializaciones obtenidas correctamente",
            data: data,
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al obtener especializaciones",
        });
    }
};