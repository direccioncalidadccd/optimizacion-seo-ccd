import { environment } from '@/environments/environment';
import { Autocomplete, AutocompleteItem, Button, Input, Card, CardBody, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, Tab, Tabs, useDisclosure, Tooltip } from '@nextui-org/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa6';
import { MdModeEdit } from 'react-icons/md'
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Key } from "@react-types/shared";
import { RiBroadcastFill } from "react-icons/ri";
import { BsCameraVideoFill } from "react-icons/bs";

import { Button as ButtonAd, Modal as ModalAd } from 'antd';

export default function ModalEditarUsuario({ idusuario }: any) {

    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    const { isOpen: isOpen20, onOpen: onOpen20, onOpenChange: onOpenChange20 } = useDisclosure();
    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabChange = (key: any) => {
        setSelectedTab(key);
    };
    const [selects, setSelects] = useState({
        cliente: null,
        naturaleza: null,
        tipoProducto: null,
        clasificacion: null,
        categoria: null,
        subCategoria: null,
        modelo: null
    });
    const [data, setData] = useState({
        modelo: [],
        clientes: [],
        naturalezas: [],
        tipoProductos: [],
        clasificaciones: [],
        categorias: [],
        subCategorias: [],
    });
    const [precio, setPrecio] = useState("");
    const [productosprecio, setproductosprecio] = useState([]);
    const [notasalumnos, setnotasalumnos] = useState([]);
    const [key, setValue] = React.useState<Key | null>();
    const [precio1, setprecio1] = React.useState("");
    const [listarpermisos, setlistarpermisos] = useState([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<any>({});
    const [selectedSala, setSelectedSala] = useState<Key | null>(null); // Estado para la sala seleccionada



    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        setValue(null); // Resetear curso seleccionado
        setSelectedSala(null); // Resetear sala seleccionada
        setprecio1(""); // Resetear precio
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setValue(null);
    setSelectedSala(null);
    setprecio1("");
    };


      // Cargar datos iniciales (clientes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes] = await Promise.all([
          api.post("/inicio/listarSelectCliente"),
        ]);
        setData({ ...data, clientes: clientesRes.data.data[0] });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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
    useEffect(() => {
        if (selects.naturaleza && selects.tipoProducto && selects.clasificacion && selects.categoria && selects.subCategoria) {
            const fetchModelo = async () => {
                try {
                    const response = await api.post("/inicio/listarSelectModelo", {

                    });
                    setData((prevData) => ({
                        ...prevData,
                        modelo: response.data.data[0],
                    }));
                } catch (error) {
                    console.error("Error fetching SubCategorias:", error);
                }
            };
            fetchModelo();
        }
    }, [selects.naturaleza, selects.tipoProducto, selects.clasificacion, selects.categoria, selects.subCategoria]);
    
    // Cargar productosprecio cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      const load = async () => {
        try {
          const response = await api.post("/inicio/listarproductospreciov2", {});
          setproductosprecio(response.data.data[0]);
        } catch (error) {
          console.error("Error fetching productosprecio:", error);
        }
      };
      load();
    }
  }, [isModalOpen]);

    // Actualizar precio y resetear sala cuando se selecciona un curso
    useEffect(() => {
        if (isModalOpen && key) {
        const producto: any = productosprecio.find(
            (item: any) => item.IdProducto === Number(key)
        );
        console.log("Producto seleccionado:", producto); // Depuración
        if (producto) {
            setprecio1(producto.Precio || "");
            setSelectedSala(null); // Resetear sala al cambiar curso
        } else {
            setprecio1("");
            setSelectedSala(null);
        }
        }
    }, [key, isModalOpen, productosprecio]);
    useEffect(() => {
        if (isModalOpen) {
            const load = async () => {
                try {
                    const response = await api.post("/inicio/listarpermisosv2", {
                        fusuario_id: idusuario

                    });
                    const permisos = response.data.data[0];

                    setlistarpermisos(permisos);

                    const estadoInicial: any = {};
                    permisos.forEach((permiso: any) => {
                        estadoInicial[permiso.IdMenu] = permiso.posesion === 1;
                    });

                    setPermisosSeleccionados(estadoInicial);
                } catch (error) {
                    console.error("Error fetching TipoProductos:", error);
                }
            };
            load();
        }
    }, [isModalOpen]);
    useEffect(() => {
        if (isModalOpen) {
            const load = async () => {
                try {
                    const response = await api.post("/inicio/listarnotasalumnosv2", {
                        fusuario_id: idusuario
                    });
                    setnotasalumnos(response.data.data[0]);
                } catch (error) {
                    console.error("Error fetching TipoProductos:", error);
                }
            };
            load();
        }
    }, [isModalOpen]);
    
    // Función para asignar curso con sala
    async function asignarcurso() {
        const MySwal = withReactContent(Swal);
        const producto: any = productosprecio.find(
        (item: any) => item.IdProducto === Number(key)
        );

        // Validar selección de sala solo para cursos en vivo con salas disponibles
        if (producto?.TipoModalidad === "En Vivo" && producto?.sala?.length > 0 && !selectedSala) {
        MySwal.fire({
            title: "Error",
            text: "Por favor, seleccione una sala para el curso en vivo.",
            icon: "error",
        });
        return;
        }

        MySwal.fire({
        title: "¿Añadir curso a usuario?",
        text: `Desea añadir el curso ${producto?.Curso} al usuario?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, añadir",
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            const response = await api.post("/inicio/asignarcursoadminv2", {
                fproducto_id: key,
                fusuario_id: idusuario,
                fprecio: precio1,
                fsala_id: selectedSala || null, // Enviar IdSala si está seleccionado, null si no
            });
            MySwal.fire({
                title: "¡Creación Exitosa!",
                text: "Se añadió el curso de forma exitosa.",
                icon: "success",
            }).then(() => {
                handleOk(); // Cerrar modal tras éxito
            });
            } catch (error: any) {
            console.error("Error asignando curso:", error);
            MySwal.fire({
                title: "Error",
                text: error.response?.data?.message || "Hubo un problema al añadir el curso.",
                icon: "error",
            });
            }
        }
        });
    }

    const togglePermiso = (id: any) => {
        setPermisosSeleccionados((prev: any) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const guardarCambios = async () => {
        const permisosActualizados = Object.keys(permisosSeleccionados).map((id) => ({
            Menu_id: Number(id),
            asignado: permisosSeleccionados[id] ? 1 : 0,
        }));

        try {
            await api.post("/inicio/guardarpermisosv2", {
                fusuario_id: idusuario,
                permisos: permisosActualizados,
            });

            alert("Permisos actualizados correctamente.");
        } catch (error) {
            console.error("Error guardando permisos:", error);
            alert("Error al guardar permisos.");
        }
    };
    const handleNotaChange = (cursoIndex: number, evaluacionIndex: number, nuevaNota: string) => {
        setnotasalumnos((prevNotas: any) =>
            prevNotas.map((curso: any, i: any) =>
                i === cursoIndex
                    ? {
                        ...curso,
                        evaluaciones: curso.evaluaciones.map((evaluacion: any, j: any) =>
                            j === evaluacionIndex
                                ? { ...evaluacion, Nota: nuevaNota }
                                : evaluacion
                        ),
                    }
                    : curso
            )
        );
    };
    const handleGuardar = async () => {

        const response = await api.post("/inicio/guardarnotasalumnosv2", {
            data: notasalumnos
        });
        // Aquí puedes hacer la petición a tu API con fetch o axios
    };

    console.log("Producto Precio:", productosprecio);
    console.log("Sala: ", selectedSala);

   
    return (
        <>
 
            <MdModeEdit onClick={showModal} className="cursor-pointer text-2xl" />

            <ModalAd  open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
             width={800} >
                <Tabs

                >
                    <Tab key="1" title="Permisos">
                        <Card classNames={{}}>
                            <CardBody>
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                                        <h3 className="text-white font-bold text-lg">Gestión de Permisos</h3>
                                        <p className="text-blue-100 text-sm">Seleccione los accesos para este rol</p>
                                    </div>

                                    {/* Table */}
                                    <div className="p-6">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tl-lg">Permiso</th>
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 rounded-tr-lg w-24">Acceso</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listarpermisos.map((item: any, index: number) => (
                                                        <tr
                                                            key={item.IdMenu}
                                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === listarpermisos.length - 1 ? "border-b-0" : ""
                                                                }`}
                                                        >
                                                            <td className="py-3 px-4 text-gray-800">{item.Menu}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex justify-center">
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={permisosSeleccionados[item.IdMenu] || false}
                                                                            onChange={() => togglePermiso(item.IdMenu)}
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Button */}
                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={guardarCambios}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="2" title="Mis Cursos">
                        <Card classNames={{}}>
                            <CardBody className='flex flex-col gap-4'>
                                <div className="max-w-4xl  bg-white rounded-xl shadow-md overflow-hidden p-6">
                                    <div className="space-y-6">
                                        {notasalumnos.map((item: any, cursoIndex: any) => (
                                            <div key={cursoIndex} className="bg-gray-50 rounded-lg p-5 border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                                    <h3 className="font-bold text-lg text-gray-800">{item.Curso}</h3>
                                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                                        {item.TipoModalidad}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {Array.isArray(item.evaluaciones) &&
                                                        item.evaluaciones.map((item1: any, evaluacionIndex: any) => (
                                                            <div
                                                                key={evaluacionIndex}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between py-2 hover:bg-gray-100 rounded-md px-2 transition-colors"
                                                            >
                                                                <div className="mb-2 sm:mb-0">
                                                                    <p className="font-medium text-gray-700">{item1.Evaluacion}</p>
                                                                    <p className="text-sm text-gray-500">{item1.TipoEvaluacion}</p>
                                                                </div>

                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="20"
                                                                        value={item1.Nota}
                                                                        onChange={(e) => {
                                                                            let nuevaNota = Number.parseInt(e.target.value, 10)

                                                                            // Validar que la nota esté entre 0 y 20
                                                                            if (isNaN(nuevaNota)) nuevaNota = 0
                                                                            if (nuevaNota < 0) nuevaNota = 0
                                                                            if (nuevaNota > 20) nuevaNota = 20

                                                                            handleNotaChange(cursoIndex, evaluacionIndex, nuevaNota.toString())
                                                                        }}
                                                                        className="border border-gray-300 p-2 rounded-md w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                    />
                                                                    <span className="absolute right-3 top-2 text-gray-400 pointer-events-none">/20</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleGuardar}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center shadow-sm"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                                />
                                            </svg>
                                            Guardar Calificaciones
                                        </button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                    {/* ... (Tab Permisos y Mis Cursos sin cambios) */}
                    <Tab key="3" title="Asignar Cursos">
                        <Card>
                        <CardBody className="flex flex-col gap-4">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                                <h3 className="text-white font-bold text-lg">Asignación de Curso</h3>
                                <p className="text-blue-100 text-sm">Seleccione un curso, una sala (si aplica) y establezca su precio</p>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                {/* Selección de Curso */}
                                <Autocomplete
                                className="w-full"
                                label="Selecciona un curso"
                                selectedKey={key}
                                onSelectionChange={setValue}
                                labelPlacement="outside"
                                classNames={{
                                    base: "max-w-full",
                                    listboxWrapper: "max-h-64",
                                    listbox: "p-1 border border-gray-200 rounded-lg shadow-md",
                                    popoverContent: "p-0 border border-gray-200 shadow-lg rounded-lg",
                                }}
                                placeholder="Buscar y seleccionar curso"
                                >
                                {productosprecio.map((item: any) => (
                                    <AutocompleteItem
                                    key={item.IdProducto}
                                    textValue={`${item.TipoModalidad === "En Vivo" ? "En Vivo" : "Asincrónico"} | ${item.Curso}`}
                                    className="py-1"
                                    >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                            item.TipoModalidad === "En Vivo" ? "bg-green-500" : "bg-blue-500"
                                            }`}
                                        ></span>
                                        <div className="flex items-center gap-2">
                                            <span>{`${item.TipoModalidad === "En Vivo" ? "En Vivo" : "Asincrónico"} | ${item.Escuela} | `}</span>
                                            <Tooltip
                                            content={item.Curso}
                                            placement="top"
                                            offset={10}
                                            className="px-3 py-2 bg-gray-800 text-white rounded-md"
                                            >
                                            <span
                                                className="max-w-[250px] truncate"
                                                style={{
                                                display: "inline-block",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                }}
                                            >
                                                {item.Curso.length > 75
                                                ? `${item.Curso.substring(0, 75)}...`
                                                : item.Curso}
                                            </span>
                                            </Tooltip>
                                            {item.TipoModalidad === "En Vivo" && item.sala?.length > 0 && (
                                            <span className="text-sm text-gray-500">
                                                Salas disponibles: {item.sala.length}
                                            </span>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                    </AutocompleteItem>
                                ))}
                                </Autocomplete>

                                {/* Selección de Sala (solo para cursos en vivo con salas) */}
                                {key && (
                                (() => {
                                    const producto: any = productosprecio.find(
                                    (item: any) => item.IdProducto === Number(key)
                                    );
                                    if (producto?.TipoModalidad === "En Vivo") {
                                    if (producto?.sala?.length > 0) {
                                        return (
                                        <Autocomplete
                                            key={`sala-${key}`}
                                            className="w-full"
                                            label="Selecciona una sala"
                                            selectedKey={selectedSala !== null ? String(selectedSala) : null}
                                            onSelectionChange={(key) => setSelectedSala(key ? parseInt(String(key), 10) : null)}
                                            labelPlacement="outside"
                                            classNames={{
                                            base: "max-w-full",
                                            listboxWrapper: "max-h-64",
                                            listbox: "p-1 border border-gray-200 rounded-lg shadow-md",
                                            popoverContent: "p-0 border border-gray-200 shadow-lg rounded-lg",
                                            }}
                                            placeholder="Buscar y seleccionar sala"
                                        >
                                            {producto.sala.map((sala: any) => (
                                            <AutocompleteItem
                                                key={sala.IdSala}
                                                textValue={`${sala.Sala} | ${sala.Horario}`}
                                                className="py-2"
                                            >
                                                <div className="flex flex-col gap-1">
                                                <span className="font-medium">{sala.Sala}</span>
                                                <span className="text-sm text-gray-600">{`${sala.Horario}`}</span>
                                                <span className="text-sm text-gray-500">{`Reunión: ${sala.NumeroReunion}`}</span>
                                                <span className="text-sm text-gray-500">{`WhatsApp: ${sala.NumeroWhatsapp}`}</span>
                                                </div>
                                            </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                        );
                                    }
                                    return <p className="text-gray-500">No hay salas asignadas a este curso. Se asignarán más adelante.</p>;
                                    }
                                    return null;
                                })()
                                )}

                                {/* Precio */}
                                <Input
                                label="Precio"
                                placeholder="Precio es"
                                value={precio1}
                                onValueChange={setprecio1}
                                labelPlacement="outside"
                                startContent={<span className="text-gray-500 text-sm">$</span>}
                                classNames={{
                                    base: "max-w-full",
                                    label: "font-medium text-gray-700",
                                    input: "text-gray-800",
                                    inputWrapper:
                                    "border-gray-300 data-[hover=true]:border-blue-400 group-data-[focus=true]:border-blue-500 rounded-lg shadow-sm",
                                }}
                                />

                                {/* Botón de Asignar */}
                                <div className="mt-2 flex justify-center">
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 w-1/2 py-6"
                                    onPress={asignarcurso}
                                    isDisabled={!key} // Deshabilitar si no hay curso seleccionado
                                >
                                    <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                    </svg>
                                    Asignar Curso
                                </Button>
                                </div>
                            </div>
                            </div>
                        </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </ModalAd>            
        </>
    )
}