"use client";
import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import axios from "axios";
import { environment } from "@/environments/environment";
import { RxCross2 } from "react-icons/rx";

const api = axios.create({
  baseURL: environment.baseUrl,
  headers: { "Content-Type": "application/json" },
});

export default function CancelarSuscripcion() {
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [razon, setRazon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const mensaje = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 15px; text-align: center; }
            .content { padding: 20px; background-color: #fff; border: 1px solid #ddd; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Solicitud de Cancelación</h2>
            </div>
            <div class="content">
              <p><strong>Correo del usuario:</strong> ${email}</p>
              <p><strong>Motivo de cancelación:</strong> ${motivo}</p>
              <p><strong>Razón específica:</strong> ${razon}</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático. Por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const response = await api.post("/inicio/EnviarCorreoPago", {
        pdestinatario: "info@ccdcapacitacion.edu.pe",
        pmensaje: mensaje,
        asunto: "Solicitud de Cancelación"
      });

      console.log("Respuesta del servidor:", response.data);

      if (response.data.success || (typeof response.data === "string" && response.data.includes("enviado"))) {
        Swal.fire({
          title: "Solicitud enviada",
          text: "Hemos recibido tu solicitud de cancelación. Nos pondremos en contacto contigo pronto.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setEmail("");
        setMotivo("");
        setRazon("");
      } else {
        throw new Error(response.data.message || "Error al enviar el correo");
      }
    } catch (error: any) {
      console.error("Error en la solicitud:", error);
      setMessage(error.message || "Error al enviar la solicitud. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 bg-gradient-to-br from-[rgba(0,96,254,0.4)] via-[rgba(22,46,84,0.5)] to-[rgba(0,96,254,0.4)] border-2 border-[rgba(22,46,84,0.4)] rounded-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Cancelar Suscripción/Membresía</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-colors-sky-ccd mb-2 font-medium">
              Correo electrónico:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-colors-sky-ccd focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="motivo" className="block text-colors-sky-ccd mb-2 font-medium">
              ¿Qué deseas cancelar?
            </label>
            <select
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-colors-sky-ccd focus:border-transparent"
            >
              <option value="">Selecciona una opción</option>
              <option value="Suscripción anual">Suscripción anual</option>
              <option value="Membresía premium">Membresía premium</option>
              <option value="Curso específico">Cuenta personal</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="razon" className="block text-colors-sky-ccd mb-2 font-medium">
              Razón de la cancelación:
            </label>
            <textarea
              id="razon"
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-colors-sky-ccd focus:border-transparent"
              placeholder="Por favor, dinos por qué quieres cancelar..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-br from-[rgba(0,96,254,0.4)] hover:from-[rgba(0,96,254,0.7)] via-[rgba(22,46,84,0.5)] hover:via-[rgba(22,46,84,0.7)] 
            to-[rgba(0,96,254,0.4)] hover:to-[rgba(0,96,254,0.7)] border-2 border-[rgba(22,46,84,0.7)] text-white rounded-2xl transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : 'Enviar solicitud'}
          </button>

          {message && (
            <div className={`p-4 rounded-2xl text-center ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-white">
          <p>¿Cambiaste de opinión? <Link href="/" className="text-colors-sky-ccd hover:underline">Volver al inicio</Link></p>
        </div>
      </div>
    </div>
  );
}