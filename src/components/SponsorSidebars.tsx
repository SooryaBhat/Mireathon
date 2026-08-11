"use client";

import React from "react";
import Image from "next/image";

// List of available sponsor & advisor images located in /public/sponsors/
const SPONSOR_IMAGES = [
  { id: "sponser1", src: "/sponsors/sponser1.jpeg", label: "Sponsor Partner 01" },
  { id: "advisor1", src: "/sponsors/advisor1.jpeg", label: "Advisor 01" },
  { id: "sponser2", src: "/sponsors/sponser2.jpeg", label: "Sponsor Partner 02" },
  { id: "advisor2", src: "/sponsors/advisor2.jpeg", label: "Advisor 02" },
  { id: "sponser3", src: "/sponsors/sponser3.jpeg", label: "Sponsor Partner 03" },
  { id: "advisor3", src: "/sponsors/advisor3.jpeg", label: "Advisor 03" },
  { id: "advisor4", src: "/sponsors/advisor4.jpeg", label: "Advisor 04" },
];

export default function SponsorSidebars() {
  if (!SPONSOR_IMAGES || SPONSOR_IMAGES.length === 0) {
    return null;
  }

  // Duplicate items for continuous infinite marquee loop
  const duplicatedItems = [...SPONSOR_IMAGES, ...SPONSOR_IMAGES, ...SPONSOR_IMAGES];

  return (
    <>
      {/* ── DESKTOP ONLY: Fixed Left & Right Vertical Sidebars (lg+ screens) ── */}
      {/* Left Edge Fixed Vertical Marquee Sidebar */}
      <aside
        aria-label="Sponsors and Advisors Left Sidebar"
        className="fixed left-3 top-24 bottom-12 z-30 hidden lg:flex flex-col items-center overflow-hidden w-16 pointer-events-auto select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0715]/40 to-[#05050a]/90 border-r border-purple-500/20 backdrop-blur-sm rounded-r-2xl pointer-events-none" />
        <div className="relative z-10 pt-2 pb-1 text-[9px] font-mono tracking-widest uppercase text-cyan-400/80 font-bold rotate-180 write-vertical text-center pointer-events-none">
          PARTNERS
        </div>
        <div className="relative w-full flex-1 overflow-hidden py-2">
          <div className="flex flex-col items-center gap-4 animate-marquee-down py-2">
            {duplicatedItems.map((item, idx) => (
              <div
                key={`left-${item.id}-${idx}`}
                className="group relative w-12 h-12 rounded-xl p-1 bg-black/80 border border-purple-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.7)] transition-all duration-300 transform hover:scale-110 cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain rounded-lg filter saturate-110 contrast-105 group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Edge Fixed Vertical Marquee Sidebar */}
      <aside
        aria-label="Sponsors and Advisors Right Sidebar"
        className="fixed right-3 top-24 bottom-12 z-30 hidden lg:flex flex-col items-center overflow-hidden w-16 pointer-events-auto select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0715]/40 to-[#05050a]/90 border-l border-purple-500/20 backdrop-blur-sm rounded-l-2xl pointer-events-none" />
        <div className="relative z-10 pt-2 pb-1 text-[9px] font-mono tracking-widest uppercase text-pink-400/80 font-bold write-vertical text-center pointer-events-none">
          ADVISORS
        </div>
        <div className="relative w-full flex-1 overflow-hidden py-2">
          <div className="flex flex-col items-center gap-4 animate-marquee-up py-2">
            {duplicatedItems.map((item, idx) => (
              <div
                key={`right-${item.id}-${idx}`}
                className="group relative w-12 h-12 rounded-xl p-1 bg-black/80 border border-pink-500/30 hover:border-pink-400 shadow-[0_0_12px_rgba(255,46,136,0.3)] hover:shadow-[0_0_20px_rgba(255,46,136,0.7)] transition-all duration-300 transform hover:scale-110 cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain rounded-lg filter saturate-110 contrast-105 group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MOBILE & TABLET IN-FLOW SECTION (< lg screens) ── */}
      <section className="lg:hidden w-full py-10 px-4 bg-[#070512] border-t border-b border-purple-500/20 text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
            EVENT PARTNERS & ADVISORS
          </span>
        </div>

        {/* Horizontal Marquee Track for Mobile */}
        <div className="w-full overflow-hidden relative">
          <div className="flex items-center gap-4 animate-marquee-left py-2">
            {duplicatedItems.map((item, idx) => (
              <div
                key={`mobile-${item.id}-${idx}`}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/80 border border-purple-500/30 shadow-[0_0_15px_rgba(138,43,226,0.25)]"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0">
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-mono font-medium text-gray-300 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
