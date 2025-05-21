"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Typography } from 'antd'
import { useSession } from "next-auth/react"

const Loaderinicioplataforma = () => {
    const { data: session } = useSession()
    const [heightText, setHeightText] = useState(false)
    const titleModule = useRef(null)
    const { Title } = Typography

    const searchLetter = () => {
        const letras = ['q', 'y', 'p', 'g', 'j']
        const nombre = session?.user.Nombres?.toLowerCase() || ''
        const hasLetter = letras.some(l => nombre.includes(l))
        if (hasLetter) setHeightText(true)
    }

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('usuusuario')) {
            searchLetter()
        }
    }, [])

    const nombreUsuario = session?.user.Nombres?.split(" ")[0] || ''

    return (
        <div id="iniciarReproduccion" className="Container-Presentation Presentation-Up">
            <div style={{ marginTop: '-8vh' }}>
                <div className="Container-Item-Top-Presentation" style={{ alignItems: 'end' }}>
                    <Title
                        className="Title-Presentacion"
                        ref={titleModule}
                        style={{ lineHeight: heightText ? '100px' : '67px' }}
                    >
                        Hola {nombreUsuario}
                    </Title>
                    <Title
                        className={` max-sm:!hidden Subtitle-Presentacion ${heightText ? 'Height-Big' : 'Height-Regular'}`}
                        level={3}
                    >
                        Bienvenido <br />
                        a la plataforma de
                    </Title>
                </div>
                <div className="Container-Item-Bottom-Presentation ">
                    <Title className="Title-Presentacion max-sm:hidden ">CCD 2025</Title>
                </div>
            </div>
        </div>
    )
}

export default Loaderinicioplataforma
