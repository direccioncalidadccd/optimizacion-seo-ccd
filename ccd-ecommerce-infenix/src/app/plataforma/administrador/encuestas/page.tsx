"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import axios from "axios";
import { environment } from "@/environments/environment";

// Tipos de datos
type Encuesta = {
    id: number
    titulo: string
    descripcion: string
    fechaCreacion: string
    estado: string
}

type EncuestaPregunta = {
    id: number
    encuestaId: number
    pregunta: string
    tipo: string
    orden: number
    opciones?: string[]
}

export default function EncuestaAdmin() {
    // Estados
    const [encuestas, setEncuestas] = useState<Encuesta[]>([])
    const [preguntas, setPreguntas] = useState<EncuestaPregunta[]>([])
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState<Encuesta | null>(null)
    const [busqueda, setBusqueda] = useState("")
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [mostrarFormularioPregunta, setMostrarFormularioPregunta] = useState(false)
    const [nuevaEncuesta, setNuevaEncuesta] = useState<Partial<Encuesta>>({
        titulo: "",
        descripcion: "",
        estado: "activo",
    })
    const [nuevaPregunta, setNuevaPregunta] = useState<Partial<EncuestaPregunta>>({
        pregunta: "",
        tipo: "texto",
        orden: 1,
        opciones: [],
    })
    const [opcionTemp, setOpcionTemp] = useState("")

    // Datos de ejemplo
    useEffect(() => {
        // Simulación de datos de la base de datos
        const encuestasEjemplo: Encuesta[] = [
            {
                id: 1,
                titulo: "Satisfacción del cliente",
                descripcion: "Encuesta para medir la satisfacción de nuestros clientes",
                fechaCreacion: "2023-04-15",
                estado: "activo",
            },
            {
                id: 2,
                titulo: "Evaluación de producto",
                descripcion: "Encuesta para evaluar nuestros productos",
                fechaCreacion: "2023-05-20",
                estado: "activo",
            },
            {
                id: 3,
                titulo: "Experiencia de usuario",
                descripcion: "Encuesta sobre la experiencia de usuario en nuestra plataforma",
                fechaCreacion: "2023-06-10",
                estado: "inactivo",
            },
        ]

        const preguntasEjemplo: EncuestaPregunta[] = [
            {
                id: 1,
                encuestaId: 1,
                pregunta: "¿Cómo calificaría nuestro servicio?",
                tipo: "escala",
                orden: 1,
                opciones: ["1", "2", "3", "4", "5"],
            },
            { id: 2, encuestaId: 1, pregunta: "¿Qué podríamos mejorar?", tipo: "texto", orden: 2 },
            {
                id: 3,
                encuestaId: 2,
                pregunta: "¿Qué producto compró?",
                tipo: "seleccion",
                orden: 1,
                opciones: ["Producto A", "Producto B", "Producto C"],
            },
            { id: 4, encuestaId: 2, pregunta: "¿Está satisfecho con su compra?", tipo: "boolean", orden: 2 },
        ]

        setEncuestas(encuestasEjemplo)
        setPreguntas(preguntasEjemplo)
    }, [])

    // Filtrar encuestas por búsqueda
    const encuestasFiltradas = encuestas.filter(
        (encuesta) =>
            encuesta.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            encuesta.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
    )

    // Obtener preguntas de la encuesta seleccionada
    const preguntasDeEncuesta = preguntas
        .filter((pregunta) => encuestaSeleccionada && pregunta.encuestaId === encuestaSeleccionada.id)
        .sort((a, b) => a.orden - b.orden)

    // Manejadores de eventos
    const handleCrearEncuesta = () => {
        if (!nuevaEncuesta.titulo) return

        const nuevaEncuestaCompleta = {
            ...nuevaEncuesta,
            id: encuestas.length + 1,
            fechaCreacion: new Date().toISOString().split("T")[0],
        } as Encuesta

        setEncuestas([...encuestas, nuevaEncuestaCompleta])
        setNuevaEncuesta({ titulo: "", descripcion: "", estado: "activo" })
        setMostrarFormulario(false)
    }

    const handleCrearPregunta = () => {
        if (!nuevaPregunta.pregunta || !encuestaSeleccionada) return

        const nuevaPreguntaCompleta = {
            ...nuevaPregunta,
            id: preguntas.length + 1,
            encuestaId: encuestaSeleccionada.id,
        } as EncuestaPregunta

        setPreguntas([...preguntas, nuevaPreguntaCompleta])
        setNuevaPregunta({ pregunta: "", tipo: "texto", orden: preguntasDeEncuesta.length + 1, opciones: [] })
        setMostrarFormularioPregunta(false)
    }

    const handleEliminarEncuesta = (id: number) => {
        setEncuestas(encuestas.filter((encuesta) => encuesta.id !== id))
        if (encuestaSeleccionada && encuestaSeleccionada.id === id) {
            setEncuestaSeleccionada(null)
        }
    }

    const handleEliminarPregunta = (id: number) => {
        setPreguntas(preguntas.filter((pregunta) => pregunta.id !== id))
    }

    const handleAgregarOpcion = () => {
        if (!opcionTemp) return
        setNuevaPregunta({
            ...nuevaPregunta,
            opciones: [...(nuevaPregunta.opciones || []), opcionTemp],
        })
        setOpcionTemp("")
    }

    const handleEliminarOpcion = (index: number) => {
        const opciones = nuevaPregunta.opciones || []
        setNuevaPregunta({
            ...nuevaPregunta,
            opciones: opciones.filter((_, i) => i !== index),
        })
    }




    const [dataencuesta, setdataencuesta] = useState([]);

    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.post("/inicio/listarencuesta");
                setdataencuesta(response.data.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);



    return (
        <div className="min-h-screen bg-[#0c1330] text-white">
            {/* Cabecera */}
            <header className="bg-[#0c1330] border-b border-[#1a2547] p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Administración de Encuestas</h1>
                    {encuestaSeleccionada ? (
                        <button
                            onClick={() => setEncuestaSeleccionada(null)}
                            className="flex items-center gap-2 text-[#0095ff] hover:text-[#33abff] transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Volver a encuestas
                        </button>
                    ) : (
                        <button
                            onClick={() => setMostrarFormulario(true)}
                            className="bg-[#0095ff] hover:bg-[#33abff] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} />
                            Nueva Encuesta
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto p-4">
                {!encuestaSeleccionada ? (
                    <>
                        {/* Barra de búsqueda */}
                        <div className="mb-6 relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar encuestas..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full bg-[#1a2547] border border-[#2a3761] rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Lista de encuestas */}
                        <div className="bg-[#1a2547] rounded-lg overflow-hidden shadow-lg">
                            <div className="grid grid-cols-12 bg-[#0c1330] p-4 border-b border-[#2a3761] font-medium">
                                <div className="col-span-4">Título</div>
                                <div className="col-span-4">Descripción</div>
                                <div className="col-span-2">Tiempo Estimado</div>
                                <div className="col-span-1">Estado</div>
                                <div className="col-span-1 text-right">Acciones</div>
                            </div>

                            {dataencuesta.length > 0 ? (
                                <div className="divide-y divide-[#2a3761]">
                                    {dataencuesta.map((encuesta:any,number:any) => (
                                        <div key={number} className="grid grid-cols-12 p-4 hover:bg-[#232f5a] transition-colors">
                                            <div
                                                className="col-span-4 font-medium text-[#0095ff] cursor-pointer hover:underline"
                                                onClick={() => setEncuestaSeleccionada(encuesta)}
                                            >
                                                {encuesta.Encuesta}
                                            </div>
                                            <div className="col-span-4 text-gray-300 truncate">{encuesta.Descripcion}</div>
                                            <div className="col-span-2 text-gray-400">{encuesta.TiempoEstimado}</div>
                                            <div className="col-span-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${encuesta.Estado_id === "1" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                                                        }`}
                                                >
                                                    {encuesta.Estado_id === "1" ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex justify-end gap-2">
                                                <button className="text-gray-400 hover:text-[#0095ff] transition-colors" title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Eliminar"
                                                    onClick={() => handleEliminarEncuesta(encuesta.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">No se encontraron encuestas</div>
                            )}
                        </div>

                        {/* Modal para crear encuesta */}
                        {mostrarFormulario && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-[#1a2547] rounded-lg w-full max-w-md p-6 shadow-xl">
                                    <h2 className="text-xl font-bold mb-4">Nueva Encuesta</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Título</label>
                                            <input
                                                type="text"
                                                value={nuevaEncuesta.titulo}
                                                onChange={(e) => setNuevaEncuesta({ ...nuevaEncuesta, titulo: e.target.value })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                                placeholder="Título de la encuesta"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Descripción</label>
                                            <textarea
                                                value={nuevaEncuesta.descripcion}
                                                onChange={(e) => setNuevaEncuesta({ ...nuevaEncuesta, descripcion: e.target.value })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff] min-h-[100px]"
                                                placeholder="Descripción de la encuesta"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Estado</label>
                                            <select
                                                value={nuevaEncuesta.estado}
                                                onChange={(e) => setNuevaEncuesta({ ...nuevaEncuesta, estado: e.target.value })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                            >
                                                <option value="activo">Activo</option>
                                                <option value="inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => setMostrarFormulario(false)}
                                            className="px-4 py-2 border border-[#2a3761] rounded-md hover:bg-[#232f5a] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCrearEncuesta}
                                            className="bg-[#0095ff] hover:bg-[#33abff] text-white px-4 py-2 rounded-md transition-colors"
                                            disabled={!nuevaEncuesta.titulo}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Detalle de encuesta y sus preguntas */}
                        <div className="bg-[#1a2547] rounded-lg overflow-hidden shadow-lg mb-6 p-6">
                            <h2 className="text-2xl font-bold mb-2">{encuestaSeleccionada.titulo}</h2>
                            <p className="text-gray-300 mb-4">{encuestaSeleccionada.descripcion}</p>

                            <div className="flex gap-4 text-sm text-gray-400">
                                <div>Fecha: {encuestaSeleccionada.fechaCreacion}</div>
                                <div>
                                    Estado:
                                    <span
                                        className={`ml-2 px-2 py-0.5 rounded-full ${encuestaSeleccionada.estado === "activo"
                                                ? "bg-green-900 text-green-300"
                                                : "bg-red-900 text-red-300"
                                            }`}
                                    >
                                        {encuestaSeleccionada.estado}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Preguntas */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Preguntas</h3>
                            <button
                                onClick={() => setMostrarFormularioPregunta(true)}
                                className="bg-[#0095ff] hover:bg-[#33abff] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                            >
                                <Plus size={18} />
                                Nueva Pregunta
                            </button>
                        </div>

                        {preguntasDeEncuesta.length > 0 ? (
                            <div className="space-y-4">
                                {preguntasDeEncuesta.map((pregunta) => (
                                    <div key={pregunta.id} className="bg-[#1a2547] rounded-lg p-4 shadow-md">
                                        <div className="flex justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-[#0c1330] text-[#0095ff] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                    {pregunta.orden}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{pregunta.pregunta}</h4>
                                                    <div className="text-sm text-gray-400 mt-1">
                                                        Tipo: <span className="text-[#0095ff]">{pregunta.tipo}</span>
                                                    </div>

                                                    {pregunta.opciones && pregunta.opciones.length > 0 && (
                                                        <div className="mt-2">
                                                            <div className="text-sm text-gray-400 mb-1">Opciones:</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {pregunta.opciones.map((opcion, index) => (
                                                                    <span key={index} className="bg-[#232f5a] px-2 py-1 rounded text-sm">
                                                                        {opcion}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="text-gray-400 hover:text-[#0095ff] transition-colors" title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Eliminar"
                                                    onClick={() => handleEliminarPregunta(pregunta.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#1a2547] rounded-lg p-8 text-center text-gray-400">
                                No hay preguntas en esta encuesta
                            </div>
                        )}

                        {/* Modal para crear pregunta */}
                        {mostrarFormularioPregunta && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-[#1a2547] rounded-lg w-full max-w-md p-6 shadow-xl">
                                    <h2 className="text-xl font-bold mb-4">Nueva Pregunta</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Pregunta</label>
                                            <input
                                                type="text"
                                                value={nuevaPregunta.pregunta}
                                                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                                placeholder="Texto de la pregunta"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tipo</label>
                                            <select
                                                value={nuevaPregunta.tipo}
                                                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, tipo: e.target.value })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                            >
                                                <option value="texto">Texto</option>
                                                <option value="seleccion">Selección</option>
                                                <option value="escala">Escala</option>
                                                <option value="boolean">Sí/No</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Orden</label>
                                            <input
                                                type="number"
                                                value={nuevaPregunta.orden}
                                                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, orden: Number.parseInt(e.target.value) })}
                                                className="w-full bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                                min="1"
                                            />
                                        </div>

                                        {(nuevaPregunta.tipo === "seleccion" || nuevaPregunta.tipo === "escala") && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Opciones</label>

                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={opcionTemp}
                                                        onChange={(e) => setOpcionTemp(e.target.value)}
                                                        className="flex-1 bg-[#0c1330] border border-[#2a3761] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0095ff]"
                                                        placeholder="Nueva opción"
                                                    />
                                                    <button
                                                        onClick={handleAgregarOpcion}
                                                        className="bg-[#0095ff] hover:bg-[#33abff] text-white px-3 py-2 rounded-md transition-colors"
                                                    >
                                                        Agregar
                                                    </button>
                                                </div>

                                                {nuevaPregunta.opciones && nuevaPregunta.opciones.length > 0 && (
                                                    <div className="bg-[#0c1330] border border-[#2a3761] rounded-md p-2 mt-2">
                                                        {nuevaPregunta.opciones.map((opcion, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between items-center py-1 px-2 hover:bg-[#232f5a] rounded"
                                                            >
                                                                <span>{opcion}</span>
                                                                <button
                                                                    onClick={() => handleEliminarOpcion(index)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => setMostrarFormularioPregunta(false)}
                                            className="px-4 py-2 border border-[#2a3761] rounded-md hover:bg-[#232f5a] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCrearPregunta}
                                            className="bg-[#0095ff] hover:bg-[#33abff] text-white px-4 py-2 rounded-md transition-colors"
                                            disabled={!nuevaPregunta.pregunta}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
