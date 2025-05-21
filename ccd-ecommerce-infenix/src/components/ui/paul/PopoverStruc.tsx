import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PropPopUp {
  img: string;
}

export default function App({img}:PropPopUp) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  useEffect(() => {
    // Verificar si el modal ya fue cerrado anteriormente
    const popupClosed = localStorage.getItem('popupClosed');
    
    // Si no ha sido cerrado antes, mostrar después de 7 segundos
    if (!popupClosed) {
      const timer = setTimeout(() => {
        onOpen();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [onOpen]);
  
  // Función para manejar el cierre del modal
  // const handleClose = () => {
  //   // Guardar en localStorage que el popup fue cerrado
  //   localStorage.setItem('popupClosed', 'true');
  //   onOpenChange();
  // };

  return (
    <>
      <Modal
        size="5xl"
        placement="center"
        classNames={{
          body: " !h-full !w-fit !p-0 ",
          closeButton: "!bg-white"
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange} // Usar nuestra función personalizada
      >
        <ModalContent className="!w-fit">
          {(onClose) => (
            <>
              <ModalBody className="mx-auto !w-fit">
                <Image alt="popover" src={img} width={650} height={650} priority />
              </ModalBody>
              {/* <ModalFooter>
                <Button color="primary" onPress={handleClose}>
                  Cerrar
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}