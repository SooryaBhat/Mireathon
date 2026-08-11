"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Award } from "lucide-react";

// List of available sponsor & advisor images located in /public/sponsors/
const SPONSOR_IMAGES = [
  { id: "sponser1", src: "/sponsors/sponser1.jpeg", label: "Industry Partner 01" },
  { id: "advisor1", src: "/sponsors/advisor1.jpeg", label: "Strategic Advisor 01" },
  { id: "sponser2", src: "/sponsors/sponser2.jpeg", label: "Technology Partner 02" },
  { id: "advisor2", src: "/sponsors/advisor2.jpeg", label: "Academic Advisor 02" },
  { id: "sponser3", src: "/sponsors/sponser3.jpeg", label: "Innovation Partner 03" },
  { id: "advisor3", src: "/sponsors/advisor3.jpeg", label: "Research Advisor 03" },
  { id: "advisor4", src: "/sponsors/advisor4.jpeg", label: "Domain Advisor 04" },
];

export default function SponsorSidebars() {
  if (!SPONSOR_IMAGES || SPONSOR_IMAGES.length === 0) {
    return null;
  }

  // Duplicate items for continuous infinite marquee loop
  const duplicatedItems = [
    ...SPONSOR_IMAGES,
    ...SPONSOR_IMAGES,
    ...SPONSOR_IMAGES,
    ...SPONSOR_IMAGES,
  ];

  return (
    <section
      id="sponsors"
      className="w-full py-14 sm:py-18 px-4 bg-[#05040d] border-t border-b border-purple-500/20 text-white overflow-hidden relative z-20 select-none"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-xs tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(138,43,226,0.3)] backdrop-blur-md">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>COLLABORATIVE ECOSYSTEM</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500 drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]">
          EVENT SPONSORS, ADVISORS & PARTNERS
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-400 font-sans max-w-lg mx-auto">
          Empowering student innovation and business transformation at Miraethon 2026.
        </p>
      </div>

      {/* ── Continuous Horizontal Marquee Loop Moving LEFT → RIGHT ── */}
      <div className="w-full overflow-hidden relative z-10 py-3">
        <div className="flex items-center gap-5 sm:gap-8 animate-marquee-right py-2">
          {duplicatedItems.map((item, idx) => (
            <div
              key={`sponsor-loop-${item.id}-${idx}`}
              className="flex-shrink-0 flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-black/80 border border-purple-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(138,43,226,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 group cursor-pointer"
            >
              {/* Slightly Larger Logo Container with White Background */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white p-1 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-mono font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">
                  MIRAETHON 2026
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
