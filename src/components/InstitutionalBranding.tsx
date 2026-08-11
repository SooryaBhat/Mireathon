"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * InstitutionalBranding — v4
 *
 * Official College & Department Branding:
 * - SRINIVAS INSTITUTE OF TECHNOLOGY, VALACHIL MANGALORE
 * - DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
 * - Official Logos: Srinivas Group, IEEE Bangalore, IEEE Mangalore, IEEE SIT, AADE, IIC, NAAC A+
 */
export default function InstitutionalBranding() {
  const logos = [
    {
      src: "/New_images/official_logos/Srinivas.jpg",
      alt: "Srinivas Group",
      w: 48,
      h: 48,
      cls: "h-6 sm:h-8 md:h-9 w-auto rounded-sm bg-white p-0.5",
    },
    {
      src: "/New_images/official_logos/ieee_bangalore1.jpeg",
      alt: "IEEE Bangalore Section",
      w: 80,
      h: 36,
      cls: "h-5 sm:h-7 md:h-8 w-auto bg-white p-0.5 rounded-sm",
    },
    {
      src: "/New_images/official_logos/ieee_mangalore1.jpeg",
      alt: "IEEE Mangalore Subsection",
      w: 80,
      h: 36,
      cls: "h-5 sm:h-7 md:h-8 w-auto bg-white p-0.5 rounded-sm",
    },
    {
      src: "/New_images/official_logos/ieee_sit1.jpeg",
      alt: "IEEE SIT Student Branch",
      w: 80,
      h: 36,
      cls: "h-5 sm:h-7 md:h-8 w-auto bg-white p-0.5 rounded-sm",
    },
    {
      src: "/New_images/official_logos/AADE1.jpeg",
      alt: "AADE – Association of AI & Data Science Educators",
      w: 48,
      h: 48,
      cls: "h-6 sm:h-8 md:h-9 w-auto rounded-full bg-white p-0.5",
    },
    {
      src: "/New_images/official_logos/iic.jpeg",
      alt: "Institution's Innovation Council (IIC)",
      w: 48,
      h: 48,
      cls: "h-6 sm:h-8 md:h-9 w-auto rounded-md bg-white p-0.5",
    },
    {
      src: "/New_images/official_logos/naac_A1_white.png",
      alt: "NAAC A+ Accredited",
      w: 48,
      h: 48,
      cls: "h-6 sm:h-8 md:h-9 w-auto rounded-md bg-white p-0.5",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col items-center max-w-full px-3 mb-3 sm:mb-5 select-none"
      style={{ background: "transparent" }}
    >
      {/* ── College Name (Bold, Guaranteed 1 Single Line) ── */}
      <span
        className="text-[9px] xs:text-[11px] sm:text-[14px] md:text-[16px] tracking-[0.1em] sm:tracking-[0.18em] font-extrabold font-mono uppercase text-white leading-none text-center max-w-full whitespace-nowrap drop-shadow-[0_2px_12px_rgba(0,0,0,1)]"
        style={{
          textShadow: "0 0 16px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1)",
        }}
      >
        SRINIVAS INSTITUTE OF TECHNOLOGY, VALACHIL MANGALORE
      </span>

      {/* ── Department Name (Vibrant High-Contrast Color) ── */}
      <span
        className="text-[9px] xs:text-[10.5px] sm:text-[13px] md:text-[14.5px] tracking-[0.1em] sm:tracking-[0.15em] font-mono uppercase font-extrabold leading-tight text-center max-w-full mt-1.5"
        style={{
          color: "#fde047",
          textShadow: "0 0 18px rgba(0,0,0,1), 0 0 25px rgba(253,224,71,0.5), 0 2px 8px rgba(0,0,0,1)",
        }}
      >
        DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
      </span>

      {/* ── Official Logos Row (All 7 Official Logos Cleanly Spaced) ── */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 mt-2 sm:mt-3 flex-wrap max-w-full">
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
                className="h-4 sm:h-5 w-px flex-shrink-0 hidden sm:block"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
