import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Input
} from "@heroui/react";
import axios from "axios";
import { environment } from "@/environments/environment";
import { MdModeEdit } from 'react-icons/md';
import { Button as ButtonAd, Modal as ModalAd } from 'antd';

export default function ModalEditarAcreditacion({ setarray, array }: any) {
    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [acreditacion, setacreditacion] = useState("");
    const [codigo, setcodigo] = useState("");
    const [precio, setprecio] = useState("");



    useEffect(() => {
        setacreditacion(array.Acreditacion)
        setcodigo(array.Codigo)
        setprecio(array.Precio)
    }, [])
    async function editaracreditacion() {
        const response1 = await api.post("/inicio/editaracreditacionv2", {
            facreditacion_id: array.IdAcreditacion,
            facreditacion: acreditacion,
            fcodigo: codigo,
            fprecio: precio
        });
        const response = await api.post("/inicio/listaradministraracreditacionv2");
        setarray(response.data.data[0]);
        onOpenChange()

    }
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
    return (
        <>
            <MdModeEdit onClick={showModal} className="cursor-pointer text-2xl " />

            <ModalAd open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                width={800} >
                <div className='flex flex-col gap-2'>
                    <Input label="Acreditación" type="text" value={acreditacion} onValueChange={setacreditacion} />
                    <Input label="Codigo" type="text" value={codigo} onValueChange={setcodigo} />
                    <Input label="Precio" type="number" value={precio} onValueChange={setprecio} />
                </div>
                <Button onPress={editaracreditacion} className='text-white bg-[var(--colorccd1)]'>Enviar</Button>
            </ModalAd>

            
        </>
    )
}
