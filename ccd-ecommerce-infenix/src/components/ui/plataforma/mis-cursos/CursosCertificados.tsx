"use client";

import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { environment } from "@/environments/environment";
import { Download, Award, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Image as Image1,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AOS from "aos"; // Importa AOS
import KRGlue from "@lyracom/embedded-form-glue";
import { HiCurrencyDollar } from "react-icons/hi2";
import confetti from "canvas-confetti";
import { IoClose } from "react-icons/io5";

export default function CursosCertificados({ acreditaciones }: any) {
  const [textData, setTextData] = useState(""); // Datos para el QR
  const [textOverlay, setTextOverlay] = useState(""); // Texto adicional encima de la imagen (líneas separadas por \n)
  const [loading, setLoading] = useState(true); // Estado de carga
  const canvasRef = useRef<HTMLCanvasElement>(null); // Referencia al canvas
  const canvasRef2 = useRef<HTMLCanvasElement>(null); // Referencia al canvas
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const psala = searchParams.get("psala");
  const pmodalidad = searchParams.get("pmodalidad");
  const { data: session } = useSession();
  const [datacertificadogener, setdatacertificadogener] = useState({}); // Estado para la fuente del video
  const [precioacreditacion, setprecioacreditacion] = useState(0); // Estado para la fuente del video
  const [codigosecreto, setcodigosecreto] = useState(""); // Estado para la fuente del video
  const [acreditacioindex, setacreditacioindex] = useState(""); // Estado para la fuente del video

  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onOpenChange: onOpenChange1,
  } = useDisclosure();

  function numeroACadena(num: any) {
    const unidades = [
      "",
      "Uno",
      "Dos",
      "Tres",
      "Cuatro",
      "Cinco",
      "Seis",
      "Siete",
      "Ocho",
      "Nueve",
    ];
    const decenas = [
      "",
      "Diez",
      "Veinte",
      "Treinta",
      "Cuarenta",
      "Cincuenta",
      "Sesenta",
      "Setenta",
      "Ochenta",
      "Noventa",
    ];
    const especiales = [
      "Diez",
      "Once",
      "Doce",
      "Trece",
      "Catorce",
      "Quince",
      "Dieciséis",
      "Diecisiete",
      "Dieciocho",
      "Diecinueve",
    ];
    const centenas = [
      "",
      "Ciento",
      "Doscientos",
      "Trescientos",
      "Cuatrocientos",
      "Quinientos",
      "Seiscientos",
      "Setecientos",
      "Ochocientos",
      "Novecientos",
    ];

    let palabra = "";

    if (num === 100) {
      return "Cien";
    }

    if (num >= 1000 && num < 10000) {
      let miles = Math.floor(num / 1000);
      palabra += miles === 1 ? "Mil " : unidades[miles] + " mil ";
      num = num % 1000;
    }

    if (num >= 100) {
      let centena = Math.floor(num / 100);
      palabra += centenas[centena] + " ";
      num = num % 100;
    }

    if (num >= 20) {
      let decena = Math.floor(num / 10);
      palabra += decenas[decena] + " ";
      num = num % 10;
    }

    if (num >= 10) {
      palabra += especiales[num - 10] + " ";
      return palabra.trim();
    }

    if (num > 0) {
      palabra += unidades[num] + " ";
    }

    return palabra.trim();
  }

  const [sizeRes, setSizeRes] = useState<
    "md" | "full" | "xs" | "sm" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  >("md"); // Tipo explícito

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1280) {
        setSizeRes("full"); // Cambiar a "full" en pantallas pequeñas
      } else {
        setSizeRes("5xl"); // Usar "md" en pantallas grandes
      }
    };

    // Ejecutar la función al montar el componente y al redimensionar
    handleResize();
    window.addEventListener("resize", handleResize);

    // Limpieza del evento al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (session && pmodalidad == "En-Vivo") {
      const loadData = async () => {
        try {
          const listarTemario = await api.post(
            "/inicio/listardatoscertificadogenerarvivov2",
            {
              fproducto_id: pid,
              fusuario_id: session?.user.uid,
              psala_id: psala,
            }
          );
          setdatacertificadogener(listarTemario.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
    if (session && pmodalidad == "Asincrónico") {
      const loadData = async () => {
        try {
          const listarTemario = await api.post(
            "/inicio/listardatoscertificadogenerarv2",
            {
              fproducto_id: pid,
              fusuario_id: session?.user.uid,
            }
          );
          setdatacertificadogener(listarTemario.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.uid]);

  function convertToRomanNumerals(input: string): string {
    const toRoman = (num: number): string => {
      const romanNumerals = [
        ["M", 1000],
        ["CM", 900],
        ["D", 500],
        ["CD", 400],
        ["C", 100],
        ["XC", 90],
        ["L", 50],
        ["XL", 40],
        ["X", 10],
        ["IX", 9],
        ["V", 5],
        ["IV", 4],
        ["I", 1],
      ] as [string, number][];

      let result = "";
      for (const [roman, value] of romanNumerals) {
        while (num >= value) {
          result += roman;
          num -= value;
        }
      }
      return result;
    };

    // Detectar números y convertirlos a romanos, respetando conectores como "y" o ","
    return input.replace(/\d+/g, (match) => toRoman(parseInt(match, 10)));
  }

  const dataURLtoBlob = (dataURL: string): Blob => {
    try {
      const [header, base64Data] = dataURL.split(",");
      if (!base64Data) throw new Error("Formato incorrecto");

      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";

      const byteString = atob(base64Data);
      const arrayBuffer = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }

      return new Blob([arrayBuffer], { type: mime });
    } catch (error) {
      console.error("Error al convertir DataURL a Blob:", error);
      throw error;
    }
  };

  const subirCanvasAStorage = async (canvas: HTMLCanvasElement, nombreArchivo: string, posicion: string) => {
    // Convertir canvas a blob
    const dataUrl = canvas.toDataURL('image/png');

    // Convertir DataURL a Blob
    const blob = dataURLtoBlob(dataUrl);


    if (blob.size === 0) {
      console.error("El Blob está vacío, no se puede subir.");
      return;
    }

    // Crear formData con la metadata
    const formData = new FormData();
    formData.append('posicion', posicion ?? '');
    formData.append('pproducto_id', pid?.toString() ?? '');
    formData.append('pusuario_id', session?.user.uid?.toString() ?? '');
    formData.append('Dvideovivo', blob, nombreArchivo);

    const filePaths = {
      Dvideovivo: { tipo1: 'Multimedia', tipo2: 'Imagen', tipo3: 'Cursos', tipo4: posicion }
    };

    const fileMetadata = [{
      abbreviation: "Dvideovivo",
      name: nombreArchivo,
      filePath: `${filePaths.Dvideovivo.tipo1}/${filePaths.Dvideovivo.tipo2}/${filePaths.Dvideovivo.tipo3}/${filePaths.Dvideovivo.tipo4}/${nombreArchivo}`,
      tipo1: filePaths.Dvideovivo.tipo1,
      tipo2: filePaths.Dvideovivo.tipo2,
      tipo3: filePaths.Dvideovivo.tipo3,
      tipo4: filePaths.Dvideovivo.tipo4
    }];
    try {
      // Subir metadata
      await api.post("/inicio/subircertificado", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      // Obtener pre-signed URL
      const response = await api.post("/inicio/generate-presigned-urls", { files: fileMetadata });
      const urls = response.data.urls;
      if (!urls.Dvideovivo) {
        console.error("No se recibió URL para el archivo.");
        return;
      }

      // Subir el blob al storage (S3 o R2) con la URL firmada
      const uploadResponse = await axios.put(urls.Dvideovivo, blob, {
        headers: { 'Content-Type': blob.type }
      });

    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };


  // Función para generar las imágenes
  const funcionimagenes = async () => {

    startConfetti();
    if (!canvasRef.current) return;
    if (!canvasRef2.current) return;

    const canvas = canvasRef.current;
    const canvas1 = canvasRef2.current;

    const ctx = canvas.getContext("2d");
    const ctx1 = canvas1.getContext("2d");
    if (!ctx) return;
    if (!ctx1) return;

    // Configuración del canvas
    const canvasWidth = 1124;
    const canvasHeight = 794;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    canvas1.width = canvasWidth * dpr;
    canvas1.height = canvasHeight * dpr;
    canvas1.style.width = `${canvasWidth}px`;
    canvas1.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);
    ctx1.scale(dpr, dpr);

    // Cargar la imagen de fondo
    const backgroundImage = new Image();
    const backgroundImage1 = new Image();
    backgroundImage.src = "/Multimedia/certificado/PlantillaCertificadoGES.png"; // Ruta a la plantilla
    backgroundImage.onload = async () => {
      // Dibujar la imagen de fondo

      ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

      // Añadir múltiples líneas de texto
      const lines = textOverlay.split("\n"); // Dividir texto en líneas
      ctx.fillStyle = "#3579BD";
      let fontSize = 34.5; // Tamaño inicial del texto

      lines.forEach((line, index) => {
        ctx.font = `600 ${fontSize}px Tahoma`;
        let textWidth = ctx.measureText(line).width;

        // Reducir tamaño de fuente si el texto es demasiado ancho
        while (textWidth > canvasWidth - 40 && fontSize > 10) {
          fontSize--;
          ctx.font = `600 ${fontSize}px Tahoma`;
          textWidth = ctx.measureText(line).width;
        }

        // Calcular posición para centrar cada línea
        const textX = (canvasWidth - textWidth) / 2;
        const textY = 250 + index * (fontSize + 10); // Separación entre líneas

        ctx.fillText(line, textX, textY);
      });

      const y0ini = 202;
      const maxWidth0 = canvas.width - 40;
      const maxWidth10 = canvas.width - 300;
      const maxWidth20 = canvas.width - 250;

      ctx.font = "bold 58px Tahoma";
      ctx.fillStyle = "#123157";
      const text0 =
        (datacertificadogener as any).TipoCurso === "Curso"
          ? "CERTIFICADO"
          : (datacertificadogener as any).TipoCurso === "Diploma"
            ? "DIPLOMA"
            : "";
      const w0 = ctx.measureText(text0).width;
      const x0ini = (canvasWidth - w0) / 2;
      const inicioa = wrapText1(ctx, text0, x0ini, y0ini, maxWidth0, 25);

      ctx.font = "14px Tahoma";
      ctx.fillStyle = "#123256";
      const text1 = "Otorgado a:";
      const w1 = ctx.measureText(text1).width;
      const x1ini = (canvasWidth - w1) / 2;
      const iniciob = wrapText1(ctx, text1, x1ini, inicioa + 8, maxWidth0, 25);

      ctx.font = "bold 34px Tahoma";
      ctx.fillStyle = "#004D8C";
      const text2 = `${session?.user.Nombres.toUpperCase() || ""} ${session?.user.Apellidos.toUpperCase() || ""
        }`;
      const w2 = ctx.measureText(text2).width;
      const x21ini = (canvasWidth - w2) / 2;
      const inicioc = wrapText1(
        ctx,
        text2,
        x21ini,
        iniciob + 20,
        maxWidth0,
        25
      );

      ctx.font = "bold 15px Tahoma";
      ctx.fillStyle = "#123256";
      const text4 = `Por haber concluido con éxito el ${(
        datacertificadogener as any
      ).TipoCurso.toLowerCase()} de alta especialización de:`;
      const w4 = ctx.measureText(text4).width;
      const x41ini = (canvasWidth - w4) / 2;
      const iniciod = wrapText1(
        ctx,
        text4,
        x41ini,
        inicioc + 10,
        maxWidth0,
        25
      );

      ctx.font = "bold 30px Tahoma";
      ctx.fillStyle = "#123256";
      const text5 = `${(datacertificadogener as any).Curso.toUpperCase()}`;
      const w5 = ctx.measureText(text5).width;
      const x51ini = (canvasWidth - w5) / 2;
      const inicioe = wrapText1(
        ctx,
        text5,
        x51ini,
        iniciod + 15,
        maxWidth0,
        10
      );

      ctx.font = "19px Tahoma";
      ctx.fillStyle = "#123256";
      const text6 = `Emitido por el Centro de capacitación y desarrollo - CCD, con una duración de ${(datacertificadogener as any).HorasAcademicas
        } (${numeroACadena(
          (datacertificadogener as any).HorasAcademicas
        )}) horas académicas, realizado desde el 14 de Enero hasta el 18 de Marzo del 2024.`;
      const w6 = ctx.measureText(text6).width;
      const x61ini = (canvasWidth - w6) / 2;
      const iniciof = wrapText3(
        ctx,
        text6,
        x61ini + 260,
        inicioe + 25,
        maxWidth20,
        25
      );

      ctx.font = "19px Tahoma";
      ctx.fillStyle = "#123256";
      const text7 =
        "Por cuanto: Para que conste y sea reconocido, se otorga el presente certificado en calidad de APROBADO.";
      const w7 = ctx.measureText(text7).width;
      const x71ini = (canvasWidth - w7) / 2;
      const iniciog = wrapText1(
        ctx,
        text7,
        x71ini,
        iniciof + 15,
        maxWidth10,
        25
      );

      ctx.font = "19px Tahoma";
      ctx.fillStyle = "#123256";
      const text8 = "Firmado, el 18 de Marzo del 2024.";
      const w8 = ctx.measureText(text8).width;
      const x81ini = (canvasWidth - w8) / 2;
      const inicioh = wrapText1(
        ctx,
        text8,
        x81ini,
        iniciog + 15,
        maxWidth0,
        25
      );

      //TEMARIO 2DA PAGINA

      function wrapText3(
        ctx: any,
        text: any,
        x: any,
        y: any,
        maxWidth: any,
        lineHeight: any
      ) {
        const words = text.split(" ");
        let line = "";
        const lines = [];

        // Dividir el texto en líneas
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line); // Línea completa
            line = words[n] + " "; // Nueva línea
          } else {
            line = testLine; // Continuar línea actual
          }
        }
        lines.push(line.trim()); // Agregar la última línea

        // Dibujar cada línea centrada
        lines.forEach((line) => {
          const lineWidth = ctx.measureText(line).width;
          const centeredX = (canvasWidth - lineWidth) / 2; // Calcular posición centrada
          ctx.fillText(line, centeredX, y);
          y += lineHeight; // Avanzar en Y
        });

        return y; // Retornar la posición final
      }

      function wrapText1(
        ctx: any,
        text: any,
        x: any,
        y: any,
        maxWidth: any,
        lineHeight: any
      ) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        words.forEach((word: any) => {
          const testLine = line + word + " ";
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth && line !== "") {
            lines.push(line);
            line = word + " ";
          } else {
            line = testLine;
          }
        });

        lines.push(line); // Agregar la última línea

        // Dibujar las líneas y ajustar la posición 'y' después de cada línea
        lines.forEach((lineText, index) => {
          ctx.fillText(lineText, x, y + index * lineHeight);
        });



        // Retornar la nueva posición 'y' después de dibujar todo el texto
        return y + lines.length * lineHeight;
      }


    };
    backgroundImage1.src =
      "/Multimedia/certificado/PlantillaCertificadoAtrasGES.png"; // Ruta a la plantilla
    backgroundImage1.onload = async () => {
      ctx1.drawImage(backgroundImage1, 0, 0, canvasWidth, canvasHeight);
      function wrapText1(
        ctx: any,
        text: any,
        x: any,
        y: any,
        maxWidth: any,
        lineHeight: any
      ) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        words.forEach((word: any) => {
          const testLine = line + word + " ";
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth && line !== "") {
            lines.push(line);
            line = word + " ";
          } else {
            line = testLine;
          }
        });

        lines.push(line); // Agregar la última línea

        // Dibujar las líneas y ajustar la posición 'y' después de cada línea
        lines.forEach((lineText, index) => {
          ctx.fillText(lineText, x, y + index * lineHeight);
        });

        // Retornar la nueva posición 'y' después de dibujar todo el texto
        return y + lines.length * lineHeight;
      }
      function generateUUID() {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let uuid = "";
        for (let i = 0; i < 10; i++) {
          uuid += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        return uuid;
      }
      const codigo =
        (datacertificadogener as any).CodigoCertificado === null
          ? generateUUID()
          : (datacertificadogener as any).CodigoCertificado;

      const y3ini = 64;
      const x3ini = 211;
      const maxWidth3 = canvas1.width - 100;
      ctx1.font = "bold 16.5px Tahoma ";
      ctx1.fillStyle = "#123256";
      const finala = wrapText1(
        ctx1,
        `${(
          datacertificadogener as any
        ).TipoCurso.toUpperCase()} DE ESPECIALIZACIÓN`,
        x3ini,
        y3ini,
        maxWidth3,
        25
      );

      ctx1.font = "12px Tahoma ";
      ctx1.fillStyle = "#123256";
      const finalb = wrapText1(
        ctx1,
        `${(datacertificadogener as any).Curso.toUpperCase()}`,
        x3ini + 105,
        y3ini + 14,
        maxWidth3,
        25
      );

      ctx1.font = "12px Tahoma ";
      ctx1.fillStyle = "#123256";
      const finalc = wrapText1(
        ctx1,
        `${(
          datacertificadogener as any
        ).HorasAcademicas.toUpperCase()} horas académicas.`,
        x3ini + 60,
        y3ini + 30,
        maxWidth3,
        25
      );

      ctx1.font = "12px Tahoma ";
      ctx1.fillStyle = "#123256";
      const finald = wrapText1(
        ctx1,
        `${convertToRomanNumerals(
          (datacertificadogener as any).temarioarray.length.toString()
        )} módulos de alta especialización.`,
        x3ini + 58,
        y3ini + 45,
        maxWidth3,
        25
      );

      ctx1.font = "bold 14.5px Tahoma ";
      ctx1.fillStyle = "#123256";
      const finale = wrapText1(
        ctx1,
        `${codigo}`,
        x3ini + 3,
        y3ini + 80,
        maxWidth3,
        25
      );

      const y2ini = 210;
      const x2ini = 40;
      ctx1.font = "bold 20px Tahoma ";
      ctx1.fillStyle = "#3579BE";
      const maxWidth = canvas1.width - 200;
      const finalY = wrapText1(
        ctx1,
        `${(
          datacertificadogener as any
        ).TipoCurso.toUpperCase()} DE ESPECIALIZACIÓN EN ${(
          datacertificadogener as any
        ).Curso.toUpperCase()}`,
        x2ini,
        y2ini,
        maxWidth,
        25
      );
      const canvasWidth1 = canvas1.width;
      const columnWidth = canvasWidth1 / 2 - 90;
      const columnGap = 15;
      const lineHeight = 19;

      const modules = (datacertificadogener as any).temarioarray;
      const numModules = modules.length;

      const half = Math.ceil(
        (datacertificadogener as any).temarioarray.length / 2
      );
      const column1 = (datacertificadogener as any).temarioarray.slice(0, half);
      const column2 = (datacertificadogener as any).temarioarray.slice(half);
      ctx1.font = " 15px Tahoma ";
      ctx1.fillStyle = "#123157";
      const maxWidth1 = canvas1.width - 200; // El ancho máximo de la caja (con margen de 40px a la izquierda y derecha)
      const finalY1 = wrapText1(
        ctx1,
        "El Diploma fue desarrollado por un docente de amplia experiencia diseñado con una metodología con enfoque aplicativo al ámbito laboral.",
        x2ini,
        finalY,
        maxWidth1,
        25
      );

      ctx1.font = "bold 20px Tahoma ";
      ctx1.fillStyle = "#3579BE";
      const finalY2 = wrapText1(
        ctx1,
        "Temario:",
        x2ini,
        finalY + 28,
        maxWidth1,
        25
      );

      // Renderizar la primera columna
      if (numModules > 14) {
        const half = Math.ceil(numModules / 2);
        const column1 = modules.slice(0, half);
        const column2 = modules.slice(half);

        // Renderizar la primera columna
        column1.forEach((item: any, index: any) => {
          const x = 55; // Posición inicial del texto
          const y = finalY2 + index * lineHeight - 5; // Posición en Y
          const circleRadius = 2.2; // Radio del círculo
          const circleX = x - 10; // Posición X del círculo
          const circleY = y - 5; // Posición Y del círculo (centrado verticalmente con el texto)

          // Dibujar el círculo
          ctx1.beginPath();
          ctx1.arc(circleX, circleY, circleRadius, 0, Math.PI * 2); // Dibujar el círculo
          ctx1.fillStyle = "#007BFF"; // Color azul del círculo
          ctx1.fill();

          // Dibujar el texto
          ctx1.font = "11px Tahoma";
          ctx1.fillStyle = "#123157";
          ctx1.fillText(
            `Módulo ${convertToRomanNumerals(item.numeracion)}: ${item.nombre}`,
            x,
            y
          );
        });

        // Renderizar la segunda columna
        column2.forEach((item: any, index: any) => {
          const x = columnWidth + columnGap - 100;
          const y = finalY2 + index * lineHeight - 5;
          const circleRadius = 2.2; // Radio del círculo
          const circleX = x - 10; // Posición X del círculo
          const circleY = y - 5; // Posición Y del círculo (centrado verticalmente con el texto)

          // Dibujar el círculo
          ctx1.beginPath();
          ctx1.arc(circleX, circleY, circleRadius, 0, Math.PI * 2); // Dibujar el círculo
          ctx1.fillStyle = "#007BFF"; // Color azul del círculo
          ctx1.fill();

          ctx1.font = "11px Tahoma";
          ctx1.fillStyle = "#123157";
          ctx1.fillText(
            `Módulo ${convertToRomanNumerals(item.numeracion)}: ${item.nombre}`,
            x,
            y
          );
        });
      } else {
        // Si hay 14 o menos módulos, renderiza en una sola columna
        modules.forEach((item: any, index: any) => {
          const x = 55; // Posición inicial del texto
          const y = finalY2 + index * lineHeight - 5; // Posición en Y
          const circleRadius = 2.2; // Radio del círculo
          const circleX = x - 10; // Posición X del círculo
          const circleY = y - 5; // Posición Y del círculo (centrado verticalmente con el texto)

          // Dibujar el círculo
          ctx1.beginPath();
          ctx1.arc(circleX, circleY, circleRadius, 0, Math.PI * 2); // Dibujar el círculo
          ctx1.fillStyle = "#007BFF"; // Color azul del círculo
          ctx1.fill();

          // Dibujar el texto
          ctx1.font = "14px Tahoma";
          ctx1.fillStyle = "#123157";
          ctx1.fillText(
            `Módulo ${convertToRomanNumerals(item.numeracion)}: ${item.nombre}`,
            x,
            y
          );
        });
      }

      const gradient = ctx1.createLinearGradient(50, 50, canvas1.width, 50);
      gradient.addColorStop(0, "#4B8ED9"); // Azul claro4B8ED9
      gradient.addColorStop(1, "#08325D"); // Azul oscuro08325D
      ctx1.fillStyle = gradient;
      ctx1.fillRect(40, 610, 270, 60);
      ctx1.font = "bold 24px Arial";
      ctx1.fillStyle = "white";
      ctx1.textAlign = "center";
      ctx1.textBaseline = "middle";
      ctx1.fillText(
        `Calificación Final: ${Math.round(
          (datacertificadogener as any).notafinal
        )}`,
        175,
        640
      );

      // Generar el código QR
      const qrCodeImage = await QRCode.toDataURL(
        `${environment.frontendUrl}/validar/?pcodigo=${codigo}`,
        { width: 250 }
      );


      if ((datacertificadogener as any).CodigoCertificado === null) {
        const listarTemario = await api.post("/inicio/guardarcertificadov2", {
          fcodigocertificado: codigo,
          fusuario_id: session?.user.uid,
          fproducto_id: pid,
          ftipo: acreditacioindex,
        });
        const listarTemario1 = await api.post(
          "/inicio/listardatoscertificadogenerarv2",
          {
            fproducto_id: pid,
            fusuario_id: session?.user.uid,
          }
        );
        setdatacertificadogener(listarTemario1.data.data[0]);
      }
      const qrImage = new Image();
      qrImage.setAttribute("crossorigin", "anonymous");
      qrImage.crossOrigin = "anonymous";
      qrImage.src = qrCodeImage;
      qrImage.onload = () => {
        const qrSize = 100;
        ctx1.drawImage(qrImage, 104, 48, qrSize, qrSize);
        subirCanvasAStorage(canvas, `${generateUUID()}-frontal.png`, 'CertificadoAdelante');
        subirCanvasAStorage(canvas1, `${generateUUID()}-reverso.png`, 'CertificadoAtras');
      };

    };



  };

  const generateImages = async (acreditacion: any, precio: any) => {
    setprecioacreditacion(precio);
    if (acreditacion == "0") {
      onOpen1();
      setacreditacioindex("0");
    }
    if (acreditacion == "1") {
      onOpen();
      setacreditacioindex("1");
    }
    if (acreditacion == "2") {
      onOpen();
      setacreditacioindex("2");
    }
    if (acreditacion == "3") {
      onOpen();
      setacreditacioindex("3");
    }
    if (acreditacion == "4") {
      onOpen();
      setacreditacioindex("4");
    }
  };
  const [dataacreditacioncerti, setdataacreditacioncerti] = useState({}); // Estado para la fuente del video

  useEffect(() => {
    if (session && pmodalidad == "En-Vivo") {
      const loadData = async () => {
        try {
          const listarTemario = await api.post(
            "/inicio/listarcertificadoacreditacionesvivo",
            {
              fproducto_id: pid,
              fusuario_id: session?.user.uid,
              psala_id: psala,
            }
          );
          setdataacreditacioncerti(listarTemario.data.data[0][0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
    if (session && pmodalidad == "Asincrónico") {
      const loadData = async () => {
        try {
          const listarTemario = await api.post(
            "/inicio/listarcertificadoacreditaciones",
            {
              fproducto_id: pid,
              fusuario_id: session?.user.uid,
            }
          );
          setdataacreditacioncerti(listarTemario.data.data[0][0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.uid]);

  const acreditacion = (dataacreditacioncerti as any).MarcasRespaldo || ""; // Obtener la acreditación desde el estado
  const acreditacionArray = acreditacion
    .split(",")
    .filter((id: any) => id !== "0") // Excluir "0"
    .map((id: any) => ({
      id,
      label:
        id === "1"
          ? "CIP"
          : id === "2"
            ? "CEL"
            : id === "3"
              ? "AUT"
              : id === "4"
                ? "PMI"
                : "Desconocido", // Etiquetas según el valor
      precio:
        id === "1"
          ? 130
          : id === "2"
            ? 500
            : id === "3"
              ? 300
              : id === "4"
                ? 300
                : "Desconocido",
      foto:
        id === "1"
          ? "/Multimedia/acreditacion/acreditacion-cdidp-white.svg"
          : id === "2"
            ? 500
            : id === "3"
              ? "/Multimedia/acreditacion/acreditacion-autodesk-white.svg"
              : id === "4"
                ? "/Multimedia/acreditacion/acreditacion-pmi-white.svg"
                : "Desconocido",
    }));

  // Combinar siempre el genérico CCD solo si no hay "0"
  const certificados =
    acreditacionArray.length > 0
      ? [

        ...acreditacionArray,
      ]
      : [];

  const [message, setMessage] = useState("");
  const [verprimercerti, setverprimercerti] = useState(0);

  const [animationKey, setAnimationKey] = useState<number>(0);
  const [krInstance, setKrInstance] = useState<any>(null); // Estado para almacenar la instancia de KR

  useEffect(() => {
    async function setupPaymentForm() {
      const endpoint = "https://api.micuentaweb.pe";
      const publicKey = environment.izipago;
      let formToken = "";

      try {
        if (precioacreditacion > 0) {
          const res = await fetch(environment.baseUrl + "/pago/CreatePayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: precioacreditacion * 100,
              currency: "PEN",
            }),
          });
          formToken = await res.text();
          const { KR } = await KRGlue.loadLibrary(endpoint, publicKey);

          await KR.setFormConfig({
            formToken,
            "kr-language": "es-ES",
          });

          await KR.removeForms();
          await KR.renderElements("#myPaymentForm");

          setKrInstance(KR);

          await KR.onSubmit(async (paymentData: KRPaymentResponse) => {
            try {
              const response = await fetch(
                environment.baseUrl + "/pago/validatePayment",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(paymentData),
                }
              );
              if (response.status === 200) {
                const MySwal = withReactContent(Swal);
                MySwal.fire({
                  title: "Su compra fue realizada con éxito",
                  text: "Completar el siguiente formulario para poder brindarle sus accesos a la plataforma",
                  icon: "success",
                  showCancelButton: false,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Empezar a completar el formulario",
                  allowOutsideClick: false,
                }).then(async (result) => {
                  if (result.isConfirmed) {
                  }
                });
                setMessage("Payment successful!");
              } else {
                setMessage("Payment failed!");
              }
            } catch (error) {
              console.error("Error processing payment:", error);
              setMessage("Payment failed due to an error!");
            }

            return false; // Debemos devolver un booleano explícitamente
          });
        }
      } catch (error) {
        setMessage(error + " (ver consola para más detalles)");
        console.error("Error en la configuración del formulario:", error);
      }
    }
    if (isOpen) {
      setupPaymentForm();
    }
    return () => {
      if (krInstance) {
        krInstance.removeForms(); // Remueve el formulario cuando el componente se desmonte
      }
    };
  }, [precioacreditacion, isOpen]);

  useEffect(() => {
    AOS.init({
      duration: 1000, // Duración de las animaciones
      once: false, // Permite que las animaciones se repitan
      mirror: false, // Si las animaciones se deben volver a ejecutar al hacer scroll hacia arriba
    });
  }, []);


  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: any, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }
  const startConfetti = () => {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleDownload = async () => {
    const listarTemario = await api.post("/inicio/vercertificadosv2", {
      fproducto_id: pid,
      fusuario_id: session?.user.uid,
    });
  
    const data = listarTemario.data.data[0][0];
    const rutas = [data.RutaImagenDelante, data.RutaImagenDetras];
    console.log("rutitas", rutas);
  
    for (const ruta of rutas) {
      const filename = ruta.split("/").pop();
      const fullUrl = `${environment.baseUrlStorage}${ruta}`;
  
      try {
        const response = await fetch(fullUrl);
        const blob = await response.blob();
  
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || "archivo.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error(`Error descargando ${filename}:`, err);
      }
    }
  };
  
  

  const [vercertificado, setvercertificado] = useState([]); // Estado para la fuente del video


  useEffect(() => {
    if (session?.user.uid) {
      const loadData = async () => {
        try {
          const listarTemario = await api.post(
            "/inicio/vercertificadosv2",
            {
              fproducto_id: pid,
              fusuario_id: session?.user.uid,
            }
          );
          setvercertificado(listarTemario.data.data[0]);
        } catch (error) {
          console.error("Error cargando los datos:", error);
        }
      };
      loadData();
    }
  }, [session?.user.uid,isOpen1]);

  useEffect(() => {
    if (isOpen1 && vercertificado.length == 0) {
      console.log('COMPRE')
      funcionimagenes();
    } else {
      console.log('AG')
      console.log(vercertificado)
      console.log(vercertificado.length)
      console.log(isOpen1)

    }

  }, [isOpen1]);
  return (
    <div className="flex flex-col  ">
      {/* Contenedor principal con diseño de dos columnas */}
      <div className="flex flex-col md:flex-row gap-6 text-white">
        {/* Certificado principal (CCD) - Ocupa más espacio pero con mejor uso del espacio */}
        <div className="md:w-3/5 bg-[#0f2042] rounded-xl p-6 relative overflow-hidden border-[var(--colorccd1)] border-1 h-min">
          {/* Elemento decorativo de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a3366] rounded-full opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#1a3366] rounded-full opacity-20 -ml-10 -mb-10"></div>

          <div className="relative z-10">
            {/* Encabezado con insignia destacada */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-[#0d99ff] bg-opacity-20 rounded-xl">
                <Image1
                  removeWrapper
                  isBlurred
                  alt="HeroUI Album Cover"
                  className="!rounded-none !opacity-100"
                  src={'/Multimedia/acreditacion/acreditacion-cdd-white5.svg'}
                  width={50}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">

                  <h2 className="text-2xl font-bold text-[#0d99ff]">Generar Certificado (CCD)</h2>
                </div>
                <div className="bg-[#0d99ff] bg-opacity-10 px-3 py-1 rounded-full inline-block text-sm text-[#0d99ff] font-medium mb-2">
                  Certificado Principal
                </div>
                <p className="text-gray-300">
                  Genera tu certificado emitido por el Centro de Capacitación y Desarrollo.
                </p>
              </div>
            </div>

            {/* Información del certificado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0a1429] rounded-xl p-4">
                <p className="text-gray-400 mb-1">Progreso del curso</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{Math.round(((dataacreditacioncerti as any).Progreso / (dataacreditacioncerti as any).ProgresoTotal) * 100)}%</span>
                  <div className="w-24 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0d99ff] h-full w-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a1429] rounded-xl p-4">
                <p className="text-gray-400 mb-1">Fecha de emisión</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium">23/03/2025</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z"
                      fill="#0d99ff"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-[#0a1429] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="font-medium text-[#0d99ff]">Información importante</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Este certificado valida tus conocimientos como Maestro de Obra en Edificaciones y está avalado por
                    el Centro de Capacitación y Desarrollo. Tiene validez nacional y una vigencia de 2 años.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-[#0d99ff] hover:bg-[#0b85dd] transition py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                onClick={() => generateImages(0, 0)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="white" />
                </svg>
                <span>Descargar certificado</span>
              </button>

              <button className="bg-[#1e3a6e] hover:bg-[#2a4b85] transition py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z"
                    fill="white"
                  />
                </svg>
                <span>Compartir</span>
              </button>
            </div>


            <div className="bg-[#0a1429] border border-[#1e3a6e] rounded-xl p-6 mt-7">
              <div className="flex items-center gap-3 mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 18H13V16H11V18ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 12 11 11.75 11 15H13C13 12.75 16 12.5 16 10C16 7.79 14.21 6 12 6Z"
                    fill="#0d99ff"
                  />
                </svg>
                <h3 className="text-lg font-medium">¿Necesitas ayuda?</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Si tienes problemas para generar o descargar tus certificados, contáctanos para recibir asistencia.
              </p>
              <button className="w-full bg-[#1e3a6e] hover:bg-[#2a4b85] transition py-2 px-4 rounded-xl text-sm">
                Contactar soporte
              </button>

            </div>
          </div>
        </div>

        {/* Columna vertical de certificados secundarios */}
        <div className="md:w-2/5 flex flex-col gap-6">
          {certificados.map((cert: any, number: any) => (
            <div key={number} className="bg-[#0f2042] rounded-xl p-6 hover:shadow-lg hover:shadow-[#0d99ff]/10 transition-all duration-300 border-[var(--colorccd1)] border-1">
              <div className="flex items-center gap-4 mb-0">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#0d99ff] bg-opacity-20 rounded-xl">
                      <Image1
                        removeWrapper
                        isBlurred
                        alt="HeroUI Album Cover"
                        className="!rounded-none !opacity-100"
                        src={cert.foto}
                        width={50}
                      />
                    </div>

                    <h2 className="text-xl font-bold text-[#0d99ff]">Generar Certificado ({cert.label})</h2>
                  </div>
                  <p className="text-gray-300 mt-1">
                    {cert.id == "0" &&
                      "Genera tu certificado emitido por el Centro de Capacitación y Desarrollo ."}
                    {cert.id == "1" &&
                      "Genera tu certificado emitido por el Colegio de Ingenieros del Perú."}
                    {cert.id == "2" &&
                      "Genera tu certificado emitido por el Colegio de Economistas de Lima."}
                    {cert.id == "3" &&
                      "Genera tu certificado emitido por Autodesk Perú."}
                    {cert.id == "4" &&
                      "Genera tu certificado emitido por PMI Perú."}
                  </p>
                </div>
              </div>

              <div className="bg-[#0a1429] rounded-xl p-4 mb-4">
                <p className="text-gray-400 mb-1">Progreso del curso</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{Math.round(((dataacreditacioncerti as any).Progreso / (dataacreditacioncerti as any).ProgresoTotal) * 100)}%</span>
                  <div className="w-24 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0d99ff] h-full w-full"></div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#0d99ff] hover:bg-[#0b85dd] transition py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                onClick={() => generateImages(cert.id, cert.precio)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z"
                    fill="white"
                  />
                </svg>
                <span >Iniciar Trámite</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <Modal
        size={sizeRes}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div
                  className="flex  justify-center bg-gradient-to-br from-[rgba(0,96,254,0.4)] hover:from-[rgba(0,96,254,0.7)] via-[rgba(22,46,84,0.5)] hover:via-[rgba(22,46,84,0.7)] 
            to-[rgba(0,96,254,0.4)] hover:to-[rgba(0,96,254,0.7)] border-2 border-[rgba(22,46,84,0.7)] rounded-2xl"
                >
                  <div
                    key={animationKey}
                    className="flex flex-col justify-center items-center gap-4 p-4 !bg-transparent !rounded-none  !h-full"
                    data-aos="fade-up"
                  >
                    <div className="flex flex-col gap-4 p-6 justify-center   !bg-transparent !rounded-none !h-full">
                      <div className="container">
                        <div
                          id="myPaymentForm"
                          className="flex justify-center overflow-auto"
                        >
                          <div
                            className="kr-smart-form"
                            kr-card-form-expanded="true"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen1}
        onOpenChange={onOpenChange1}
        size="5xl"
      >
        <ModalContent className="overflow-auto h-[80%] bg-[var(--colorccd3)]">
          {(onClose) => (
            <>
              <ModalBody className="relative justify-center text-center">

                <div className={`flex flex-col  gap-10 m-5 ${vercertificado.length > 0 ? 'ml-[0rem]' : 'ml-[8rem]'} `}>
                  {vercertificado.length > 0 ? (
                    vercertificado.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col justify-center items-center">
                        <div className="w-[45rem] h-[25rem] relative">
                          <img
                            src={environment.baseUrlStorage + item.RutaImagenDelante}
                            alt="Certificado Delante"
                            className="absolute top-0 w-full h-full"
                            style={{ display: "block", }}
                          />
                        </div>
                        <div className="w-[45rem] h-[25rem] relative mt-[3rem]">
                          <img
                            src={environment.baseUrlStorage + item.RutaImagenDetras}
                            alt="Certificado Detrás"
                            className="absolute top-0 w-full h-full"
                            style={{ display: "block", }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="w-[35rem] h-[15rem] relative">
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 w-full h-full"
                          style={{ display: "block", zoom: "62%" }}
                        ></canvas>
                      </div>
                      <div className="w-[35rem] h-[15rem] relative mt-[15rem] mb-[17rem]">
                        <canvas
                          ref={canvasRef2}
                          className="absolute top-0 w-full h-full"
                          style={{ display: "block", zoom: "62%" }}
                        ></canvas>
                      </div>
                    </>
                  )}
                </div>
                <div className="mx-auto flex flex-row gap-2">
                  <Button onClick={() => { handleDownload() }} className={`${vercertificado.length > 0 ? 'ml-[0rem]' : 'ml-[16rem]'}  text-white bg-[var(--colorccd1)] mx-auto w-40`}>Descargar</Button>
                  <Button color="danger" variant="light" onPress={onClose} className={`bg-white mx-auto w-40 ${vercertificado.length > 0 ? 'ml-[0rem] mb-[1rem]' : 'ml-[16rem]'} `}>
                    Cerrar
                  </Button>

                </div>
              </ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
