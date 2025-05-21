"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { IoMail } from "react-icons/io5";
import { FaPhoneAlt, FaFacebook, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { TbDeviceLandlinePhone } from "react-icons/tb";
import { MdMenuBook } from "react-icons/md";

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
const icon = {
  mobilphone: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/footer-icon-mobilphone.svg`,
  iphone: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/footer-icon-phone.svg`,
  message: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/footer-icon-message.svg`,
  map: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/footer-icon-map.svg`,
};

const Footer = ({ environment }: { environment: any }) => {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const currentYear = new Date().getFullYear();

  const phoneNumber = "51908841254";
  const defaultMessage = "Hola, deseo mi Masterclass gratuita 📲😁📣";
  const [message, setMessage] = useState(defaultMessage);
  //   const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
  //     message
  //   )}`;
  const isMobile = /iPhone|Android|iPad|iPod/.test(navigator.userAgent);
  if (environment.modo === "desarrollo") return null;
  const handleSend = () => {
    // Genera la URL de WhatsApp
    const whatsappURL = isMobile
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
          message
        )}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
          message
        )}`;

    // Abre WhatsApp en una nueva pestaña
    window.open(whatsappURL, "_blank");

    // Reinicia el mensaje después de enviarlo
    setTimeout(() => {
      setMessage(defaultMessage);
    }, 500);
  };

  return (
    <>
      <div ref={footerRef}></div>
      <span className="w-full h-1 bg-white"></span>
      <footer className="bg-[#0a0e27] text-white py-12 border-t-2 border-white">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 lg:px-14">
          {/* Columna 1: Logo e Información de contacto */}
          <div className="">
            <img
              src={`${storageUrl}/Multimedia/Imagen/Ccd/Logos/CCDLOGOWHITE.png`}
              alt="CCD Logo"
              className="w-32 mb-4"
            />
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <img src={icon.mobilphone} className="text-sm w-6" />
                +51 908 841 254
              </li>
              <li className="flex items-center gap-3">
                <TbDeviceLandlinePhone className="text-3xl text-colors-cyan-ccd" />
                01 3083619
              </li>
              <li className="flex items-center gap-3">
                <img src={icon.message} className="text-sm w-6" />
                info@ccdcapacitacion.edu.pe
              </li>
              <li className="flex items-center gap-3">
                <img src={icon.map} className="text-sm w-6" />
                Av. Rivera Navarrete 762, San Isidro, Lima, Perú
              </li>
            </ul>
          </div>

          {/* Columna 2: Programas */}
          <div>
            <h4 className="text-colors-cyan-ccd text-xl font-semibold mb-4">
              Programas
            </h4>
            <ul className="space-y-2 text-sm">
              {/* <li>
              <Link href="/" className="hover:underline">
                Especializaciones en vivo
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:underline">
                Especializaciones asincronas
              </Link>
            </li> */}
              <li>
                <Link href="/en-vivo" className="hover:underline">
                  Cursos en Vivo
                </Link>
              </li>
              <li>
                <Link href="/asincronico" className="hover:underline">
                  Cursos Asincrónicos
                </Link>
              </li>
            </ul>
            <h4 className="text-colors-cyan-ccd text-xl font-semibold my-4">
              Sobre CCD
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/nosotros" className="hover:underline">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos-y-condiciones"
                  className="hover:underline"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Corporativo */}
          <div>
            <h4 className="text-colors-cyan-ccd text-xl font-semibold mb-4">
              Corporativo
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-colors-cyan-ccd text-2xl" />
                +51 995 377 509
              </li>
              <li>
                <Link
                  href="mailto:corporativo@ccdcapacitacion.com"
                  className="hover:underline"
                >
                  corporativo@ccdcapacitacion.com
                </Link>
              </li>
            </ul>
            <h4 className="text-colors-cyan-ccd text-xl font-semibold my-4">
              Síguenos
            </h4>

            <div className="flex max-2xl:flex-col">
              <div className="flex">
                <a
                  href="https://www.facebook.com/ccd.capacitacion"
                  target="_blank"
                  className="hover:underline"
                >
                  Facebook
                </a>
                <span className="mx-2">|</span>
                <a
                  href="https://www.youtube.com/channel/UCkUcUqz1EH9xEsogvVF92oA"
                  target="_blank"
                  className="hover:underline"
                >
                  Youtube
                </a>
                <span className="mx-2">|</span>
                <a
                  href="https://www.linkedin.com/company/centro-de-capacitaci%C3%B3n-y-desarrollo-ccd/"
                  target="_blank"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </div>
              <div>
                <span className="mx-2">|</span>
                <a
                  href="https://www.instagram.com/ccd.capacitacion"
                  target="_blank"
                  className="hover:underline"
                >
                  Instagram
                </a>
                <span className="mx-2">|</span>
                <a
                  href="https://www.tiktok.com/@ccd.capacitacion"
                  target="_blank"
                  className="hover:underline"
                >
                  Tiktok
                </a>
              </div>
            </div>
          </div>

          {/* Columna 4: Más */}
          <div>
            <h4 className="text-colors-cyan-ccd text-xl font-semibold mb-4">
              Más
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MdMenuBook className="text-colors-cyan-ccd size-8" />
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSflruyCMzI379rVSbtcawNZunN7WDlYcoZQ9cxB6Szz5mjloA/viewform"
                  target="_blank"
                  className="hover:underline"
                >
                  Libro de reclamaciones
                </a>
              </li>
              <li>
                <Link href="/validar" className="hover:underline">
                  Verificar certificado
                </Link>
              </li>
              <li>
                <button onClick={handleSend} className="hover:underline">
                  Masterclass gratuitas
                </button>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-de-privacidad"
                  className="hover:underline"
                >
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/cancelar-cuenta"
                  className="hover:underline"
                >
                  Cancelar mi suscripción o cuenta
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-4 -pb-2 -mb-2">
          Copyright {currentYear} - Empresa: CENTRO DE CAPACITACION Y DESARROLLO
          S.A.C. - RUC: 20606101911
        </div>
      </footer>
    </>
  );
};
export default Footer;
