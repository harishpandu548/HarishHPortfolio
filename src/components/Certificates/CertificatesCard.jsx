// components/Certificates/CertificateCard.jsx
"use client";

import React from "react";
import Image from "next/image";

export default function CertificateCard({ c }) {
  const theme = c.theme || "azure";

  return (
    <article
      className="cert-card"
      data-theme={theme}
      aria-labelledby={`cert-title-${c.id}`}
      role="group"
    >
      <div
        className="cert-img-wrapper"
        role="img"
        aria-label={`${c.title} preview`}
      >
        {c.img ? (
          // -----------------------------
          // Next.js Image Component (Fill)
          // -----------------------------
          <div className="cert-img relative">
            <Image
              src={c.img}
              alt={c.title}
              fill
              sizes="(max-width: 600px) 100vw, 400px"
              className="object-cover rounded-xl"
              priority={false}
            />
          </div>
        ) : (
          // fallback block (no image)
          <div
            className="cert-img"
            style={{
              background: c.color || "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 24,
              padding: 12,
            }}
          >
            {c.title}
          </div>
        )}

        {/* animated accent */}
        <div className="cert-top-accent" aria-hidden />
      </div>

      <div className="cert-bottom" role="group" aria-label={`${c.title} info`}>
        <h3 id={`cert-title-${c.id}`} className="cert-title">
          <span className="cert-title-gradient">{c.title}</span>
        </h3>

        <div className="cert-info">
          <span>{c.issuer}</span>
          <span aria-hidden="true">•</span>
          <span>{c.date}</span>
        </div>

        <a
          className="cert-btn"
          href={c.url || "#"}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${c.title}`}
        >
          View ↗
        </a>
      </div>
    </article>
  );
}
