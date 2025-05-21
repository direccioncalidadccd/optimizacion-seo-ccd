"use client";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Input,
    Autocomplete,
    AutocompleteItem,
    Tabs,
    Tab,
    Card,
    CardBody,
    Divider,
    Image,
    CheckboxGroup,
    Checkbox,
    Select,
    SelectItem,
    Textarea, DatePicker, Progress, Popover, PopoverTrigger, PopoverContent, Accordion, AccordionItem,
} from "@nextui-org/react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import axios from "axios";
import { environment } from "@/environments/environment";
import { MdModeEdit } from "react-icons/md";
import CheckboxGroupComponent from "../checkboxgroup/checkboxgroup";
import type { Selection } from "@nextui-org/react";
import { DateValue, parseDate, getLocalTimeZone } from "@internationalized/date";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdMeetingRoom } from "react-icons/md";
import { FaCalendarAlt, FaFileWord, FaFilePdf, FaFileImage, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa';
import { IoIosPlay, IoMdMailUnread } from 'react-icons/io';
import { AiFillFileZip } from "react-icons/ai";
import { IoDocumentAttach, IoEnter, IoPlay, IoSend } from 'react-icons/io5';
import { FaCloudDownloadAlt } from "react-icons/fa";
import { useSearchParams } from 'next/navigation';
import { MdEdit } from "react-icons/md";
import { Button as ButtonAd, Modal as ModalAd } from 'antd';

interface props {
    array: any
}

export default function ModalEditarCursoComponent({ array }: props) {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };


    const { data: session } = useSession();
    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedTab, setSelectedTab] = useState("1");
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
    const searchParams = useSearchParams();
    const pid = searchParams.get('pid');
    const psala = searchParams.get('psala');
    const pmodalidad = searchParams.get('pmodalidad');
    const ptipo = searchParams.get('ptipo');
    const [value, setValue] = useState("");
    const [selects, setSelects] = useState({
        cliente: null,
        naturaleza: null,
        tipoProducto: null,
        clasificacion: null,
        categoria: null,
        subCategoria: null,
    });
    const [data, setData] = useState({
        datosadjunto: [],
        datosadjunto1: [],
        datosadjunto2: [],
        tipoProductos: [],
        clasificaciones: [],
        categorias: [],
        subCategorias: [],
        docentes: [],
        temario: [],
        precios: []
    });
    const [files, setFiles] = useState({
        DAdelante: null,
        DAtras: null,
        Brochure: null,
        ImagenCursoPortada: null,
        VideoCursoPresentacion: null,
    });
    const [WhatsappValue, setWhatsappValue] = useState("");
    const [CodigoValue, setCodigoValue] = useState("");
    const [TituloValue, setTituloValue] = useState("");
    const [DescripcionValue, setDescripcionValue] = useState("");
    const [CalificacionValue, setCalificacionValue] = useState("");
    const [SeguidoresValue, setSeguidoresValue] = useState("");
    const [NivelValue, setNivelValue] = useState("");
    const [HorasAcademicas, setHorasAcademicas] = useState("");
    const [selectMarcasRespaldoValue, setSelectMarcasRespaldoValue] = useState<any>();
    const [selectProfesoresValue, setSelectProfesoresValue] = useState<any>();
    const [selectFrecuenciaValue, setSelectFrecuenciaValue] = useState<any>();
    const [ExamenParcialValue, setExamenParcialValue] = useState("");
    const [ExamenFinalValue, setExamenFinalValue] = useState("");
    const [PrecioOnlineValue, setPrecioOnlineValue] = useState("");
    const [PrecioMixtoValue, setPrecioMixtoValue] = useState("");
    const [PrecioAsincronicoValue, setPrecioAsincronicoValue] = useState("");
    const [idprod, setidprod] = useState("");
    const [modulos, setModulos] = useState<any[]>([]);
    const [idsproductos, setidsproductos] = useState([]);
    const [salas, setsalas] = useState([]);
    const [salasusuarios, setsalasusuarios] = useState([]);
    const [vercrearsala, setvercrearsala] = useState(false);
    const [sala, setsala] = useState("");
    const [fechainicio, setfechainicio] = React.useState<DateValue | null>(parseDate("2024-04-04"));
    const [fechafin, setfechafin] = React.useState<DateValue | null>(parseDate("2024-04-04"));
    const [horario, sethorario] = useState("");
    const [linkwhatsapp, setlinkwhatsapp] = useState("");
    const [maximoalumnos, setmaximoalumnos] = useState("");
    const [bancopreguntaid, setbancopreguntaid] = useState("");

    const [frecuencia, setfrecuencia] = React.useState<Selection>(new Set([]));
    const [vermodalidades, setvermodalidades] = useState([]);
    const [verbancopreguntas, setverbancopreguntas] = useState([]);
    const [selectedKeys, setSelectedKeys] = React.useState<any[]>([]); // Usar array en lugar de Set
    const [evaluacionesTipo1, setEvaluacionesTipo1] = useState([]);
    const [evaluacionesTipo2, setEvaluacionesTipo2] = useState([]);
    const [preguntasxtipo, setpreguntasxtipo] = useState<any[]>([]);
    const [productotemariodatos, setproductotemariodatos] = useState([]);
    const [listardocentes, setlistardocentes] = useState([]);
    const [listardocentessala, setlistardocentessala] = useState([]);
    const [idsalaactual, setidsalaactual] = useState("");
    const [docenteactual, setdocenteactual] = useState("");
    const [vercrearevaluacion, setvercrearevaluacion] = useState(false);
    const [vercrearbancopregunta, setvercrearbancopregunta] = useState(false);
    const [descripcion, setdescripcion] = useState("");
    const [evaluacion, setevaluacion] = useState("");
    const [bancopregunta, setbancopregunta] = useState("");
    const [tipoevaluacion, settipoevaluacion] = useState("");
    const [tipobanco, settipobanco] = useState("");
    const [duracion, setduracion] = useState("");
    const [intentos, setintentos] = useState("");
    const [listarsalasporproducto, setlistarsalasporproducto] = useState([]);
    const [evaluacionactual, setevaluacionactual] = useState("");
    const [evsala, setevsala] = useState("");
    const [evfechainicio, setevfechainicio] = React.useState<DateValue | null>(parseDate("2024-04-04"));
    const [evfechafin, setevfechafin] = React.useState<DateValue | null>(parseDate("2024-04-04"));
    const [listareditarvalores, setlistareditarvalores] = useState([]);
    const [numeroreunion, setnumeroreunion] = useState("");
    const [clavereunion, setclavereunion] = useState("");
    const [datomodulo, setdatomodulo] = useState([]);
    const [verbancosxevaluacion, setverbancosxevaluacion] = useState([]);
    const [datomodulolvl1, setdatomodulolvl1] = useState([]);
    const [datomodulolvl2, setdatomodulolvl2] = useState([]);
    const [datomodulolvl3, setdatomodulolvl3] = useState([]);
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
    const [crearmodulo, setcrearmodulo] = useState("");
    const [crearnumeracionmodulo, setcrearnumeracionmodulo] = useState("");
    const [crearcontenidomodulo, setcrearcontenidomodulo] = useState("");
    const [idproductotemario, setidproductotemario] = useState("");
    const { isOpen: isOpen1, onOpen: onOpen1, onOpenChange: onOpenChange1 } = useDisclosure();
    const { isOpen: isOpen2, onOpen: onOpen2, onOpenChange: onOpenChange2 } = useDisclosure();
    const { isOpen: isOpen3, onOpen: onOpen3, onOpenChange: onOpenChange3 } = useDisclosure();
    const { isOpen: isOpen4, onOpen: onOpen4, onOpenChange: onOpenChange4 } = useDisclosure();
    const { isOpen: isOpen5, onOpen: onOpen5, onOpenChange: onOpenChange5 } = useDisclosure();
    const { isOpen: isOpen21, onOpen: onOpen21, onOpenChange: onOpenChange21 } = useDisclosure();
    const { isOpen: isOpen22, onOpen: onOpen22, onOpenChange: onOpenChange22 } = useDisclosure();
    const { isOpen: isOpen23, onOpen: onOpen23, onOpenChange: onOpenChange23 } = useDisclosure();
    const { isOpen: isOpen24, onOpen: onOpen24, onOpenChange: onOpenChange24 } = useDisclosure();
    const { isOpen: isOpen25, onOpen: onOpen25, onOpenChange: onOpenChange25 } = useDisclosure();
    const { isOpen: isOpen51, onOpen: onOpen51, onOpenChange: onOpenChange51 } = useDisclosure();

    // Fetch data for dropdowns
    useEffect(() => {
        if (isModalOpen == true) {
            const fetchData = async () => {
                try {
                    const datasa = await api.post("/inicio/listarProductoId", {
                        pcurso_id: array.IdCurso,
                    })
                    setidprod(datasa.data.data[0][0].IdProducto)

                    const [datosadjuntoRes, adjuntoRes, docentes, temario] = await Promise.all([
                        api.post("/inicio/listarEditarCursoGeneral", {
                            pcurso_id: array.IdCurso,
                        }),
                        api.post("/inicio/listarCursoAdjuntos", {
                            pcurso_id: array.IdCurso,
                        }),
                        api.post("/inicio/listarDocentes", {
                        }),
                        api.post("/inicio/listarTemario", {
                            fproductoid: datasa.data.data[0][0].IdProducto
                        }),
                        
                        
                    ]);

                    setData({
                        ...data,
                        datosadjunto: datosadjuntoRes.data.data[0],
                        datosadjunto1: adjuntoRes.data.data[0],
                        docentes: docentes.data.data[0],
                        temario: temario.data.data[0],
                    });

                    setModulos(temario.data.data[0])
                    setHorasAcademicas(datosadjuntoRes.data.data[0][0]?.HorasAcademicas);
                    setSelectFrecuenciaValue(datosadjuntoRes.data.data[0][0]?.Frecuencia);
                    setWhatsappValue(datosadjuntoRes.data.data[0][0]?.NumeroWhatsapp);
                    setCodigoValue(datosadjuntoRes.data.data[0][0]?.CodigoCurso);
                    setTituloValue(datosadjuntoRes.data.data[0][0]?.Curso);
                    setDescripcionValue(datosadjuntoRes.data.data[0][0]?.Descripcion);
                    setCalificacionValue(datosadjuntoRes.data.data[0][0]?.Calificacion);
                    setSeguidoresValue(datosadjuntoRes.data.data[0][0]?.Seguidores);
                    setNivelValue(datosadjuntoRes.data.data[0][0]?.Nivel);
                    setSelectMarcasRespaldoValue(datosadjuntoRes.data.data[0][0]?.MarcasRespaldo?.split(',') || []);
                    setExamenParcialValue(datosadjuntoRes.data.data[0][0]?.ExamenParcial);
                    setExamenFinalValue(datosadjuntoRes.data.data[0][0]?.ExamenFinal);
                    setSelectProfesoresValue(datosadjuntoRes.data.data[0][0]?.Profesores?.split(',') || []);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();
        }
    }, [isModalOpen]);
    useEffect(() => {
        if (selects.naturaleza) {
            const fetchTipoProductos = async () => {
                try {
                    const response = await api.post("/inicio/listarSelectTipoProducto", {
                        pnaturaleza: selects.naturaleza
                    });
                    setData((prevData) => ({
                        ...prevData,
                        tipoProductos: response.data.data[0],
                    }));
                } catch (error) {
                    console.error("Error fetching TipoProductos:", error);
                }
            };
            fetchTipoProductos();
        }
    }, [selects.naturaleza]);
    useEffect(() => {
        if (selects.naturaleza && selects.tipoProducto) {
            const fetchClasificaciones = async () => {
                try {
                    const response = await api.post("/inicio/listarSelectClasificacion", {
                        pnaturaleza: selects.naturaleza,
                        ptipoproducto: selects.tipoProducto
                    });
                    setData((prevData) => ({
                        ...prevData,
                        clasificaciones: response.data.data[0],
                    }));
                } catch (error) {
                    console.error("Error fetching Clasificaciones:", error);
                }
            };
            fetchClasificaciones();
        }
    }, [selects.naturaleza, selects.tipoProducto]);
    useEffect(() => {
        if (selects.naturaleza && selects.tipoProducto && selects.clasificacion) {
            const fetchCategorias = async () => {
                try {
                    const response = await api.post("/inicio/listarSelectCategoria", {
                        pnaturaleza: selects.naturaleza,
                        ptipoproducto: selects.tipoProducto,
                        pclasificacion: selects.clasificacion
                    });
                    setData((prevData) => ({
                        ...prevData,
                        categorias: response.data.data[0],
                    }));
                } catch (error) {
                    console.error("Error fetching Categorias:", error);
                }
            };
            fetchCategorias();
        }
    }, [selects.naturaleza, selects.tipoProducto, selects.clasificacion]);
    useEffect(() => {
        if (selects.naturaleza && selects.tipoProducto && selects.clasificacion && selects.categoria) {
            const fetchSubCategorias = async () => {
                try {
                    const response = await api.post("/inicio/listarSelectSubCategoria", {
                        pnaturaleza: selects.naturaleza,
                        ptipoproducto: selects.tipoProducto,
                        pclasificacion: selects.clasificacion,
                        pcategoria: selects.categoria
                    });
                    setData((prevData) => ({
                        ...prevData,
                        subCategorias: response.data.data[0],
                    }));
                } catch (error) {
                    console.error("Error fetching SubCategorias:", error);
                }
            };
            fetchSubCategorias();
        }
    }, [selects.naturaleza, selects.tipoProducto, selects.clasificacion, selects.categoria]);
    const handleTabChange = (key: any) => {
        setSelectedTab(key);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFiles((prevFiles) => ({
            ...prevFiles,
            [type]: file
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        const selectFrecuenciaValue1 = [...selectFrecuenciaValue].filter((item: any) => item !== ",").map(String)

        formData.append('ptitulo', TituloValue);
        formData.append('pdescripcion', DescripcionValue);
        formData.append('pcalificacion', CalificacionValue);
        formData.append('pseguidores', SeguidoresValue);
        formData.append('pnivel', NivelValue);
        formData.append('pmarcasrespaldo', selectMarcasRespaldoValue);
        formData.append('pexamenparcial', ExamenParcialValue);
        formData.append('pexamenfinal', ExamenFinalValue);
        formData.append('pprofesores', JSON.stringify(Array.from(selectProfesoresValue)) || '');
        formData.append('pfrecuencia', JSON.stringify(Array.from(selectFrecuenciaValue1)) || '');
        formData.append('phorasacademicas', HorasAcademicas);
        formData.append('pcodigocurso', CodigoValue);
        formData.append('pwhatsapp', WhatsappValue);
        formData.append('pcurso_id', array.IdCurso);

        const filePaths = {
            PBrochure: { tipo1: 'Documentos', tipo2: 'Pdf', tipo3: 'Cursos', tipo4: 'BrochureCursos' },
            PPortada: { tipo1: 'Multimedia', tipo2: 'Imagen', tipo3: 'Cursos', tipo4: 'PortadaFinal' },
        };

        const fileMetadata = Object.entries(files)
            .filter(([key, file]) => file !== null && filePaths[key as keyof typeof filePaths]) // Filtrar archivos nulos y claves inexistentes
            .map(([key, file]) => {
                const { tipo1, tipo2, tipo3, tipo4 } = filePaths[key as keyof typeof filePaths]; // Obtener tipos por abreviatura
                return {
                    abbreviation: key,   // Abreviatura (como 'DAdelante', 'DAtras', etc.)
                    name: (file as any).name, // Nombre del archivo
                    filePath: `${tipo1}/${tipo2}/${tipo3}/${tipo4}/${(file as any).name}`, // Ruta personalizada
                    tipo1,
                    tipo2,
                    tipo3,
                    tipo4
                };
            });


        fileMetadata.forEach(({ abbreviation, name }) => {
            formData.append(abbreviation, name); // Agregar la abreviatura como clave y el nombre del archivo como valor
        });


        try {
            await api.post("/inicio/guardar-atributos-admin",
                formData
                , {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
        } catch (error) {
            console.error('Error uploading files:', error);
        }


        const response = await api.post("/inicio/generate-presigned-urls", {
            files: fileMetadata
        });

        const urls: any = response.data.urls;

        for (const [abbreviation, url] of Object.entries(urls)) {
            try {
                const file = files[abbreviation as keyof typeof files];
                const past = await axios.put(url as string, file, {
                    headers: {
                        'Content-Type': '*'
                    }
                });
            } catch (error) {
                console.error(`Error al subir el archivo`);
            }
        }
    };
    const guardararchivosadjuntos = async (e: React.FormEvent) => {
        e.preventDefault();

        const filePaths: any = {
            Pdf: { tipo1: 'Documentos', tipo2: 'Pdf', tipo3: 'Cursos', tipo4: 'MaterialesCursos' },
            Word: { tipo1: 'Documentos', tipo2: 'Word', tipo3: 'Cursos', tipo4: 'MaterialesCursos' },
            Excel: { tipo1: 'Documentos', tipo2: 'Excel', tipo3: 'Cursos', tipo4: 'MaterialesCursos' },
            Ppt: { tipo1: 'Documentos', tipo2: 'Ppt', tipo3: 'Cursos', tipo4: 'MaterialesCursos' },
            Imagen: { tipo1: 'Documentos', tipo2: 'Imagen', tipo3: 'Cursos', tipo4: 'MaterialesCursos' },
            VideoPresentacion: { tipo1: 'Multimedia', tipo2: 'Video', tipo3: 'Cursos', tipo4: 'PresentacionesCursos' },
        };

        console.log("Estructura de files:", JSON.stringify(files, null, 2));

        // 🔹 Agrupar archivos por tipo (Pdf, Word, etc.)
        const groupedFiles: Record<string, any[]> = {};

        Object.values(files).forEach((fileArray: any) => {
            if (Array.isArray(fileArray)) {
                fileArray.forEach(({ file, tipo }: any) => {
                    if (!groupedFiles[tipo]) {
                        groupedFiles[tipo] = [];
                    }
                    groupedFiles[tipo].push(file);
                });
            }
        });

        console.log("Estructura de groupedFiles:", JSON.stringify(groupedFiles, null, 2));

        // 🔹 Crear metadatos de archivos
        const fileMetadata = Object.entries(groupedFiles)
            .flatMap(([tipo, filesArray]) =>
                filesArray.map((file: any) => {
                    const filePathData = filePaths[tipo];

                    if (!filePathData) return null;

                    const { tipo1, tipo2, tipo3, tipo4 } = filePathData;

                    return {
                        abbreviation: tipo, // Pdf, Word, etc.
                        name: file.name, // Nombre del archivo
                        filePath: `${tipo1}/${tipo2}/${tipo3}/${tipo4}/${file.name}`, // Ruta personalizada
                        tipo1,
                        tipo2,
                        tipo3,
                        tipo4
                    };
                })
            )
            .filter(Boolean); // Eliminar valores nulos

        console.log("Metadata de archivos:", JSON.stringify(fileMetadata, null, 2));

        try {
            await api.post("/inicio/guardar-archivosmodulos-admin", {
                fileMetadata: JSON.stringify(fileMetadata, null, 2),
                idproductotemario: idproductotemario,
                idcurso: array.IdCurso
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading files:', error);
        }


        // 🔹 Solicitar URLs firmadas
        const response = await api.post("/inicio/generate-presigned-urls", {
            files: fileMetadata
        });

        const urls: any = response.data.urls;

        // 🔹 Subir archivos usando las URLs firmadas
        for (const [abbreviation, urlArray] of Object.entries(urls)) {
            console.log(`Procesando: ${abbreviation}`);
            console.log("URLs:", JSON.stringify(urlArray, null, 2));

            const filesArray = groupedFiles[abbreviation] || []; // Accede a los archivos correspondientes
            console.log("Archivos correspondientes:", JSON.stringify(filesArray, null, 2));

            if (!Array.isArray(urlArray) || !Array.isArray(filesArray)) {
                console.error(`Error: Los datos de ${abbreviation} no son arrays válidos.`);
                continue;
            }

            for (let i = 0; i < urlArray.length; i++) {
                try {
                    const file = filesArray[i];
                    const url = urlArray[i];

                    if (!file || !url) {
                        console.warn(`Advertencia: Archivo o URL faltante para ${abbreviation} en índice ${i}`);
                        continue;
                    }

                    await axios.put(url as string, file, {
                        headers: {
                            'Content-Type': '*'
                        }
                    });

                    console.log(`Archivo subido correctamente a ${url}`);
                } catch (error) {
                    console.error(`Error al subir el archivo ${i} de ${abbreviation}:`, error);
                }
            }
        }
    };

    const getFileType = (ruta: any) => {
        if (ruta.includes('Multimedia/Imagen/Cursos/PortadaFinal')) return 'imagen';
        if (ruta.includes('Documentos/Pdf/Cursos/BrochureCursos')) return 'brochure';
        return 'unknown';
    };
    const handlePriceChange = (index: number, newPrice: string) => {
        const updatedModalidades = [...vermodalidades];
        (updatedModalidades as any)[index].Precio = newPrice;
        setvermodalidades(updatedModalidades);
    };
    const handleToggleEstado = (index: number) => {
        const updatedModalidades = [...vermodalidades];
        (updatedModalidades as any)[index].Estado_id =
            (updatedModalidades as any)[index].Estado_id === "1" ? "0" : "1";
        setvermodalidades(updatedModalidades);
    };
    const handleGuardar = async () => {
        // Aquí puedes enviar los datos actualizados al backend
        console.log("Datos guardados:", vermodalidades);
        const response = await api.post("/inicio/administradoractualizarmodalidadesv2", {
            fdata: vermodalidades
        });
    };
    const days = [
        { key: "1", label: "Lunes" },
        { key: "2", label: "Martes" },
        { key: "3", label: "Miercoles" },
        { key: "4", label: "Jueves" },
        { key: "5", label: "Viernes" },
        { key: "6", label: "Sábado" },
        { key: "7", label: "Domingo" }
    ];
    const abrirmodalpreguntas = async (id: any) => {
        onOpen1()
        const response = await api.post("/inicio/verpreguntasxtipoxcursov2", {
            fbancopregunta_id: id,
        });
        setpreguntasxtipo(response.data.data[0])
        setbancopreguntaid(id)
        console.log(JSON.stringify(response.data.data[0]))

    }
    const handleAddPregunta = () => {
        const nuevasPreguntas = [...preguntasxtipo];
        const nuevaPregunta = {
            IdPregunta: 0,
            Pregunta: "Nueva pregunta",
            TipoPregunta: "1", // Tipo por defecto
            RespuestaCorrecta: "",
            respuestas: [
                { IdRespuesta: 0, Orden: 1, Respuesta: "" },
                { IdRespuesta: 0, Orden: 2, Respuesta: "" },
            ],
        };
        nuevasPreguntas.push(nuevaPregunta);
        setpreguntasxtipo(nuevasPreguntas);
    };
    const handleAddRespuesta = (preguntaIndex: number) => {
        const nuevasPreguntas = [...preguntasxtipo];
        const nuevaRespuesta = {
            Orden: (nuevasPreguntas as any)[preguntaIndex].respuestas.length + 1,
            Respuesta: "",
        };
        (nuevasPreguntas as any)[preguntaIndex].respuestas.push(nuevaRespuesta);
        setpreguntasxtipo(nuevasPreguntas);
    };
    const handleUpdatePregunta = (preguntaIndex: number, field: string, value: any) => {
        const nuevasPreguntas = [...preguntasxtipo];
        (nuevasPreguntas as any)[preguntaIndex][field] = value;
        setpreguntasxtipo(nuevasPreguntas);
    };
    const handleUpdateRespuesta = (preguntaIndex: number, respuestaIndex: number, value: string) => {
        const nuevasPreguntas = [...preguntasxtipo];
        (nuevasPreguntas as any)[preguntaIndex].respuestas[respuestaIndex].Respuesta = value;
        setpreguntasxtipo(nuevasPreguntas);
    };
    const handleSavePreguntas = async () => {

        const response1 = await api.post("/inicio/guardarpreguntasadmin", {
            preguntas: preguntasxtipo,
            fbancopregunta_id: bancopreguntaid
        });
        const response = await api.post("/inicio/verpreguntasxtipoxcursov2", {
            fbancopregunta_id: bancopreguntaid,
        });
        setpreguntasxtipo(response.data.data[0])
        console.log(preguntasxtipo)

    };
    const tipoevalucionarray = [{ key: 1, name: "Parcial" }, { key: 2, name: "Final" }]
    const abrirmodalevaluacionenvivo = async (IdEvaluacion: any) => {
        setevaluacionactual(IdEvaluacion)
        onOpen4()
        const response = await api.post("/inicio/listarsalasevaluacionv2", {
            fevaluacion_id: IdEvaluacion

        });
        setlistarsalasporproducto(response.data.data[0])
    }
    const abrireditarvalores = async (idsala: any) => {
        setidsalaactual(idsala)
        onOpen5()
        const response = await api.post("/inicio/listarsalaxidv2", {
            fsala_id: idsala

        });
        setlistareditarvalores(response.data.data[0])
        setnumeroreunion(response.data.data[0][0].NumeroReunion)
        setclavereunion(response.data.data[0][0].ClaveReunion)

    }
    const capitalizeFirstWord = (text: any) => {
        if (!text || typeof text !== 'string') return ''; // Manejo de valores no válidos

        const [firstWord, ...rest] = text.split(' ');
        return `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()} ${rest.join(' ').toLowerCase()}`;
    };
    const handleChange21 = (index: any, e: any) => {
        const { name, value } = e.target;
        setdatomodulolvl1((prev: any) =>
            prev.map((mod: any, i: any) => (i === index ? { ...mod, [name]: value } : mod))
        );
    };
    const handleChange22 = (modId: number, temaId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        setdatomodulolvl1((prev: any) =>
            prev.map((mod: any) =>
                mod.id === modId
                    ? {
                        ...mod,
                        temas: mod.temas.map((tema: any) =>
                            tema.id_ptc === temaId ? { ...tema, nombre_ptc: value } : tema
                        ),
                    }
                    : mod
            )
        );
    };
    const handleSave21 = async () => {
        const listarTemario = await api.post("/inicio/actualizarnombretemario", {
            data: datomodulolvl1
        });
        const listarTemario1 = await api.post("/inicio/listarproductotemariomodulov2", {
            fcurso_id: array.IdCurso
        });
        setdatomodulo(listarTemario1.data.data[0]);
        onOpenChange21()
    };
    const handleSave22 = async () => {
        const listarTemario = await api.post("/inicio/actualizarcontenidotemario", {
            data: datomodulolvl1
        });
        const listarTemario1 = await api.post("/inicio/listarproductotemariomodulov2", {
            fcurso_id: array.IdCurso
        });
        setdatomodulo(listarTemario1.data.data[0]);
        onOpenChange22()

    };
    const handleSave24 = async () => {
        const listarTemario1 = await api.post("/inicio/crearproductotemariov2", {
            fcurso_id: array.IdCurso,
            fproductotemario: crearmodulo,
            fnumeracion: crearnumeracionmodulo
        });
        const listarTemario11 = await api.post("/inicio/listarproductotemariomodulov2", {
            fcurso_id: array.IdCurso
        });
        setdatomodulo(listarTemario11.data.data[0]);
        onOpenChange24()
        setcrearmodulo("")
        setcrearnumeracionmodulo("")

    };
    const handleSave25 = async () => {
        const listarTemario1 = await api.post("/inicio/crearproductotemariocontenidov2", {
            fproductotemario_id: idproductotemario,
            fproductotemariocontenido: crearcontenidomodulo
        });

        const listarTemario11 = await api.post("/inicio/listarproductotemariomodulov2", {
            fcurso_id: array.IdCurso
        });

        // Extraer el array de datos
        const dataModulos = listarTemario11.data.data[0];
        console.log(JSON.stringify(dataModulos))
        // Filtrar los elementos donde IdProductoTemario sea igual a idproductotemario
        const modulosFiltrados = dataModulos.filter((item: any) => item.id === idproductotemario);
        console.log(JSON.stringify(modulosFiltrados))

        // Actualizar los estados
        setdatomodulo(dataModulos);
        setdatomodulolvl1(modulosFiltrados);
        onOpenChange25();
        setcrearcontenidomodulo("");
    };


    const defaultFiles = {
        imagen: { RutaImagen: "/Multimedia/Imagen/Cursos/PortadaFinal/default.jpg", tipo: "imagen" },
        brochure: { RutaImagen: "/Documentos/Pdf/Cursos/BrochureCursos/default.pdf", tipo: "brochure" }
    };

    // Crear un objeto combinando valores de la BD y valores por defecto
    const fileMap: any = { ...defaultFiles };

    data.datosadjunto1.forEach((item: any) => {
        const tipo = getFileType(item.RutaImagen);
        if (tipo && fileMap[tipo]) {
            fileMap[tipo] = item; // Reemplaza el valor por defecto si existe en la BD
        }
    });

    // Convertir a array para mapear
    const allFiles = Object.values(fileMap);

    useEffect(() => {
        if (isModalOpen == true) {
            const loadData = async () => {
                const response = await api.post("/inicio/obteneridproductoxcursov2", {
                    fcurso_id: array.IdCurso
                });
                setidsproductos(response.data.data[0])
            }
            loadData();
        }
    }, [isModalOpen])
    useEffect(() => {
        if (isModalOpen == true) {
            const loadData = async () => {
                const response = await api.post("/inicio/obtenersalasv2", {
                    fcurso_id: array.IdCurso
                });
                setsalas(response.data.data[0])
            }
            loadData();
        }
    }, [isModalOpen])
    useEffect(() => {
        if (isModalOpen == true) {
            const loadData = async () => {
                const response = await api.post("/inicio/vermodalidadescursov2", {
                    fcurso_id: array.IdCurso
                });
                setvermodalidades(response.data.data[0])
            }
            loadData();
        }
    }, [isModalOpen])
    useEffect(() => {
        if (isModalOpen && selectedTab == "4") {
            const loadData = async () => {
                const response = await api.post("/inicio/verbancopreguntasv2", {
                    fcurso_id: array.IdCurso,
                });

                const data = response.data.data[0];

                // Asignar a los estados correspondientes
                setverbancopreguntas(data);
            };
            loadData();
        }
    }, [isModalOpen, selectedTab]);
    useEffect(() => {
        if (isModalOpen && selectedTab == "5") {
            const loadData = async () => {
                const response = await api.post("/inicio/verevaluacionescursov2", {
                    fcurso_id: array.IdCurso,
                });

                const data = response.data.data[0];

                // Filtrar las evaluaciones por TipoEvaluacion
                const tipo1 = data.filter((item: any) => item.TipoEvaluacion === "1");
                const tipo2 = data.filter((item: any) => item.TipoEvaluacion === "2");

                // Asignar a los estados correspondientes
                setEvaluacionesTipo1(tipo1);
                setEvaluacionesTipo2(tipo2);
            };
            loadData();
        }
    }, [isModalOpen, selectedTab]);
    useEffect(() => {
        if (isModalOpen == true && selectedTab == "2") {
            const loadData = async () => {

                const listarTemario = await api.post("/inicio/listarproductotemariomodulov2", {
                    fcurso_id: array.IdCurso
                });
                setdatomodulo(listarTemario.data.data[0]);

            };
            loadData();
        }
    }, [selectedTab]);
    async function crearsala() {
        // Verifica si las fechas son nulas
        if (!fechainicio || !fechafin) {
            console.error("Fechas no válidas:", fechainicio, fechafin);
            return;
        }

        // Verificar si 'frecuencia' es un objeto y tiene la propiedad 'currentKey'
        let frecuenciaValue: any = null;
        if (frecuencia && typeof frecuencia === 'object' && 'currentKey' in frecuencia) {
            frecuenciaValue = frecuencia.currentKey;
        } else {
            console.error("Frecuencia no tiene currentKey o es un valor inválido");
            return;
        }

        // Convierte las fechas a formato YYYY-MM-DD (como cadenas)
        const fechaInicio: any = `${fechainicio.year}-${String(fechainicio.month).padStart(2, '0')}-${String(fechainicio.day).padStart(2, '0')}`;
        const fechaFin: any = `${fechafin.year}-${String(fechafin.month).padStart(2, '0')}-${String(fechafin.day).padStart(2, '0')}`;

        // Buscamos el producto con IdTipoModalidad igual a 1
        const producto: any = idsproductos.find((item: any) => item.IdTipoModalidad === 1);

        if (!producto) {
            console.error("Producto no encontrado");
            return;
        }


        try {
            const response = await api.post("/inicio/crearsalav2", {
                fsala: sala,
                fproducto_id: producto.IdProducto,
                ffechainicio: fechaInicio, // En formato YYYY-MM-DD
                ffechafin: fechaFin,       // En formato YYYY-MM-DD
                fhorario: horario,
                fmaximoalumnos: maximoalumnos,
                ffrecuencia: Array.from(frecuencia).map(Number).join(','),
                flinkwhatsapp: linkwhatsapp,
                fnumeroreunion: numeroreunion,
                fclavereunion: clavereunion,
                // Solo el valor de currentKey
            });
            setvercrearsala(false)
            console.log("Respuesta de la API:", response.data);
        } catch (error: any) {
            console.error("Error al realizar la solicitud:", error);
        }
    }
    async function crearevaluacion() {
        const response1 = await api.post("/inicio/crearevaluacionv2", {
            fevaluacion: evaluacion,
            fdescripcion: descripcion,
            ftipoevaluacion: tipoevaluacion,
            fduracion: duracion,
            fintentos: intentos,
            fcurso_id: array.IdCurso
        });
        const response = await api.post("/inicio/verevaluacionescursov2", {
            fcurso_id: array.IdCurso,
        });

        const data = response.data.data[0];

        // Filtrar las evaluaciones por TipoEvaluacion
        const tipo1 = data.filter((item: any) => item.TipoEvaluacion === "1");
        const tipo2 = data.filter((item: any) => item.TipoEvaluacion === "2");

        // Asignar a los estados correspondientes
        setEvaluacionesTipo1(tipo1);
        setEvaluacionesTipo2(tipo2);
        setvercrearevaluacion(false)
        setevaluacion("")
        setdescripcion("")
        settipoevaluacion("")
        setduracion("")
        setintentos("")
    }
    async function crearbancopreguntas() {
        const response1 = await api.post("/inicio/crearbancopreguntasv2", {
            fbancopregunta: bancopregunta,
            ftipoevaluacion: tipobanco,
            fcurso_id: array.IdCurso
        });
        const response = await api.post("/inicio/verbancopreguntasv2", {
            fcurso_id: array.IdCurso,
        });

        // Asignar a los estados correspondientes
        setverbancopreguntas(response.data.data[0]);
        setvercrearbancopregunta(false)
        setbancopregunta("")
        settipobanco("")
    }
    async function abrirgrabaciones(idsala: any) {
        setidsalaactual(idsala)
        onOpen2()
        const response = await api.post("/inicio/listarProductoTemariov2", {
            fcurso_id: array.IdCurso
        });
        setproductotemariodatos(response.data.data[0])
    }
    async function abrireditarevaluacion(tipo: any) {
        onOpen51()
        const response = await api.post("/inicio/verbancosxevaluacionv2", {
            fcurso_id: array.IdCurso,
            ftipoevaluacion: tipo
        });
        setverbancosxevaluacion(response.data.data[0])
    }

    async function subirvideoenvivo(event: React.ChangeEvent<HTMLInputElement>, valor: string) {
        event.preventDefault();

        if (!event.target.files || event.target.files.length === 0) {
            console.error("No se seleccionó ningún archivo.");
            return;
        }

        const selectedFile = event.target.files[0]; // Obtener el archivo seleccionado
        console.log("Archivo seleccionado:", selectedFile);

        const formData = new FormData();
        formData.append('pidproductotemario', valor);
        formData.append('pidsala', idsalaactual);
        formData.append('Dvideovivo', selectedFile);
        const filePaths = {
            Dvideovivo: { tipo1: 'Multimedia', tipo2: 'Video', tipo3: 'Cursos', tipo4: 'Modulos' }
        };

        const fileMetadata = [{
            abbreviation: "Dvideovivo",
            name: selectedFile.name,
            filePath: `${filePaths.Dvideovivo.tipo1}/${filePaths.Dvideovivo.tipo2}/${filePaths.Dvideovivo.tipo3}/${filePaths.Dvideovivo.tipo4}/${selectedFile.name}`,
            tipo1: filePaths.Dvideovivo.tipo1,
            tipo2: filePaths.Dvideovivo.tipo2,
            tipo3: filePaths.Dvideovivo.tipo3,
            tipo4: filePaths.Dvideovivo.tipo4
        }];



        try {
            await api.post("/inicio/subirvideossala",
                formData
                , {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
        } catch (error) {
            console.error('Error uploading files:', error);
        }

        console.log("Metadata del archivo:", fileMetadata);

        // 🔹 Hacer la petición para obtener los pre-signed URLs
        const response = await api.post("/inicio/generate-presigned-urls", { files: fileMetadata });
        const urls = response.data.urls;

        console.log("URLs generadas:", urls);

        if (!urls.Dvideovivo) {
            console.error("No se recibió URL para el archivo.");
            return;
        }

        // 🔹 Subir el archivo a Cloudflare R2
        try {
            const uploadResponse = await axios.put(urls.Dvideovivo, selectedFile, {
                headers: { 'Content-Type': selectedFile.type }
            });
            console.log("Subida exitosa:", uploadResponse.status);
        } catch (error) {
            console.error("Error al subir el archivo:", error);
        }
    }

    async function abrirprofesor(idsala: any) {
        setidsalaactual(idsala)
        onOpen3()
        const response = await api.post("/inicio/listardocentesv2", {
        });
        setlistardocentes(response.data.data[0])

        const response1 = await api.post("/inicio/listardocentesalav2", {
            fsala_id: idsala
        });
        setlistardocentessala(response1.data.data[0])
    }
    async function añadirprofesor() {
        const response = await api.post("/inicio/agregardocentesalav2", {
            fusuario_id: docenteactual,
            fsala_id: idsalaactual
        });
    }
    async function agregarsalaevaluacion() {
        if (!evfechainicio || !evfechafin) {
            return;
        }
        const fechaInicio: any = `${evfechainicio.year}-${String(evfechainicio.month).padStart(2, '0')}-${String(evfechainicio.day).padStart(2, '0')}`;
        const fechafin: any = `${evfechafin.year}-${String(evfechafin.month).padStart(2, '0')}-${String(evfechafin.day).padStart(2, '0')}`;

        const response = await api.post("/inicio/agregarsalaevaluacionv2", {
            fsala_id: evsala,
            ffechainicio: fechaInicio,
            ffechafin: fechafin,
            fevaluacion_id: evaluacionactual
        });
    }
    async function guardarabrireditarvalores() {

        const response = await api.post("/inicio/guardarabrireditarvaloresv2", {
            fsala_id: idsalaactual,
            fnumero_reunion: numeroreunion,
            fclave_reunion: clavereunion
        });
    }





    const handleFileChange11 = (moduleIndex: number, event: React.ChangeEvent<HTMLInputElement>, tipo: string) => {

        const file = event.target.files ? event.target.files[0] : null;
        if (!file) return;

        setFiles((prev: any) => ({
            ...prev,
            [moduleIndex]: [...(prev[moduleIndex] || []), { file, tipo }], // Guardamos el archivo con su tipo
        }));



        if (!file) return;
        const tipoCarpeta = {
            Pdf: "Pdf",
            Word: "Word",
            Excel: "Excel",
            Ppt: "Ppt",
            Imagen: "Imagen",
        }[tipo] || "Otros";

        // Construir la ruta de guardado
        const ruta_pta = `/Documentos/${tipoCarpeta}/Cursos/MaterialesCursos/${file.name}`;

        setdatomodulolvl1((prevModules: any) => {
            return prevModules.map((module: any, index: any) => {
                if (index === moduleIndex) {
                    return {
                        ...module,
                        adjuntos: [
                            ...module.adjuntos,
                            {
                                id_pta: Date.now(),
                                ruta_pta: ruta_pta, // Solo para vista previa
                                tipo_pta: tipo,
                                nombre_pta: file.name
                            }
                        ]
                    };
                }
                return module;
            });
        });
    };

    const handleRemoveFile = (moduleIndex: number, adjuntoIndex: number) => {
        setdatomodulolvl1((prevModules: any) =>
            prevModules.map((module: any, index: any) => {
                if (index === moduleIndex) {
                    return {
                        ...module,
                        adjuntos: module.adjuntos.filter((_: any, idx: any) => idx !== adjuntoIndex)
                    };
                }
                return module;
            })
        );
    };
    const [selectedTypes, setSelectedTypes] = useState<string[]>(datomodulolvl1.map(() => "Pdf"));

    const handleTypeChange = (moduleIndex: number, tipo: string) => {
        setSelectedTypes((prev) => {
            const newTypes = [...prev];
            newTypes[moduleIndex] = tipo;
            return newTypes;
        });
    };


    return (
        <>
            <MdModeEdit onClick={showModal} className="cursor-pointer text-2xl" />



            <ModalAd open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                width={800} >
                <Tabs
                    disabledKeys={[]}
                    selectedKey={selectedTab}
                    onSelectionChange={handleTabChange}
                >
                    <Tab key="1" title="Atributos">
                        <Card classNames={{}}>
                            <CardBody>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                            <h1 className="text-xl font-bold">Inicio</h1>
                                        </div>
                                        <Input
                                            label="Nombre del Curso(Titulo)"
                                            placeholder=""
                                            value={TituloValue}
                                            onValueChange={setTituloValue}
                                        />
                                        <Input
                                            label="Codigo del curso"
                                            placeholder=""
                                            value={CodigoValue}
                                            onValueChange={setCodigoValue}
                                        />
                                        <Textarea
                                            label="Description"
                                            placeholder="Enter your description"
                                            value={DescripcionValue}
                                            onValueChange={setDescripcionValue}
                                            className="max-w-xs"
                                        />
                                        <Input
                                            label="Calificación"
                                            placeholder=""
                                            value={CalificacionValue}
                                            onValueChange={setCalificacionValue}
                                        />

                                        <Input
                                            label="Estudiantes"
                                            placeholder=""
                                            value={SeguidoresValue}
                                            onValueChange={setSeguidoresValue}
                                        />
                                        <Autocomplete
                                            label="Nivel"
                                            variant="bordered"
                                            placeholder="Seleccionar la opción"
                                            selectedKey={NivelValue}
                                            onSelectionChange={(key) => {
                                                if (key !== null) {
                                                    setNivelValue(key.toString());
                                                }
                                            }}
                                        >
                                            <AutocompleteItem key={"1"} value={"1"}>
                                                Facil
                                            </AutocompleteItem>
                                            <AutocompleteItem key={"2"} value={"2"}>
                                                Normal
                                            </AutocompleteItem>
                                            <AutocompleteItem key={"3"} value={"3"}>
                                                Dificil
                                            </AutocompleteItem>
                                        </Autocomplete>
                                        <CheckboxGroupComponent
                                            value={selectMarcasRespaldoValue}
                                            onChange={setSelectMarcasRespaldoValue}
                                        />
                                        <div className="flex gap-3">
                                            <Input
                                                label="Examen Final"
                                                placeholder=""
                                                value={ExamenParcialValue}
                                                onValueChange={setExamenParcialValue}
                                            />
                                            <Input
                                                label="Examen Parcial"
                                                placeholder=""
                                                value={ExamenFinalValue}
                                                onValueChange={setExamenFinalValue}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center">
                                                <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                                <h1 className="text-xl font-bold">Profesores</h1>
                                            </div>
                                            <Select
                                                selectionMode="multiple"
                                                label="Seleccione los profesores del curso"
                                                variant="bordered"
                                                selectedKeys={selectProfesoresValue}
                                                onSelectionChange={setSelectProfesoresValue}
                                            >
                                                {data.docentes.map((item: any, key) => (
                                                    <SelectItem key={item.IdUsuario} value={item.IdUsuario}>
                                                        {item.Nombres + ' ' + item.Apellidos}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center">
                                                <div className="w-2 h-6 bg-[var(--colorccd1)] mr-2"></div>
                                                <h1 className="text-xl font-bold">Frecuencia</h1>
                                            </div>
                                            <Select
                                                selectionMode="multiple"
                                                label="Seleccione los días del curso"
                                                variant="bordered"
                                                selectedKeys={selectFrecuenciaValue}
                                                onSelectionChange={setSelectFrecuenciaValue}
                                            >
                                                <SelectItem key="1" value="1">Lunes</SelectItem>
                                                <SelectItem key="2" value="2">Martes</SelectItem>
                                                <SelectItem key="3" value="3">Miércoles</SelectItem>
                                                <SelectItem key="4" value="4">Jueves</SelectItem>
                                                <SelectItem key="5" value="5">Viernes</SelectItem>
                                                <SelectItem key="6" value="6">Sábado</SelectItem>
                                                <SelectItem key="7" value="7">Domingo</SelectItem>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center">
                                                <div className="w-2 h-6 bg-[var(--colorccd1)] mr-2"></div>
                                                <h1 className="text-xl font-bold">Horas Academicas</h1>
                                            </div>
                                            <Input
                                                placeholder="Escribir las horas académicas"
                                                value={HorasAcademicas}
                                                onValueChange={setHorasAcademicas}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center">
                                                <div className="w-2 h-6 bg-[var(--colorccd1)] mr-2"></div>
                                                <h1 className="text-xl font-bold">Link Whatsapp</h1>
                                            </div>
                                            <Input
                                                placeholder="Escribir el link de Whatsapp"
                                                value={WhatsappValue}
                                                onValueChange={setWhatsappValue}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                            <h1 className="text-xl font-bold">Adjuntos</h1>
                                        </div>
                                        <div className="w-full grid grid-cols-3 gap-4">
                                            {allFiles.map((item: any, index) => {
                                                const tipo = getFileType(item.RutaImagen);
                                                switch (tipo) {
                                                    case "imagen":
                                                        return (
                                                            <div key={index} className="flex flex-col gap-3 items-center">
                                                                <h1>Imagen</h1>
                                                                <div className="w-40 h-40 relative cursor-pointer">
                                                                    <Image
                                                                        src={environment.baseUrlStorage + item.RutaImagen}
                                                                        alt={`Imagen ${index}`}
                                                                        removeWrapper
                                                                        className="absolute w-full h-full z-[9] cursor-pointer"
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleFileChange(e, "PPortada")}
                                                                        className="absolute w-full h-full z-[10] opacity-0 cursor-pointer"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    case "brochure":
                                                        return (
                                                            <div key={index} className="flex flex-col gap-3 items-center">
                                                                <h1>Brochure</h1>
                                                                <div className="w-40 h-40 relative cursor-pointer">
                                                                    <iframe
                                                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(environment.baseUrlStorage + item.RutaImagen)}&embedded=true`}
                                                                        width="100%"
                                                                        height="600px"
                                                                        className="absolute w-full h-full z-[9] cursor-pointer"
                                                                        frameBorder="0"
                                                                    ></iframe>
                                                                    <input
                                                                        type="file"
                                                                        accept="application/pdf"
                                                                        onChange={(e) => handleFileChange(e, "PBrochure")}
                                                                        className="absolute w-full h-full z-[10] opacity-0 cursor-pointer"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })}
                                        </div>
                                    </div>
                                    <Button type="submit" className="bg-[var(--colorccd1)] text-tiny m-auto w-[50%] mt-5 text-white" color="primary" radius="sm" size="sm">
                                        Guardar Configuraciones
                                    </Button>
                                </form>

                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="2" title="Módulos">
                        <Card classNames={{}}>
                            <CardBody>
                                <div>
                                    <div>
                                        <Button className="bg-[var(--colorccd1)] text-tiny  my-2 text-white" onClick={() => {
                                            onOpen24();

                                        }}>
                                            Agregar Modulo
                                        </Button>
                                    </div>
                                    <Accordion isCompact variant="shadow" className="bg-[#0B0F25] rounded-none px-1" showDivider={false}>
                                        {datomodulo.map((modulo: any, index: number) => (
                                            <AccordionItem
                                                key={index}
                                                title={
                                                    <>
                                                        <div>
                                                            <div className='flex gap-2  items-center py-1'>
                                                                <div className={`text-base m-0 font-bold ${openItems[index + 1] ? "text-[var(--colorccd1)]" : "text-white"}`}>
                                                                    Módulo {modulo.numeracion}
                                                                </div>
                                                                <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center 
                                                                    justify-center rounded-xl'
                                                                    onClick={() => {
                                                                        onOpen21();
                                                                        const filteredModules = datomodulo.filter(
                                                                            (item: any) => item.id === modulo.id
                                                                        );
                                                                        setdatomodulolvl1(filteredModules);
                                                                    }}
                                                                >
                                                                    <MdEdit />

                                                                    Editar nombre
                                                                </div>
                                                                <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center 
                                                                    justify-center rounded-xl'
                                                                    onClick={() => {
                                                                        onOpen22();
                                                                        const filteredModules = datomodulo.filter(
                                                                            (item: any) => item.id === modulo.id
                                                                        );
                                                                        setdatomodulolvl1(filteredModules);
                                                                        setidproductotemario(modulo.id)
                                                                    }}
                                                                >
                                                                    <MdEdit />

                                                                    Editar contenido
                                                                </div>
                                                                <div className='text-white text-tiny flex gap-1 bg-[var(--colorccd1)] px-1.5 py-1 items-center 
                                                                    justify-center rounded-xl'
                                                                    onClick={() => {
                                                                        onOpen23();
                                                                        const filteredModules = datomodulo.filter(
                                                                            (item: any) => item.id === modulo.id
                                                                        );
                                                                        setdatomodulolvl1(filteredModules);
                                                                        setidproductotemario(modulo.id)
                                                                    }}
                                                                >
                                                                    <MdEdit />

                                                                    Editar archivos
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
                                                    {modulo.temas.map((tema: any, temaIndex: number) => (
                                                        <li key={temaIndex} className="mb-2">
                                                            <h1 className=" text-white flex gap-2 items-center">
                                                                <IoIosPlay className='text-[var(--colorccd1)] min-w-10' />
                                                                <span>{capitalizeFirstWord(tema.nombre_ptc)}</span>
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
                                                            {modulo.adjuntos
                                                                // Excluimos los elementos con tipo 'Video'
                                                                .filter((item: any) => item.tipo !== 'Video')
                                                                .map((item: any, temaIndex: number) => (
                                                                    <a
                                                                        href={storageUrl + item.ruta}
                                                                        download
                                                                        target="_blank"
                                                                        className="flex items-center justify-between space-x-1 hover:bg-[#151F42]"
                                                                        key={temaIndex} // Añade la key para evitar advertencias
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
                                                                ))}
                                                        </AccordionItem>
                                                    </Accordion>

                                                </ul>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                    <Modal
                                        isDismissable={false}
                                        isKeyboardDismissDisabled={true}
                                        isOpen={isOpen21}
                                        onOpenChange={onOpenChange21}
                                        size="3xl"
                                    >
                                        <ModalContent className="h-[80%] overflow-auto">
                                            {(onClose) => (
                                                <>
                                                    <ModalBody>
                                                        <div className="flex flex-col gap-4 rounded-xl py-3 w-full">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                                                <h1 className="text-xl font-bold">Editar Módulos</h1>
                                                            </div>
                                                            {datomodulolvl1.map((module: any, index) => (
                                                                <div key={index} className="flex flex-col gap-1 rounded-xl">
                                                                    <div className="mb-4">
                                                                        <label className="block text-sm font-medium mb-1">Numeración:</label>
                                                                        <input
                                                                            type="text"
                                                                            name="numeracion"
                                                                            placeholder="Ejemplo: 1 o 1,2 o 1,2 y 3 o 1,2,3 y 4"
                                                                            value={module.numeracion}
                                                                            onChange={(e) => handleChange21(index, e)}
                                                                            className="w-full p-2 rounded-xl border border-[var(--colorccd1)]"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="block text-sm font-medium mb-1">
                                                                            Nombre del Módulo:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name="nombre"
                                                                            value={module.nombre}
                                                                            onChange={(e) => handleChange21(index, e)}
                                                                            className="w-full p-2 rounded-xl border border-[var(--colorccd1)]"
                                                                        />
                                                                    </div>

                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={handleSave21}
                                                                className="w-full bg-[var(--colorccd1)] hover:bg-[var(--colorccd1)] text-white font-bold py-2 px-4 rounded-xl transition"
                                                            >
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Cerrar
                                                        </Button>
                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                    <Modal
                                        isDismissable={false}
                                        isKeyboardDismissDisabled={true}
                                        isOpen={isOpen22}
                                        onOpenChange={onOpenChange22}
                                        size="3xl"
                                    >
                                        <ModalContent className="h-[80%] overflow-auto">
                                            {(onClose) => (
                                                <>
                                                    <ModalBody>
                                                        <div className="flex flex-col gap-4 rounded-xl py-3 w-full">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                                                <h1 className="text-xl font-bold">Editar Contenido</h1>
                                                            </div>
                                                            <Button className="bg-[var(--colorccd1)] text-tiny  my-2 text-white !max-w-[10rem]" onClick={() => {
                                                                onOpen25();
                                                            }}>
                                                                Agregar Contenido
                                                            </Button>
                                                            {datomodulolvl1.map((module: any, index: any) => (
                                                                <div key={index} className="mb-6   rounded-xl">
                                                                    {(module as any).temas.map((item: any, index: any) => (
                                                                        <div key={index} className="mb-4">
                                                                            <label className="block text-sm font-medium mb-1">
                                                                                Nombre del Módulo:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={item.nombre_ptc}
                                                                                onChange={(e) => handleChange22(module.id, item.id_ptc, e)}
                                                                                className="w-full p-2 rounded-xl border border-[var(--colorccd1)]"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={handleSave22}
                                                                className="w-full bg-[var(--colorccd1)] hover:bg-[var(--colorccd1)] text-white font-bold py-2 px-4 rounded-xl transition"
                                                            >
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Cerrar
                                                        </Button>
                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                    <Modal isOpen={isOpen23} onOpenChange={onOpenChange23} size="3xl">
                                        <ModalContent className="h-[80%] overflow-auto">
                                            {(onClose) => (
                                                <>
                                                    <ModalBody>
                                                        <form onSubmit={guardararchivosadjuntos} className="p-6  rounded-xl shadow-md w-full">
                                                            <h2 className="text-xl font-bold mb-4">Editar Adjuntos</h2>
                                                            {datomodulolvl1.map((module, moduleIndex) => (
                                                                <div key={moduleIndex} className="mb-6 p-4  rounded-xl">
                                                                    <h3 className="text-lg font-semibold mb-2">Módulo {moduleIndex + 1}</h3>
                                                                    {(module as any).adjuntos.map((item: any, adjuntoIndex: any) => (
                                                                        <div key={adjuntoIndex} className="mb-4 flex justify-between items-center">
                                                                            <div>
                                                                                <span className="block text-sm font-medium">{item.tipo_pta}</span>
                                                                                <span className="block text-sm">{item.nombre_pta}</span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveFile(moduleIndex, adjuntoIndex)}
                                                                                className="text-red-500 hover:text-red-700"
                                                                            >
                                                                                Eliminar
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    <div className="flex gap-2">
                                                                        <select
                                                                            className="p-2 rounded-xl  border border-gray-500 "
                                                                            onChange={(e) => handleTypeChange(moduleIndex, e.target.value)}
                                                                            value={selectedTypes[moduleIndex]}
                                                                        >
                                                                            <option value="seleccionar">seleccionar</option>
                                                                            <option value="Pdf">Pdf</option>
                                                                            <option value="Word">Word</option>
                                                                            <option value="Excel">Excel</option>
                                                                            <option value="Ppt">Ppt</option>
                                                                            <option value="Imagen">Imagen</option>
                                                                            <option value="VideoPresentacion">Video de Presentación</option>
                                                                        </select>
                                                                        <input
                                                                            type="file"
                                                                            className="w-full p-2 rounded-xl  border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            onChange={(event) => handleFileChange11(moduleIndex, event, selectedTypes[moduleIndex])}
                                                                            accept={
                                                                                selectedTypes[moduleIndex] === "Word" ? ".doc,.docx" :
                                                                                    selectedTypes[moduleIndex] === "Pdf" ? ".pdf" :
                                                                                        selectedTypes[moduleIndex] === "Excel" ? ".xls,.xlsx" :
                                                                                            selectedTypes[moduleIndex] === "Ppt" ? ".ppt,.pptx" :
                                                                                                selectedTypes[moduleIndex] === "VideoPresentacion" ? ".mp4,.avi,.mov,.mkv" :
                                                                                                    "image/*"
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="submit"
                                                                className="w-full bg-[var(--colorccd1)] hover:bg-[var(--colorccd1)] text-white font-bold py-2 px-4 rounded-xl transition"
                                                            >
                                                                Guardar
                                                            </button>
                                                        </form>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Cerrar
                                                        </Button>
                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                    <Modal
                                        isDismissable={false}
                                        isKeyboardDismissDisabled={true}
                                        isOpen={isOpen24}
                                        onOpenChange={onOpenChange24}
                                        size="3xl"
                                    >
                                        <ModalContent className="h-[80%] overflow-auto">
                                            {(onClose) => (
                                                <>
                                                    <ModalHeader className="flex flex-col gap-1">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                                            <h1 className="text-xl font-bold">Crear Módulo</h1>
                                                        </div></ModalHeader>
                                                    <ModalBody>
                                                        <Input
                                                            label="Numero de Módulo"
                                                            placeholder="Ejemplo: 1 o 1,2 o 1,2 y 3 o 1,2,3 y 4"
                                                            value={crearnumeracionmodulo}
                                                            onValueChange={setcrearnumeracionmodulo}
                                                        />
                                                        <Input
                                                            label="Nombre de módulo"
                                                            placeholder=""
                                                            value={crearmodulo}
                                                            onValueChange={setcrearmodulo}
                                                        />

                                                        <button
                                                            onClick={handleSave24}
                                                            className="w-full bg-[var(--colorccd1)] hover:bg-[var(--colorccd1)] text-white font-bold py-2 px-4 rounded-xl transition"
                                                        >
                                                            Guardar
                                                        </button>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Cerrar
                                                        </Button>

                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                    <Modal
                                        isDismissable={false}
                                        isKeyboardDismissDisabled={true}
                                        isOpen={isOpen25}
                                        onOpenChange={onOpenChange25}
                                        size="3xl"
                                    >
                                        <ModalContent className="h-[80%] overflow-auto">
                                            {(onClose) => (
                                                <>
                                                    <ModalHeader className="flex flex-col gap-1">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-6  bg-[var(--colorccd1)] mr-2"></div>
                                                            <h1 className="text-xl font-bold"> Crear contenido</h1>
                                                        </div>
                                                    </ModalHeader>
                                                    <ModalBody>
                                                        <Input
                                                            label="Contenido"
                                                            placeholder=""
                                                            value={crearcontenidomodulo}
                                                            onValueChange={setcrearcontenidomodulo}
                                                        />

                                                        <button
                                                            onClick={handleSave25}
                                                            className="w-full bg-[var(--colorccd1)] hover:bg-[var(--colorccd1)] text-white font-bold py-2 px-4 rounded-xl transition"
                                                        >
                                                            Guardar
                                                        </button>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button color="danger" variant="light" onPress={onClose}>
                                                            Close
                                                        </Button>
                                                        <Button color="primary" onPress={onClose}>
                                                            Action
                                                        </Button>
                                                    </ModalFooter>
                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="3" title="Modalidades">
                        <Card>
                            <CardBody className="flex flex-col gap-5 text-center justify-center">
                                {vermodalidades.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <div className="flex flex-col gap-2">
                                            <h1>{item.TipoModalidad}</h1>
                                            <Input
                                                label="Precio"
                                                placeholder=""
                                                value={item.Precio}
                                                onValueChange={setPrecioMixtoValue}
                                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className={`w-40 text-white p-2 ${item.Estado_id === "1" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                            onClick={() => handleToggleEstado(index)}
                                        >
                                            {item.Estado_id === "1" ? "Activo" : "Inactivo"}
                                        </Button>
                                    </div>
                                ))}
                                <Button onClick={handleGuardar} className="bg-[var(--colorccd1)] text-tiny text-white m-auto w-[50%] mt-5" color="primary" radius="sm" size="sm">
                                    Guardar Configuraciones
                                </Button>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="4" title="Banco de Preguntas">
                        <Card>
                            <CardBody className="flex flex-col gap-5 text-center justify-center ">
                                <Button onClick={() => { setvercrearbancopregunta(!vercrearbancopregunta) }}>{!vercrearbancopregunta ? 'Crear ' : 'Ocultar creación de '}banco de preguntas</Button>

                                {vercrearbancopregunta && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-5">
                                            <Input label="Nombre de banco" type="text" value={bancopregunta} onValueChange={setbancopregunta} />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Autocomplete
                                                label="TipoEvaluacion"
                                                variant="bordered"
                                                defaultItems={tipoevalucionarray}
                                                placeholder="Seleccionar la opción"
                                                selectedKey={tipobanco}
                                                onSelectionChange={(value) => settipobanco(String(value ?? ""))}
                                            >
                                                {(item: any) => (
                                                    <AutocompleteItem key={item.key} value={String(item.key)}>
                                                        {`${String(item.name)}`}
                                                    </AutocompleteItem>
                                                )}
                                            </Autocomplete>
                                            <Button onClick={() => crearbancopreguntas()}>Enviar</Button>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    {verbancopreguntas.map((item: any, any: number) => (

                                        <div key={any} className="flex gap-3 items-center p-3">

                                            <h2>{item.TipoEvaluacion == 1 ? 'Parcial' : item.TipoEvaluacion == 2 ? 'Final' : ''} | {item.BancoPregunta}</h2>
                                            <Button
                                                onPress={() => { abrirmodalpreguntas(item.IdBancoPregunta) }}
                                                className="bg-[var(--colorccd1)] text-tiny text-white"
                                                color="primary"
                                                radius="sm"
                                                size="sm"
                                            >
                                                <FaClipboardQuestion />
                                            </Button>

                                        </div>
                                    ))}



                                </div>
                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen1}
                                    onOpenChange={onOpenChange1}
                                    size="3xl"
                                >
                                    <ModalContent className="h-[80%]">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="h-[5%] flex flex-col gap-1">{preguntasxtipo.length} Preguntas</ModalHeader>
                                                <ModalBody className="h-[85%] overflow-auto">
                                                    <div>

                                                        {preguntasxtipo.map((pregunta: any, preguntaIndex: number) => (
                                                            <div key={preguntaIndex} className="mb-6">
                                                                <div className="flex gap-2 py-3">
                                                                    <h3 className="font-bold text-lg">
                                                                        {(preguntaIndex + 1) + ') '}
                                                                    </h3>
                                                                    <Input
                                                                        label="Pregunta"
                                                                        placeholder="Ej: 1"
                                                                        value={pregunta.Pregunta}
                                                                        onChange={(e) =>
                                                                            handleUpdatePregunta(preguntaIndex, "Pregunta", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <Select
                                                                    className="max-w-xs"
                                                                    label="Tipo pregunta"
                                                                    placeholder="Seleccionar tipo"
                                                                    variant="bordered"
                                                                    defaultSelectedKeys={[pregunta.TipoPregunta]} // Aseguramos que el valor sea correcto
                                                                    onChange={(event) => {
                                                                        // Acceder al valor desde event.target.value
                                                                        const selectedValue = (event.target as HTMLSelectElement).value;
                                                                        console.log('dato' + selectedValue)
                                                                        handleUpdatePregunta(preguntaIndex, "TipoPregunta", selectedValue as any);
                                                                    }}
                                                                >
                                                                    <SelectItem key="1">Selección normal</SelectItem>
                                                                    <SelectItem key="2">Selección múltiple</SelectItem>
                                                                </Select>
                                                                <div className="flex gap-3 items-center py-3">
                                                                    <p className="text-gray-500">Respuesta Correcta:</p>
                                                                    <Input
                                                                        label="Respuesta Correcta"
                                                                        placeholder="Ej: 1"
                                                                        value={pregunta.RespuestaCorrecta}
                                                                        onChange={(e) =>
                                                                            handleUpdatePregunta(preguntaIndex, "RespuestaCorrecta", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <ul className="list-disc pl-6 mt-2">
                                                                    {(pregunta.respuestas as any).map((respuesta: any, respuestaIndex: number) => (
                                                                        <li key={respuestaIndex} className="mb-1 flex gap-2 items-center">
                                                                            <p>{respuesta.Orden + ')'}</p>
                                                                            <input
                                                                                type="text"
                                                                                value={respuesta.Respuesta}
                                                                                className="border p-2 w-full"
                                                                                onChange={(e) =>
                                                                                    handleUpdateRespuesta(
                                                                                        preguntaIndex,
                                                                                        respuestaIndex,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                <button
                                                                    onClick={() => handleAddRespuesta(preguntaIndex)}
                                                                    className="mt-2 text-blue-500"
                                                                >
                                                                    Añadir Respuesta
                                                                </button>
                                                            </div>
                                                        ))}

                                                    </div>
                                                </ModalBody>
                                                <ModalFooter className="h-[10%] flex gap-2 justify-start">
                                                    <button
                                                        onClick={handleAddPregunta}
                                                        className="mb-4 bg-green-500 text-white py-2 px-4 rounded-xl"
                                                    >
                                                        Añadir Nueva Pregunta
                                                    </button>
                                                    <button
                                                        onClick={handleSavePreguntas}
                                                        className="mb-4 bg-[var(--colorccd1)] text-white py-2 px-4 rounded-xl"
                                                    >
                                                        Guardar Cambios
                                                    </button>
                                                    <Button color="danger" variant="light" onPress={onClose}>
                                                        Close
                                                    </Button>
                                                </ModalFooter>

                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen51}
                                    onOpenChange={onOpenChange51}
                                    size="3xl"
                                >
                                    <ModalContent className="h-[80%] overflow-auto">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Editar Evaluación</ModalHeader>
                                                <ModalBody>
                                                    <div>
                                                        <Autocomplete
                                                            label="Área"
                                                            variant="bordered"
                                                            defaultItems={listarsalasporproducto}
                                                            placeholder="Seleccionar la opción"
                                                            selectedKey={evsala}
                                                            onSelectionChange={(value) => setevsala(String(value ?? ""))}
                                                        >
                                                            {(item: any) => (
                                                                <AutocompleteItem key={item.IdSala} value={String(item.IdSala)}>
                                                                    {`${String(item.Sala)}`}
                                                                </AutocompleteItem>
                                                            )}
                                                        </Autocomplete>
                                                        <DatePicker className="max-w-[284px]" label="Fecha Inicio" value={evfechainicio}
                                                            onChange={setevfechainicio} />
                                                        <DatePicker className="max-w-[284px]" label="Fecha Fin" value={evfechafin}
                                                            onChange={setevfechafin} />
                                                        <Button onPress={() => { agregarsalaevaluacion() }}>
                                                            Enviar
                                                        </Button>
                                                    </div>
                                                </ModalBody>

                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="5" title="Evaluacion">
                        <Card>
                            <CardBody className="flex flex-col gap-5 text-center justify-center ">
                                <Button onClick={() => { setvercrearevaluacion(!vercrearevaluacion) }}>{!vercrearevaluacion ? 'Crear ' : 'Ocultar creación de '}evaluacion</Button>

                                {vercrearevaluacion && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-5">
                                            <Input label="Evaluacion" type="text" value={evaluacion} onValueChange={setevaluacion} />
                                            <Input label="Descripcion" type="text" value={descripcion} onValueChange={setdescripcion} />

                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Autocomplete
                                                label="TipoEvaluacion"
                                                variant="bordered"
                                                defaultItems={tipoevalucionarray}
                                                placeholder="Seleccionar la opción"
                                                selectedKey={tipoevaluacion}
                                                onSelectionChange={(value) => settipoevaluacion(String(value ?? ""))}
                                            >
                                                {(item: any) => (
                                                    <AutocompleteItem key={item.key} value={String(item.key)}>
                                                        {`${String(item.name)}`}
                                                    </AutocompleteItem>
                                                )}
                                            </Autocomplete>
                                            <Input label="Duracion" type="text" value={duracion} onValueChange={setduracion} />
                                            <Input label="Intentos" type="text" value={intentos} onValueChange={setintentos} />

                                            <Button onClick={() => crearevaluacion()}>Enviar</Button>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div className="flex gap-3 items-center p-3">

                                        <h2>Evaluaciones Parcial</h2>


                                    </div>
                                    <div className="flex flex-col gap-3">

                                        {evaluacionesTipo1.map((item: any, index: number) => (
                                            <div key={index} className="flex flex-col gap-3 border-2 border-blue-500 p-2 rounded-xl">
                                                <Button onClick={() => abrireditarevaluacion(item.TipoEvaluacion)}>Editor</Button>

                                                <div className="w-full flex flex-col gap-3">
                                                    <Input
                                                        label="Evaluación"
                                                        placeholder=""
                                                        value={item.Evaluacion}
                                                    />
                                                    <Textarea
                                                        label="Descripcion"
                                                        placeholder=""
                                                        value={item.Descripcion}
                                                    />
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 items-center p-3">

                                        <h2>Evaluaciones Final</h2>


                                    </div>
                                    <div className="flex flex-col gap-3">

                                        {evaluacionesTipo2.map((item: any, index: number) => (

                                            <div key={index} className="flex flex-col gap-3 border-2 border-blue-500 p-2 rounded-xl">

                                                <div className="w-full flex flex-col gap-3">
                                                    <Input
                                                        label="Evaluación"
                                                        placeholder=""
                                                        value={item.Evaluacion}
                                                    />
                                                    <Textarea
                                                        label="Descripcion"
                                                        placeholder=""
                                                        value={item.Descripcion}
                                                    />
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen4}
                                    onOpenChange={onOpenChange4}
                                    size="3xl"
                                >
                                    <ModalContent className="h-[80%] overflow-auto">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Evaluacion por sala</ModalHeader>
                                                <ModalBody>
                                                    <div>
                                                        <Autocomplete
                                                            label="Área"
                                                            variant="bordered"
                                                            defaultItems={listarsalasporproducto}
                                                            placeholder="Seleccionar la opción"
                                                            selectedKey={evsala}
                                                            onSelectionChange={(value) => setevsala(String(value ?? ""))}
                                                        >
                                                            {(item: any) => (
                                                                <AutocompleteItem key={item.IdSala} value={String(item.IdSala)}>
                                                                    {`${String(item.Sala)}`}
                                                                </AutocompleteItem>
                                                            )}
                                                        </Autocomplete>
                                                        <DatePicker className="max-w-[284px]" label="Fecha Inicio" value={evfechainicio}
                                                            onChange={setevfechainicio} />
                                                        <DatePicker className="max-w-[284px]" label="Fecha Fin" value={evfechafin}
                                                            onChange={setevfechafin} />
                                                        <Button onPress={() => { agregarsalaevaluacion() }}>
                                                            Enviar
                                                        </Button>
                                                    </div>
                                                </ModalBody>

                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="6" title="Salas">
                        <Card>
                            <CardBody className="flex flex-col gap-5 text-center justify-center">
                                <Button onClick={() => { setvercrearsala(!vercrearsala) }}>{!vercrearsala ? 'Crear ' : 'Ocultar creación de '}sala</Button>
                                {vercrearsala && (<div className="flex flex-col gap-3">
                                    <span className="text-red-500 text-start">No se admite crear sala con simbolos especiales - , / , etc</span>
                                    <Input
                                        label="Sala"
                                        type="text"
                                        value={sala}
                                        onValueChange={setsala}
                                        onChange={e => {
                                            // No permitir "-" ni "/"
                                            const value = e.target.value.replace(/[-\/]/g, "");
                                            setsala(value);
                                        }}
                                    />
                                    
                                    <div className="flex gap-5">
                                        <DatePicker className="max-w-[284px]" label="Fecha Inicio" value={fechainicio}
                                            onChange={setfechainicio} />
                                        <DatePicker className="max-w-[284px]" label="Fecha Fin" value={fechafin}
                                            onChange={setfechafin} />
                                    </div>
                                    <Input label="Horario" type="text" value={horario} onValueChange={sethorario} />
                                    <Input label="MaximoAlumnos" type="text" value={maximoalumnos} onValueChange={setmaximoalumnos} />
                                    <Select
                                        className="max-w-xs"
                                        label="Frecuencia"
                                        placeholder="Seleccionar Fechas"
                                        selectionMode="multiple"
                                        selectedKeys={frecuencia}
                                        variant="bordered"
                                        onSelectionChange={setfrecuencia}
                                    >
                                        {days.map((days) => (
                                            <SelectItem key={days.key}>{days.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <Input label="Link de Whatsapp" type="text" value={linkwhatsapp} onValueChange={setlinkwhatsapp} />
                                    <Input label="Numero reunión" type="text" value={numeroreunion} onValueChange={setnumeroreunion} />
                                    <Input label="Clave reunión" type="text" value={clavereunion} onValueChange={setclavereunion} />

                                    <div className="text-center">
                                        <Button onClick={() => crearsala()}>Enviar</Button>
                                    </div>
                                </div>)}

                                {salas.map((item: any, index: number) => (
                                    <div key={index} className="overflow-hidden rounded-xl w-full bg-[var(--colorccd1)] p-6 text-white shadow-lg transition-transform hover:scale-[1.02] flex gap-2">
                                        <div className="w-[80%]">
                                            <div className="mb-4 flex items-baseline justify-between">
                                                <h2 className="text-2xl font-bold">Sala {item.Sala}</h2>
                                                <time className="text-sm text-blue-100"> {new Date(item.FechaInicio).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                                </time>
                                            </div>

                                            <div className="mb-6 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="font-medium">{item.Horario}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="font-medium"> {item.Frecuencia.split(',').map((num: string) => {
                                                        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                                                        return dias[parseInt(num.trim())];
                                                    }).join(', ')}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Capacidad</span>
                                                    <span>{item.CantidadActualAlumnos}/{item.MaximoAlumnos}</span>
                                                </div>
                                                <Progress classNames={{ "indicator": `bg-white` }} value={(item.CantidadActualAlumnos / item.MaximoAlumnos) * 100} aria-label={`Progreso del curso: ${50}%`} />
                                            </div>
                                        </div>
                                        <div className="w-[20%] flex flex-col gap-3">
                                            <Button onPress={() => abrirgrabaciones(item.IdSala)}>
                                                Grabaciones
                                            </Button>
                                            <Button onPress={() => abrirprofesor(item.IdSala)}>
                                                Añadir Profesor
                                            </Button>
                                            <Button onPress={() => abrireditarvalores(item.IdSala)}>
                                                Editar valores
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen2}
                                    onOpenChange={onOpenChange2}
                                >
                                    <ModalContent className="h-[80%] overflow-auto">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Grabaciones en vivo</ModalHeader>
                                                <ModalBody>
                                                    <div className="flex flex-col gap-2">
                                                        {productotemariodatos.map((item: any, index: number) => (
                                                            <div key={index} className="bg-[var(--colorccd1)] rounded-xl p-3">
                                                                <h1 className="text-white">Módulo {item.Numeracion}</h1>
                                                                <Popover placement="right">
                                                                    <PopoverTrigger>
                                                                        <button className="text-white bg-red-500 p-2 rounded-xl">Subir Grabación</button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <div className="px-1 py-2">
                                                                            <input type="file" accept="video/*"
                                                                                onChange={(event) => subirvideoenvivo(event, item.IdProductoTemario)} />
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant="light" onPress={onClose}>
                                                        Close
                                                    </Button>
                                                    <Button color="primary" onPress={onClose}>
                                                        Action
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen3}
                                    onOpenChange={onOpenChange3}
                                >
                                    <ModalContent className="h-[80%] overflow-auto">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Añadir Docentes</ModalHeader>
                                                <ModalBody>
                                                    {listardocentessala.map((item: any, index: number) => (
                                                        <div key={index}>
                                                            {item.Usuario + ' | ' + item.Nombres + ' ' + item.Apellidos}
                                                        </div>
                                                    ))}
                                                    <Autocomplete
                                                        label="Área"
                                                        variant="bordered"
                                                        defaultItems={listardocentes}
                                                        placeholder="Seleccionar la opción"
                                                        selectedKey={docenteactual}
                                                        onSelectionChange={(value) => setdocenteactual(String(value ?? ""))}
                                                    >
                                                        {(item: any) => (
                                                            <AutocompleteItem key={item.IdUsuario} value={String(item.Usuario)}>
                                                                {`${String(item.Usuario + ' | ' + item.Nombres + ' ' + item.Apellidos)}`}
                                                            </AutocompleteItem>
                                                        )}
                                                    </Autocomplete>
                                                    <Button onPress={() => añadirprofesor()}>
                                                        Enviar
                                                    </Button>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant="light" onPress={onClose}>
                                                        Close
                                                    </Button>
                                                    <Button color="primary" onPress={onClose}>
                                                        Action
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Modal
                                    isDismissable={false}
                                    isKeyboardDismissDisabled={true}
                                    isOpen={isOpen5}
                                    onOpenChange={onOpenChange5}
                                >
                                    <ModalContent className="h-[80%] overflow-auto">
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Editar valores</ModalHeader>
                                                <ModalBody>
                                                    <div className="flex flex-col gap-3">
                                                        <Input label="Numero de reunión" type="text" value={numeroreunion} onValueChange={setnumeroreunion} />
                                                        <Input label="Clave de reunión" type="text" value={clavereunion} onValueChange={setclavereunion} />
                                                        <Button className="bg-[var(--colorccd1)] text-tiny text-white m-auto w-[50%] mt-5" onPress={() => { guardarabrireditarvalores() }}>
                                                            Guardar
                                                        </Button>
                                                    </div>

                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant="light" onPress={onClose}>
                                                        Close
                                                    </Button>
                                                    <Button color="primary" onPress={onClose}>
                                                        Action
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </ModalAd>


        </>
    );
}
