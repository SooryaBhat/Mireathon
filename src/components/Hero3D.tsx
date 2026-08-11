"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Sparkles, Compass, Zap, ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import VideoBackground from "./VideoBackground";
import InstitutionalBranding from "./InstitutionalBranding";

// Dynamically import Three.js 3D canvas component for edge-to-edge 3D hero scene
const Hero3DCanvas = dynamic(() => import("./Hero3DCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#05050a]">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-purple-500/30 border-t-cyan-400 animate-spin" />
        <span className="absolute text-[10px] sm:text-xs tracking-widest text-cyan-400 font-mono animate-pulse">
          INITIALIZING 3D WORLD...
        </span>
      </div>
    </div>
  ),
});

export default function Hero3D() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#05050a] text-white">
      {/* ── Edge-to-Edge 3D Moving Canvas Layer (Mobile & Desktop Edge-to-Edge World) ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Hero3DCanvas />
      </div>

      {/* Minimal Video Background & Fog Accent (Bright, Zero Opaque Dark Overlay) */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/rift-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.05}
      />

      {/* Ambient Radial Accent Glows */}
      <div className="absolute top-1/4 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-purple-900/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-pink-900/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* ── Fixed Header / Navigation Bar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#05050a]/90 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.9)] py-2.5 sm:py-3"
            : "bg-transparent py-3 sm:py-4"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo Identity */}
          <div
            onClick={() => scrollToSection("top")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-black/90 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/New_images/character.png"
                alt="Miraethon Mascot"
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-wider text-white font-mono group-hover:text-cyan-400 transition-colors">
                MIRAETHON<span className="text-purple-400 font-extrabold ml-1">2026</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-cyan-400/80 tracking-widest uppercase font-mono">
                AI MEETS BUSINESS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-widest font-mono text-gray-300">
            <button
              onClick={() => scrollToSection("top")}
              className="hover:text-cyan-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              HOME
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-cyan-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              ABOUT
            </button>
            <button
              onClick={() => scrollToSection("themes")}
              className="hover:text-purple-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-purple-400 hover:after:w-full after:transition-all"
            >
              TRACKS
            </button>
            <button
              onClick={() => scrollToSection("rules")}
              className="hover:text-pink-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-pink-400 hover:after:w-full after:transition-all"
            >
              RULES
            </button>
            <button
              onClick={() => scrollToSection("register")}
              className="hover:text-emerald-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-emerald-400 hover:after:w-full after:transition-all"
            >
              REGISTER
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-amber-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 hover:after:w-full after:transition-all"
            >
              CONTACT
            </button>
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection("register")}
              className="px-4 lg:px-5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/50 text-cyan-300 font-mono text-xs tracking-wider uppercase hover:bg-purple-600/30 hover:border-cyan-400 shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>REGISTER</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cyan-400 p-2 rounded-lg border border-purple-500/30 bg-black/80 hover:border-cyan-400 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Overlay Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-[#05050a]/95 backdrop-blur-xl border-b border-purple-500/30 px-6 py-6 flex flex-col gap-3 font-mono text-sm tracking-wider shadow-2xl mt-2"
            >
              <button
                onClick={() => scrollToSection("top")}
                className="text-left text-gray-200 hover:text-cyan-400 py-2 border-b border-white/10 flex items-center gap-2"
              >
                <span className="text-cyan-400">//</span> HOME
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left text-gray-200 hover:text-cyan-400 py-2 border-b border-white/10 flex items-center gap-2"
              >
                <span className="text-cyan-400">//</span> ABOUT
              </button>
              <button
                onClick={() => scrollToSection("themes")}
                className="text-left text-gray-200 hover:text-purple-400 py-2 border-b border-white/10 flex items-center gap-2"
              >
                <span className="text-purple-400">//</span> TRACKS
              </button>
              <button
                onClick={() => scrollToSection("rules")}
                className="text-left text-gray-200 hover:text-pink-400 py-2 border-b border-white/10 flex items-center gap-2"
              >
                <span className="text-pink-400">//</span> RULES & TIMELINE
              </button>
              <button
                onClick={() => scrollToSection("register")}
                className="text-left text-cyan-300 hover:text-cyan-200 py-2 border-b border-white/10 flex items-center gap-2 font-bold"
              >
                <span className="text-cyan-400">//</span> REGISTER SQUAD
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left text-amber-300 hover:text-amber-200 py-2 flex items-center gap-2 font-bold"
              >
                <span className="text-amber-400">//</span> CONTACT COORDINATORS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Hero Content Overlay directly over the Edge-to-Edge 3D moving scene ── */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 flex-1 flex flex-col items-center justify-center text-center">

        {/* 1. Official College & Department Branding */}
        <InstitutionalBranding />

        {/* Sci-Fi HUD Corner Brackets */}
        <div className="absolute top-28 left-4 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-cyan-400/60 hidden sm:block pointer-events-none" />
        <div className="absolute top-28 right-4 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-pink-500/60 hidden sm:block pointer-events-none" />
        <div className="absolute bottom-16 left-4 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-purple-500/60 hidden sm:block pointer-events-none" />
        <div className="absolute bottom-16 right-4 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-amber-400/60 hidden sm:block pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-purple-950/80 border border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.4)] mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-widest font-mono text-cyan-300 backdrop-blur-md max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
          <span className="truncate">02/09/2026 — COLLEGE BUSINESS INNOVATION HACKATHON</span>
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
        </motion.div>

        {/* 2. Hero Title Line 1: MIRAETHON 2026 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-white to-[#ff2e88] animate-flicker drop-shadow-[0_6px_35px_rgba(0,0,0,1)] mb-2 select-none max-w-full break-words"
          style={{
            fontSize: "clamp(2.2rem, 8.5vw, 7.5rem)",
            filter: "drop-shadow(0 0 30px rgba(56,189,248,0.7)) drop-shadow(0 0 60px rgba(255,46,136,0.45))",
          }}
        >
          MIRAETHON 2026
        </motion.h1>

        {/* 3. Hero Subtitle Line 2: AI MEETS BUSINESS */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-extrabold font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 mb-3 sm:mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
          style={{ fontSize: "clamp(1.1rem, 4.5vw, 3rem)" }}
        >
          AI MEETS BUSINESS
        </motion.h2>

        {/* 4. Hero Tagline: CREATIVITY AT THE EVEREST */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="max-w-2xl text-xs sm:text-base md:text-xl text-cyan-300/95 font-mono tracking-widest uppercase font-light leading-relaxed mb-6 sm:mb-8 drop-shadow-[0_4px_15px_rgba(0,0,0,0.95)]"
        >
          CREATIVITY AT THE EVEREST
        </motion.p>

        {/* 5. CTAs: ENTER THE MIRAETHON & EXPLORE THE TRACKS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto max-w-xs sm:max-w-none"
        >
          <button
            onClick={() => scrollToSection("about")}
            className="w-full sm:w-auto group relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 p-[2px] shadow-[0_0_35px_rgba(138,43,226,0.7)] hover:shadow-[0_0_60px_rgba(34,211,238,1)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="w-full px-6 sm:px-8 py-3 sm:py-3.5 rounded-[10px] bg-[#080812] flex items-center justify-center gap-3 font-mono font-bold text-xs sm:text-sm tracking-widest text-white uppercase group-hover:bg-opacity-80 transition-colors">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              <span>ENTER MIRAETHON</span>
              <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => scrollToSection("themes")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-black/60 border border-purple-500/40 text-cyan-300 font-mono text-xs sm:text-sm tracking-widest uppercase hover:border-cyan-400 hover:text-white backdrop-blur-md transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)]"
          >
            EXPLORE TRACKS
          </button>
        </motion.div>
      </div>

      {/* ── Hero Bottom Floating Stats Bar ── */}
      <div className="relative z-20 border-t border-purple-500/20 bg-black/60 backdrop-blur-md py-4 sm:py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center font-mono">
          <div className="border-r border-purple-500/10 last:border-0 pr-2 sm:pr-4">
            <div className="text-cyan-400 text-xl sm:text-2xl font-bold">6 TRACKS</div>
            <div className="text-gray-400 text-[10px] sm:text-xs tracking-wider uppercase mt-1">Specialized Worlds</div>
          </div>
          <div className="border-r border-purple-500/10 md:border-r last:border-0 pl-2 sm:pl-0 pr-2 sm:pr-4">
            <div className="text-purple-400 text-xl sm:text-2xl font-bold">2 - 4</div>
            <div className="text-gray-400 text-[10px] sm:text-xs tracking-wider uppercase mt-1">Squad Members</div>
          </div>
          <div className="border-r border-purple-500/10 last:border-0 pr-2 sm:pr-4 pt-2 md:pt-0">
            <div className="text-pink-400 text-xl sm:text-2xl font-bold">12 TEAMS</div>
            <div className="text-gray-400 text-[10px] sm:text-xs tracking-wider uppercase mt-1">Mini Hackathon Finalists</div>
          </div>
          <div className="pt-2 md:pt-0 pl-2 sm:pl-0">
            <div className="text-amber-400 text-xl sm:text-2xl font-bold">02/09/2026</div>
            <div className="text-gray-400 text-[10px] sm:text-xs tracking-wider uppercase mt-1">Official Event Date</div>
          </div>
        </div>
      </div>
    </section>
  );
}
