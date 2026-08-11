"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Filter,
  Flame,
  Award,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import VideoBackground from "./VideoBackground";

interface RuleObjective {
  num: string;
  title: string;
  badge?: string;
  shortDesc: string;
  icon: React.ReactNode;
  accent: string;
  details: string[];
}

const OBJECTIVES: RuleObjective[] = [
  {
    num: "OBJECTIVE 01",
    title: "Squad Formation & Team Size",
    shortDesc: "Assemble your squad of 2 to 4 registered college students.",
    icon: <Users className="w-5 h-5 text-cyan-400" />,
    accent: "#22d3ee",
    details: [
      "Each team must consist of 2 to 4 registered college students.",
      "Cross-departmental and inter-college team formations are encouraged.",
      "One member must be designated as the Team Leader for primary official communications.",
      "No student can be a member of more than one team.",
    ],
  },
  {
    num: "OBJECTIVE 02",
    title: "Preliminary Presentation — Round 1",
    shortDesc: "Submit your business innovation pitch presentation for Round 1.",
    icon: <FileText className="w-5 h-5 text-amber-400" />,
    accent: "#f59e0b",
    details: [
      "Submit your business innovation pitch presentation for Round 1.",
      "Clearly articulate the real-world problem statement and target customer pain points.",
      "Present your proposed business solution, innovation model, and tech/AI integration.",
      "Demonstrate market relevance, feasibility, and commercial viability.",
    ],
  },
  {
    num: "OBJECTIVE 03",
    title: "Track Shortlisting & Evaluation",
    shortDesc: "Evaluation by the judging panel across the 6 domain tracks.",
    icon: <Filter className="w-5 h-5 text-purple-400" />,
    accent: "#8a2be2",
    details: [
      "Submissions will be evaluated by the judging panel across the six hackathon tracks.",
      "Evaluated on Innovation, Business Relevance, Technical Feasibility, and Presentation Impact.",
      "The strongest teams across all domain tracks will be shortlisted for the next stage.",
      "Tracks: 01 Retail & Real Estate, 02 Finance & Investments, 03 Health & Wellness, 04 Travel & Food, 05 Sports & Fitness, 06 Music & OTT.",
    ],
  },
  {
    num: "OBJECTIVE 04",
    title: "12-Team Mini Hackathon Arena",
    badge: "4-HOUR LIVE BUILD",
    shortDesc: "Top 12 shortlisted teams advance to the live 4-hour hackathon stage.",
    icon: <Flame className="w-5 h-5 text-pink-400" />,
    accent: "#ff2e88",
    details: [
      "The top 12 shortlisted teams advance to the live hackathon stage.",
      "4-HOUR LIVE BUILD: Teams will develop their working solution/prototype during the four-hour hackathon.",
      "Mentors will be available during the 4-hour build to assist finalist squads.",
      "Teams must prepare a functional prototype, MVP, or working software/business simulation model.",
    ],
  },
  {
    num: "OBJECTIVE 05",
    title: "Round 2 — Final Pitch & Jury Demo",
    badge: "FINAL PITCH + PROTOTYPE DEMO",
    shortDesc: "Present your working solution live to the Grand Jury.",
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    accent: "#10b981",
    details: [
      "After the 4-hour build phase, shortlisted teams present their working solution/prototype to the Grand Jury.",
      "Live presentation including final pitch, product/prototype demonstration, and solution explanation.",
      "Clear defense of business relevance and technical implementation during the jury Q&A.",
    ],
  },
  {
    num: "OBJECTIVE 06",
    title: "Code of Conduct & Final Decorum",
    shortDesc: "Professional decorum and binding jury authority.",
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    accent: "#ef4444",
    details: [
      "Participants are expected to maintain professional conduct throughout the event.",
      "Professional dress code is expected during the final presentation.",
      "Participants must follow instructions from the organizing and judging teams.",
      "The decision of the jury will be binding and final.",
    ],
  },
];

export default function RulesTimeline() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section id="rules" className="relative py-28 px-4 sm:px-6 bg-[#05050a] text-white overflow-hidden max-w-full">
      {/* Animated Video Background */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/themes-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.55}
      />

      {/* Ambient Glows */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(255,46,136,0.3)] backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>HACKATHON GUIDELINES // PROTOCOLS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-pink-500 drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]"
          >
            MISSION OBJECTIVES
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-lg mx-auto text-gray-300 font-sans text-xs sm:text-base px-2"
          >
            Follow the operational protocols carefully. Clear each objective to advance through Round 1 and the 4-Hour Live Build.
          </motion.p>
        </div>

        {/* Desktop: Vertical Glowing Timeline / Mobile: Clean Full-Width Accordion Cards */}
        <div className="relative space-y-4 sm:space-y-6 sm:border-l-2 sm:border-purple-500/30 sm:ml-6 sm:pl-8">
          {OBJECTIVES.map((obj, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <motion.div
                key={obj.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative w-full"
              >
                {/* Desktop Node Bullet */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="hidden sm:flex absolute -left-[45px] top-5 w-8 h-8 rounded-full border-2 bg-black items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(138,43,226,0.6)] hover:scale-110 transition-transform z-10"
                  style={{ borderColor: obj.accent }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: obj.accent }}
                  />
                </div>

                {/* Card Container */}
                <div
                  className={`rounded-2xl glass-rift border transition-all duration-300 overflow-hidden w-full ${
                    isExpanded
                      ? "border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.25)] bg-black/80"
                      : "border-purple-500/30 hover:border-purple-400/50 bg-black/60"
                  }`}
                >
                  {/* Card Title Header */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="p-4 sm:p-6 flex items-center justify-between cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className="p-2 sm:p-2.5 rounded-xl bg-black/80 border shrink-0"
                        style={{ borderColor: `${obj.accent}50` }}
                      >
                        {obj.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase"
                            style={{ color: obj.accent }}
                          >
                            {obj.num}
                          </span>
                          {obj.badge && (
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/40 flex items-center gap-1 shadow-[0_0_10px_rgba(255,46,136,0.4)]">
                              <Clock className="w-3 h-3 text-pink-400" />
                              {obj.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-xl font-bold font-mono uppercase text-white mt-0.5 truncate">
                          {obj.title}
                        </h3>
                        <p className="text-xs text-gray-300 font-sans mt-0.5 line-clamp-1">
                          {obj.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="text-cyan-400 shrink-0">
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isExpanded ? "rotate-180 text-pink-400" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details Accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 sm:px-6 pb-5 pt-2 border-t border-white/10 space-y-3 font-sans text-xs sm:text-sm text-gray-200 bg-black/40"
                      >
                        {obj.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2.5">
                            <CheckCircle2
                              className="w-4 h-4 mt-0.5 shrink-0"
                              style={{ color: obj.accent }}
                            />
                            <span className="leading-relaxed">{detail}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
