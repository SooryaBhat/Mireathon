"use client";

import React from "react";
import Image from "next/image";
import { Award, UserCheck, ShieldCheck } from "lucide-react";

// Official Sponsor Organizations (Real Names Only - No Generic Placeholders)
const OFFICIAL_SPONSORS = [
  {
    id: "sp1",
    src: "/sponsors/sponser1.jpeg",
    name: "KATEELESHWARI DEVELOPERS",
    category: "OFFICIAL SPONSOR",
  },
  {
    id: "sp2",
    src: "/sponsors/sponser2.jpeg",
    name: "SUVITA INVESTOR SERVICES",
    category: "OFFICIAL SPONSOR",
  },
  {
    id: "sp3",
    src: "/sponsors/sponser3.jpeg",
    name: "KATEELESHWARI DEVELOPERS",
    category: "OFFICIAL SPONSOR",
  },
];

// Official Advisor Organizations (Real Names Only - No Generic Placeholders)
const OFFICIAL_ADVISORS = [
  {
    id: "adv1",
    src: "/sponsors/advisor1.jpeg",
    name: "MUSICLOUD",
    category: "OFFICIAL ADVISOR",
  },
  {
    id: "adv2",
    src: "/sponsors/advisor2.jpeg",
    name: "COACHBUDDY",
    category: "OFFICIAL ADVISOR",
  },
  {
    id: "adv3",
    src: "/sponsors/advisor3.jpeg",
    name: "BANGALORE & BEYOND",
    category: "OFFICIAL ADVISOR",
  },
  {
    id: "adv4",
    src: "/sponsors/advisor4.jpeg",
    name: "SAMANYA BEAUTY ON BROADWAY",
    category: "OFFICIAL ADVISOR",
  },
];

// Official Institutional Advisory Board
const ADVISORY_BOARD = [
  {
    name: "Dr. Shrinivasa Mayya D",
    role: "Principal, SIT",
  },
  {
    name: "Prof. Nagaraja Hebbar N",
    role: "HOD, AI&DS Dept., SIT",
  },
  {
    name: "Dr. Vinayak Rao",
    role: "Staff Advisor & IEEE ExecOn Member (MSS), SIT",
  },
  {
    name: "Prof. Sudarshan K",
    role: "HOD, ISE & CSD & IEEE Branch Counsellor, SIT",
  },
  {
    name: "Dr. Umashankar KS",
    role: "IIC Coordinator, SIT",
  },
];

// Combined list for horizontal continuous marquee
const COMBINED_SPONSOR_ADVISORS = [
  ...OFFICIAL_SPONSORS,
  ...OFFICIAL_ADVISORS,
  ...OFFICIAL_SPONSORS,
  ...OFFICIAL_ADVISORS,
];

export default function SponsorSidebars() {
  return (
    <>
      {/* ── 1. LARGE DESKTOP-ONLY SIDE SPONSOR/ADVISOR RAILS (hidden on screens < 1440px / 2xl) ── */}
      {/* Left Edge Fixed Vertical Marquee Sidebar (Sponsors) */}
      <aside
        aria-label="Official Sponsors Left Sidebar"
        className="fixed left-2 top-28 bottom-12 z-10 hidden 2xl:flex flex-col items-center overflow-hidden w-16 pointer-events-none select-none opacity-85 hover:opacity-100 transition-opacity"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0715]/40 to-[#05050a]/90 border-r border-purple-500/20 backdrop-blur-sm rounded-r-2xl pointer-events-none" />
        <div className="relative z-10 pt-2 pb-1 text-[8px] font-mono tracking-widest uppercase text-cyan-400 font-bold rotate-180 write-vertical text-center pointer-events-none">
          OFFICIAL SPONSORS
        </div>
        <div className="relative w-full flex-1 overflow-hidden py-2 pointer-events-auto">
          <div className="flex flex-col items-center gap-4 animate-marquee-down py-2">
            {[...OFFICIAL_SPONSORS, ...OFFICIAL_SPONSORS, ...OFFICIAL_SPONSORS].map((item, idx) => (
              <div
                key={`left-rail-${item.id}-${idx}`}
                title={item.name}
                className="group relative w-11 h-11 rounded-xl p-1 bg-white border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all duration-300 transform hover:scale-110 cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
              >
                <Image
                  src={item.src}
                  alt={item.name}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Edge Fixed Vertical Marquee Sidebar (Advisors) */}
      <aside
        aria-label="Official Advisors Right Sidebar"
        className="fixed right-2 top-28 bottom-12 z-10 hidden 2xl:flex flex-col items-center overflow-hidden w-16 pointer-events-none select-none opacity-85 hover:opacity-100 transition-opacity"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/90 via-[#0a0715]/40 to-[#05050a]/90 border-l border-purple-500/20 backdrop-blur-sm rounded-l-2xl pointer-events-none" />
        <div className="relative z-10 pt-2 pb-1 text-[8px] font-mono tracking-widest uppercase text-pink-400 font-bold rotate-180 write-vertical text-center pointer-events-none">
          OFFICIAL ADVISORS
        </div>
        <div className="relative w-full flex-1 overflow-hidden py-2 pointer-events-auto">
          <div className="flex flex-col items-center gap-4 animate-marquee-up py-2">
            {[...OFFICIAL_ADVISORS, ...OFFICIAL_ADVISORS, ...OFFICIAL_ADVISORS].map((item, idx) => (
              <div
                key={`right-rail-${item.id}-${idx}`}
                title={item.name}
                className="group relative w-11 h-11 rounded-xl p-1 bg-white border border-pink-500/40 hover:border-pink-400 shadow-[0_0_12px_rgba(255,46,136,0.4)] transition-all duration-300 transform hover:scale-110 cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
              >
                <Image
                  src={item.src}
                  alt={item.name}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN BOTTOM SPONSORS, ADVISORS & ADVISORY BOARD SECTION ── */}
      <section
        id="sponsors"
        className="w-full py-16 sm:py-20 px-4 bg-[#05040d] border-t border-b border-purple-500/20 text-white overflow-hidden relative z-20 select-none"
      >
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-xs tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(138,43,226,0.3)] backdrop-blur-md">
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

        {/* ── Institutional Advisory Board Grid ── */}
        <div className="max-w-5xl mx-auto mb-12 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6 font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>INSTITUTIONAL ADVISORY BOARD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADVISORY_BOARD.map((board, idx) => (
              <div
                key={`board-${idx}`}
                className="p-4 rounded-2xl bg-black/70 border border-purple-500/30 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(138,43,226,0.2)] transition-all duration-300 flex items-start gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-left font-mono">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {board.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-snug">
                    {board.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Continuous Horizontal Marquee Loop Moving LEFT → RIGHT (Real Names Only) ── */}
        <div className="w-full overflow-hidden relative z-10 py-3">
          <div className="flex items-center gap-5 sm:gap-8 animate-marquee-right py-2">
            {COMBINED_SPONSOR_ADVISORS.map((item, idx) => (
              <div
                key={`sponsor-loop-${item.id}-${idx}`}
                className="flex-shrink-0 flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-black/80 border border-purple-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(138,43,226,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 group cursor-pointer"
              >
                {/* White Background Logo Container */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white p-1 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
