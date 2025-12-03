"use client";

import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";

import CertificateCard from "./CertificatesCard";
import { certificates } from "./certificatesData";
import "./styles.css";

export default function CertificatesSlider() {
  // add small aria-labels to navigation buttons after mount (enhances accessibility)
  useEffect(() => {
    setTimeout(() => {
      const prev = document.querySelector(".swiper-button-prev");
      const next = document.querySelector(".swiper-button-next");
      if (prev) prev.setAttribute("aria-label", "Previous certificates");
      if (next) next.setAttribute("aria-label", "Next certificates");
    }, 600);
  }, []);

  return (
    <motion.section
      id="certificates"
      className="cert-section"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
        <div className="max-w-7xl mx-auto px-6 mt-2">
        {/* big heading — matches Featured Projects scale */}
       <h3 className="text-center text-6xl md:text-7xl font-extrabold mb-6">
          <span className="text-white"></span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Certificates</span>
        </h3>

        <p className="subtitle">
          Selected professional certificates and course achievements — proof of the work behind the projects.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={3}
          spaceBetween={32}
          slidesPerGroup={1}
          speed={620}
          loop={false}
          centeredSlides={false}
          className="cert-swiper"
          breakpoints={{
            320: { slidesPerView: 1, slidesPerGroup: 1 },
            640: { slidesPerView: 1.3, slidesPerGroup: 1 },
            900: { slidesPerView: 2, slidesPerGroup: 1 },
            1200: { slidesPerView: 3, slidesPerGroup: 1 },
            1500: { slidesPerView: 3, slidesPerGroup: 1 },
          }}
        >
          {certificates.map((c) => (
            <SwiperSlide key={c.id}>
              <CertificateCard c={c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.section>
  );
}
