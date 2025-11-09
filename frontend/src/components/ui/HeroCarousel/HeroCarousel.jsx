import { useEffect } from "react";
import carousel1 from "../../../assets/images/carousel/1.png";
import carousel2 from "../../../assets/images/carousel/2.png";
import carousel3 from "../../../assets/images/carousel/3.png";
import styles from "./HeroCarousel.module.css";

const HeroCarousel = () => {
  const carouselItems = [
    {
      id: 1,
      image: carousel1,
      alt: "Coffee artisan preparation",
      title: "Kopi Berkualitas Premium",
      description: "Dibuat dengan biji kopi pilihan dari petani lokal",
    },
    {
      id: 2,
      image: carousel2,
      alt: "Freshly baked bread",
      title: "Roti Segar Setiap Hari",
      description: "Dibuat dengan bahan-bahan pilihan tanpa pengawet",
    },
    {
      id: 3,
      image: carousel3,
      alt: "Cozy cafe interior",
      title: "Suasana yang Nyaman",
      description: "Tempat yang tepat untuk bersantai dan bekerja",
    },
  ];

  useEffect(() => {
    const initializeCarousel = () => {
      if (typeof window !== "undefined" && window.bootstrap) {
        const myCarousel = document.getElementById("heroCarousel");
        if (myCarousel) {
          const existingCarousel =
            window.bootstrap.Carousel.getInstance(myCarousel);
          if (existingCarousel) {
            existingCarousel.dispose();
          }

          const carousel = new window.bootstrap.Carousel(myCarousel, {
            interval: 3000,
            wrap: true,
            ride: "carousel",
          });
        }
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeCarousel);
    } else {
      initializeCarousel();
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", initializeCarousel);
    };
  }, []);

  return (
    <div
      id="heroCarousel"
      className={`carousel slide container mt-4 ${styles.carousel}`}
      data-bs-ride="carousel"
      data-bs-interval="3000"
    >
      <div className={`carousel-indicators ${styles.indicators}`}>
        {carouselItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="carousel-inner rounded">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <img src={item.image} className="d-block w-100" alt={item.alt} />
            <div className="carousel-caption d-none d-md-block">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default HeroCarousel;
