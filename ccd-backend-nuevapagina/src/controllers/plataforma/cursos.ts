import { request, response } from "express";
import db from "../../db/connection";

export const listarcursosplataformaxusuario = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
        select "Producto_id","IdTipoProducto","IdProducto","Clasificacion","IdModelo","Modelo",(SELECT 
            CONCAT('/',"pa"."Tipo1",'/',"pa"."Tipo2",'/',"pa"."Tipo3",'/',"pa"."Tipo4",'/',"pa"."NombreArchivo" ) as "RutaImagen" 
            FROM "Vw_Producto"
            INNER JOIN "ProductoAdjunto" "pa" ON "pa"."Producto_id" = "Vw_Producto"."IdProducto" 
            WHERE "Tipo1"='Multimedia' and "Tipo2"='Imagen' and "Tipo3"='Cursos' and "Tipo4"='Portada'
            and "Vw_Producto"."IdProducto" = ANY (
                SELECT unnest(string_to_array(
                    (SELECT STRING_AGG(("IdProducto")::TEXT, ',') 
                    FROM "Vw_Producto"
                    WHERE "Clasificacion" IN (
                        SELECT DISTINCT "vwp"."Clasificacion" 
                        FROM "ProductoStock" "ps"
                        LEFT JOIN "Vw_Producto" "vwp" ON "vwp"."IdProducto" = "prada"."Producto_id" and "ps"."Usuario_id"="prada"."Usuario_id"
                    )
                    AND "Modelo" IN (
                        SELECT DISTINCT "vwp"."Modelo" 
                        FROM "ProductoStock" "ps"
                        LEFT JOIN "Vw_Producto" "vwp" ON "vwp"."IdProducto" = "prada"."Producto_id" and "ps"."Usuario_id"="prada"."Usuario_id"
                    )
                    AND "IdTipoProducto" = 2), ',')::INTEGER[])
            )) as "RutaImagen"
        from "ProductoStock" "prada"
        inner join "Vw_Producto" "vwpr" on "vwpr"."IdProducto"="prada"."Producto_id"
        where "prada"."Usuario_id"=${fusuario_id}
    `;

    try {
        const data: any = await db.query(sql, {
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

export const listarcertificadosxusuario = async (req = request, res = response) => {
    const { fusuario_id } = req.body;

    // Ajusta la consulta SQL a tus necesidades
    const sql = `
       SELECT STRING_AGG("cs"."RutaImagen"::TEXT, ',' ORDER BY "cs"."Orden") as "RutaImagen","CodigoCertificado","Modelo","cs"."FechaGenerado"
        FROM "Certificado" "cs"
        INNER JOIN "Vw_Producto" "vwp" ON "vwp"."IdProducto" = "cs"."Producto_id"
        WHERE "Usuario_id"=${fusuario_id}
        GROUP BY "cs"."CodigoCertificado","vwp"."Modelo","cs"."FechaGenerado"
    `;

    try {
        const data: any = await db.query(sql, {
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

export const listarevaluacionesxusuario = async (req = request, res = response) => {
    const { fusuario_id, fproducto_id } = req.body;
    const sql = `
    select "ev"."IdEvaluacion","ev"."Evaluacion","ev"."Duracion","ev"."FechaLimite","en"."Intento" 
    from "Evaluacion" "ev"
    inner join "Vw_Producto" "vwp" on "vwp"."IdProducto"="ev"."Producto_id"
    left join "EvaluacionNota" "en" on "en"."Evaluacion_id"="ev"."IdEvaluacion"
    where "Usuario_id"=${fusuario_id} and "Producto_id"=${fproducto_id}
    `;
    try {
        const data: any = await db.query(sql, {
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


export const listarpreguntasxusuario = async (req = request, res = response) => {
    const { fproducto_id } = req.body;
    const sql = `
        SELECT 
            "pre"."IdPregunta", 
            "pre"."Pregunta", 
            JSON_AGG(JSON_BUILD_OBJECT('Respuesta', "res"."Respuesta", 'Orden', "res"."Orden")) AS Respuestas,
            "RespuestaCorrecta"
        FROM 
            "Pregunta" AS "pre"
        INNER JOIN 
            "Respuesta" AS "res" ON "res"."Pregunta_id" = "pre"."IdPregunta"
        WHERE "pre"."Producto_id"=${fproducto_id}
        GROUP BY 
            "pre"."IdPregunta", "pre"."Pregunta"
        ORDER BY 
            "pre"."IdPregunta";
    `;
    try {
        const data: any = await db.query(sql, {
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

export const GuardarDatosExamen = async (req = request, res = response) => {
    const { respuestas } = req.body; // Obtenemos el array de respuestas del cuerpo de la solicitud

    try {
        await db.query('BEGIN'); // Inicia una transacción

        for (const respuesta of respuestas) {
            const { pregunta_id, marcado, intento, evaluacion_id } = respuesta;
            
            // Ejecuta la consulta con parámetros usando opciones
            await db.query(
                `INSERT INTO "EvaluacionPregunta"("Pregunta_id", "Marcado", "Intento", "Evaluacion_id") 
                 VALUES (:pregunta_id, :marcado, :intento, :evaluacion_id)`,
                {
                    replacements: {
                        pregunta_id,
                        marcado,
                        intento,
                        evaluacion_id,
                    },
                }
            );
        }

        await db.query('COMMIT'); // Confirma la transacción
        return res.status(200).json({
            ok: true,
            msg: "Respuestas guardadas correctamente"
        });
    } catch (err) {
        await db.query('ROLLBACK'); // Deshace la transacción en caso de error
        console.error(err);
        return res.status(400).json({
            ok: false,
            msg: "Error al guardar respuestas"
        });
    }
};