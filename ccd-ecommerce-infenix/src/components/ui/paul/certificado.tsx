"use client";

import React, { useEffect, useState } from "react";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import axios from "axios";
import { environment } from "@/environments/environment";

function GalleryWithCodeVerification({ codigo }: any) {
  const [code, setCode] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [vercertificado, setvercertificado] = useState([]); // Estado para la fuente del video


  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });
  // Función para verificar el código
  const verifyCode = async (codigoVerificar: string) => {
    try {
      const listarTemario = await api.post("/inicio/vercertificadosxcodigov2", {
        fcodigo: codigoVerificar,
      });

      const data = listarTemario.data.data[0];
      setvercertificado(data);

      if (data.length>0) {
        setShowGallery(true);
      } else {
        setShowGallery(false);
        alert("No se encontró el certificado");
      }
    } catch (error) {
      console.error("Error en la verificación:", error);
      alert("Ocurrió un error al verificar el certificado");
    }
  };

  useEffect(() => {
    if (codigo) {
      setCode(codigo);
    }
  }, [codigo]);

  // Efecto para ejecutar `verifyCode` solo cuando `code` se actualice
  useEffect(() => {
    if (code.trim()) {
      verifyCode(code);
    }
  }, [code]);

  return (
    <div className="w-full max-w-md flex flex-col gap-10">
      <div className="relative  flex flex-col gap-10">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ejemplo: VFEMCCD2025"
            className="w-full border-[0.5px] border-white rounded-xl bg-[#1a1b26] px-10 max-lg:px-4 py-[0.6rem] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700"
          />
          <button
            onClick={()=>verifyCode(code)}
            className="rounded-xl absolute right-1 top-1/2 -translate-y-1/2 bg-[#00ccbb] px-6 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[#00e6c1]"
          >
            Verificar
          </button>
        </div>
      </div>

      {/* Solo mostrar LightGallery si el código es válido */}
      {showGallery && (
        <LightGallery
          elementClassNames="flex w-full gap-8 justify-center"
          speed={500}
          plugins={[lgThumbnail, lgZoom]}
          thumbnail={true}
        >
          {vercertificado.map((item: any, index: any) => (
            <>
              <a key={`delante-${index}`} href={environment.baseUrlStorage + item.RutaImagenDelante}>
                <img
                  alt={`img-delante-${index}`}
                  src={environment.baseUrlStorage + item.RutaImagenDelante}
                  className="w-36 h-32 object-cover cursor-pointer rounded-xl"
                />
              </a>
              <a key={`detras-${index}`} href={environment.baseUrlStorage + item.RutaImagenDetras}>
                <img
                  alt={`img-detras-${index}`}
                  src={environment.baseUrlStorage + item.RutaImagenDetras}
                  className="w-36 h-32 object-cover cursor-pointer rounded-xl"
                />
              </a>
            </>
          ))}
        </LightGallery>
      )}
    </div>
  );
}

export default GalleryWithCodeVerification;
