"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Info, Lightbulb, Target, Cpu, ArrowRight, Sparkles } from "lucide-react";

import VideoBackground from "./VideoBackground";

export default function AboutSection() {
  const eventFlow = [
    { step: "01", name: "IDEA", desc: "Conceptualize business innovations across 6 domain tracks." },
    { step: "02", name: "EVALUATION", desc: "Expert screening of Round 1 PPT pitch presentations." },
    { step: "03", name: "SHORTLIST", desc: "Top 12 elite finalist squads qualify for live building." },
    { step: "04", name: "4-HOUR BUILD", desc: "Intense live MVP prototyping phase in the arena." },
    { step: "05", name: "FINAL PITCH", desc: "Live prototype demonstration & Q&A with the Grand Jury." },
  ];

  return (
    <section id="about" className="relative py-28 px-6 bg-[#05050a] text-white overflow-hidden">
      {/* Animated Cybernetic Video Background Layer */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/rift-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.55}
      />

      {/* Background Ambience Accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-950/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Edge Distortion Scanline */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <Info className="w-3.5 h-3.5" />
            <span>EVENT BRIEFING // MIRAETHON 2026</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]"
          >
            WHAT IS MIRAETHON 2026?
          </motion.h2>
        </div>

        {/* Mission Briefing Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl p-6 sm:p-10 md:p-12 glass-rift cracked-border overflow-hidden"
        >
          {/* Corner Portal Flares */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Official Character Spotlight */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl p-3 bg-gradient-to-br from-purple-500/40 via-cyan-400/40 to-pink-500/40 border border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.35)] animate-float-mascot">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-black/90 relative">
                  <Image
                    src="/New_images/character.png"
                    alt="Miraethon 2026 Official Character Visual"
                    fill
                    className="object-contain p-2 hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>
              <div className="mt-4 font-mono text-xs tracking-widest text-cyan-300 uppercase text-center bg-purple-950/60 px-4 py-1.5 rounded-full border border-purple-500/40 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                <span>AI MEETS BUSINESS // HACKATHON ARENA</span>
              </div>
            </div>

            {/* Right: Clean Event Narrative & 5-Step Process */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4 text-gray-200 font-sans leading-relaxed text-base sm:text-lg">
                <p>
                  <strong className="text-cyan-300 font-bold">MIRAETHON 2026</strong> is a premier business innovation hackathon where student visionaries explore real-world challenges across six specialized industry domains.
                </p>
                <p>
                  Participants leverage artificial intelligence, technology, creativity, and strategic business models to build practical solutions that drive tangible real-world impact.
                </p>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono">
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-cyan-400/50 transition-colors">
                  <Lightbulb className="w-6 h-6 text-amber-400 mb-2" />
                  <h4 className="text-sm font-bold text-white uppercase">Innovate</h4>
                  <p className="text-xs text-gray-400 mt-1">Disrupt traditional market boundaries with AI & tech vision.</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-cyan-400/50 transition-colors">
                  <Target className="w-6 h-6 text-cyan-400 mb-2" />
                  <h4 className="text-sm font-bold text-white uppercase">Strategize</h4>
                  <p className="text-xs text-gray-400 mt-1">Craft razor-sharp business models and pitch slide decks.</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-cyan-400/50 transition-colors">
                  <Cpu className="w-6 h-6 text-pink-400 mb-2" />
                  <h4 className="text-sm font-bold text-white uppercase">Build</h4>
                  <p className="text-xs text-gray-400 mt-1">Develop working MVP prototypes in the 4-hour live arena.</p>
                </div>
              </div>

              {/* Event Journey Flow */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-3">
                  EVENT EXECUTION WORKFLOW
                </h4>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {eventFlow.map((flow, i) => (
                    <React.Fragment key={flow.name}>
                      <div className="px-3 py-1.5 rounded-lg bg-black/70 border border-purple-500/30 text-gray-200 flex items-center gap-1.5">
                        <span className="text-pink-400 font-bold">{flow.step}</span>
                        <span>{flow.name}</span>
                      </div>
                      {i < eventFlow.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
