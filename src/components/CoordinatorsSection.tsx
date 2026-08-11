"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, MessageSquare, HelpCircle, Sparkles, Compass, Award, Calendar } from "lucide-react";
import VideoBackground from "./VideoBackground";

interface Coordinator {
  name: string;
  phone: string;
  displayPhone: string;
  role: string;
  designation?: string;
  department?: string;
  institution?: string;
  isPrimary?: boolean;
}

const PRIMARY_COORDINATOR: Coordinator = {
  name: "DR. VINAYAK RAO",
  phone: "9739290784",
  displayPhone: "9739 290 784",
  role: "PRIMARY EVENT COORDINATOR",
  designation: "Professor",
  department: "Department of Artificial Intelligence and Data Science",
  institution: "Srinivas Institute of Technology",
  isPrimary: true,
};

const STUDENT_COORDINATORS: Coordinator[] = [
  {
    name: "CHIRAG",
    phone: "8277611747",
    displayPhone: "8277 611 747",
    role: "STUDENT COORDINATOR",
  },
  {
    name: "VINISH",
    phone: "9591243710",
    displayPhone: "9591 243 710",
    role: "STUDENT COORDINATOR",
  },
];

export default function CoordinatorsSection() {
  return (
    <section
      id="contact"
      className="relative py-28 px-4 sm:px-6 bg-[#05050a] text-white overflow-hidden border-t border-purple-500/20 max-w-full"
    >
      {/* Background Video & Particle Layer */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/rift-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.55}
      />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Dimensional Portal Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-purple-500/20 bg-gradient-to-tr from-cyan-500/5 via-purple-500/5 to-pink-500/5 blur-xl pointer-events-none animate-pulse" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(138,43,226,0.3)] backdrop-blur-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>COMMUNICATION TERMINAL</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500 drop-shadow-[0_0_25px_rgba(138,43,226,0.5)]"
          >
            CONTACT THE COORDINATORS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-lg mx-auto text-gray-300 font-sans text-xs sm:text-base"
          >
            For any queries or more details, contact the coordinators.
          </motion.p>
        </div>

        {/* ── 1. PRIMARY FEATURED COORDINATOR: DR. VINAYAK RAO ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative group rounded-3xl glass-rift p-6 sm:p-8 border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:shadow-[0_0_55px_rgba(34,211,238,0.5)] transition-all duration-300 overflow-hidden max-w-2xl mx-auto mb-8 bg-black/80"
        >
          {/* Sci-Fi HUD Corner Brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-pink-500 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          <div className="space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/80 px-3.5 py-1 rounded-full border border-cyan-400/40 font-bold inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {PRIMARY_COORDINATOR.role}
              </span>
              <span className="text-xs font-mono text-purple-300 font-semibold">
                EVENT DATE: <span className="text-amber-300 font-bold">02/09/2026</span>
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-mono uppercase tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                {PRIMARY_COORDINATOR.name}
              </h3>
              <p className="text-xs sm:text-sm font-sans font-semibold text-amber-300 mt-0.5">
                {PRIMARY_COORDINATOR.designation}
              </p>
              <p className="text-xs font-sans text-cyan-200/90 mt-0.5">
                {PRIMARY_COORDINATOR.department}
              </p>
              <p className="text-xs font-sans text-gray-400">
                {PRIMARY_COORDINATOR.institution}
              </p>
            </div>

            <p className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 pt-1">
              +91 {PRIMARY_COORDINATOR.displayPhone}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-5 mt-5 border-t border-white/10 flex items-center gap-3">
            <a
              href={`tel:${PRIMARY_COORDINATOR.phone}`}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.5)] group/btn transition-all"
            >
              <Phone className="w-4 h-4 text-cyan-300 group-hover/btn:scale-110 transition-transform" />
              <span>CALL DR. VINAYAK RAO</span>
            </a>

            <a
              href={`https://wa.me/91${PRIMARY_COORDINATOR.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-black/70 border border-purple-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
              title={`Chat on WhatsApp with ${PRIMARY_COORDINATOR.name}`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">WHATSAPP</span>
            </a>
          </div>
        </motion.div>

        {/* ── 2 & 3. STUDENT COORDINATORS: CHIRAG & VINISH ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {STUDENT_COORDINATORS.map((coord, idx) => (
            <motion.div
              key={coord.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 + 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative group rounded-3xl glass-rift p-6 border border-purple-500/30 hover:border-cyan-400/60 shadow-[0_0_25px_rgba(138,43,226,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-all duration-300 flex flex-col justify-between overflow-hidden bg-black/70"
            >
              {/* Sci-Fi Corner Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-cyan-400/50 group-hover:border-cyan-300 transition-colors pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-pink-500/50 group-hover:border-pink-400 transition-colors pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-purple-500/50 group-hover:border-purple-400 transition-colors pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-cyan-400/50 group-hover:border-cyan-300 transition-colors pointer-events-none" />

              {/* Card Body */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400/90 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 font-semibold">
                    {coord.role}
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
                </div>

                <h3 className="text-2xl font-extrabold font-mono uppercase tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  {coord.name}
                </h3>

                <p className="text-lg font-mono font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                  +91 {coord.displayPhone}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-5 border-t border-white/10 flex items-center gap-3">
                <a
                  href={`tel:${coord.phone}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(138,43,226,0.4)] group/btn transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-300 group-hover/btn:scale-110 transition-transform" />
                  <span>CALL</span>
                </a>

                <a
                  href={`https://wa.me/91${coord.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-black/60 border border-purple-500/40 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
                  title={`Chat on WhatsApp with ${coord.name}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CHAT</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final Branding Message (Hero Connection) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center pt-8 border-t border-purple-500/20 space-y-3 font-mono"
        >
          <div className="inline-flex items-center gap-2 text-cyan-400/90 text-xs tracking-[0.25em] uppercase">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>EVENT DATE: <span className="text-amber-300 font-bold">02/09/2026</span> (2 SEPTEMBER 2026)</span>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500 drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]">
            MIRAETHON 2026
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm tracking-[0.2em] font-bold text-gray-300 uppercase">
            <span className="text-amber-300">AI MEETS BUSINESS</span>
            <span className="hidden sm:inline text-purple-500">//</span>
            <span className="text-cyan-300">CREATIVITY AT THE EVEREST</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
