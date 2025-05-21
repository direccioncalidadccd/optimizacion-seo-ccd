import React, { useState } from 'react'
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

export default function ModalCrearAcreditacion({setarray}:any) {
    const api = axios.create({
            baseURL: environment.baseUrl,
            headers: { "Content-Type": "application/json" },
        });
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [acreditacion, setacreditacion] = useState("");
    const [codigo, setcodigo] = useState("");
    const [precio, setprecio] = useState("");

    async function crearacreditacion(){
        const response1 = await api.post("/inicio/crearacreditacionv2", {
            facreditacion: acreditacion,
            fcodigo: codigo,
            fprecio: precio
        });
        const response = await api.post("/inicio/listaradministraracreditacionv2");
        setarray(response.data.data[0]);
        onOpenChange()
        setacreditacion("")
        setcodigo("")
        setprecio("")
    }

    return (
        <>
            <Button onPress={onOpen}>Crear</Button>
            <Modal
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Crear Acreditación</ModalHeader>
                            <ModalBody>
                                <div className='flex flex-col gap-2'>
                                    <Input label="Acreditación" type="text" value={acreditacion} onValueChange={setacreditacion} />
                                    <Input label="Codigo" type="text" value={codigo} onValueChange={setcodigo} />
                                    <Input label="Precio" type="number" value={precio} onValueChange={setprecio} />
                                </div>
                                <Button onPress={crearacreditacion}>Enviar</Button>

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
        </>
    )
}
