"use client";
import {
  Select,
  SelectItem,
  Divider,
  Pagination as Pagination1,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalBody,
} from "@nextui-org/react";

import ProductPlatComponent from "@/components/ui/pricing/productoplat";
import { environment } from "@/environments/environment";
import { Button } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useGlobalContext } from "./layout";
import CardCurso from "@/components/ui/plataforma/CardCurso";
import CourseCardv2 from "@/components/ui/paul/coursecardv2";
import { useSession } from "next-auth/react";
import CourseCardTienda from "@/components/ui/paul/coursecardtienda";
import { MdKeyboardBackspace } from "react-icons/md";
import { BiSolidVideoRecording } from "react-icons/bi";
import { CiStreamOn } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { useCartProductoStore } from "@/context/cartProducto";
import CompraRapida from "@/components/ui/paul/compraRapida/payment-flow";
import {
  Download,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  ShoppingCart,
} from "lucide-react";
import Loaderinicioplataforma from "@/components/ui/plataforma/loader/loader-inicioplataforma";
import Image from "next/image";
import PopoverStruc from "@/components/ui/paul/PopoverStruc";
import { useRouter } from "next/router";

export default function Page() {
  const { data: session, status } = useSession();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onOpenChange: onOpenChange1,
  } = useDisclosure();

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "";

  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });
  const [enVivoActivo, setEnVivoActivo] = useState<boolean>(false);
  const [asincronicoActivo, setAsincronicoActivo] = useState<boolean>(false);
  const [cursosCompletos, setcursosCompletos] = useState<any[]>([]);
  const [preciototal, setpreciototal] = useState(0);
  const [precioAnterior, setprecioAnterior] = useState(0);
  const [idproducto, setidproducto] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post(
          "/inicio/vercursosplataformatiendaxtop1v2",
          {}
        );
        setcursosCompletos(response.data.data[0]);
        console.log(response.data.data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const { nombreGlobal, setNombreGlobal } = useGlobalContext();
  setNombreGlobal("principal");
  function capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  const openSideSheet = (curso: any) => {
    setSelectedCourse(curso);
    setIsOpen(true);
  };

  const addProductToCart = useCartProductoStore(
    (state) => state.addProductTocart
  );
  const removeProductFromCart = useCartProductoStore(
    (state) => state.removeProduct
  );
  const cart = useCartProductoStore((state) => state.cart);

  const handleSeleccion = (item: any) => {
    setpreciototal(item.Precio);
    setprecioAnterior(item.PrecioAnterior);

    // Actualizar estados de En Vivo y Asincrónico
    if (item.TipoModalidad === "En Vivo") {
      setmodalidad("En Vivo");

      setEnVivoActivo(true);
      setAsincronicoActivo(false);
    } else if (item.TipoModalidad === "Asincrónico") {
      setmodalidad("Asincrónico");

      setEnVivoActivo(false);
      setAsincronicoActivo(true);
    }
  };

  const handleCartToggle = (array: any) => {
    const TipoModalidad = enVivoActivo ? "1" : asincronicoActivo ? "2" : "";
    const isInCart = cart.some((item) => item.IdProducto === idproducto); // Calcular dentro de la función
    const imagen1 = imagen; // Calcular dentro de la función

    const nuevoarray = {
      ...array,
      Precio: preciototal.toFixed(2),
      PrecioAnterior: precioAnterior.toFixed(2),
      TipoModalidad: TipoModalidad,
      IdProducto: idproducto,
      RutaImagen: imagen1,
    };

    if (isInCart) {
      removeProductFromCart(nuevoarray);
    } else {
      addProductToCart(nuevoarray);
    }
  };

  const [modalidad, setmodalidad] = React.useState("");
  const [tipocurso, settipocurso] = useState("");
  const [curso, setcurso] = useState("");
  const [imagen, setimagen] = useState("");
  const [brochure, setbrochure] = useState("");

  useEffect(() => {
    if (selectedCourse && selectedCourse.Productos) {
      // Ordenar los productos
      settipocurso((selectedCourse as any).TipoCurso);
      setcurso((selectedCourse as any).Curso);

      const productosOrdenados = selectedCourse.Productos.slice().sort(
        (a: any, b: any) => {
          if (
            a.TipoModalidad === "En Vivo" &&
            b.TipoModalidad === "Asincrónico"
          )
            return -1;
          if (
            a.TipoModalidad === "Asincrónico" &&
            b.TipoModalidad === "En Vivo"
          )
            return 1;
          return 0;
        }
      );

      // Buscar el primer producto (En Vivo o Asincrónico)
      const productoInicial =
        productosOrdenados.find((p: any) => p.TipoModalidad === "En Vivo") ||
        productosOrdenados.find((p: any) => p.TipoModalidad === "Asincrónico");
      if (productoInicial) {
        setmodalidad(productoInicial.TipoModalidad);
        setpreciototal(productoInicial.Precio);
        setprecioAnterior(productoInicial.PrecioAnterior);
        setidproducto(productoInicial.IdProducto);
        const rutas = (cursosCompletos as any)[0].RutaImagen; // Obtenemos el string de la BD
        const rutasArray = JSON.parse(rutas);
        const rutaPortadaFinal = rutasArray.find((ruta: string) =>
          ruta.includes("PortadaFinal")
        );
        const rutaBrochureCursos = rutasArray.find((ruta: string) =>
          ruta.includes("BrochureCursos")
        );

        setbrochure(rutaBrochureCursos);
        setimagen(rutaPortadaFinal);
        // Activar el estado correspondiente
        if (productoInicial.TipoModalidad === "En Vivo") {
          setEnVivoActivo(true);
          setAsincronicoActivo(false);
        } else if (productoInicial.TipoModalidad === "Asincrónico") {
          setEnVivoActivo(false);
          setAsincronicoActivo(true);
        }
      }
    }
  }, [selectedCourse]);

  /* */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Datos de ejemplo para el slider
  const slides = [
    {
      title: "Módulo de inicio",
      description:
        "El módulo de inicio guía a nuevos usuarios con un tutorial interactivo sobre las funcionalidades y herramientas de la plataforma. Incluye un video sobre CCD, su misión y valores, y muestra cursos en venta, ayudando a descubrir opciones de aprendizaje.",
      image: "/Multimedia/modulo/Modulo1.png",
    },
    {
      title: "Módulo de mis cursos y diplomas",
      description:
        "Este módulo organiza la experiencia de aprendizaje, permitiendo acceder a cursos en curso, reanudar lecciones, seguir el progreso y descargar diplomas obtenidos. Es ideal para gestionar tu formación y compartir certificaciones verificables.",
      image: "/Multimedia/modulo/Modulo2.png",
    },
    {
      title: "Módulo de diplomas",
      description:
        "El módulo de diplomas guarda tus certificados de cursos completados, con detalles como fecha, contenido y entidad certificadora. Permite descargar o compartir logros en redes sociales o con empleadores, potenciando tu portafolio académico.",
      image: "/Multimedia/modulo/Modulo3.png",
    },
    {
      title: "Módulo de tienda",
      description:
        "Este módulo ofrece diversos cursos en venta, filtrables por categorías o intereses, con fichas detalladas sobre objetivos, temario, duración, precio y certificación. Facilita decisiones informadas para tu crecimiento profesional según tus metas.",
      image: "/Multimedia/modulo/Modulo4.png",
    },
    {
      title: "Módulo de ranking",
      description:
        "Este módulo agrega diversión al aprendizaje, mostrando tu posición en rankings según actividad, logros y participación. Incluye categorías como cursos completados o puntos acumulados, motivando el esfuerzo y premiando la excelencia.",
      image: "/Multimedia/modulo/Modulo5.png",
    },
  ];

  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  };
  const openModal1 = () => {
    setIsModalOpen1(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeModal1 = () => {
    setIsModalOpen1(false);
    document.body.classList.remove("overflow-hidden");
  };
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (sliderRef.current) {
      const translateValue = currentSlide * -100;
      sliderRef.current.style.transform = `translateX(${translateValue}%)`;
    }
  }, [currentSlide]);

  // Función para calcular el porcentaje de descuento
const calculateDiscount = (precioAnterior: number, precioActual: number): string => {
    // Verificar que los precios sean números válidos y mayores que cero
    if (
      typeof precioAnterior !== 'number' || 
      typeof precioActual !== 'number' || 
      precioAnterior <= 0 || 
      precioActual <= 0
    ) {
      return "0%"; // Valor por defecto si los precios no son válidos
    }
  
    // Si el precio anterior es menor que el actual, no hay descuento
    if (precioAnterior <= precioActual) {
      return "0%";
    }
  
    // Calcular el porcentaje de descuento: (precioAnterior - precioActual) / precioAnterior * 100
    const descuento = ((precioAnterior - precioActual) / precioAnterior) * 100;
    
    // Redondear el descuento a un número entero
    const descuentoRedondeado = Math.round(descuento);
    
    return `${descuentoRedondeado}%`;
  };

  return (
    <>
      <Loaderinicioplataforma />

      <div className="py-5 px-10 !overflow-visible">
        <h1 className="text-white text-2xl">
          Hola,{" "}
          {capitalizeWords(
            `${session?.user.Nombres} ${session?.user.Apellidos}`
          )}
          <span className="text-[#8F9094] text-2xl">
            {" "}
            Bienvenido de vuelta!
          </span>
        </h1>
      </div>
      {/* Modal Tutorial */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0a2a5e] to-[#051530] w-11/12 max-w-4xl rounded-2xl relative py-8 lg:p-8  shadow-2xl animate-slideUp">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="relative overflow-hidden">
              <div
                ref={sliderRef}
                className="flex transition-transform duration-500 ease-in-out"
              >
                {slides.map((slide, index) => (
                  <div key={index} className="min-w-full px-4">
                    <div className="flex flex-col items-center">
                      <h2 className="text-3xl font-bold text-center !mb-[1.5rem] text-white">
                        {slide.title}
                      </h2>
                      <div className="relative w-full max-w-lg h-64 mb-8 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                        <Image
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="object-cover"
                          fill
                        />
                      </div>
                      <p className="text-justify text-white/90 max-w-2xl text-lg leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full items-center justify-center transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={nextSlide}
                className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full items-center justify-center transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronRight size={24} />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "bg-white scale-125"
                        : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Tutorial  */}
      {isModalOpen1 && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-gradient-to-br from-[#0a2a5e] to-[#051530] w-11/12 max-w-4xl rounded-2xl relative p-8 
                                shadow-2xl animate-slideUp"
          >
            <button
              onClick={closeModal1}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out">
                <div className="min-w-full px-4">
                  <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-center !mb-[1.5rem] text-white">
                      Video referencial
                    </h2>
                    <div className="relative w-full max-w-lg aspect-square mb-8 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                      <video
                        src={
                          "https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Video/Cursos/PresentacionesCursos/VIDEO%20INSTITUCIONAL.mp4"
                        }
                        className="object-cover w-full h-full"
                        controls
                        autoPlay
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="px-6 bg-[image:var(--newgrad4)]  h-40 max-sm:h-full rounded-xl py-5 flex flex-col gap-2  mx-10">
        <h1 className="text-white text-lg bg-white/30 w-[4rem] rounded-2xl text-center">
          CCD
        </h1>
        <h1 className="text-white text-2xl font-bold max-sm:text-xl">
          Centro de Capacitación y Desarrollo
        </h1>
        <div className="flex gap-4 max-sm:justify-between max-sm3:flex-col">
          <Button
            color="primary"
            variant="solid"
            className="bg-[var(--colorccd2)] max-sm:border-1 text-white"
            onClick={openModal}
          >
            Iniciar
          </Button>
          <Button
            className="px-6 py-3 bg-white/30 text-white rounded-xl hover:bg-[var(--colorccd1) transition-colors"
            onClick={openModal1}
          >
            Conocer más
          </Button>
        </div>
      </div>
      <div className="mt-3 px-10">
        <h1 className="text-[#D9DADB] text-lg">Explorar</h1>
        <h1 className="text-white text-2xl font-bold">Cursos y Diplomas</h1>
      </div>

      <div className=" flex flex-wrap  justify-between max-2xl:justify-around  w-full mx-auto  px-10 py-10 ">
        {cursosCompletos.map((item, index) => (
          <CourseCardTienda
            key={index}
            array={item}
            openSideSheet={openSideSheet}
          />
        ))}
      </div>
      {isOpen && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ pointerEvents: "none" }}
        >
          <div
            className=" w-[25%] max-xl:w-[24rem] h-full bg-[var(--colorccd3)] shadow-xl  absolute right-0 top-0 px-4 py-2 flex items-center justify-center"
            style={{ pointerEvents: "auto" }}
          >
            <div className="h-auto max-h-[100vh] overflow-y-auto scrollbar-hide bg-[var(--colorccd3)] ">
              <div className="mx-auto max-w-7xl">
                <div className="rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="flex flex-col gap-2 ">
                    {/* Left Column - Image and Badges */}
                    <Button
                      className="bg-[var(--colorccd1)] w-[7rem] my-3 flex justify-start"
                      onPress={() => {
                        setIsOpen(false);
                      }}
                    >
                      <MdKeyboardBackspace className="text-white  text-xl " />
                      <h1 className="text-white text-base  ">Volver</h1>
                    </Button>

                    <div className="">
                      <div className="relative aspect-video w-full  rounded-xl">
                        <Image
                          src={
                            storageUrl +
                            (Array.isArray(selectedCourse.RutaImagen)
                              ? selectedCourse.RutaImagen.find((ruta: any) =>
                                  ruta.includes("PortadaFinal")
                                ) || selectedCourse.RutaImagen[0]
                              : Array.isArray(
                                  JSON.parse(selectedCourse.RutaImagen)
                                )
                              ? JSON.parse(selectedCourse.RutaImagen).find(
                                  (ruta: any) => ruta.includes("PortadaFinal")
                                ) || JSON.parse(selectedCourse.RutaImagen)[0]
                              : selectedCourse.RutaImagen)
                          }
                          alt="Environmental Impact Study"
                          className="rounded-xl mx-auto"
                          width={400}
                          height={600}
                        />
                      </div>

                      <div className="flex gap-1 mt-4 items-center justify-center">
                        <div className="flex items-center gap-2 bg-blue-400/5 text-blue-400 px-4 py-2 rounded-lg hover:bg-[var(--colorccd1)/20 transition-colors cursor-pointer">
                          <div className="w-2 h-2 bg-[var(--colorccd1)] rounded-full animate-pulse" />
                          <span className="text-xs lg:text-sm font-medium">
                            Certificación Profesional
                          </span>
                        </div>
                        <div className="flex !items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-[10px] lg:rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-xs lg:text-sm font-medium">
                            Acceso Inmediato
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className=" flex flex-col pb-2  ">
                      {/* <div>
                                                <h2 className="text-2xl font-bold text-white mb-4">
                                                    {selectedCourse.Curso}
                                                </h2>
                                            </div>                           */}
                      <div className="flex flex-col gap-5">
                        <div className="">
                          <div className="flex flex-col gap-4 mt-3">
                            {/* Apartado Smartphone */}
                            <div className="flex lg:hidden w-full items-center justify-center  gap-2">
                              <button
                                className=" flex w-full rounded-xl group items-center justify-center gap-2 bg-gradient-to-r
                            from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 
                            font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
                                onClick={() => {
                                  const brochureUrl = Array.isArray(
                                    selectedCourse.RutaImagen
                                  )
                                    ? selectedCourse.RutaImagen.find(
                                        (ruta: any) =>
                                          ruta.includes("BrochureCursos")
                                      ) || selectedCourse.RutaImagen[0]
                                    : Array.isArray(
                                        JSON.parse(selectedCourse.RutaImagen)
                                      )
                                    ? JSON.parse(
                                        selectedCourse.RutaImagen
                                      ).find((ruta: any) =>
                                        ruta.includes("BrochureCursos")
                                      ) ||
                                      JSON.parse(selectedCourse.RutaImagen)[0]
                                    : selectedCourse.RutaImagen;

                                  if (brochureUrl) {
                                    window.open(
                                      `${storageUrl}${brochureUrl}`,
                                      "_blank"
                                    );
                                  } else {
                                    console.error(
                                      "No se encontró un Brochure válido."
                                    );
                                  }
                                }}
                              >
                                <Download className="w-5 h-5 group-hover:animate-bounce" />
                                Brochure
                              </button>
                              <button
                                className="flex w-full rounded-xl group items-center justify-center gap-2 bg-gradient-to-r
                           from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3
                             font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                                onClick={() =>
                                  window.open(
                                    `${selectedCourse.NumeroWhatsapp}}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Phone className="w-5 h-5 group-hover:animate-bounce" />
                                Llámanos
                              </button>
                            </div>
                            {/* Apartado Desk */}
                            <div className="hidden lg:flex flex-col sm:flex-row gap-4">
                              <button
                                className="flex-1 rounded-xl group inline-flex items-center justify-center gap-2 bg-gradient-to-r
                                from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 
                                font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
                                onClick={() => {
                                  const brochureUrl = Array.isArray(
                                    selectedCourse.RutaImagen
                                  )
                                    ? selectedCourse.RutaImagen.find(
                                        (ruta: any) =>
                                          ruta.includes("BrochureCursos")
                                      ) || selectedCourse.RutaImagen[0]
                                    : Array.isArray(
                                        JSON.parse(selectedCourse.RutaImagen)
                                      )
                                    ? JSON.parse(
                                        selectedCourse.RutaImagen
                                      ).find((ruta: any) =>
                                        ruta.includes("BrochureCursos")
                                      ) ||
                                      JSON.parse(selectedCourse.RutaImagen)[0]
                                    : selectedCourse.RutaImagen;

                                  if (brochureUrl) {
                                    window.open(
                                      `${storageUrl}${brochureUrl}`,
                                      "_blank"
                                    );
                                  } else {
                                    console.error(
                                      "No se encontró un Brochure válido."
                                    );
                                  }
                                }}
                              >
                                <Download className="w-5 h-5 group-hover:animate-bounce" />
                                Descargar Brochure
                              </button>
                              <button
                                className="flex-1 rounded-xl group inline-flex items-center justify-center gap-2 bg-gradient-to-r
                               from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3
                                 font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                                onClick={() =>
                                  window.open(
                                    `${selectedCourse.NumeroWhatsapp}}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Phone className="w-5 h-5 group-hover:animate-bounce" />
                                Más Información
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* <div className="relative px-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Ingresa tu cupón de descuento"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button className="absolute rounded-xl right-2 top-1/2 -translate-y-1/2 bg-[var(--colorccd1) hover:bg-[var(--colorccd1) text-white px-4 py-1.5  text-sm font-medium transition-colors">
                                                        Aplicar
                                                    </button>
                                                </div> */}
                      </div>

                      <Divider className="bg-white  w-full my-4" />
                      <div className="flex gap-5 items-center">
                        <span className="text-white">Escoger:</span>
                        <div className="flex gap-2">
                          {selectedCourse.Productos.slice() // Crea una copia para evitar mutar el arreglo original
                            .sort((a: any, b: any) => {
                              // Ordena 'En Vivo' primero y luego 'Asincrónico'
                              if (
                                a.TipoModalidad === "En Vivo" &&
                                b.TipoModalidad === "Asincrónico"
                              )
                                return -1;
                              if (
                                a.TipoModalidad === "Asincrónico" &&
                                b.TipoModalidad === "En Vivo"
                              )
                                return 1;
                              return 0; // Si son iguales, no cambia el orden
                            })
                            .map((item: any, index: number) => {
                              return (
                                <div key={index}>
                                  {" "}
                                  {/* Asegúrate de usar una clave única */}
                                  {item.TipoModalidad === "En Vivo" && (
                                    <Button
                                      className={`text-white bg-red-500 ${
                                        enVivoActivo ? "" : "opacity-30"
                                      }`}
                                      onClick={() => {
                                        handleSeleccion(item);
                                      }}
                                    >
                                      <CiStreamOn className="text-2xl text-white" />{" "}
                                      En Vivo
                                    </Button>
                                  )}
                                  {item.TipoModalidad === "Asincrónico" && (
                                    <Button
                                      className={`text-white bg-green-500 ${
                                        asincronicoActivo ? "" : "opacity-30"
                                      }`}
                                      onClick={() => {
                                        handleSeleccion(item);
                                      }}
                                    >
                                      <BiSolidVideoRecording className="text-2xl text-white" />{" "}
                                      Asincrónico
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>                                          
                      <div className=" pt-1">
                        <div className="flex  p-2 sm:flex-row justify-between  gap-4">
                          <div className="text-center items-center justify-center">
                            <div className="flex flex-col items-center lg:items-baseline gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400 line-through">
                                  S/{precioAnterior.toFixed(2)}
                                </span>
                                <span className="text-sm font-medium text-emerald-500">
                                {calculateDiscount(precioAnterior, preciototal)} OFF
                                </span>
                              </div>
                              <Button
                                className="text-4xl  font-bold bg-[var(--colorccd1)] bg-clip-text text-white"
                                onPress={() => {
                                  onOpen1();
                                  setimagen(
                                    Array.isArray(selectedCourse.RutaImagen)
                                      ? selectedCourse.RutaImagen.find(
                                          (ruta: any) =>
                                            ruta.includes("PortadaFinal")
                                        ) || selectedCourse.RutaImagen[0]
                                      : Array.isArray(
                                          JSON.parse(selectedCourse.RutaImagen)
                                        )
                                      ? JSON.parse(
                                          selectedCourse.RutaImagen
                                        ).find((ruta: any) =>
                                          ruta.includes("PortadaFinal")
                                        ) ||
                                        JSON.parse(selectedCourse.RutaImagen)[0]
                                      : selectedCourse.RutaImagen
                                  );
                                }}
                              >
                                <span className="text-3xl font-bold">S/</span>
                                <span className="text-5xl font-bold tracking-tight">
                                  {preciototal.toFixed(2)}
                                </span>
                              </Button>
                            </div>
                          </div>
                          <button
                            className="flex-1 w-full rounded-xl group inline-flex items-center justify-center gap-2 bg-gradient-to-r
                               from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3
                                 font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 "
                            onClick={() => {
                              handleCartToggle(selectedCourse);
                            }}
                          >
                            {cart.some(
                              (item) => item.IdProducto === idproducto
                            ) ? ( // Calcular isInCart directamente aquí
                              <FaCheck className="text-3xl" />
                            ) : (
                              <FaShoppingCart className="text-3xl" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        backdrop="opaque"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20  ",
          closeButton: "bg-white",
        }}
        isOpen={isOpen1}
        onOpenChange={onOpenChange1}
        className="h-full mt-10 overflow-y-auto"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent
          className="!bg-colors-night-blue-ccd2 bg-double-esferas2"
          style={{
            width: "90%",
            height: "90%",
            maxWidth: "90%",
            maxHeight: "90%",
          }}
        >
          {(onClose) => (
            <>
              {/* <ModalHeader>
                        {" "}
                        <button
                          onClick={onclose}
                          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
                        >
                          <ChevronLeft className="w-6 h-6" />
                          Regresar
                        </button>
                      </ModalHeader> */}
              <ModalBody>
                <CompraRapida
                  precio={preciototal}
                  modalidad={modalidad}
                  imagen={imagen}
                  tipocurso={tipocurso}
                  curso={curso}
                  idproducto={idproducto}
                />
              </ModalBody>
              {/* <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button color="primary" onPress={onClose}>
                          Action
                        </Button>
                      </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>

      {/* <PopoverStruc img='https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Ccd/landing/DiaDelTrabajo/PROMOCION_DIA_DEL_TRABAJADOR_FB_2_CCD1080_1080.webp'/>          */}
    </>
  );
}
