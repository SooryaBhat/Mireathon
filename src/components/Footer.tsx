"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Sparkles, Compass, HelpCircle } from "lucide-react";

import VideoBackground from "./VideoBackground";

export default function Footer() {
  return (
    <footer className="relative bg-[#030307] text-white border-t border-purple-500/20 pt-16 pb-12 overflow-hidden">
      {/* Animated Video Background Layer */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/rift-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.65}
      />

      {/* Edge Fog Gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-black p-0.5">
                <Image
                  src="/New_images/character.png"
                  alt="Miraethon Mascot Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-mono font-bold text-2xl tracking-wider text-white">
                MIRAETHON<span className="text-purple-400 font-extrabold ml-1">2026</span>
              </span>
            </div>

            <p className="text-sm font-sans text-gray-300 leading-relaxed max-w-sm">
              Srinivas Institute of Technology — Department of Artificial Intelligence and Data Science. Official College Business Innovation Hackathon.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 pt-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>AI Meets Business // Creativity At The Everest</span>
            </div>
          </div>

          {/* Event Details Box */}
          <div className="md:col-span-4 space-y-3 font-mono text-sm">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              // Event Coordinates
            </h4>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Official Event Date</div>
                <div className="text-amber-300 font-bold tracking-wider text-xs sm:text-sm">
                  02/09/2026 <span className="text-gray-400 font-normal text-[10px] ml-1">(2 September 2026)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Institution</div>
                <div className="text-cyan-300 font-bold tracking-wider text-xs">
                  Srinivas Institute of Technology
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs uppercase tracking-widest">
            <h4 className="text-purple-400 font-bold tracking-widest mb-2">// Navigation</h4>
            <ul className="space-y-2.5 text-gray-300">
              <li>
                <a href="#about" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>About Miraethon</span>
                </a>
              </li>
              <li>
                <a href="#themes" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>6 Domain Tracks</span>
                </a>
              </li>
              <li>
                <a href="#rules" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-pink-400" />
                  <span>Rules & Objectives</span>
                </a>
              </li>
              <li>
                <a href="#register" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Register Squad</span>
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contact Coordinators</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-400">
          <div>
            © 2026 <span className="text-white font-bold">MIRAETHON 2026</span>. All Rights Reserved.
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <span>Srinivas Institute of Technology</span>
            <span className="text-cyan-400 font-bold ml-1">// Valachil, Mangaluru</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
