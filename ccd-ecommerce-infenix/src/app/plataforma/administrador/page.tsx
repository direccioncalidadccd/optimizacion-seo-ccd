"use client"
import { Image, Link } from '@nextui-org/react'
import React from 'react'
import { FaPhotoVideo } from 'react-icons/fa'


export default function page() {
    const lstdatos = [
        { "id": 1, "nombre": "Gestión de Usuarios", "url": "usuarios" },
        { "id": 2, "nombre": "Gestión de Cursos", "url": "cursos" },
        { "id": 3, "nombre": "Gestión de Reportes", "url": "reportes" },
        { "id": 4, "nombre": "Gestión de Encuestas", "url": "encuestas" },
        { "id": 5, "nombre": "Gestión de Matriculas", "url": "matricula" }
    ]
    return (
        <>
            <div className='mt-3 '>
                <h1 className='text-[#D9DADB] text-lg'>Elegir la opcion deseada</h1>
                <h1 className='text-white text-2xl font-bold'>Gestiónes</h1>
            </div>
            <div className=' h-full w-full grid grid-cols-4 max-[1600px]:grid-cols-3 max-xl:grid-cols-2  max-md:grid-cols-2 max-sm:grid-cols-1  gap-14 py-10 justify-center'>
                {lstdatos.map((item, index) => (
                    <Link key={index} href={item.url} className='h-fit w-full' >
                        <div className='!rounded-xl overflow-hidden h-fit w-full shadow-xl'>
                            <Image
                                className='!rounded-none '
                                src='https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/Multimedia/Imagen/Cursos/Portada/valorizacion.jpeg' />
                            <div className='bg-white/15 text-center p-4'>
                                <h1 className='text-white'>{item.nombre}</h1>
                            </div>
                        </div>
                    </Link>
                ))}


            </div>

        </>
    )
}
