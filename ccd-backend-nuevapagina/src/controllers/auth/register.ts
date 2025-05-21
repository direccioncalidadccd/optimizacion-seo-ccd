import { request, response } from "express";
import db from "../../db/connection";
import nodemailer from "nodemailer";

// Función simplificada para generar una contraseña de 8 dígitos
function generarContrasena() {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let contrasena = "";
    for (let i = 0; i < 8; i++) {
        contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasena;
}

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "paginawebccd@gmail.com",
        pass: "iplg sjuy hapk azsv",
    },
});

export const crearUsuariov2 = async (req = request, res = response) => {
    const { pnombres, papellidos, pcorreo,pimg } = req.body;

    // Generar una contraseña numérica de 8 dígitos
    const contrasena = generarContrasena();

    try {
        // Insertar en la tabla "Entidad"
        const sqlEntidad = `  
            INSERT INTO "Entidad"("Nombres", "Apellidos", "Correo") 
            VALUES ('${pnombres}', '${papellidos}', '${pcorreo}') 
            RETURNING "IdEntidad"
        `;
        const dataEntidad: any = await db.query(sqlEntidad, {
            replacements: {},
        });

        const idEntidad = dataEntidad[0][0].IdEntidad;

        // Insertar en la tabla "Usuario"
        try {

            const sqlUsuario = `
                INSERT INTO "Usuario"("Usuario", "Clave", "RutaImagenPerfil","Entidad_id")
                VALUES ('${pcorreo}', '${contrasena}', '${pimg}',${idEntidad})
                RETURNING "IdUsuario"
            `;
            
            
            const dataUsuario: any = await db.query(sqlUsuario);
            const idUsuario = dataUsuario[0][0].IdUsuario;
            
        } catch (error) {
            console.error("Error específico al insertar usuario:", error);
            throw error;
        }

        // Insertar en la tabla "EntidadCliente"
        const sqlEntidadCliente = `   
            INSERT INTO "EntidadCliente"("Cliente_id", "Entidad_id") 
            VALUES (1, ${idEntidad})    
        `;
        await db.query(sqlEntidadCliente, {
            replacements: {},
        });

        // Enviar correo con el usuario y la contraseña
        const mailOptions = {
            from: "paginawebccd@gmail.com",
            to: pcorreo,
            subject: "Registro exitoso - Tus credenciales de acceso",
            text: `¡Hola ${pnombres}!\n\nTu registro ha sido exitoso. Aquí están tus credenciales de acceso:\n\nUsuario: ${pcorreo}\nContraseña: ${contrasena}\n\nPor favor, cambia tu contraseña después de iniciar sesión por primera vez.`,
            html: `<p>¡Hola ${pnombres}!</p>
                   <p>Tu registro ha sido exitoso. Aquí están tus credenciales de acceso:</p>
                   <p><strong>Usuario:</strong> ${pcorreo}</p>
                   <p><strong>Contraseña:</strong> ${contrasena}</p>
                   <p>Por favor, cambia tu contraseña después de iniciar sesión por primera vez.</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            ok: true,
            msg: "Usuario registrado exitosamente. Se ha enviado un correo con las credenciales.",
        });
    } catch (err) {
        console.error("Error en el proceso de registro:", err);

        if ((err as any).code === "23505") {
            return res.status(400).json({
                ok: false,
                msg: "El correo electrónico ya está registrado.",
            });
        } else if ((err as any).responseCode) {
            return res.status(500).json({
                ok: false,
                msg: "Error al enviar el correo electrónico. Por favor, contacta al soporte.",
            });
        } else {
            return res.status(500).json({
                ok: false,
                msg: "Error en el servidor. Por favor, intenta nuevamente más tarde.",
            });
        }
    }
};