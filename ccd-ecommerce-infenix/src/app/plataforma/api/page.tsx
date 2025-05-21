"use client"
import React from 'react';

const ShareImageButton = () => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Crear un objeto File o Blob para compartir la imagen
        const file = new File(
          [await fetch('https://media.forgecdn.net/avatars/thumbnails/1162/482/256/256/638731647309909180.png').then(res => res.blob())],
          'imagen.jpg',
          { type: 'image/jpeg' }
        );

        // Usamos navigator.share() con un archivo
        await navigator.share({
          files: [file],
          title: 'Mira esta imagen increíble',
          text: 'Te comparto una imagen espectacular.',
        });
        console.log('Imagen compartida con éxito');
      } catch (error) {
        console.error('Error al compartir la imagen:', error);
      }
    } else {
      alert('Tu navegador no soporta la API de compartir');
    }
  };

  return (
    <div className='text-white'>
      <h2>Comparte esta imagen:</h2>
      <button onClick={handleShare}>Compartir Imagen</button>
    </div>
  );
};

export default ShareImageButton;
