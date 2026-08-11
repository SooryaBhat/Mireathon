"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundEngine } from "@/utils/audio";

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    if (soundEngine) {
      const active = soundEngine.toggleAmbientHum();
      setIsPlaying(active);
      if (active) {
        soundEngine.playClickSound();
      }
    }
  };

  const handleMouseEnter = () => {
    if (soundEngine) {
      soundEngine.playHoverSound();
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      aria-label="Toggle Portal Audio Hum"
      title={isPlaying ? "Mute Ambient Portal Hum" : "Unmute Ambient Portal Hum"}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full border transition-all duration-300 flex items-center justify-center gap-2 group backdrop-blur-xl ${
        isPlaying
          ? "bg-purple-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6)]"
          : "bg-black/70 border-purple-500/40 text-gray-400 hover:text-white hover:border-purple-400 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      }`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-cyan-300 pr-1">
            HUM: ON
          </span>
          {/* Animated Audio Equalizer Bars */}
          <div className="flex items-end gap-0.5 h-3 pr-1">
            <span className="w-0.5 bg-cyan-400 h-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-0.5 bg-pink-400 h-2/3 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.5 bg-purple-400 h-4/5 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </>
      ) : (
        <>
          <VolumeX className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors pr-1">
            HUM: OFF
          </span>
        </>
      )}
    </button>
  );
}
