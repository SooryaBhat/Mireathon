"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Zap, Compass, ShieldCheck } from "lucide-react";
import VideoBackground from "./VideoBackground";

interface Track {
  id: string;
  num: string;
  name: string;
  subtitle: string;
  accentColor: string;
  borderGlow: string;
  image: string;
  description: string;
  problemStatement: string;
  keyAreas: string[];
}

const TRACKS: Track[] = [
  {
    id: "retail",
    num: "01",
    name: "RETAIL & REAL ESTATE",
    subtitle: "Smart Commerce, Property Tech & Spatial Intelligence",
    accentColor: "#f59e0b",
    borderGlow: "hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]",
    image: "/New_images/retail_realestate.png",
    description: "Reimagine physical and digital spaces through AI, spatial computing, and intelligent automation. From hyper-personalized store experiences, demand forecasting, and autonomous retail supply chains to AI-driven property discovery, smart building telemetry, and predictive asset valuation—build next-gen solutions transforming how humans buy, sell, manage, and inhabit physical and virtual spaces.",
    problemStatement: "Modern retail faces high return rates, fragmented omnichannel customer journeys, and supply chain stockouts, while real estate suffers from manual property valuations, opaque tenant matching, and inefficient building operations. How can AI, spatial computing, and automated analytics revolutionize physical commerce and property intelligence?",
    keyAreas: [
      "AI Property Discovery & Matching",
      "Demand Forecasting & Inventory Intelligence",
      "Smart Building IoT & Predictive Maintenance",
      "Phygital Shopping & AR Product Try-Ons",
      "Automated Tenant & Store Operations",
      "Omnichannel Personalization & Pricing"
    ],
  },
  {
    id: "finance",
    num: "02",
    name: "FINANCE & INVESTMENTS",
    subtitle: "Decentralized Wealth & Smart Fintech",
    accentColor: "#10b981",
    borderGlow: "hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]",
    image: "/New_images/finance.png",
    description: "Cross into automated wealth management, transparent micro-investments, fraud-prevention neural networks, and friction-free cross-border asset allocation models.",
    problemStatement: "Gen-Z and millennial investors face barriers in financial literacy and transparent asset allocation. How can tech simplify wealth creation?",
    keyAreas: ["AI Portfolio Optimization", "Micro-Savings & Fractional Investing", "Fraud Detection Neural Nets", "Decentralized Micro-Loans"],
  },
  {
    id: "health",
    num: "03",
    name: "HEALTH & WELLNESS",
    subtitle: "Biotech Signals & Preventive Care",
    accentColor: "#14b8a6",
    borderGlow: "hover:border-teal-400 hover:shadow-[0_0_35px_rgba(20,184,166,0.6)]",
    image: "/New_images/health.png",
    description: "Architect proactive mental wellbeing platforms, continuous biometric tracking algorithms, tele-health diagnostics, and customized longevity solutions.",
    problemStatement: "Healthcare remains reactive rather than preventative. How can real-time wearable telemetry and predictive AI transform personal health outcomes?",
    keyAreas: ["Predictive Diagnostic AI", "Mental Health Support Ecosystems", "Wearable Signal Analytics", "Personalized Nutrition Algorithms"],
  },
  {
    id: "travel",
    num: "04",
    name: "TRAVEL & FOOD",
    subtitle: "Autonomous Expeditions & Ghost Kitchens",
    accentColor: "#f97316",
    borderGlow: "hover:border-orange-400 hover:shadow-[0_0_35px_rgba(249,115,22,0.6)]",
    image: "/New_images/travel.png",
    description: "Innovate eco-conscious flight logistics, hyper-local food discovery networks, automated cloud kitchens, and personalized itinerary optimization engines.",
    problemStatement: "Travelers demand sustainable choices and authentic food experiences without logistical delays. How can smart mobility and foodtech deliver?",
    keyAreas: ["Sustainable Travel Optimization", "Cloud Kitchen Automation", "AI Itinerary Orchestration", "Hyper-Local Culinary Tech"],
  },
  {
    id: "sports",
    num: "05",
    name: "SPORTS & FITNESS",
    subtitle: "Kinetic Performance & Fan Immersion",
    accentColor: "#3b82f6",
    borderGlow: "hover:border-blue-400 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]",
    image: "/New_images/sports.png",
    description: "Reimagine athletic posture tracking using computer vision, fan engagement gamification, virtual stadium broadcasts, and smart fitness hardware.",
    problemStatement: "Coaching and fan participation often lack real-time biometric metrics. How can computer vision elevate athletic performance?",
    keyAreas: ["Computer Vision Biometrics", "Virtual Fan Arena Interactions", "AI Fitness Coaching", "Smart Wearable Integration"],
  },
  {
    id: "music",
    num: "06",
    name: "MUSIC & OTT",
    subtitle: "Sonic Generative Media & Streaming",
    accentColor: "#ec4899",
    borderGlow: "hover:border-pink-400 hover:shadow-[0_0_35px_rgba(236,72,153,0.6)]",
    image: "/New_images/music.png",
    description: "Build adaptive spatial audio tools, direct-to-fan creator monetization protocols, AI content recommendation engines, and interactive media streams.",
    problemStatement: "Indie content creators face royalty fragmentation while streaming audiences demand interactive storytelling. How can tech redefine media consumption?",
    keyAreas: ["Interactive Storytelling OTT", "Direct-to-Fan Creator Economy", "Spatial Audio Synthesis", "AI Content Curation"],
  },
];

// Interactive 3D Parallax & Tilt Card Component for Theme Track
function Theme3DCard({
  track,
  index,
  onClick,
}: {
  track: Track;
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 18;
    const tiltY = (centerX - x) / 18;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="perspective-1000 z-20 relative"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
            : "transform 0.5s ease-in-out, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        className={`group relative rounded-2xl p-5 sm:p-6 glass-rift cursor-pointer border border-purple-500/30 ${track.borderGlow} flex flex-col justify-between overflow-hidden transform-gpu select-none min-h-[420px] bg-black/80 z-20`}
      >
        {/* Top Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5 z-30"
          style={{ backgroundColor: track.accentColor }}
        />

        <div className="relative z-20">
          {/* Theme Card Cinematic Image Frame with 3D Parallax */}
          <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden mb-5 bg-black/90 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
            <Image
              src={track.image}
              alt={track.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`transition-transform duration-700 ease-out group-hover:scale-105 ${
                track.id === "retail"
                  ? "object-contain bg-[#05050a] p-1 object-center"
                  : "object-cover object-center"
              }`}
              priority={index < 2}
            />

            {/* Dark Cinematic Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Track Number Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/90 border border-white/20 font-mono text-[10px] uppercase tracking-widest text-cyan-300 backdrop-blur-md shadow-md z-30">
              TRACK {track.num}
            </div>

            {/* Accent Glowing Orb on Hover */}
            <div
              className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: track.accentColor }}
            />
          </div>

          {/* Track Title — Always 100% Crisp, Readable & Visible */}
          <h3
            className="text-xl sm:text-2xl font-extrabold font-mono uppercase tracking-wide group-hover:text-white transition-colors leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,1)] relative z-30"
            style={{ color: track.accentColor }}
          >
            {track.name}
          </h3>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 uppercase tracking-wider relative z-30">
            {track.subtitle}
          </p>

          <p className="text-gray-300 font-sans text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed relative z-30">
            {track.description}
          </p>
        </div>

        {/* Card Footer CTA */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-gray-400 group-hover:text-white transition-colors relative z-30">
          <span>Open World Experience</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
            style={{ borderColor: track.accentColor, color: track.accentColor }}
          >
            <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ThemesGrid() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  return (
    <section id="themes" className="relative py-28 px-4 sm:px-6 lg:px-12 bg-[#05050a] text-white overflow-hidden z-10">
      {/* Animated Video Background & Glowing Particles */}
      <VideoBackground
        variant="themes"
        webmSrc="/assets/themes-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.5}
      />

      {/* Background Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container with Lateral Padding so Sidebars Never Overlap Cards */}
      <div className="max-w-6xl mx-auto relative z-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(138,43,226,0.3)] backdrop-blur-md"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Choose Your World // 6 Specialized Tracks</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(255,46,136,0.5)]"
          >
            INNOVATION DOMAINS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-xl mx-auto text-gray-300 font-sans text-xs sm:text-base"
          >
            Select a dimensional track to reveal its specific challenge brief, domain parameters, and core innovation vectors.
          </motion.p>
        </div>

        {/* 3x2 Grid Desktop, Stacked Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TRACKS.map((track, idx) => (
            <Theme3DCard
              key={track.id}
              track={track}
              index={idx}
              onClick={() => setSelectedTrack(track)}
            />
          ))}
        </div>
      </div>

      {/* Cinematic Full-Screen Theme Experience Overlay */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-2xl"
          >
            {/* Expanded Cinematic Hero Image Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <Image
                src={selectedTrack.image}
                alt={selectedTrack.name}
                fill
                className="object-cover opacity-25 filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-black/80 to-[#05050a]/90" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-rift border border-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.35)] text-white z-10 bg-black/95"
            >
              {/* Top Banner Image Feature */}
              <div className="relative w-full h-56 sm:h-72 overflow-hidden rounded-t-3xl">
                <Image
                  src={selectedTrack.image}
                  alt={selectedTrack.name}
                  fill
                  className={
                    selectedTrack.id === "retail"
                      ? "object-contain bg-[#05050a] p-2 object-center"
                      : "object-cover object-center"
                  }
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-black/40 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 border border-white/30 text-gray-300 hover:text-white hover:border-cyan-400 transition-all z-20 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-5 right-5 flex flex-col justify-end">
                  <span
                    className="text-xs font-mono font-bold tracking-widest uppercase mb-1"
                    style={{ color: selectedTrack.accentColor }}
                  >
                    // TRACK {selectedTrack.num} WORLD BRIEF
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold font-mono uppercase text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                    {selectedTrack.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-cyan-300/90 uppercase tracking-wider mt-1">
                    {selectedTrack.subtitle}
                  </p>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="p-5 sm:p-8 space-y-5 font-sans text-xs sm:text-base text-gray-200">
                <p className="leading-relaxed text-gray-300">{selectedTrack.description}</p>

                {/* Core Problem Statement Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2 backdrop-blur-sm">
                  <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Core Innovation Problem Statement</span>
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-gray-100 leading-relaxed">{selectedTrack.problemStatement}</p>
                </div>

                {/* Key Vectors */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-3">
                    Recommended Vector Focus Areas:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTrack.keyAreas.map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-200"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="text-xs font-mono text-gray-400 hover:text-white underline"
                  >
                    Close Brief
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTrack(null);
                      const reg = document.getElementById("register");
                      if (reg) reg.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-5 sm:px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(138,43,226,0.6)]"
                  >
                    Register Squad for Track
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
