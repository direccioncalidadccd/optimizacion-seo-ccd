import React, { useState } from "react";
import { Modal } from "@mui/material";
import PacksSectionModalCasi from "./packsectionmodal-CASI";
import PacksSectionModalCasiV2 from "./packsectionmodal-CASI-V2";
import Link from "next/link";
import ModalPromo from "./ModalPromo";
import Image from "next/image";
import CountdownTimer from "./countdowntimer";
import { environment } from "@/environments/environment";
import PopupPromo from "./PopUpPromo";

const FrontPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => setModalOpen(!isModalOpen);
  const contador: string = environment.contador;

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
  const images = {
    person: `${storageUrl}/Multimedia/Imagen/Ccd/landing/DiaDelTrabajo/Imagen_de_Campa%C3%B1a_izquierda_DIA_DEL_TRABAJO.webp`,
    icons: {
      gestion: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/portada-icon-gestion.svg`,
      ingenieria: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/portada-icon-ingenieria.svg`,
      mineria: `${storageUrl}/Multimedia/Imagen/Ccd/Iconos/portada-icon-mineria.svg`,
    },
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Imagen de fondo */}
        <Image
          src="https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Ccd/landing/background_azul_ccd-Photoroom.png"
          alt="Fondo azul CCD"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
          className="-mb-10"
        />

        <div className=" relative w-full  h-full flex items-center justify-center py-12 pt-20 ">
          {/* Contenido de la página */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Contenedor principal */}
            <div className=" max-w-[110rem] w-full h-full flex flex-col lg:flex-row  lg:px-16 ">
              {/* <p
                className=" absolute !max-lg:top-[30rem]  max-xl2:-left-[9rem] -left-[10rem] 
          top-[9rem] lg:top-[15rem]  w-fit -rotate-90 text-white text-[10px] lg:text-[15px]  max-2xl:text-[10px] max-lg:tex-[10px]"
              >
                *Promoción vigente desde
                <span className="max-lg:text-[10px] max-2xl:text-[25px] text-[10px] lg:text-[15px] font-bold">
                  {" "}
                  el 05 de Mayo hasta el 11 de Mayo
                </span>
              </p> */}
              {/* Columna izquierda: Imagen */}
              <div className="flex flex-col  justify-center lg:w-[55%] ml-10 lg:mb-0 relative">
                <Image
                  width={726}
                  height={550}
                  src={images.person}
                  alt="Persona"
                  className=" -mb-8"
                  priority
                />                                                             
                {/* <h1 className="w-full max-lg:w-fit text-6xl max-lg2:text-[40px] max-sm4:text-4xl max-sm3:text-2xl max-sm3:bottom-9 absolute bottom-[10rem] max-2xl:bottom-[7rem] max-sm3:left-[2.5rem] max-lg:left-[5rem] text-white font-[350]  ">
                <span className="font-bold text-6xl  max-sm4:text-4xl  max-lg2:text-[40px] max-sm3:text-2xl">
                  APRENDER <br />
                </span>{" "}
                ES{" "}
                <span className="font-bold text-6xl  max-sm4:text-4xl   max-lg2:text-[35px] max-sm3:text-2xl">
                  UN REGALO <br />
                </span>
                QUE
                <span className="text-6xl font-bold   max-sm4:text-4xl  max-lg2:text-[40px] max-sm3:text-2xl">
                  {" "}
                  NUNCA SE ACABA{" "}
                  <span className="text-7xl font-bold  max-sm4:text-5xl  max-2xl:text-6xl leading-[0] max-sm3:text-3xl">
                    !
                  </span>
                </span>
              </h1> */}
                {/* <div className="  -left-8 ">
                  <CountdownTimer targetDate={contador} />
                </div> */}
                {/* Antes */}
                {/* <div className="absolute max-[1536px]:bottom-8 bottom-16 max-sm3:bottom-0 -left-8 max-lg:left-16 max-sm3:left-8 ">
                  <CountdownTimer targetDate={contador} />
                </div> */}
              </div>

              {/* Columna derecha: Títulos, iconos y botón */}
              <div className="flex flex-col items-center mt-10 lg:mt-5 lg:w-[45%] text-center lg:text-left">
                <Image
                  alt="img"
                  src="https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Ccd/landing/basico/promo_19_99.webp"
                  width={480}
                  height={345}
                  priority
                  className="-mb-10"
                />
                {/* <Image
                  alt="img"
                  src="https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Ccd/landing/INFO_LADO%20DERECHO_CCD.png"
                  width={540}
                  height={179}
                  priority
                /> */}
                <h1 className="w-full max-w-md font-extrabold leading-tight tracking-wider hidden">
                  <span
                    className="text-4xl md:text-5xl lg:text-6xl text-transparent mr-2"
                    style={{
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: "#fff",
                    }}
                  >
                    TU
                  </span>
                  <span className="text-4xl md:text-5xl lg:text-6xl text-white">
                    EDUCACIÓN
                  </span>
                  <br />
                  <span
                    className="text-4xl md:text-6xl lg:text-[69px] text-transparent mr-2"
                    style={{
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: "#fff",
                    }}
                  >
                    ES
                  </span>
                  <span className="text-4xl md:text-6xl lg:text-[69px] text-white">
                    PRIMERO
                  </span>
                </h1>
                {/* Subtitulo */}
                <p className="w-full max-w-md text-white text-center hidden">
                  <span className="text-lg md:text-2xl text-colors-cyan-ccd">
                    ¡Suscríbete y refuerza{" "}
                  </span>
                  <span className="text-lg md:text-2xl text-white">
                    tus conocimientos en nuestras escuelas!
                  </span>
                </p>

                {/* Iconos */}
                <div className="flex pt-3 justify-center gap-4 ">
                  <Link href="/gestion">
                    <div className="relative max-sm:w-[110px] w-[130px] h-[150px] flex flex-col items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110">
                      {/* Contenedor con imagen de fondo e ícono */}
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Imagen de fondo */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/DEGRADADO ROJO.png"
                          alt="Imagen de fondo"
                          className="absolute w-full h-full object-cover rounded-lg z-0"
                        />

                        {/* Icono */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/ICONOS-25.svg"
                          alt="Icono"
                          className="absolute top-1/2 left-1/2 w-[60px] h-[60px] object-contain transform -translate-x-1/2 -translate-y-1/2 z-10"
                        />
                      </div>

                      {/* Texto debajo del contenedor */}
                      <div className="mt-2 absolute bottom-2 ">
                        <p className="text-white font-semibold text-center text-xl">
                          Gestión
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/ingenieria">
                    <div className="relative max-sm:w-[110px] w-[130px] h-[150px] flex flex-col items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110">
                      {/* Contenedor con imagen de fondo e ícono */}
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Imagen de fondo */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/DEGRADADO AZUL.png"
                          alt="Imagen de fondo"
                          className="absolute w-full h-full object-cover rounded-lg z-0"
                        />

                        {/* Icono */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/ICONOS-19.svg"
                          alt="Icono"
                          className="absolute top-1/2 left-1/2 w-[60px] h-[60px] object-contain transform -translate-x-1/2 -translate-y-1/2 z-10"
                        />
                      </div>

                      {/* Texto debajo del contenedor */}
                      <div className="mt-2 absolute bottom-2 ">
                        <p className="text-white font-semibold text-center text-xl">
                          Ingeniería
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/mineria">
                    <div className="relative max-sm:w-[110px] w-[130px] h-[150px] flex flex-col items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110">
                      {/* Contenedor con imagen de fondo e ícono */}
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Imagen de fondo */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/DEGRADADO NARANJA.png"
                          alt="Imagen de fondo"
                          className="absolute w-full h-full object-cover rounded-lg z-0"
                        />

                        {/* Icono */}
                        <img
                          src="/Multimedia/Imagen/ccdcorp/iconoshome/ICONOS-23.svg"
                          alt="Icono"
                          className="absolute top-1/2 left-1/2 w-[60px] h-[60px] object-contain transform -translate-x-1/2 -translate-y-1/2 z-10"
                        />
                      </div>

                      {/* Texto debajo del contenedor */}
                      <div className="mt-2 absolute bottom-2 ">
                        <p className="text-white font-semibold text-center text-xl">
                          Minería
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex mt-4 items-center text-white text-center lg:text-left">
                  <span className="mr-2 text-xl lg:text-2xl">Aplica para</span>
                  <span className="font-bold text-xl lg:text-2xl">
                    todas nuestras escuelas
                  </span>
                </div>

                {/* <div className="flex flex-col mt-4 items-center text-center lg:text-left">
                <Image
                  alt="img"
                  src="https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Ccd/landing/SemanaSanta_Texto.png"
                  width={480}
                  height={345}
                  priority
                />
                </div>         */}

                {/* Botón */}
                {/* <ModalPromo
                  css=" max-sm:w-fit border-3 mt-2 hover:text-colors-dark-blue-ccd bg-transparent border-colors-cyan-ccd text-colors-cyan-ccd 
            text-[30px] max-sm:text-2xl font-bold p-4  rounded-2xl 
            shadow-lg hover:bg-[#00d3c5] hover:shadow-[0_0_25px_5px_rgba(0,234,223,0.7)] transition-all duration-300"
                /> */}
              </div>
            </div>
          </div>
        </div>

        {/* Modal usando Material-UI */}
        <Modal open={isModalOpen} onClose={toggleModal}>
          <div className="flex justify-center items-center h-screen">
            {/* <PacksSectionModalCasi onClose={toggleModal} /> */}
            <PacksSectionModalCasiV2 onClose={toggleModal} />
          </div>
        </Modal>
      </div>
      {/* <PopupPromo /> */}
    </>
  );
};

export default FrontPage;
