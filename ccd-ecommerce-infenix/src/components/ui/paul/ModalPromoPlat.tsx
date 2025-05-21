import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";

const imageItems = [

  "/Multimedia/promo/cuponinternacional.jpg",
  "/Multimedia/promo/refiereaunamigo.jpg",
  "/Multimedia/promo/CCD DAYS 2x1.jpg",
  "/Multimedia/promo/S_20 dto PLIN.jpeg",
  "/Multimedia/promo/cuponinternacional.jpg",
];

const CarouselComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    beforeChange: (oldIndex: any, newIndex: React.SetStateAction<number>) => {
      setCurrentSlide(newIndex);
    },
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    appendDots: (dots: React.ReactNode) => (
      <div>
        <ul className="flex justify-center mt-4 space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: (i: number) => (
      <button className="w-3 h-3 rounded-full border-2 border-transparent bg-white/20 hover:bg-white focus:outline-none  active:border-blue-500" />
    ),
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  return (
    <div
      className="flex flex-col carousel-container py-8 w-[80%] max-[1440px]:w-[70%]  max-xl:w-[80%] max-sm:w-full px-[6rem] max-sm:px-0 min-[500px]:px-0 lg:px-0"
      data-aos="zoom-out-right"
      data-aos-delay="200"
    >
      <Slider {...settings}>
        {imageItems.map((imageUrl, index) => {
          // Determinamos el índice de la imagen central
          const isMiddleImage =
            index === (currentSlide + 1) % imageItems.length; // El índice medio es el actual + 1 en un carrusel de 3
          return (
            <div key={index} className="p-2 w-fit max-sm:p-0 mt-3 ">
              <div
                className={`flex  justify-center items-center rounded-lg `}
              >
          
                <Link href="/plataforma/tienda">
                <Image
                  src={imageUrl}
                  alt="carousel-image"
                  width={300}
                  height={300}
                  layout="intrinsic"
                  className="rounded-2xl "
                />
            </Link>

              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

// Componentes de flecha personalizados
const CustomNextArrow = ({
  onClick,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <>
    
    
      <button
        className="absolute top-[50%] right-0  transform -translate-y-1/2  bg-white/30  p-2 rounded-full z-10 focus:outline-none border border-slate-400"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    
  </>
);

const CustomPrevArrow = ({
  onClick,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <>
    {/* <button
      className="absolute top-1/2 -left-16 max-sm:left-4 transform -translate-y-1/2  p-2 rounded-full z-10 focus:outline-none hidden max-xl:block"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button> */}

      <button
        className="absolute top-[50%] left-0 transform -translate-y-1/2  bg-white/30 p-2 rounded-full z-10 focus:outline-none border border-slate-400"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

  </>
);

export default CarouselComponent;
