import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
const path = require('path');
const fs = require('fs');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

import { listarSubCategoriaxCategoria } from '../controllers/inicio/inicio';
import db from "../../src/db/connection";
import {
    EnviarCorreoPagoConArchivo,
    acreditacionescertificadosv2,
    alternarestadomodalidad,
    asignarcursoadminv2,
    asignarcursocarritov2,
    buscarCupon,
    comprarplannopremiumv2,
    comprarplanpremiumv2,
    concretarventa,
    crearAreav2,
    crearCategoria,
    crearClasificacion,
    crearcursov2,
    crearescuelav2,
    crearespecializacionv2,
    crearModelo,
    crearProductoFinal,
    crearproductov2,
    crearPuestov2,
    crearsalav2,
    crearsignaturezoomv2,
    crearSubCategoria,
    crearUsuario,
    datatableusuario,
    EnviarCorreoPago,
    fanadircursosusuario,
    guardarevaluacionv2,
    insertarusuariomasivov2,
    integrarsesalav2,
    listarAdministrarCursos,
    listaradministrarcursosv2,
    listaradministrarusuariov2,
    listarArea,
    listarCatalogoP1,
    listarclientev2,
    listarCursoAdjuntos,
    listarCursoAdjuntosCatalogo,
    listarcursoslimitadosv2,
    listarcursostotalesv2,
    listarcursosxespecializacionv2,
    listarcursosxrutasv2,
    listarcursoxespecializacionv2,
    listarcursoxusuariov2,
    listardatoscertificadogenerarv2,
    listarDepartamento,
    listarDistrito,
    listarDocentes,
    listarEditarCursoGeneral,
    listarencuestasalumnoobligatoriov2,
    listarescuelasxusuariov2,
    listarescuelav2,
    listarespecializacionesxescuelav2,
    listarespecializacionesxusuariov2,
    listarespecializacionxescuelav2,
    listarevaluacionesnotaxusuariov2,
    listarevaluacionesxcursov2,
    listarFiltroCategoria,
    listarFiltroClasificacion,
    listarFiltroSubCategoria,
    listarMisDatos,
    listarmoduloprofesores,
    listarnotasproductosv2,
    listarnotasproductosxproidv2,
    listarPais,
    listarplanv2,
    listarpreguntasmarcadasxevaluacionv2,
    listarpreguntasxencuestav2,
    listarpreguntasxevaluacionv2,
    listarProductoBeneficio,
    listarProductoBusqueda,
    listarProductoBusquedaCatalogo,
    listarProductoBusquedaDetalles,
    listarProductoBusquedaDetallesTotal,
    listarProductoDetallesTop,
    listarProductoId,
    listarproductoscatalogo,
    listarproductospreciov2,
    listarprofesoreslanding,
    listarProvincia,
    listarPuesto,
    listarrutasxusuariov2,
    listarSelectCategoria,
    listarSelectClasificacion,
    listarSelectCliente,
    listarSelectModelo,
    listarSelectNaturaleza,
    listarSelectSubCategoria,
    listarSelectTipoDocumento,
    listarSelectTipoProducto,
    listarTableClasificacion,
    listarTableTipoProducto,
    listarTemario,
    listartemariointrov2,
    listartipocursov2,
    listarvideointrov2,
    listaultimahora,
    lstprodxclaxcat,
    obtenerFechasCurso,
    obtenerFechasCursoxId,
    obteneridproductoxcursov2,
    obtenerModalidadesDisponibles,
    obtenersalasusuariosv2,
    obtenersalasv2,
    rellenarcarritodatos,
    responderencuestav2,
    validarpertenenciasalav2,
    vercursosplataformamineria,
    vercursosplataformatiendaxtop1v2,
    vercursosplataformatiendaxtopv2,
    verespecializacionesmineria,
    versalasdisponiblesv2,
    EnviarCorreoCorp,
    EnviarCorreoPromo,
    vermodalidadescursov2,
    administradoractualizarmodalidadesv2,
    verevaluacionescursov2,
    verpreguntasxtipoxcursov2,
    guardarpreguntasadmin,
    listarcertificadoacreditaciones,
    guardarcertificadov2,
    listarinputlayoutv2,
    listarpreguntasyrespuestasv2,
    insertarpreguntav2,
    insertarrespuestav2,
    listardatosalasv2,
    listarProductoTemariov2,
    listarTemarioVivov2,
    listardocentesv2,
    agregardocentesalav2,
    listardocentesalav2,
    listarcalendariov2,
    listarevaluacionesvivoxcursov2,
    listarsalasevaluacionv2,
    agregarsalaevaluacionv2,
    listarevaluacionesnotavivoxusuariov2,
    guardarevaluacionvivov2,
    listarnotasvivoproductosxproidv2,
    eliminarusuariov2,
    desactivaractivarusuariov2,
    listaralumnospuntajev2,
    listaralumnospuntaje10v2,
    listarcertificadoacreditacionesvivo,
    listardatoscertificadogenerarvivov2,
    listaranunciosxcursov2,
    exportarReportesAExcel,
    listarfullaccessv2,
    listarreportesv2,
    listarsalaxidv2,
    guardarabrireditarvaloresv2,
    ObtenerEspe,
    loginUsuario,
    listarpermisosv2,
    guardarpermisosv2,
    listarproductotemariomodulov2,
    actualizarnombretemario,
    actualizarcontenidotemario,
    crearproductotemariov2,
    crearproductotemariocontenidov2,
    cambiarestadoadmincursosv2,
    crearevaluacionv2,
    crearbancopreguntasv2,
    verbancopreguntasv2,
    verbancosxevaluacionv2,
    listaradministraracreditacionv2,
    crearacreditacionv2,
    editaracreditacionv2,
    actualizarClaveTemporal,
    verificarCode,
    updatePassword,
    vercertificadosv2,
    listarnotasalumnosv2,
    guardarnotasalumnosv2,
    vercertificadosxcodigov2,
    listarencuesta
} from '../controllers/inicio/producto';


import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DATE } from 'sequelize';
import { NOW } from 'sequelize';
import { GuardarDatosExamen, listarcertificadosxusuario, listarcursosplataformaxusuario, listarevaluacionesxusuario, listarpreguntasxusuario } from '../controllers/plataforma/cursos';
import { asignarxpago, getRutas, getRutasDetalle, listaespecializacion, listaespecializacionGeneral, obteneridsalav2, vercursosespecializacionescuela, vercursosespecializacionGeneral } from '../controllers/inicio/curso';
import { actualizarEntidad, buscarCursosPorPalabra, escuelagetcursodetalle, frontgetcursodetalle, getcursodetalle, getcursoescuelaespecializacion, getcursosav, getcursosfull, getescuela } from '../controllers/inicio/curso';

const rateLimit = require('express-rate-limit');

// Configura el limitador para la ruta de envío de correos
const emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo de 5 intentos por IP
    message: { error: 'Has excedido el límite de intentos de envío. Inténtalo de nuevo más tarde.' },
});
const emailRateLimiter2 = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo de 5 intentos por IP
    message: { error: 'Has excedido el límite de intentos de envío. Inténtalo de nuevo más tarde.' },
});
const emailRateLimiter3 = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo de 5 intentos por IP
    message: { error: 'Has excedido el límite de intentos de envío. Inténtalo de nuevo más tarde.' },
});
const emailRateLimiter4 = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo de 5 intentos por IP
    message: { error: 'Has excedido el límite de intentos de envío. Inténtalo de nuevo más tarde.' },
});

const router = Router();
router.post('/listarSubCategoriaxCategoria', listarSubCategoriaxCategoria)
router.get('/listarProductoBusqueda', listarProductoBusqueda)
router.get('/listarProductoBusquedaCatalogo', listarProductoBusquedaCatalogo)

router.post('/listarProductoBusquedaDetalles', listarProductoBusquedaDetalles)
router.post('/listarFiltroClasificacion', listarFiltroClasificacion)
router.post('/listarFiltroCategoria', listarFiltroCategoria)
router.post('/listarFiltroSubCategoria', listarFiltroSubCategoria)
router.post('/listarAdministrarCursos', listarAdministrarCursos)

router.post('/listarTableTipoProducto', listarTableTipoProducto)
router.post('/listarTableClasificacion', listarTableClasificacion)
router.post('/listarproductotemariomodulov2', listarproductotemariomodulov2)
router.post('/actualizarnombretemario', actualizarnombretemario)
router.post('/actualizarcontenidotemario', actualizarcontenidotemario)
router.post('/crearproductotemariov2', crearproductotemariov2)
router.post('/vercertificadosv2', vercertificadosv2)
router.post('/listarnotasalumnosv2', listarnotasalumnosv2)
router.post('/guardarnotasalumnosv2', guardarnotasalumnosv2)
router.post('/vercertificadosxcodigov2', vercertificadosxcodigov2)


router.post('/listarSelectNaturaleza', listarSelectNaturaleza)
router.post('/listarSelectTipoProducto', listarSelectTipoProducto)
router.post('/listarSelectClasificacion', listarSelectClasificacion)
router.post('/listarSelectCategoria', listarSelectCategoria)
router.post('/listarSelectSubCategoria', listarSelectSubCategoria)
router.post('/listarSelectModelo', listarSelectModelo)
router.post('/listarSelectCliente', listarSelectCliente)

router.post('/crearProductoFinal', crearProductoFinal)
router.post('/ObtenerEspe', ObtenerEspe)


router.post('/listarEditarCursoGeneral', listarEditarCursoGeneral)
router.post('/listarCursoAdjuntos', listarCursoAdjuntos)
router.post('/listarCursoAdjuntosCatalogo', listarCursoAdjuntosCatalogo)
router.post('/listarmoduloprofesores', listarmoduloprofesores)
router.post('/listarproductoscatalogo', listarproductoscatalogo)
router.post('/listarprofesoreslanding', listarprofesoreslanding)
router.post('/listardatosalasv2', listardatosalasv2)
router.post('/listarProductoTemariov2', listarProductoTemariov2)
router.post('/editaracreditacionv2', editaracreditacionv2)



router.post('/listarSelectTipoDocumento', listarSelectTipoDocumento)

router.post('/EnviarCorreoPago', EnviarCorreoPago)
router.post('/EnviarCorreoPagoConArchivo', emailRateLimiter, EnviarCorreoPagoConArchivo);
router.post('/EnviarCorreoCorp', emailRateLimiter2, EnviarCorreoCorp);
router.post('/EnviarCorreoPromo', emailRateLimiter3, EnviarCorreoPromo);

router.post('/crearUsuario', crearUsuario)

router.post('/listarProductoDetallesTop', listarProductoDetallesTop)
router.post('/listarProductoBusquedaDetallesTotal', listarProductoBusquedaDetallesTotal)
router.post('/buscarCupon', buscarCupon)
router.post('/listarProductoBeneficio', listarProductoBeneficio)

router.post('/crearClasificacion', crearClasificacion)
router.post('/crearCategoria', crearCategoria)
router.post('/crearModelo', crearModelo)
router.post('/crearSubCategoria', crearSubCategoria)


router.post('/listarProductoId', listarProductoId)
router.post('/listarTemario', listarTemario)
router.post('/obtenerModalidadesDisponibles', obtenerModalidadesDisponibles)
router.post('/obtenerFechasCurso', obtenerFechasCurso)
router.post('/listarencuesta', listarencuesta)


router.post('/lstprodxclaxcat', lstprodxclaxcat)
router.post('/listarMisDatos', listarMisDatos)
router.post('/listarCatalogoP1', listarCatalogoP1)
router.post('/datatableusuario', datatableusuario)
router.post('/listarArea', listarArea)
router.post('/listarPuesto', listarPuesto)
router.post('/obtenerFechasCursoxId', obtenerFechasCursoxId)
router.post('/listaultimahora', listaultimahora)
router.post('/concretarventa', concretarventa)
router.post('/rellenarcarritodatos', rellenarcarritodatos)

router.post('/listarcursosplataformaxusuario', listarcursosplataformaxusuario)
router.post('/listarcertificadosxusuario', listarcertificadosxusuario)
router.post('/listarevaluacionesxusuario', listarevaluacionesxusuario)
router.post('/listarpreguntasxusuario', listarpreguntasxusuario)
router.post('/GuardarDatosExamen', GuardarDatosExamen)

export const r2 = new S3Client({
    region: "auto",
    endpoint: "https://89b4390775d9ea636df759447986d2ae.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: "565efaec224078967244d303913c30c2",
        secretAccessKey: "e10217b0b75da1269dba95b90e280f686836e88bbffa1fe187f1a9361b7d131d"
    }
})
router.post('/listarreportesv2', listarreportesv2)
router.post('/listarDocentes', listarDocentes)
router.post('/listardocentesalav2', listardocentesalav2)
router.post('/listarcalendariov2', listarcalendariov2)
router.post('/listarevaluacionesvivoxcursov2', listarevaluacionesvivoxcursov2)
router.post('/listarsalasevaluacionv2', listarsalasevaluacionv2)
router.post('/agregarsalaevaluacionv2', agregarsalaevaluacionv2)
router.post('/listarevaluacionesnotavivoxusuariov2', listarevaluacionesnotavivoxusuariov2)
router.post('/guardarevaluacionvivov2', guardarevaluacionvivov2)
router.post('/listarnotasvivoproductosxproidv2', listarnotasvivoproductosxproidv2)
router.post('/listarcertificadoacreditacionesvivo', listarcertificadoacreditacionesvivo)
router.post('/listardatoscertificadogenerarvivov2', listardatoscertificadogenerarvivov2)
router.post('/listaranunciosxcursov2', listaranunciosxcursov2)
router.post('/exportarReportesAExcel', exportarReportesAExcel)
router.post('/listarfullaccessv2', listarfullaccessv2)
router.post('/listarsalaxidv2', listarsalaxidv2)
router.post('/guardarabrireditarvaloresv2', guardarabrireditarvaloresv2)

router.post('/listardocentesv2', listardocentesv2)
router.post('/agregardocentesalav2', agregardocentesalav2)
router.post('/desactivaractivarusuariov2', desactivaractivarusuariov2)
router.post('/eliminarusuariov2', eliminarusuariov2)
router.post('/listaralumnospuntajev2', listaralumnospuntajev2)
router.post('/listaralumnospuntaje10v2', listaralumnospuntaje10v2)
router.post('/cambiarestadoadmincursosv2', cambiarestadoadmincursosv2)
router.post('/crearevaluacionv2', crearevaluacionv2)
router.post('/crearbancopreguntasv2', crearbancopreguntasv2)
router.post('/verbancopreguntasv2', verbancopreguntasv2)
router.post('/verbancosxevaluacionv2', verbancosxevaluacionv2)
router.post('/listaradministraracreditacionv2', listaradministraracreditacionv2)
router.post('/crearacreditacionv2', crearacreditacionv2)

router.post('/listarPais', listarPais)
router.post('/crearAreav2', crearAreav2)
router.post('/crearPuestov2', crearPuestov2)

router.post('/listarDepartamento', listarDepartamento)
router.post('/listarProvincia', listarProvincia)
router.post('/listarDistrito', listarDistrito)
router.post('/alternarestadomodalidad', alternarestadomodalidad)
router.post('/fanadircursosusuario', fanadircursosusuario)

router.post('/listarproductospreciov2', listarproductospreciov2)

const upload = multer({
    limits: {
        fileSize: 1000 * 1024 * 1024
    }
});
router.post('/crearUsuarioAdmin', upload.none(), async (req: Request, res: Response) => {
    const { fModo, fUsuario,
        fClave,
        fNombres,
        fApellidos,
        fTipoDocumento,
        fNroDocumento,
        fCorreo,
        fTelefono,
        fPais,
        fDepartamento,
        fProvincia,
        fDistrito,
        fFechaNac,
        fGenero,
        fCorreoEmp,
        fTelefonoEmp,
        fArea,
        fPuesto,
        fDescripcion, fDireccion, UCuerpo, UPerfil } = req.body;
    const sql = `select count(*) from "Usuario" where "Usuario"='${fUsuario}'`;

    try {
        // Ejecutar la consulta SQL directamente usando sequelize.query
        const data: any = await db.query(sql, {});
        if (data[0][0].count == 1) {

            return res.status(200).json({
                ok: true,
                msg: "El Usuario ya existe",
                data,
            });

        } else {
            if (fModo === 'Empleado') {

                const sql2 = `Insert into "Entidad" ("Nombres","Apellidos","TipoDocumento_id","NroDocumento","Correo",
                "Telefono","Ubigeo","Direccion","Genero","FcNacimiento") values ('${fNombres}','${fApellidos}',
                ${fTipoDocumento},'${fNroDocumento}','${fCorreo}','${fTelefono}','010101','${fDireccion}','${fGenero}','${fFechaNac}') RETURNING "IdEntidad"`;
                const data2: any = await db.query(sql2, {});

                const sql1 = `Insert into "Empleado" ("Descripcion","CorreoCorporativo","TelefonoCorporativo","Area_id","Puesto_id","Entidad_id") values 
                ('${fDescripcion}','${fCorreoEmp}','${fTelefonoEmp}',${fArea},${fPuesto},${data2[0][0].IdEntidad}) RETURNING "IdEmpleado"`;
                const data1: any = await db.query(sql1, {});

                const sql3 = `Insert into "Usuario" ("Usuario","Clave","RutaImagenPerfil","RutaImagenCuerpo","Entidad_id") 
        values ('${fUsuario}','${fClave}','${'/Multimedia/Imagen/Usuarios/Perfil/' + UPerfil}','${'/Multimedia/Imagen/Usuarios/Cuerpo/' + UCuerpo}',${data2[0][0].IdEntidad})`;
                const data3: any = await db.query(sql3, {});

                return res.status(200).json({
                    ok: true,
                    msg: "Información correcta",
                    data,
                });
            }
            if (fModo === 'Cliente') {
                const sql2 = `Insert into "Entidad" ("Nombres","Apellidos","TipoDocumento_id","NroDocumento","Correo",
                "Telefono","Ubigeo","Direccion","Genero","FcNacimiento") values ('${fNombres}','${fApellidos}',
                ${fTipoDocumento},'${fNroDocumento}','${fCorreo}','${fTelefono}','010101','${fDireccion}','${fGenero}','${fFechaNac}') RETURNING "IdEntidad"`;
                const data2: any = await db.query(sql2, {});


                const sql3 = `Insert into "Usuario" ("Usuario","Clave","RutaImagenPerfil","RutaImagenCuerpo","Entidad_id") 
        values ('${fUsuario}','${fClave}','${'/Multimedia/Imagen/Usuarios/Perfil/' + UPerfil}','${'/Multimedia/Imagen/Usuarios/Cuerpo/' + UCuerpo}',${data2[0][0].IdEntidad})`;
                const data3: any = await db.query(sql3, {});

                return res.status(200).json({
                    ok: true,
                    msg: "Información correcta",
                    data,
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/subirvideossala', upload.single('Dvideovivo'), async (req: Request, res: Response) => {
    try {
        const { pidproductotemario, pidsala } = req.body;
        const file = req.file;

        if (!pidproductotemario || !pidsala || !file) {
            return res.status(400).json({ error: "Faltan datos requeridos o archivo" });
        }

        const fileName = file.originalname;

        // Verificar si ya existe el registro en la base de datos
        const checkResult = await db.query(
            `SELECT COUNT(*) as count FROM "ProductoTemarioAdjunto" WHERE "ProductoTemario_id" = :pproductotemario AND "Sala_id" = :psala`,
            {
                replacements: { pproductotemario: pidproductotemario, psala: pidsala },
            }
        );

        const count = (checkResult[0][0] as any).count;


        if (count > 0) {
            // Si existe, actualizar el archivo
            await db.query(
                `UPDATE "ProductoTemarioAdjunto" 
                SET "NombreArchivo" = :pname 
                WHERE "ProductoTemario_id" = :pproductotemario AND "Sala_id" = :psala`,
                {
                    replacements: { pname: fileName, pproductotemario: pidproductotemario, psala: pidsala },
                }
            );
            return res.json({ message: "Archivo actualizado correctamente" });
        } else {
            // Si no existe, insertar un nuevo registro
            await db.query(
                `INSERT INTO "ProductoTemarioAdjunto" 
                ("ProductoTemario_id", "Sala_id", "Tipo1", "Tipo2", "Tipo3", "Tipo4", "NombreArchivo") 
                VALUES (:pproductotemario, :psala, 'Multimedia', 'Video', 'Cursos', 'Modulos', :pname)`,
                {
                    replacements: { pproductotemario: pidproductotemario, psala: pidsala, pname: fileName },
                }
            );
            return res.json({ message: "Archivo insertado correctamente" });
        }

    } catch (error) {
        console.error("Error en /subirvideossala:", error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
});

router.post('/subircertificado', upload.single('Dvideovivo'), async (req: Request, res: Response) => {
    try {
        const { pproducto_id, pusuario_id ,posicion} = req.body;
        const file = req.file;

        if ( !file) {
            return res.status(400).json({ error: "Faltan datos requeridos o archivo" });
        }

        const fileName =`/Multimedia/Imagen/Cursos/${posicion}/`+file.originalname;

        // Verificar si ya existe el registro en la base de datos
        const checkResult = await db.query(
            `SELECT COUNT(*) as count FROM "Certificado" WHERE "Usuario_id" = :pusuario_id AND "Producto_id" = :pproducto_id`,
            {
                replacements: { pusuario_id: pusuario_id, pproducto_id: pproducto_id },
            }
        );

        const count = (checkResult[0][0] as any).count;
        console.log(fileName)
        console.log(count)
        if(posicion=='CertificadoAdelante'){
            await db.query(
                `UPDATE "Certificado" 
                SET "RutaImagenDelante" = :pname 
                WHERE "Usuario_id" = :pusuario_id AND "Producto_id" = :pproducto_id`,
                {
                    replacements: { pname:fileName,pusuario_id: pusuario_id, pproducto_id: pproducto_id },
                }
            );
            return res.json({ message: "Archivo actualizado correctamente" });
        }else{
            await db.query(
                `UPDATE "Certificado" 
                SET "RutaImagenDetras" = :pname 
                WHERE "Usuario_id" = :pusuario_id AND "Producto_id" = :pproducto_id`,
                {
                    replacements: { pname:fileName,pusuario_id: pusuario_id, pproducto_id: pproducto_id },
                }
            );
            return res.json({ message: "Archivo actualizado correctamente" });
        }
        
    } catch (error) {
        console.error("Error en /subirvideossala:", error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
});

router.post('/guardar-atributos-admin', upload.none(), async (req: Request, res: Response) => {
    try {
        const { ptitulo, pdescripcion, pcalificacion, pseguidores, pnivel, pmarcasrespaldo,
            pexamenparcial, pexamenfinal, pprofesores, pfrecuencia, phorasacademicas, pcurso_id, pcodigocurso, pwhatsapp, PBrochure, PPortada
        } = req.body;
        const handleFileOperation = async (
            fileName: string | null,
            tipo1: string, tipo2: string, tipo3: string, tipo4: string
        ) => {
            if (!fileName) return;
            const checkSql = `
                SELECT * FROM "ProductoAdjunto"
                WHERE  "Curso_id"=${pcurso_id}
                AND "Tipo1"='${tipo1}' AND "Tipo2"='${tipo2}' AND "Tipo3"='${tipo3}' AND "Tipo4"='${tipo4}'
            `;

            const checkResult = await db.query(checkSql);

            if (checkResult[0].length > 0) {
                const updateSql = `
                    UPDATE "ProductoAdjunto" SET "NombreArchivo"='${fileName}'
                    WHERE "Curso_id"=${pcurso_id}
                    AND "Tipo1"='${tipo1}' AND "Tipo2"='${tipo2}' AND "Tipo3"='${tipo3}' AND "Tipo4"='${tipo4}'
                `;
                await db.query(updateSql);
            } else {
                const insertSql = `
                    INSERT INTO "ProductoAdjunto" ("Curso_id", "NombreArchivo", "Tipo1", "Tipo2", "Tipo3", "Tipo4")
                    VALUES (${pcurso_id}, '${fileName}', '${tipo1}', '${tipo2}', '${tipo3}', '${tipo4}')
                `;
                await db.query(insertSql);
            }


        };
        await handleFileOperation(PBrochure, 'Documentos', 'Pdf', 'Cursos', 'BrochureCursos');
        await handleFileOperation(PPortada, 'Multimedia', 'Imagen', 'Cursos', 'PortadaFinal');
        const sqlv1 = `
       	select * from "ProductoAtributo" Where "Curso_id"=${pcurso_id}
        `;
        const checkResult = await db.query(sqlv1);
        if (checkResult[0].length > 0) {
            const updateSql = `
                    UPDATE "ProductoAtributo"
                    SET 
                        "Descripcion"=${pdescripcion ? `'${pdescripcion}'` : 'NULL'},
                        "Calificacion"=${pcalificacion ? `'${pcalificacion}'` : 'NULL'},
                        "Seguidores"=${pseguidores ? `'${pseguidores}'` : 'NULL'},
                        "Nivel"=${pnivel ? `'${pnivel}'` : 'NULL'},
                        "MarcasRespaldo"=${pmarcasrespaldo ? `'${pmarcasrespaldo}'` : 'NULL'},
                        "ExamenParcial"=${pexamenparcial ? pexamenparcial : 'NULL'},
                        "ExamenFinal"=${pexamenfinal ? pexamenfinal : 'NULL'},
                        "Profesores"=${pprofesores ? `'${JSON.parse(pprofesores)}'` : 'NULL'},
                        "Frecuencia"=${pfrecuencia ? `'${JSON.parse(pfrecuencia)}'` : 'NULL'},
                        "HorasAcademicas"=${phorasacademicas ? `'${phorasacademicas}'` : 'NULL'},
                         "NumeroWhatsapp"=${pwhatsapp ? `'${pwhatsapp}'` : 'NULL'}
                    WHERE "Curso_id"=${pcurso_id}
                `;
            await db.query(updateSql);
        } else {
            const insertSql = `
           INSERT INTO "ProductoAtributo" (
                        "Curso_id",
                        "Descripcion",
                        "Calificacion",
                        "Seguidores",
                        "Nivel",
                        "MarcasRespaldo",
                        "ExamenParcial",
                        "ExamenFinal",
                        "Profesores",
                        "Frecuencia",
                        "HorasAcademicas",
                        "NumeroWhatsapp"
                    ) VALUES (
                        ${pcurso_id},
                        ${pdescripcion ? `'${pdescripcion}'` : 'NULL'},
                        ${pcalificacion ? `'${pcalificacion}'` : 'NULL'},
                        ${pseguidores ? `'${pseguidores}'` : 'NULL'},
                        ${pnivel ? `'${pnivel}'` : 'NULL'},
                        ${pmarcasrespaldo ? `'${pmarcasrespaldo}'` : 'NULL'},
                        ${pexamenparcial ? pexamenparcial : 'NULL'},
                        ${pexamenfinal ? pexamenfinal : 'NULL'},
                        ${pprofesores ? `'${JSON.parse(pprofesores)}'` : 'NULL'},
                        ${pfrecuencia ? `'${JSON.parse(pfrecuencia)}'` : 'NULL'},
                        ${phorasacademicas ? `'${phorasacademicas}'` : 'NULL'},
                        ${pwhatsapp ? `'${pwhatsapp}'` : 'NULL'}
                    );
        `;
            await db.query(insertSql);
        }
        const sql2 = `
        UPDATE "Curso" set "Curso"='${ptitulo}',"CodigoCurso"='${pcodigocurso}' WHERE "IdCurso"=${pcurso_id}
        `;
        const data1 = await db.query(sql2, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        res.status(200).json({
            ok: true,
            msg: "Archivos subidos y base de datos actualizada correctamente",
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/guardar-archivosmodulos-admin', upload.none(), async (req: Request, res: Response) => {
    try {
        const { fileMetadata, idproductotemario, idcurso } = req.body;
        const archivos = JSON.parse(fileMetadata); // Convertir a array de objetos

        for (const archivo of archivos) {
            const { tipo1, tipo2, tipo3, tipo4, name, abbreviation } = archivo;
            if (abbreviation == 'VideoPresentacion') {
                const existe: any = await db.query(
                    `SELECT Count(*) FROM "ProductoIntroduccion"
                WHERE "Tipo1" = :tipo1 AND "Tipo2" = :tipo2 AND "Tipo3" = :tipo3 AND "Tipo4" = :tipo4
                AND "NombreArchivo" = :name AND "Curso_id" = :idcurso`,
                    {
                        replacements: { tipo1, tipo2, tipo3, tipo4, name, idcurso },
                    }
                );
                if (existe[0][0].count > 0) {

                } else {
                    // Si no existe, hacer INSERT
                    await db.query(
                        `INSERT INTO "ProductoIntroduccion"
                    ("Tipo1", "Tipo2", "Tipo3", "Tipo4", "NombreArchivo", "Curso_id")
                    VALUES (:tipo1, :tipo2, :tipo3, :tipo4, :name, :idcurso)`,
                        {
                            replacements: { tipo1, tipo2, tipo3, tipo4, name, idcurso },
                        }
                    );
                }
            } else {
                // Verificar si el archivo ya existe en la base de datos
                const existe: any = await db.query(
                    `SELECT Count(*) FROM "ProductoTemarioAdjunto"
                WHERE "Tipo1" = :tipo1 AND "Tipo2" = :tipo2 AND "Tipo3" = :tipo3 AND "Tipo4" = :tipo4
                AND "NombreArchivo" = :name AND "ProductoTemario_id" = :idproductotemario`,
                    {
                        replacements: { tipo1, tipo2, tipo3, tipo4, name, idproductotemario },
                    }
                );
                if (existe[0][0].count > 0) {

                } else {
                    // Si no existe, hacer INSERT
                    await db.query(
                        `INSERT INTO "ProductoTemarioAdjunto"
                    ("Tipo1", "Tipo2", "Tipo3", "Tipo4", "NombreArchivo", "ProductoTemario_id")
                    VALUES (:tipo1, :tipo2, :tipo3, :tipo4, :name, :idproductotemario)`,
                        {
                            replacements: { tipo1, tipo2, tipo3, tipo4, name, idproductotemario },
                        }
                    );
                }
            }
        }

        res.status(200).json({ ok: true, msg: "Proceso completado con éxito" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: "Error en el proceso" });
    }
});



router.post('/ActualizarCursoOnline', async (req: Request, res: Response) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { pidproducto, pprecio } = req.body;

        // Realizar la consulta SQL para obtener los ID de producto
        const sql = `
            UPDATE "ProductoPrecio" set  "Precio"=${pprecio} where "Producto_id"=${pidproducto} and "Tiempo"=1
        `;
        const datap1 = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        res.status(200).json({
            ok: true,
            msg: "Archivos subidos y base de datos actualizada correctamente",
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/ActualizarCursoMixto', async (req: Request, res: Response) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { pidproducto, pprecio } = req.body;

        // Realizar la consulta SQL para obtener los ID de producto
        const sql = `
            UPDATE "ProductoPrecio" set  "Precio"=${pprecio} where "Producto_id"=${pidproducto} and "Tiempo"=1
        `;
        const datap1 = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        res.status(200).json({
            ok: true,
            msg: "Archivos subidos y base de datos actualizada correctamente",
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/ActualizarCursoAsincronico', async (req: Request, res: Response) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { pidproducto, pprecio } = req.body;

        // Realizar la consulta SQL para obtener los ID de producto
        const sql = `
            UPDATE "ProductoPrecio" set  "Precio"=${pprecio} where "Producto_id"=${pidproducto} and "Tiempo"=1
        `;
        const datap1 = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        res.status(200).json({
            ok: true,
            msg: "Archivos subidos y base de datos actualizada correctamente",
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/ObtenerIdsProducto', async (req: Request, res: Response) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { pclasificacion } = req.body;
        const { pmodelo } = req.body;


        // Realizar la consulta SQL para obtener los ID de producto
        const sql = `
           	select "tp"."IdTipoProducto","pro"."IdProducto","Precio","pro"."Estado_id" from "Producto" "pro"
            inner join "Modelo" "mod" on "mod"."IdModelo"="pro"."Modelo_id"
            inner join "SubCategoria" "sub" on  "sub"."IdSubCategoria"="pro"."SubCategoria_id"
            inner join "Categoria" "cat" on "cat"."IdCategoria"="sub"."Categoria_id"
            inner join "Clasificacion" "cla" on "cla"."IdClasificacion"="cat"."Clasificacion_id"
            inner JOIN "TipoProducto" "tp" ON "tp"."IdTipoProducto" = "cla"."TipoProducto_id"
            left join "ProductoPrecio" "pp" on "pp"."Producto_id"="pro"."IdProducto"
			where "mod"."IdModelo"=${pmodelo} and "cla"."Clasificacion"=${"'" + pclasificacion + "'"}
            group by "IdProducto","tp"."IdTipoProducto","Precio"
        `;
        const datap1 = await db.query(sql, {
            replacements: {}, // Parámetro para evitar inyecciones SQL
        });
        res.status(200).json({
            data: datap1,
            ok: true,
            msg: "Archivos subidos y base de datos actualizada correctamente",
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: "Error en el proceso",
        });
    }
});
router.post('/generate-presigned-urls', upload.fields([
    { name: 'PBrochure', maxCount: 1 },
    { name: 'PPortada', maxCount: 1 },
    { name: 'Dvideovivo', maxCount: 1 },
    { name: 'DAdelante', maxCount: 1 },
    { name: 'DAtras', maxCount: 1 },
    { name: 'VideoCursoPresentacion', maxCount: 1 },
    { name: 'UCuerpo', maxCount: 1 },
    { name: 'UPerfil', maxCount: 1 },
]), async (req, res) => {
    const { files } = req.body; // Espera un array con nombres y tipos de archivos

    const urls: any = {};
    try {
        for (const file of files) {
            console.log('1' + JSON.stringify(file));
            const params = {
                Bucket: 'ccd-storage',
                Key: file.filePath,
                ContentType: file.type,
            };

            const command = new PutObjectCommand(params);
            const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

            // Almacenar múltiples URLs bajo la misma key si hay varias
            if (!urls[file.abbreviation]) {
                urls[file.abbreviation] = [];
            }
            urls[file.abbreviation].push(url);
        }

        res.json({ urls });

        console.log(urls);

    } catch (err) {
        console.error('Error generating presigned URLs:', err);
        res.status(500).json({ ok: false, msg: 'Error generating presigned URLs' });
    }
});
/*-----------------*/
router.post('/listaradministrarcursosv2', listaradministrarcursosv2)
router.post('/listarclientev2', listarclientev2)
router.post('/listarescuelav2', listarescuelav2)
router.post('/listarespecializacionxescuelav2', listarespecializacionxescuelav2)
router.post('/listarcursoxespecializacionv2', listarcursoxespecializacionv2)
router.post('/listartipocursov2', listartipocursov2)

router.post('/crearescuelav2', crearescuelav2)
router.post('/crearespecializacionv2', crearespecializacionv2)
router.post('/crearcursov2', crearcursov2)
router.post('/crearproductov2', crearproductov2)
router.post('/crearproductotemariocontenidov2', crearproductotemariocontenidov2)


router.post('/listaradministrarusuariov2', listaradministrarusuariov2)
router.post('/listarcursoxusuariov2', listarcursoxusuariov2)
router.post('/listarevaluacionesxcursov2', listarevaluacionesxcursov2)
router.post('/listarevaluacionesnotaxusuariov2', listarevaluacionesnotaxusuariov2)
router.post('/listarpreguntasxevaluacionv2', listarpreguntasxevaluacionv2)
router.post('/guardarevaluacionv2', guardarevaluacionv2)
router.post('/listarescuelasxusuariov2', listarescuelasxusuariov2)
router.post('/listarespecializacionesxusuariov2', listarespecializacionesxusuariov2)
router.post('/listarrutasxusuariov2', listarrutasxusuariov2)
router.post('/verpreguntasxtipoxcursov2', verpreguntasxtipoxcursov2)
router.post('/guardarpreguntasadmin', guardarpreguntasadmin)
router.post('/listarcertificadoacreditaciones', listarcertificadoacreditaciones)
router.post('/guardarcertificadov2', guardarcertificadov2)
router.post('/listarinputlayoutv2', listarinputlayoutv2)
router.post('/listarpreguntasyrespuestasv2', listarpreguntasyrespuestasv2)
router.post('/insertarpreguntav2', insertarpreguntav2)
router.post('/insertarrespuestav2', insertarrespuestav2)



router.post('/listarespecializacionesxescuelav2', listarespecializacionesxescuelav2)
router.post('/listarcursosxespecializacionv2', listarcursosxespecializacionv2)
router.post('/listarcursosxrutasv2', listarcursosxrutasv2)


router.post('/listarcursoslimitadosv2', listarcursoslimitadosv2)
router.post('/listarcursostotalesv2', listarcursostotalesv2)
router.post('/vermodalidadescursov2', vermodalidadescursov2)
router.post('/administradoractualizarmodalidadesv2', administradoractualizarmodalidadesv2)

router.post('/verevaluacionescursov2', verevaluacionescursov2)

router.post('/listarTemarioVivov2', listarTemarioVivov2)

router.post('/insertarusuariomasivov2', insertarusuariomasivov2)
router.post('/crearsignaturezoomv2', crearsignaturezoomv2)
router.post('/listarpreguntasxencuestav2', listarpreguntasxencuestav2)
router.post('/listarencuestasalumnoobligatoriov2', listarencuestasalumnoobligatoriov2)
router.post('/listarnotasproductosv2', listarnotasproductosv2)
router.post('/listarnotasproductosxproidv2', listarnotasproductosxproidv2)
router.post('/responderencuestav2', responderencuestav2)
router.post('/versalasdisponiblesv2', versalasdisponiblesv2)
router.post('/validarpertenenciasalav2', validarpertenenciasalav2)
router.post('/integrarsesalav2', integrarsesalav2)
router.post('/obtenersalasv2', obtenersalasv2)
router.post('/obtenersalasusuariosv2', obtenersalasusuariosv2)
router.post('/obteneridproductoxcursov2', obteneridproductoxcursov2)
router.post('/crearsalav2', crearsalav2)
router.post('/vercursosplataformatiendaxtop1v2', vercursosplataformatiendaxtop1v2)
router.post('/listarvideointrov2', listarvideointrov2)
router.post('/listartemariointrov2', listartemariointrov2)
router.post('/listardatoscertificadogenerarv2', listardatoscertificadogenerarv2)
router.post('/acreditacionescertificadosv2', acreditacionescertificadosv2)
router.post('/asignarcursocarritov2', asignarcursocarritov2)
router.post('/listarplanv2', listarplanv2)
router.post('/comprarplannopremiumv2', comprarplannopremiumv2)
router.post('/comprarplanpremiumv2', comprarplanpremiumv2)
router.post('/listarpreguntasmarcadasxevaluacionv2', listarpreguntasmarcadasxevaluacionv2)

// bruno

router.post('/loginUsuario', loginUsuario)
router.post('/verificarCode',verificarCode)
router.post('/actualizarClaveTemporal',emailRateLimiter4,actualizarClaveTemporal)
router.post('/updatePassword',updatePassword)
//

router.post('/vercursosplataformatiendaxtopv2', vercursosplataformatiendaxtopv2)

router.post('/vercursosplataformamineria', vercursosplataformamineria)
router.post('/verespecializacionesmineria', verespecializacionesmineria)
router.post('/buscarCursosPorPalabra', buscarCursosPorPalabra)
router.post('/listarpermisosv2', listarpermisosv2)
router.post('/guardarpermisosv2', guardarpermisosv2)

router.post('/getcursodetalle', getcursodetalle)
router.post('/frontgetcursodetalle', frontgetcursodetalle)
router.post('/getescuela', getescuela)
router.post('/escuelagetcursodetalle', escuelagetcursodetalle)
router.post('/getcursosfull', getcursosfull)
router.post('/getcursosav', getcursosav)
router.post('/getcursoescuelaespecializacion', getcursoescuelaespecializacion)
router.post('/asignarcursoadminv2', asignarcursoadminv2)

router.post('/vercursosespecializacionescuela', vercursosespecializacionescuela)
router.post('/listaespecializacion', listaespecializacion)

router.post('/getRutas', getRutas)
router.post('/getRutasDetalle', getRutasDetalle)
router.post('/ObtenerEspe', ObtenerEspe)
router.post('/asignarxpago', asignarxpago)
router.post('/actualizarEntidad', actualizarEntidad)
router.post('/vercursosespecializacionGeneral', vercursosespecializacionGeneral)
router.post('/listaespecializacionGeneral', listaespecializacionGeneral)

router.post('/obteneridsalav2', obteneridsalav2)



export default router;