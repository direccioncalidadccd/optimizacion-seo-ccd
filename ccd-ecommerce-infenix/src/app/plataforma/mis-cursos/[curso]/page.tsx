
"use client"
import { Accordion, AccordionItem, Avatar, Snippet, Button, Chip, Divider, Image, Popover, PopoverContent, PopoverTrigger, Tab, Tabs, Textarea } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react'
import { IoDocumentAttach, IoEnter, IoPlay, IoSend } from 'react-icons/io5';
import Anuncios from '@/components/ui/bruno/Notificaciones';
import { MdLibraryBooks } from 'react-icons/md';
import { Book, GraduationCap, MoonIcon, PenTool, SunIcon } from 'lucide-react';
import { RiBookLine } from "react-icons/ri";
import { FaArrowLeft, FaBookOpenReader, FaRegCircle, FaVideo } from "react-icons/fa6";
import { RiFileExcel2Fill, RiRadioButtonLine } from "react-icons/ri";
import { useGlobalContext } from "../../layout";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,

} from "@/components/ui/sheet";
import {
  FaCalendarAlt,
  FaFileWord,
  FaFilePdf,
  FaFileImage,
  FaFileExcel,
  FaFilePowerpoint,
  FaRegCalendarAlt,
  FaDotCircle,
} from "react-icons/fa";
import { IoIosPlay, IoMdMailUnread } from "react-icons/io";
import Evaluaciones from "@/components/ui/bruno/evaluaciones";
import axios from "axios";
import { environment } from "@/environments/environment";
import { useSearchParams } from "next/navigation";
import { ZoomMtg } from "@zoom/meetingsdk";
import CursosCertificados from "@/components/ui/plataforma/mis-cursos/CursosCertificados";
import CursosEncuestas from "@/components/ui/plataforma/mis-cursos/CursosEncuestas";
import CursosEvaluaciones from "@/components/ui/plataforma/mis-cursos/CursosEvaluaciones";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { AiFillFileZip } from "react-icons/ai";
import { IoLogoWhatsapp } from "react-icons/io";
import { useSession } from "next-auth/react";
import { useFormStatus } from "react-dom";
import Video from "next-video";
import { motion } from "framer-motion"
import SheetResponsive from "@/components/ui/paul/sheetResponsive";
import { BsFileEarmarkBarGraph } from "react-icons/bs";

interface Props {
  params: {
    curso: string;
    pid: string;
  };
}
interface Video {
  src: string;
}
interface Question {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: Reply[];
}
interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-[#2563EB] hover:text-blue-400 transition-colors disabled:opacity-50"
    >
      {pending ? "Enviando..." : children}
    </button>
  );
}

export default function Page({ params }: Props) {
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const pid = searchParams.get("pid");
  // const psala = decodeURIComponent(searchParams.get("sala") || "");
  const pmodalidad = searchParams.get("pmodalidad");
  const ptipo = searchParams.get("ptipo");
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });

  const [selected, setSelected] = React.useState(() => {
    // Recuperar la pestaña seleccionada desde localStorage
    return localStorage.getItem("selectedTab") || "1";
  });
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();
  const [videoSrc, setVideoSrc] = useState(""); // Estado para la fuente del video
  const [videopriSrc, setvideopriSrc] = useState(""); // Estado para la fuente del video
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      author: "Carlos Rodriguez",
      content:
        "¿Podrías explicar más a detalle el concepto de arrays asociativos? No me quedó muy claro en el video.",
      timestamp: "hace 2 días",
      replies: [
        {
          id: "r1",
          author: "Instructor",
          content:
            '¡Claro! Los arrays asociativos son como diccionarios donde cada elemento tiene una "etiqueta" o "clave" en lugar de un índice numérico. Te recomiendo revisar el material complementario en la sección de recursos.',
          timestamp: "hace 1 día",
        },
      ],
    },
    {
      id: "q2",
      author: "Ana Martínez",
      content:
        "Excelente explicación. ¿Habrá más ejercicios prácticos sobre este tema en los próximos módulos?",
      timestamp: "hace 3 días",
      replies: [],
    },
  ]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [datomodulo, setdatomodulo] = useState([]);
  const [acreditaciondata, setacreditaciondata] = useState([]);
  const [datomodulointro, setdatomodulointro] = useState([]);
  const [primeravista, setprimeravista] = useState(true);
  const { nombreGlobal, setNombreGlobal } = useGlobalContext();
  const videoPlayerRef = useRef<any | null>("");
  const videoPlayerRefinto = useRef<any | null>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isSideSheetOpen2, setIsSideSheetOpen2] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(true);
  const [idtemariomodulo, setidtemariomodulo] = useState("");
  const [datopreguntasyrespuestas, setdatopreguntasyrespuestas] = useState([]);
  const [preguntaemitida, setpreguntaemitida] = useState("");
  const [respuestaemitida, setrespuestaemitida] = useState("");
  ///
  const [visibleComments, setVisibleComments] = useState(2); // Número de comentarios visibles
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  let psala: string | null = null;
const psalaorigen = searchParams.get("sala");
try {
  const salaDecodificada = psalaorigen ? decodeURIComponent(psalaorigen) : null;
  psala = salaDecodificada ? salaDecodificada.replace(/-/g, " ") : null;
} catch (error) {
  console.error("Error al decodificar o ajustar el parámetro sala:", error);
  psala = null;
}
console.log("PSALA:", psala); // Debería mostrar "MOBRA G2"
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1024); // Cambia el valor según el breakpoint deseado
    };

    // Inicializar el estado según el tamaño de la pantalla
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const handleVideoChange = async ({ src }: { src: string }) => {
    setVideoSrc(src); // Cambia el estado del video
    localStorage.setItem("selectedVideo", src); // Guarda el video seleccionado en localStorage
    // Forzar la recarga del video
    if (videoPlayerRef.current) {
      videoPlayerRef.current.load();
    }
  };

  async function listarpreguntas(id: any) {
    const listarTemario = await api.post(
      "/inicio/listarpreguntasyrespuestasv2",
      {
        fproductotemario_id: id,
      }
    );
    setdatopreguntasyrespuestas(listarTemario.data.data[0]);
    console.log("machoi" + JSON.stringify(listarTemario.data.data[0]));
  }
  async function handleQuestionSubmit() {
    const listarTemario = await api.post("/inicio/insertarpreguntav2", {
      fpregunta: preguntaemitida,
      fusuario_id: session?.user.uid,
      fproductotemario_id: idtemariomodulo,
    });

    const listarTemario1 = await api.post("/inicio/listarpreguntasyrespuestasv2", {
      fproductotemario_id: idtemariomodulo
    });
    setdatopreguntasyrespuestas(listarTemario1.data.data[0]);
    setpreguntaemitida("")
  }
  async function handleReplySubmit(videopregunta: any) {
    const listarTemario = await api.post("/inicio/insertarrespuestav2", {
      frespuesta: respuestaemitida,
      fusuario_id: session?.user.uid,
      fvideopregunta_id: videopregunta
    });

    const listarTemario1 = await api.post("/inicio/listarpreguntasyrespuestasv2", {
      fproductotemario_id: idtemariomodulo
    });
    setdatopreguntasyrespuestas(listarTemario1.data.data[0]);
    setrespuestaemitida("")

  }
  useEffect(() => {
    const loadData = async () => {
      try {
        const listarTemario = await api.post("/inicio/listartemariointrov2", {
          fproducto_id: pid
        });

        console.log("Respuesta API:", listarTemario.data);

        if (listarTemario.data?.data?.length > 0 && listarTemario.data.data[0].RutaVideo) {
          setvideopriSrc(storageUrl + listarTemario.data.data[0].RutaVideo);
        } else {
          console.warn("No se encontró una RutaVideo válida");
        }
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };
    loadData();
  }, []);


  useEffect(() => {
    const loadData = async () => {
      if (pmodalidad === 'En-Vivo') {
        console.log("PID", pid);
        console.log("PSALA", psala);
        const listarTemario = await api.post("/inicio/listarTemarioVivov2", {
          fproductoid: pid,
          fsala_id: psala
        });
        setdatomodulo(listarTemario.data.data[0]);
      } else {
        const listarTemario = await api.post("/inicio/listarTemario", {
          fproductoid: pid
        });
        setdatomodulo(listarTemario.data.data[0]);
      }
    };
    loadData();
  }, [pmodalidad, pid, psala]);


  useEffect(() => {

    const loadData = async () => {
      try {
        const listarTemario = await api.post("/inicio/acreditacionescertificadosv2", {
          fproducto_id: pid
        });
        setacreditaciondata(listarTemario.data.data[0][0]);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (selected === '1') {
      setNombreGlobal("contenido-curso");
    }
    if (selected === '2') {
      setNombreGlobal("evaluaciones");
    }
    if (selected === '3') {
      setNombreGlobal("curso-calificaciones");
    }
    if (selected === '4') {
      setNombreGlobal("curso-encuestas");
    }
    if (selected === '5') {
      setNombreGlobal("curso-certificados");
    }
    if (selected === '6') {
      setNombreGlobal("curso-anuncios");
    }
    // Guardar la pestaña seleccionada en localStorage
    localStorage.setItem("selectedTab", selected);
  }, [selected]);

  //check
  type Key = string | number;
  const handleSelectionChange = (key: Key) => {
    setSelected(key.toString());

  }

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1024); // Cambia el valor según el breakpoint deseado
    };

    // Inicializar el estado según el tamaño de la pantalla
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  const capitalizeFirstWord = (text: any) => {
    if (!text || typeof text !== "string") return ""; // Verifica si es vacío o no es string

    const words = text.trim().split(" ");
    if (words.length === 0) return ""; // Si no hay palabras, retorna vacío

    const [firstWord, ...rest] = words;
    return `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()} ${rest.join(" ").toLowerCase()}`;
  };

  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const toggleAccordion = (key: string) => {
    setOpenItems((prev) => ({

      [key]: !prev[key]
    }));
  };
  useEffect(() => {
    // Configura el Popover para cerrarse automáticamente después de 12 segundos
    const timer = setTimeout(() => setIsPopoverOpen(false), 12000);
    return () => clearTimeout(timer); // Limpia el temporizador al desmontar el componente
  }, []);
  const handleModalOpen = () => {
    setIsPopoverOpen(false); // Cierra el Popover al abrir el Modal
    handleSideSheetOpen(); // Abre el Modal
  };
  const [datosala, setdatosala] = useState([]);
  const [urlactual, seturlactual] = useState("");
  useEffect(() => {
    if (pmodalidad == 'En-Vivo') {

      const loadData = async () => {
        try {
          const listarTemario = await api.post("/inicio/listardatosalasv2", {
            fproducto_id: pid,
            fsala_id: psala
          });
          setdatosala(listarTemario.data.data[0][0]);
          const url = window.location.href;
          seturlactual(url);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }

  }, []);
  if (!isClient) return null;





  const toggleLike = (commentId: number) => {
    setLikedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };
  const toggleResponses = (commentId: number) => {
    setExpandedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };
  const handleReplyChange = (commentId: number, text: string) => {
    setReplyText((prev) => ({ ...prev, [commentId]: text }));
  };


  // Manejar la apertura del SideSheet
  const handleSideSheetOpen = () => {
    setIsSideSheetOpen2(true);
  };
  // Manejar el cierre del SideSheet
  const handleSideSheetClose = () => {
    setIsSideSheetOpen2(false);
  };
  function capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }



  ////////////////
  ZoomMtg.preLoadWasm();
  ZoomMtg.prepareWebSDK();
  //////////////



  const sdkKey = "YfrIk6y3QH2TsdLYBA6gaA";
  const meetingNumber = (datosala as any).NumeroReunion || "";
  const passWord = (datosala as any).ClaveReunion || "";
  const role = 0;
  const userName = capitalizeWords(
    `${session?.user.Nombres} ${session?.user.Apellidos}`
  );
  const userEmail = "";
  const registrantToken = "";
  const zakToken = "";
  const leaveUrl = urlactual;
  const getSignature = async () => {
    try {
      const req = await fetch(
        environment.baseUrl + "/inicio/crearsignaturezoomv2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingNumber: meetingNumber,
            role: role,
          }),
        }
      );
      const res = await req.json();
      const signature = res.signature as string;
      startMeeting(signature);
    } catch (e) {
      console.log(e);
    }
  };
  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";
    ZoomMtg.i18n.load("es-ES");
    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,

      success: (success: unknown) => {
        console.log(success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,
          success: (success: unknown) => {
            console.log(success);
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });
      },
      error: (error: unknown) => {
        console.log(error);
      },
    });
  }
  const observerTarget = document.body; // Cambia esto si el SDK tiene un contenedor específico
  // Configurar el observador
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && !(session?.user.IdArea === 1)) {
        // Seleccionar todos los elementos con el atributo feature-type="sharing"
        const sharingElements = document.querySelectorAll(
          'div[feature-type="participants"]'
        );
        sharingElements.forEach((element) => {
          if (element instanceof HTMLElement) {
            // Verificar que el elemento sea un HTMLElement antes de usar style
            element.style.display = "none"; // Oculta el elemento
          }
        });
      }
    });
  });
  // Configurar las opciones del observador
  observer.observe(observerTarget, {
    childList: true,
    subtree: true, // Incluye nodos hijos
  });
  function convertirFechaPeru(fechaISO: any) {
    // Crear un objeto Date a partir de la cadena ISO
    const fecha = new Date(fechaISO);

    // Opciones de formato para mostrar la fecha en un formato "normal"
    const opciones: any = {
      timeZone: "America/Lima", // Zona horaria de Perú
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const fechaPeru = new Intl.DateTimeFormat("es-PE", opciones).format(fecha);

    return fechaPeru;
  }

  function formatTipo(value: any) {
    if (!value) return ""; // Maneja casos donde no exista el valor
    // Reemplaza el guion por un espacio y transforma a minúsculas excepto la primera letra
    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char: any) => char.toUpperCase());
  }
  return (
    <>
      <div className='flex  justify-between items-center py-3 px-10'>
        <div className={`flex flex-col gap-1 ${psala ? 'w-[80%]' : 'w-[100%]'}`}>
          <h1 className='text-white text-xl font-bold max-sm:text-center m-0'>
            {decodeURIComponent(params.curso).replace(/-/g, ' ')}
          </h1>
          <div className='text-white flex gap-2 items-center'>
            <span>{formatTipo(ptipo)}</span>
            <Divider orientation='vertical' className='h-[1rem] bg-white' />
            <span>{pmodalidad == 'Asincrónico' ? 'Asincrónico' : 'En Vivo'}</span>
          </div>
        </div>
        {psala && (<div className='bg-[#141D31] w-[30%]  flex flex-col justify-center items-center rounded-xl p-1 gap-3  border-1 border-[#334155]'>
          <Snippet symbol="Sala:" color="primary" variant="solid" className='w-full text-tiny text-white bg-[var(--colorccd1)] !mx-3 !py-0.5 !px-1.5'
            classNames={{ "pre": "!text-tiny m-0 p-0 border-none", "copyIcon": "tiny-tiny", "symbol": "text-tiny" }}>{psala}</Snippet>
          <div className='flex gap-1 bg-[var(--colorccd1)] items-center justify-between rounded-xl !py-0.5 !px-1.5 w-full'>
            <p className='text-tiny text-white m-0'>Grupo: entrar al grupo</p>
            <button onClick={() => window.open((datosala as any).NumeroWhatsapp, "_blank")} className='bg-white rounded-full p-0.5 '><IoLogoWhatsapp className='text-[#26BD5E] text-xl' /></button>
          </div>

        </div>
        )}
      </div >


      <Tabs aria-label="Tabs variants" className='px-10'
        selectedKey={selected}
        onSelectionChange={handleSelectionChange}
        variant={'solid'}
        classNames={{
          "tabList": "w-full flex max-lg:flex-col  gap-4   !bg-[var(--colorccd3)] border-[var(--colorccd1)] border-1", "cursor": "bg-[var(--colorccd1)] ", "tabContent": "!text-white",

        }}
      >
        <Tab key="1" title="Contenido del curso" className='' >
          <div className='flex max-lg:flex-row-reverse w-full'>
            <div className='w-full'>
              {primeravista && (
                <div className="min-h-screen bg-[var(--colorccd2)] text-white pt-6 pb-12 px-4 md:px-6 relative">
                  {/* Background shapes */}
                  <div className="absolute top-0 left-0 w-full h-full  z-0 rounded-2xl">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--colorccd1) rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FFFF] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFFF] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
                  </div>

                  <div className="w-[90%] mx-auto relative z-10">
                    <div className="space-y-12">
                      {/* Header Section */}
                      <div className="space-y-4 text-center">
                        <h1 className="text-5xl max-lg:text-3xl  font-bold tracking-tight bg-gradient-to-r from-[#00FFFF] via-[#007AFD] to-[#00FFFF] bg-clip-text text-transparent">
                          ¡Bienvenido al curso!
                        </h1>
                        <h2 className="text-xl max-lg:text-base text-blue-200 font-medium text-start">
                          Estamos encantados de tenerte aquí. Te espera un viaje emocionante lleno de aprendizaje, desarrollo personal y nuevas oportunidades. Este curso ha sido diseñado especialmente para brindarte las herramientas y conocimientos que necesitas para alcanzar tus objetivos.
                          <br /><br />
                          Prepárate para explorar, descubrir y transformar tus habilidades. ¡Estamos seguros de que disfrutarás cada paso del camino! 💡✨
                          <br /><br />
                          Recuerda, no estás solo en esta experiencia: nuestro equipo y comunidad están aquí para apoyarte en todo momento. ¡Vamos a comenzar!
                        </h2>
                      </div>

                      {/* Course Components */}
                      <div className="bg-[var(--colorccd3)] rounded-3xl p-8 max-sm:px-2 space-y-8 shadow-2xl border border-blue-500/20 backdrop-blur-sm bg-opacity-80">
                        <p className="text-lg text-blue-200 text-center font-medium">
                          El diploma se compone de los siguientes ítems:
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* PDF Section */}
                          <div className="bg-gradient-to-br from-blue-900/50 to-[#09283C] p-6 max-md: px-2 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-[var(--colorccd1) rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Book className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-blue-300">
                                Material Adicional
                              </h3>
                            </div>
                            <div className='flex flex-col leading-[0.5] max-lg:leading-[1] pl-8'>
                              <p className="text-blue-100">
                                - Diapositivas de las sesiones.
                              </p>
                              <p className="text-blue-100">
                                - Manuales de desarrollo.
                              </p>
                              <p className="text-blue-100">
                                - Formulario prácticos.
                              </p>
                              <p className="text-blue-100">
                                - Formatos de trabajo.
                              </p>
                              <p className="text-blue-100">
                                - Material Complementario
                              </p>
                            </div>
                          </div>

                          {/* Video Section */}
                          <div className="bg-gradient-to-br from-blue-900/50 to-[#09283C] p-6 max-md: px-2 rounded-2xl shadow-lg
                           hover:shadow-blue-500/20 transition-all duration-300 group">
                            <div className="flex items-center  ">
                              <div className="p-3 bg-[var(--colorccd1) rounded-full group-hover:scale-110 transition-transform duration-300">
                                <FaVideo className='text-xl' />

                              </div>
                              <p className="text-xl font-semibold text-blue-300 !m-0">
                                Video Sesión
                              </p>
                            </div>
                            <p className="text-purple-100 pl-4">
                              Cada modulo contiene videos explicativos de la sesion donde aprenderas paso a paso
                              el desarrolo del curso
                            </p>
                          </div>

                          {/* Exams Section */}
                          <div className="md:col-span-2 bg-gradient-to-br from-blue-900/50 to-[#09283C] p-6 max-md: px-2 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                            <div className="flex flex-col  space-x-4 mb-6">

                              <h1 className="text-xl font-semibold text-blue-300 flex gap-2 items-center">
                                <div className="p-3 bg-[var(--colorccd1) rounded-full group-hover:scale-110 transition-transform duration-300">
                                  <PenTool className="w-6 h-6 text-white" />
                                </div>Certificados
                              </h1>
                              <p>Para obtener tu certificados tienes que aprobar los siguientes examenes</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-[var(--colorccd1)/30 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="font-medium text-blue-300 flex items-center mb-2">
                                  <GraduationCap className="w-5 h-5 mr-2" />
                                  Examen parcial y final
                                </h4>
                                <p className="text-blue-100">
                                  La nota mínima aprobatoria es 14/20
                                </p>
                              </div>
                              <div className="bg-[var(--colorccd1)/30 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="font-medium text-blue-300 flex items-center mb-2">
                                  <GraduationCap className="w-5 h-5 mr-2" />
                                  Certificados Acreditados
                                </h4>
                                <p className="text-pink-100">
                                  cuentan con un monto adicional consulta aqui
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Video src={videopriSrc ? videopriSrc : ""} accentColor='var(--colorccd1)' />

                    </div>
                  </div>
                </div>
              )}

              <div className='w-full px-10'>
                {primeravista ? '' : videoSrc ? (<div className=' m-auto'>
                  <div className=" m-auto">
                    {/* Componente del reproductor */}
                    <Video src={storageUrl + videoSrc} accentColor='var(--colorccd1)'></Video>
                  </div>
                </div>
                ) : (<div className="flex flex-col items-center justify-center p-8 my-6 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex flex-col items-center gap-4 py-12 px-4 text-center">
                    <div className="rounded-full bg-[var(--colorccd1)/10 p-3">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-white">Video aún no disponible</h3>
                    <p className="text-slate-400 max-w-sm">
                      La clase todavía no ha sido grabada. El video estará disponible próximamente.
                    </p>
                  </div>
                </div>)}

                {!primeravista && (
                  <div className="min-h-screen  text-white py-6 mt-6">
                    <h2 className="text-2xl font-semibold mb-8">Preguntas y Respuestas</h2>

                    {message && (
                      <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 mb-4">
                        {message}
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-xl mb-4">¿Tienes alguna duda sobre este módulo?</h3>
                      <form>
                        <div className="relative">
                          <textarea
                            name="question"
                            value={preguntaemitida} // Asociamos el estado al valor del textarea
                            onChange={(e) => setpreguntaemitida(e.target.value)} // Actualizamos el estado al escribir
                            className="w-full bg-[#1E293B] rounded-xl p-4 pr-12 min-h-[100px] resize-none border border-gray-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                            placeholder="Escribe tu comentario..."
                            required
                          />
                          <div className="absolute bottom-4 right-4">
                            <button
                              type="button"
                              onClick={handleQuestionSubmit} // Ejecutamos la función al hacer clic
                              className="bg-[var(--colorccd1) text-white p-2 rounded-full hover:bg-[var(--colorccd1) focus:outline-none"
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-6">
                      {datopreguntasyrespuestas.map((question: any, index: number) => (
                        <div key={index} className="bg-[#1E293B] rounded-xl p-6">
                          <div className="flex items-start gap-4">
                            <img
                              src="https://www.researchgate.net/publication/341068087/figure/fig3/AS:11431281104224771@1669979151092/Figura-2-Avatar-que-aparece-por-defecto-en-Facebook.png"
                              alt="Avatar"
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{question.UsuarioPregunta}</span>
                                <span className="text-sm text-gray-400">{convertirFechaPeru(question.FechaPregunta)}</span>
                              </div>
                              <p className="text-gray-300 mb-4">
                                {question.Pregunta}
                              </p>

                              {question.Respuestas.map((reply: any, index: number) => (
                                <div key={index} className="ml-8 mt-4 border-l-2 border-[#2563EB] pl-4">
                                  <div className="flex items-start gap-4">
                                    <img
                                      src="https://www.researchgate.net/publication/341068087/figure/fig3/AS:11431281104224771@1669979151092/Figura-2-Avatar-que-aparece-por-defecto-en-Facebook.png"
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-[#2563EB]">{reply.UsuarioRespuesta}</span>
                                        <span className="text-sm text-gray-400">{convertirFechaPeru(reply.FechaRespuesta)}</span>
                                      </div>
                                      <p className="text-gray-300">
                                        {reply.Respuesta}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {replyingTo === question.IdVideoPregunta && (
                                <form
                                  className="mt-4 ml-8"

                                >
                                  <div className="relative">
                                    <textarea
                                      value={respuestaemitida} // Asociamos el estado al valor del textarea
                                      onChange={(e) => setrespuestaemitida(e.target.value)} // Actualizamos el estado al escribir
                                      className="w-full bg-[#1E293B] rounded-xl p-4 pr-12 min-h-[100px] resize-none border border-gray-700 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                      placeholder="Escribe tu comentario..."
                                      required
                                    />
                                    <div className="absolute bottom-4 right-4">
                                      <button
                                        type="button"
                                        onClick={() => handleReplySubmit(question.IdVideoPregunta)} // Ejecutamos la función al hacer clic
                                        className="bg-[var(--colorccd1) text-white p-2 rounded-full hover:bg-[var(--colorccd1) focus:outline-none"
                                      >
                                        <svg
                                          className="w-6 h-6"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              )}

                              <div className="flex items-center gap-4 mt-4">
                                <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                  Útil ({question.length})
                                </button>
                                <button
                                  onClick={() => setReplyingTo(replyingTo === question.IdVideoPregunta ? null : question.IdVideoPregunta)}
                                  className="text-gray-400 hover:text-white text-sm"
                                >
                                  {replyingTo === question.IdVideoPregunta ? 'Cancelar' : 'Responder'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
            <div className=" flex flex-col gap-7 w-[25%] max-lg:w-[0%] max-lg:z-50 fixed top-0 right-0 h-full overflow-y-auto scrollbar-hide scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className='flex justify-between items-center px-5 pt-5'>
                <div className="flex  items-center gap-4 ">
                  <Button className="bg-[var(--colorccd1)] py-1.5 !px-3 text-white !min-w-0">
                    <RiBookLine className='text-2xl' />
                  </Button>
                  <motion.span
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="text-xl inline-block text-transparent bg-clip-text 
                                                                            bg-gradient-to-r from-blue-100 to-blue-300
                                                                              dark:from-blue-300 dark:to-purple-300"
                  >
                    Módulos
                  </motion.span>
                </div>
                <div className=" font-bold text-xl w-full max-lg:hidden  text-white"></div>
                {psala && (
                  <button className='text-white bg-[var(--colorccd1)] p-2 rounded-xl w-[13rem] flex gap-2 items-center text-tiny' onClick={getSignature}>
                    <IoEnter className='text-lg' />
                    Ingresar Sala
                  </button>)}
              </div>
              <div className="rounded-xl flex flex-col">
                {!isSmallScreen ? (
                  // Mostrar Accordion normalmente en pantallas grandes
                  <>
                    <Accordion isCompact variant="shadow" className="bg-[#0B0F25] px-5 rounded-none">
                      {/* Primer Accordion Item */}
                      <AccordionItem
                        key="1111"
                        aria-label="Accordion 1"
                        title={
                          <div>
                            <div className='flex gap-2  items-center py-1'>
                              <div className={`text-base m-0 font-bold ${openItems[0] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                Módulo Introductorio
                              </div>
                              <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center justify-center rounded-xl' onClick={() => handleVideoChange({ src: "/multimedia/Video/cddnosotros.mp4" })}>
                                <IoPlay />
                                Ver
                              </div>
                            </div>

                            <div className={`${openItems[0] ? "text-[var(--colorccd1)]" : "text-white text-sm"}`}>
                              <div>Introducción del curso</div>
                            </div>
                          </div>

                        }
                        indicator={({ isOpen }) => (isOpen ? <SunIcon /> : <MoonIcon />)}
                        onPress={() => {
                          toggleAccordion('0')
                          setprimeravista(true)

                        }}

                      >
                        <div className=" text-white flex gap-2 items-center">
                          <IoIosPlay className='text-[var(--colorccd1)]' />
                          <div className=''>Presentación del curso</div>
                        </div>
                      </AccordionItem>
                    </Accordion>
                    <Accordion isCompact variant="shadow" className="bg-[#0B0F25] rounded-none px-1" showDivider={false}>
                      {datomodulo.map((modulo: any, index: number) => (
                        <AccordionItem

                          key={index}
                          title={
                            <>
                              <div>
                                <div className='flex gap-2  items-center py-1'>
                                  <div className={`text-base m-0 font-bold ${openItems[index + 1] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                    Módulo {modulo.Numeracion}
                                  </div>
                                  <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center 
                                                                    justify-center rounded-xl'
                                    onClick={() => {
                                      toggleAccordion('0')
                                    }}>
                                    <IoPlay />
                                    Ver
                                  </div>
                                </div>

                                <div className={`${openItems[index + 1] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                  <div className='text-sm'>{capitalizeFirstWord(modulo.nombre)}</div>
                                </div>
                              </div>
                            </>
                          }
                          onPress={() => {

                          }}
                          className={`${openItems[index + 1] ? "bg-[#0A0D1C]" : ""} px-4`}
                        >
                          <ul>
                            <div className='py-3 flex flex-col gap-1'>
                              {modulo.videos && modulo.videos.length > 0 ? (
                                (modulo.videos || []).map((adjuntos: any, adjuntosIndex: number) => (
                                  adjuntos && adjuntos.nombre && ( // Si existe adjuntos y nombre, recién renderiza el <li>
                                    <li
                                      key={adjuntosIndex}
                                      className="!my-[10px] cursor-pointer bg-[#1a1c3a] hover:bg-[#151630] py-[1rem] p-0.5 rounded-xl"
                                      onClick={() => {
                                        handleVideoChange({ src: adjuntos.ruta });
                                        toggleAccordion((index + 1).toString());
                                        setprimeravista(false);
                                        setidtemariomodulo(modulo.id);
                                        listarpreguntas(modulo.id);
                                      }}
                                    >
                                      <h1 className="text-white flex gap-2 items-center !m-0">
                                        <IoIosPlay className="text-[#00EBEE] min-w-10" />
                                        <span className="text-[#00EBEE]">{capitalizeFirstWord(adjuntos.nombre)}</span>
                                      </h1>
                                    </li>
                                  )
                                ))
                              ) : (
                                <p className="text-white italic">No hay videos disponibles.</p>
                              )}
                            </div>
                            {modulo.temas.map((tema: any, temaIndex: number) => (
                              <li key={temaIndex} className="mb-2">
                                <h1 className=" text-white flex gap-2 items-center">
                                  <FaDotCircle className='text-[var(--colorccd1)] min-w-10' />
                                  <span>{capitalizeFirstWord(tema.nombre)}</span>
                                </h1>
                              </li>
                            ))}
                            <Accordion isCompact className="!px-0">
                              <AccordionItem
                                key="1111"
                                aria-label="Accordion 1"
                                variant="splitted"
                                title={
                                  <strong className="flex gap-1 items-center text-[var(--colorccd1)]">
                                    <IoDocumentAttach className="text-[var(--colorccd1)]" />
                                    Archivos
                                  </strong>
                                }
                                className="bg-[#101A3E] flex flex-col gap-2"
                              >
                                {!modulo.adjuntos || modulo.adjuntos.length === 0 ? (
                                  <p className="text-white italic">Aún no tiene archivos cargados.</p>
                                ) : (
                                  (modulo.adjuntos || [])
                                    .filter((item: any) => item && item.tipo !== 'Video')
                                    .map((item: any, temaIndex: any) => {
                                      const fileUrl = storageUrl + item.ruta;
                                      const pdfUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

                                      return (
                                        <a
                                          href={item.tipo === 'Pdf' ? pdfUrl : fileUrl}
                                          download={item.tipo !== 'Pdf'}
                                          target="_blank"
                                          className="flex items-center justify-between space-x-1 hover:bg-[#151F42]"
                                          key={temaIndex}
                                        >
                                          <div className="flex gap-3">
                                            {item.tipo === 'Word' && (
                                              <div className="flex gap-3">
                                                <FaFileWord className="text-[#2B77CD]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Power' && (
                                              <div className="flex gap-3">
                                                <FaFilePowerpoint className="text-[#E46943]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Pdf' && (
                                              <div className="flex gap-3">
                                                <FaFilePdf className="text-[#E22328]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Imagen' && (
                                              <div className="flex gap-3">
                                                <FaFileImage className="text-[#888B90]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Excel' && (
                                              <div className="flex gap-3">
                                                <FaFileExcel className="text-[#1D6B40]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {(item.tipo === 'Rar' || item.tipo === 'Zip') && (
                                              <div className="flex gap-3">
                                                <AiFillFileZip />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <FaCloudDownloadAlt />
                                          </div>
                                        </a>
                                      );
                                    })
                                )}
                              </AccordionItem>
                            </Accordion>

                          </ul>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </>
                ) : (
                  // Mostrar Accordion en el SideSheet para pantallas pequeñas
                  <>

                    <Sheet>
                      <SheetTrigger asChild>
                        <button
                          onClick={handleModalOpen}
                          className="border-2 text-white p-2 m-2 rounded-full fixed left-0   top-20 z-40 bg-blue-1"
                        >
                          <MdLibraryBooks className="text-3xl" />
                        </button>
                      </SheetTrigger>
                      <SheetContent className="bg-[#0B0F25] border-colors-dark-blue-ccd w-[80%] h-full overflow-y-auto">
                        <SheetClose asChild>
                          <FaArrowLeft className="text-5xl text-colors-sky-ccd" />
                        </SheetClose>
                        <>
                           <Accordion isCompact variant="shadow" className="bg-[#0B0F25] px-5 rounded-none">
                      {/* Primer Accordion Item */}
                      <AccordionItem
                        key="1111"
                        aria-label="Accordion 1"
                        title={
                          <div>
                            <div className='flex gap-2  items-center py-1'>
                              <div className={`text-base m-0 font-bold ${openItems[0] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                Módulo Introductorio
                              </div>
                              <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center justify-center rounded-xl' onClick={() => handleVideoChange({ src: "/multimedia/Video/cddnosotros.mp4" })}>
                                <IoPlay />
                                Ver
                              </div>
                            </div>

                            <div className={`${openItems[0] ? "text-[var(--colorccd1)]" : "text-white text-sm"}`}>
                              <div>Introducción del curso</div>
                            </div>
                          </div>

                        }
                        indicator={({ isOpen }) => (isOpen ? <SunIcon /> : <MoonIcon />)}
                        onPress={() => {
                          toggleAccordion('0')
                          setprimeravista(true)

                        }}

                      >
                        <div className=" text-white flex gap-2 items-center">
                          <IoIosPlay className='text-[var(--colorccd1)]' />
                          <div className=''>Presentación del curso</div>
                        </div>
                      </AccordionItem>
                    </Accordion>
                    <Accordion isCompact variant="shadow" className="bg-[#0B0F25] rounded-none px-1" showDivider={false}>
                      {datomodulo.map((modulo: any, index: number) => (
                        <AccordionItem

                          key={index}
                          title={
                            <>
                              <div>
                                <div className='flex gap-2  items-center py-1'>
                                  <div className={`text-base m-0 font-bold ${openItems[index + 1] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                    Módulo {modulo.Numeracion}
                                  </div>
                                  <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center 
                                                                    justify-center rounded-xl'
                                    onClick={() => {
                                      toggleAccordion('0')
                                    }}>
                                    <IoPlay />
                                    Ver
                                  </div>
                                </div>

                                <div className={`${openItems[index + 1] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                  <div className='text-sm'>{capitalizeFirstWord(modulo.nombre)}</div>
                                </div>
                              </div>
                            </>
                          }
                          onPress={() => {

                          }}
                          className={`${openItems[index + 1] ? "bg-[#0A0D1C]" : ""} px-4`}
                        >
                          <ul>
                            <div className='py-3 flex flex-col gap-1'>
                              {modulo.videos && modulo.videos.length > 0 ? (
                                (modulo.videos || []).map((adjuntos: any, adjuntosIndex: number) => (
                                  adjuntos && adjuntos.nombre && ( // Si existe adjuntos y nombre, recién renderiza el <li>
                                    <li
                                      key={adjuntosIndex}
                                      className="!my-[10px] cursor-pointer bg-[#1a1c3a] hover:bg-[#151630] py-[1rem] p-0.5 rounded-xl"
                                      onClick={() => {
                                        handleVideoChange({ src: adjuntos.ruta });
                                        toggleAccordion((index + 1).toString());
                                        setprimeravista(false);
                                        setidtemariomodulo(modulo.id);
                                        listarpreguntas(modulo.id);
                                      }}
                                    >
                                      <h1 className="text-white flex gap-2 items-center !m-0">
                                        <IoIosPlay className="text-[#00EBEE] min-w-10" />
                                        <span className="text-[#00EBEE]">{capitalizeFirstWord(adjuntos.nombre)}</span>
                                      </h1>
                                    </li>
                                  )
                                ))
                              ) : (
                                <p className="text-white italic">No hay videos disponibles.</p>
                              )}
                            </div>
                            {modulo.temas.map((tema: any, temaIndex: number) => (
                              <li key={temaIndex} className="mb-2">
                                <h1 className=" text-white flex gap-2 items-center">
                                  <FaDotCircle className='text-[var(--colorccd1)] min-w-10' />
                                  <span>{capitalizeFirstWord(tema.nombre)}</span>
                                </h1>
                              </li>
                            ))}
                            <Accordion isCompact className="!px-0">
                              <AccordionItem
                                key="1111"
                                aria-label="Accordion 1"
                                variant="splitted"
                                title={
                                  <strong className="flex gap-1 items-center text-[var(--colorccd1)]">
                                    <IoDocumentAttach className="text-[var(--colorccd1)]" />
                                    Archivos
                                  </strong>
                                }
                                className="bg-[#101A3E] flex flex-col gap-2"
                              >
                                {!modulo.adjuntos || modulo.adjuntos.length === 0 ? (
                                  <p className="text-white italic">Aún no tiene archivos cargados.</p>
                                ) : (
                                  (modulo.adjuntos || [])
                                    .filter((item: any) => item && item.tipo !== 'Video')
                                    .map((item: any, temaIndex: any) => {
                                      const fileUrl = storageUrl + item.ruta;
                                      const pdfUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

                                      return (
                                        <a
                                          href={item.tipo === 'Pdf' ? pdfUrl : fileUrl}
                                          download={item.tipo !== 'Pdf'}
                                          target="_blank"
                                          className="flex items-center justify-between space-x-1 hover:bg-[#151F42]"
                                          key={temaIndex}
                                        >
                                          <div className="flex gap-3">
                                            {item.tipo === 'Word' && (
                                              <div className="flex gap-3">
                                                <FaFileWord className="text-[#2B77CD]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Power' && (
                                              <div className="flex gap-3">
                                                <FaFilePowerpoint className="text-[#E46943]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Pdf' && (
                                              <div className="flex gap-3">
                                                <FaFilePdf className="text-[#E22328]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Imagen' && (
                                              <div className="flex gap-3">
                                                <FaFileImage className="text-[#888B90]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {item.tipo === 'Excel' && (
                                              <div className="flex gap-3">
                                                <FaFileExcel className="text-[#1D6B40]" />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                            {(item.tipo === 'Rar' || item.tipo === 'Zip') && (
                                              <div className="flex gap-3">
                                                <AiFillFileZip />
                                                <span className="text-white">{item.nombre}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <FaCloudDownloadAlt />
                                          </div>
                                        </a>
                                      );
                                    })
                                )}
                              </AccordionItem>
                            </Accordion>

                          </ul>
                        </AccordionItem>
                      ))}
                    </Accordion>
                        </>

                      </SheetContent>
                    </Sheet>
                    {/* <Popover isOpen={isPopoverOpen} placement="right">
                      <PopoverTrigger>
                        <button
                          onClick={handleModalOpen}
                          className="border-2 text-white p-2 m-2 rounded-full fixed left-0   top-20 z-40"
                        >
                          <MdLibraryBooks className="text-3xl" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="px-1 py-2">
                          <div className="text-small font-bold">Modulos del curso</div>
                        </div>
                      </PopoverContent>
                    </Popover> */}
                    <Accordion isCompact variant="shadow" className="bg-[#0B0F25] rounded-none px-1" showDivider={false}>
                      {datomodulo.map((modulo: any, index: number) => (
                        <AccordionItem key={`modulo-${index}`} title="">
                          <div>
                            <div className="flex gap-2 items-center py-1">
                              <div
                                className={`text-base m-0 font-bold ${openItems[index + 1] ? "text-[#007FEE]" : "text-white"
                                  }`}
                              >
                                Módulo {modulo.numeracion}
                              </div>

                              <div
                                className="text-white text-tiny flex gap-1 bg-[#006FEE] px-1.5 py-1 items-center justify-center rounded-xl"
                                onClick={() => {
                                  handleVideoChange({ src: modulo.rutas_videos });
                                  toggleAccordion((index + 1).toString());
                                  setprimeravista(false);
                                  setidtemariomodulo(modulo.id);
                                  listarpreguntas(modulo.id);
                                }}
                              >
                                <IoPlay />
                                Ver
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide text-white">
                              <AccordionItem
                                key={`submodulo-${index}`}
                                aria-label="Accordion 1"
                                title={
                                  <div>
                                    <h1 className="font-bold text-white">Módulo 0</h1>
                                    <p className="text-white">Introducción al curso</p>
                                  </div>
                                }
                                indicator={({ isOpen }) => (isOpen ? <SunIcon /> : <MoonIcon />)}
                              >
                                <h1 className="px-4 text-white flex gap-2">
                                  <FaRegCircle className="h-3 w-3 min-h-3 max-h-3 min-w-3 max-w-3 mt-1" />
                                  <span>Presentación del curso</span>
                                </h1>
                              </AccordionItem>

                              <Accordion isCompact variant="shadow" className="bg-transparent rounded-none">
                                {datomodulo.map((submodulo: any, subIndex: number) => (
                                  <AccordionItem
                                    key={`submodulo-list-${subIndex}`}
                                    title={
                                      <div>
                                        <h1
                                          className={`font-bold ${openItems[subIndex] ? "text-[var(--colorccd1)]" : "text-white"
                                            }`}
                                        >
                                          Módulo {subIndex + 1}
                                        </h1>
                                        <p className={`${openItems[subIndex] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                          <span>{capitalizeFirstWord(submodulo.nombre)}</span>
                                        </p>
                                      </div>
                                    }
                                    onPress={() => toggleAccordion(subIndex.toString())}
                                    className={`${openItems[subIndex] ? "bg-[#000000]" : ""} px-5`}
                                  >
                                    <ul>
                                      {submodulo.temas.map((tema: any, temaIndex: number) => (
                                        <li key={`tema-${subIndex}-${temaIndex}`} className="mb-2">
                                          <h1 className="px-4 text-white flex gap-2">
                                            <FaRegCircle className="h-3 w-3 min-h-3 max-h-3 min-w-3 max-w-3 mt-1" />
                                            <span>{capitalizeFirstWord(tema.nombre)}</span>
                                          </h1>
                                        </li>
                                      ))}
                                    </ul>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>

                            <div>
                              <FaCloudDownloadAlt />
                            </div>
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <div className="space-y-12">
                      {/* Header Section */}
                      <div className="space-y-4 text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#00FFFF] via-[#007AFD] to-[#00FFFF] bg-clip-text text-transparent">
                          ¡Bienvenido al curso!
                        </h1>
                        <h2 className="text-xl max-md:text-sm text-blue-200 font-medium text-start">
                          Estamos encantados de tenerte aquí. Te espera un viaje
                          emocionante lleno de aprendizaje, desarrollo personal
                          y nuevas oportunidades. Este curso ha sido diseñado
                          especialmente para brindarte las herramientas y
                          conocimientos que necesitas para alcanzar tus
                          objetivos.
                          <br />
                          <br />
                          Prepárate para explorar, descubrir y transformar tus
                          habilidades. ¡Estamos seguros de que disfrutarás cada
                          paso del camino! 💡✨
                          <br />
                          <br />
                          Recuerda, no estás solo en esta experiencia: nuestro
                          equipo y comunidad están aquí para apoyarte en todo
                          momento. ¡Vamos a comenzar!
                        </h2>
                      </div>

                      {/* Course Components */}
                      <div className="bg-[#131939] rounded-3xl p-8 space-y-8 max-md:px-2 shadow-2xl border border-blue-500/20 backdrop-blur-sm bg-opacity-80">
                        <p className="text-lg text-blue-200 text-center font-medium">
                          El diplomado se compone de los siguientes ítems:
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* PDF Section */}
                          <div className="bg-gradient-to-br from-blue-900/50 to-[#09283C] p-6 max-sm3:p-3 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Book className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-blue-300">
                                Diapositivas en PDF
                              </h3>
                            </div>
                            <p className="text-blue-100">
                              Puede descargar las diapositivas y leerlas en
                              cualquier momento.
                            </p>
                          </div>

                          {/* Video Section */}
                          <div className="bg-gradient-to-br from-blue-900/50 to-[#09283C] p-6 max-sm3:p-3 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <FaVideo className="text-xl" />
                              </div>
                              <h3 className="text-xl font-semibold text-blue-300">
                                Video Sesión
                              </h3>
                            </div>
                            <p className="text-purple-100">
                              Videos de las clases en vivo con la explicación
                              del docente de las diapositivas presentadas. Todos
                              los videos tienen la opción para ver en Pantalla
                              Completa.
                            </p>
                          </div>

                          {/* Exams Section */}
                          <div className="md:col-span-2 bg-gradient-to-br from-blue-900/50 to-[#09283C] max-sm3:p-3 p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="p-3 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <PenTool className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-blue-300">
                                El diplomado tiene dos exámenes:
                              </h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="font-medium text-blue-300 flex items-center mb-2">
                                  <GraduationCap className="w-5 h-5 mr-2" />
                                  Examen de Medio curso:
                                </h4>
                                <p className="text-blue-100">
                                  Examen de preguntas y respuestas para marcar.
                                  La nota mínima aprobatoria es 14/20
                                </p>
                              </div>
                              <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="font-medium text-blue-300 flex items-center mb-2">
                                  <GraduationCap className="w-5 h-5 mr-2" />
                                  Examen Final:
                                </h4>
                                <p className="text-pink-100">
                                  Examen de preguntas y respuestas para marcar.
                                  La nota mínima aprobatoria es 14/20
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>

                )}


              </div>

            </div >
          </div >
        </Tab >
        <Tab key="2" title="Evaluaciones">
          <div className="h-full w-full flex gap-14 px-10 max-md:px-3">
            <Evaluaciones />
          </div>
        </Tab>
        <Tab key="3" title="Calificaciones">
          <div className="px-10 max-md:px-3">
            <CursosEvaluaciones pid={pid} />
          </div>
        </Tab>
        <Tab key="4" title="Encuestas">
          <div className="px-10 max-sm:px-3">
            <CursosEncuestas pid={pid} />
          </div>
        </Tab>
        <Tab key="5" title="Certificados">
          <div className="px-10 max-md:px-3">
            <CursosCertificados
              acreditaciones={(acreditaciondata as any).MarcasRespaldo}
            />
          </div>
        </Tab>
        {
          pmodalidad == "En-Vivo" && (
            <Tab key="6" title="Anuncios">
              <div className="px-10">
                <Anuncios />
              </div>
            </Tab>
          )
        }
      </Tabs >
    </>
  );
}
