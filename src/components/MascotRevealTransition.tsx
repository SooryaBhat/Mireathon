"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

export default function MascotRevealTransition() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-120px" });
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user already experienced the mascot reveal during this session
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("miraethon_mascot_revealed");
      if (stored === "true") {
        setHasRevealed(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isInView && !hasRevealed && !isAnimating) {
      setIsAnimating(true);

      // Trigger energy burst & store session reveal
      const timer = setTimeout(() => {
        setHasRevealed(true);
        setIsAnimating(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("miraethon_mascot_revealed", "true");
        }
      }, 1800); // 1.8s energetic animation duration

      return () => clearTimeout(timer);
    }
  }, [isInView, hasRevealed, isAnimating]);

  const handleSkip = () => {
    setHasRevealed(true);
    setIsAnimating(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("miraethon_mascot_revealed", "true");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full py-16 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#05050a] via-[#0b0618] to-[#05050a] text-white"
    >
      {/* Background Energy Lines & Pulsing Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-[90px]" />
      </div>

      {/* Mascot Reveal Spotlight Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto">
        {/* Mascot Avatar with Signature Energy Burst */}
        <div className="relative mb-6">
          {/* Energy Shockwave Ring Animation */}
          {isAnimating && (
            <>
              <motion.div
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{ scale: 3.5, opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-4 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.9)] pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 4.5, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-pink-500 shadow-[0_0_60px_rgba(255,46,136,0.9)] pointer-events-none"
              />
            </>
          )}

          {/* Floating Mascot Badge Frame */}
          <motion.div
            animate={
              isAnimating
                ? { scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }
                : { y: [0, -8, 0] }
            }
            transition={
              isAnimating
                ? { duration: 1.5, ease: "easeInOut" }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_35px_rgba(138,43,226,0.6)] cursor-pointer group transition-transform ${
              isAnimating ? "ring-4 ring-cyan-300 ring-offset-4 ring-offset-black" : ""
            }`}
            onClick={handleSkip}
            title="NEXUS SPECTRE Mascot — Click to trigger energy burst"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-black bg-black relative">
              <Image
                src="/assets/mascot.png"
                alt="Miraethon Nexus Spectre Mascot"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Pulsing Energy Core Icon */}
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-black border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Mascot Message & Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2 font-mono"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 text-[11px] tracking-widest uppercase shadow-[0_0_15px_rgba(138,43,226,0.4)]">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span>NEXUS SPECTRE UNLOCKING PROTOCOLS</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-400">
            {isAnimating
              ? "⚡ RELEASING RIFT ENERGY..."
              : hasRevealed
              ? "OBJECTIVE MATRIX UNLOCKED"
              : "SCROLL TO UNLOCK MISSION RULES"}
          </h3>

          {!hasRevealed && isAnimating && (
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-cyan-300 underline font-mono tracking-wider pt-2"
            >
              [ Skip Animation ]
            </button>
          )}
        </motion.div>
      </div>

      {/* Visual Energy Wipe Beam Divider */}
      <div className="relative w-full max-w-4xl mt-8 px-6">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent relative">
          {isAnimating && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.4 }}
              className="absolute inset-0 bg-pink-500 shadow-[0_0_20px_rgba(255,46,136,1)] mx-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
}
