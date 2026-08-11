"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * InstitutionalBranding — v3
 *
 * Official College & Department Branding:
 * - SRINIVAS INSTITUTE OF TECHNOLOGY
 * - DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
 * - Official Logos: Srinivas Group, IEEE, AADE / AI-DS, NAAC A+
 * 
 * Rendered with 100% transparent background (no opaque dark boxes) so it blends
 * directly into the 3D hero scene with zero overlapping.
 */
export default function InstitutionalBranding() {
  const logos = [
    {
      src: "/New_images/official_logos/Srinivas.jpg",
      alt: "Srinivas Group",
      w: 52,
      h: 52,
      cls: "h-7 sm:h-9 md:h-11 w-auto rounded-sm",
    },
    {
      src: "/New_images/official_logos/ieee-logo.webp",
      alt: "IEEE",
      w: 100,
      h: 38,
      cls: "h-5 sm:h-7 md:h-8 w-auto",
    },
    {
      src: "/New_images/official_logos/AADE1.jpeg",
      alt: "AADE – Association of AI & Data Science Educators",
      w: 52,
      h: 52,
      cls: "h-7 sm:h-9 md:h-11 w-auto rounded-full",
    },
    {
      src: "/New_images/official_logos/naac_A.jpg",
      alt: "NAAC A+ Accredited",
      w: 52,
      h: 52,
      cls: "h-6 sm:h-8 md:h-10 w-auto rounded-full",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col items-center max-w-full px-4 mb-4 sm:mb-6 select-none"
      style={{ background: "transparent" }}
    >
      {/* ── College Name ── */}
      <span
        className="text-[11px] xs:text-[13px] sm:text-[16px] md:text-[18px] tracking-[0.16em] sm:tracking-[0.22em] font-bold font-mono uppercase text-white leading-tight text-center max-w-full drop-shadow-[0_2px_10px_rgba(0,0,0,1)]"
        style={{
          textShadow: "0 0 16px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1)",
        }}
      >
        SRINIVAS INSTITUTE OF TECHNOLOGY
      </span>

      {/* ── Department Name ── */}
      <span
        className="text-[8px] xs:text-[9px] sm:text-[11px] md:text-[12.5px] tracking-[0.12em] sm:tracking-[0.16em] font-mono uppercase font-medium text-cyan-300 leading-tight text-center max-w-full mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
        style={{
          color: "rgba(103,232,249,0.95)",
          textShadow: "0 0 14px rgba(0,0,0,1), 0 0 25px rgba(34,211,238,0.4)",
        }}
      >
        DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
      </span>

      {/* ── Official Logos Row (Responsive, no overlap) ── */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mt-2.5 sm:mt-3 flex-wrap max-w-full">
        {logos.map((logo, i) => (
          <React.Fragment key={logo.alt}>
            <div
              className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
              style={{
                filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.95))",
              }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.w}
                height={logo.h}
                className={`${logo.cls} object-contain select-none`}
                priority
                unoptimized
              />
            </div>

            {/* Thin separator between logos */}
            {i < logos.length - 1 && (
              <div
                className="h-4 sm:h-6 w-px flex-shrink-0 hidden xs:block"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
