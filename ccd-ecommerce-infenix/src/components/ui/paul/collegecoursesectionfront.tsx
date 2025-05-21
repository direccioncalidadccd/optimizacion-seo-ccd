"use client";

import React, { useState, useEffect } from "react";
import CourseCard from "@/components/ui/paul/coursecard";
import axios from "axios";
import { environment } from "@/environments/environment";
import { IoSearch } from "react-icons/io5";
import CourseCardFront from "@/components/ui/paul/coursecardfront";

type Especializacion = {
  IdEspecializacion: number;
  Especializacion: string;
  Descripcion: string;
  Escuela_id: number;
  Estado_id: string;
  UltimaFechMod: string;
  UltimoUserMod: string;
  CantidadCursos: number;
};

type Producto = {
  TipoModalidad: string;
  IdProducto: number;
  Precio: number;
};

type CursoDetalleTP = {
  Productos: Producto[];
  Descripcion: string;
  Calificacion: string;
  Seguidores: string;
  Nivel: string;
  MarcasRespaldo: string;
  ExamenParcial: number;
  ExamenFinal: number;
  Profesores: string;
  Frecuencia: string;
  HorasAcademicas: string;
  Estado_id: string;
  UltimaFechMod: string;
  Escuela: string;
  Especializacion: string;
  IdEspecializacion: number;
  IdCurso: number;
  Curso: string;
  TipoCurso: string;
  RutaImagen: string;
  CantidadModulos: number;
};

const CollegeCourseSectionFront: React.FC<{
  t1: string;
  t2: string;
  t4: string;
}> = ({ t1, t2, t4 }) => {
  const [selectedEspecializaciones, setSelectedEspecializaciones] = useState<
    number[]
  >([]);
  const [especializaciones, setEspecializaciones] = useState<Especializacion[]>(
    []
  );

  const [cursoDetalleGestion, setCursoDetalleGestion] = useState<CursoDetalleTP[]>([]);
  const [cursoDetalleIngenieria, setCursoDetalleIngenieria] = useState<CursoDetalleTP[]>([]);
  const [cursoDetalleMineria, setCursoDetalleMineria] = useState<CursoDetalleTP[]>([]);




  const [cursosCompletos, setcursosCompletos] = React.useState<
    CursoDetalleTP[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Para el texto del buscador
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 15;
  const [selectedTipoCurso, setSelectedTipoCurso] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });

  // Manejar selección del tipo de curso
  const handleTipoCursoClick = (tipoCurso: string) => {
    setSelectedTipoCurso((prev) => (prev === tipoCurso ? null : tipoCurso));
  };

  // Función para normalizar texto (quitar acentos/tildes)
  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

// Manejar búsqueda - Utilizamos el texto original
const handleSearch = () => {
  // Mantenemos el texto original con acentos para la búsqueda
  // El backend se encargará de normalizarlo
  setSelectedEspecializaciones([]); // Reinicia los filtros al buscar por palabra
  setCurrentPage(1); // Reinicia la paginación
};

  // Ingeniería
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoading(true);
    
        // Siempre obtenemos todos los cursos primero
        const response = await api.post("/inicio/vercursosespecializacionescuela", {
          Escuela: "Ingeniería",
          T1: t1,
          T2: t2,
          T4: t4,
        });
        
        let cursos = response.data.data[0];
        
        // Si hay término de búsqueda, filtramos en el frontend
        if (searchTerm.trim() !== "") {
          const term = normalizeText(searchTerm);
          cursos = cursos.filter((curso: CursoDetalleTP) => 
            normalizeText(curso.Curso).includes(term)
          );
        } else {
          // Si no hay búsqueda, limitamos a 4
          cursos = cursos.slice(0, 4);
        }
        
        setCursoDetalleIngenieria(cursos || []);
      } catch (error) {
        console.error("Error fetching cursos:", error);
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    };    
    fetchCursos();
  }, [selectedEspecializaciones, searchTerm]);

  // Gestión (mismo patrón que Ingeniería)
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoading(true);
    
        const response = await api.post("/inicio/vercursosespecializacionescuela", {
          Escuela: "Gestión",
          T1: t1,
          T2: t2,
          T4: t4,
        });
        
        let cursos = response.data.data[0];
        
        if (searchTerm.trim() !== "") {
          const term = normalizeText(searchTerm);
          cursos = cursos.filter((curso: CursoDetalleTP) => 
            normalizeText(curso.Curso).includes(term)
          );
        } else {
          cursos = cursos.slice(0, 4);
        }
        
        setCursoDetalleGestion(cursos || []);
      } catch (error) {
        console.error("Error fetching cursos:", error);
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    };    
    fetchCursos();
  }, [selectedEspecializaciones, searchTerm]);

  // Minería (mismo patrón que Ingeniería)
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoading(true);
    
        const response = await api.post("/inicio/vercursosespecializacionescuela", {
          Escuela: "Minería",
          T1: t1,
          T2: t2,
          T4: t4,
        });
        
        let cursos = response.data.data[0];
        
        if (searchTerm.trim() !== "") {
          const term = normalizeText(searchTerm);
          cursos = cursos.filter((curso: CursoDetalleTP) => 
            normalizeText(curso.Curso).includes(term)
          );
        } else {
          cursos = cursos.slice(0, 4);
        }
        
        setCursoDetalleMineria(cursos || []);
      } catch (error) {
        console.error("Error fetching cursos:", error);
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    };    
    fetchCursos();
  }, [selectedEspecializaciones, searchTerm]);



  // Manejar selección de especialización
  const handleEspecializacionClick = (especializacionId: number) => {
    setSelectedEspecializaciones((prevSelected) =>
      prevSelected.includes(especializacionId)
        ? prevSelected.filter((id) => id !== especializacionId)
        : [...prevSelected, especializacionId]
    );
    setSearchTerm(""); // Reinicia la búsqueda al usar los filtros
  };

  return (
    <>
      {/* Search Bar */}
      <div
        className="group relative w-full mt-8 mb-8 flex justify-center items-center"
        data-aos="fade-up"
      >
        <div className="relative w-[80%] max-w-2xl">
          <input
            type="text"
            placeholder="Encuentra tu curso o diploma"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Normalizar el texto al presionar Enter
                // setSearchTerm(normalizeText(searchTerm));
                handleSearch();
              }
            }}
            className="w-full px-6 py-3 text-white bg-[#0a0e27] border border-cyan-500 text-xl rounded-full text-center placeholder:text-white focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300 group-hover:outline-none group-hover:ring-2 group-hover:ring-cyan-300 transition duration-300"
          />
          <button
            className="absolute right-3 top-[50%] p-2 -translate-y-[50%] rounded-full transition duration-500"
            onClick={handleSearch}
          >
            <IoSearch className="w-5 h-5 text-cyan-500 group-hover:cyan-300 group-hover:scale-[1.20] transition duration-500" />
          </button>
        </div>
      </div>
      <div className=" max-w-[100rem]  mx-auto grid grid-cols-4  max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-2xl:w-fit gap-6 justify-center py-10 px-4">
        {cursoDetalleIngenieria.map(
          (producto: CursoDetalleTP, index: number) => (
            <div key={index}>
              <CourseCardFront
                array={producto}
                pid={producto.IdCurso}
                ruta={producto.Curso.replace(/\//g,"-").toLowerCase()}
                openSideSheet={() => {}}
              />
            </div>
          )
        )}
        {cursoDetalleGestion.map(
          (producto: CursoDetalleTP, index: number) => (
            // console.log("PRODUCTO ", producto.IdCurso),
            (
              <div key={index}>
                <CourseCardFront
                  array={producto}
                  pid={producto.IdCurso}
                  ruta={producto.Curso.replace(/\//g,"-").toLowerCase()}
                  openSideSheet={() => {}}
                />
              </div>
            )
          )
        )}
        {cursoDetalleMineria.map((producto: CursoDetalleTP, index: number) => (
          <div key={index}>
            <CourseCardFront
              array={producto}
              pid={producto.IdCurso}
              ruta={producto.Curso.replace(/\//g,"-").toLowerCase()}
              openSideSheet={() => {}}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CollegeCourseSectionFront;
