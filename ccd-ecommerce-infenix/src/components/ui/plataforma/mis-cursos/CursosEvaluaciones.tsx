'use client'
import React from 'react'

import { ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import axios from "axios";
import { environment } from "@/environments/environment";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function CursosEvaluaciones({ pid }: any) {

    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    const [notasproductos, setnotasproductos] = useState<any[]>([]);
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const pmodalidad = searchParams.get('pmodalidad');
    const psala = searchParams.get('psala');
    useEffect(() => {
        if (session?.user && pmodalidad == 'Asincrónico') {
            const loadData = async () => {
                try {
                    const responseTipoDocumento = await api.post("/inicio/listarnotasproductosxproidv2", {
                        fusuario_id: session.user.uid,
                        fproducto_id: pid
                    });
                    setnotasproductos(responseTipoDocumento.data.data[0])

                } catch (error) {
                    console.error("Error cargando los datos:", error);
                }
            };
            loadData();
        }
        if (session?.user && pmodalidad == 'En-Vivo') {
            const loadData = async () => {
                try {
                    const responseTipoDocumento = await api.post("/inicio/listarnotasvivoproductosxproidv2", {
                        fusuario_id: session.user.uid,
                        fproducto_id: pid,
                        fsala_id: psala
                    });
                    setnotasproductos(responseTipoDocumento.data.data[0])

                } catch (error) {
                    console.error("Error cargando los datos:", error);
                }
            };
            loadData();
        }


    }, [session?.user.uid]);
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

        // Formatear la fecha usando Intl.DateTimeFormat
        const fechaPeru = new Intl.DateTimeFormat("es-PE", opciones).format(fecha);

        return fechaPeru;
    }
    return (
        <>
            <div className='flex flex-col gap-4'>
                {notasproductos.map((item: any, id: number) => (
                    <>
                        <div className="flex flex-col gap-4">

                            {(() => {
                                const totalNotas = notasproductos.reduce(
                                    (sum: number, item: any) =>
                                        sum + item.questions.reduce((subSum: number, item1: any) => subSum + item1.Nota, 0),
                                    0
                                );
                                const totalEvaluaciones = notasproductos.reduce(
                                    (count: number, item: any) => count + item.questions.length,
                                    0
                                );
                                const promedio = totalEvaluaciones > 0 ? (totalNotas / totalEvaluaciones).toFixed(2) : "0.00";
                                return (
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 text-white">
                                        <h2 className="text-xl font-semibold flex items-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--colorccd1)]  mr-3 text-sm">
                                                {(item.questions).length}
                                            </span>
                                            Evaluaciones
                                        </h2>

                                        <div className="mt-4 md:mt-0">
                                            <div className="bg-gradient-to-br from-blue-900/50 to-[#09283C] rounded-xl px-3 py-2 ">
                                                <p className="text-sm font-medium !m-0">
                                                    Promedio General:
                                                    <span className="ml-2 text-lg font-bold text-yellow-400">{promedio}/20</span>
                                                </p>
                                            </div>
                                            </div>
                                            </div>
                                );
                            })()}
                            
                            {item.questions.map((item1: any, index: number) => (
                                <div key={index} className="bg-[var(--colorccd3)] backdrop-blur-sm rounded-xl overflow-hidden border text-white border-indigo-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:border-indigo-800/50 group">
                                    <div className="px-6 py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium group-hover:text-blue-300 transition-colors duration-300">
                                                {item1.Evaluacion}
                                            </h3>
                                            <p className="text-xs text-indigo-300 mt-1">{convertirFechaPeru(item1.FechaInicio)} | {convertirFechaPeru(item1.FechaFin)}</p>
                                        </div>

                                        <div className="mt-4 md:mt-0 flex items-center">
                                            <span className="text-sm text-indigo-200 mr-3">Nota:</span>
                                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
                                                {item1.Nota}/{20}
                                            </div>
                                        </div>
                                    <div className="w-full h-1 bg-indigo-900/30">
                                        <div className={`${0 < item1.Nota || item1.Nota < 14 && 'bg-[#FFA07A]'} ${14 <= item1.Nota || item1.Nota < 17 && 'bg-[#FFD700]'} ${17 <= item1.Nota || item1.Nota <= 20 && 'bg-[#98FB98]'} px-3 py-1 rounded-2xl text-[#000000] h-full`}></div>
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    </>
                ))}
            </div>
        </>
    )
}
