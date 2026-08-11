"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  time: number;
}

interface BurstRing {
  id: number;
  x: number;
  y: number;
  size: number;
  maxSize: number;
  opacity: number;
  color: string;
}

export default function CustomCursor() {
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [bursts, setBursts] = useState<BurstRing[]>([]);
  const [scrolling, setScrolling] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    // Detect touch device / mobile screen
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      setScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setScrolling(false), 300);
    };
    window.addEventListener("scroll", handleScroll);

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      // Add point for particle light trail
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1,
        time: Date.now(),
      });

      // Check hover interactive elements
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("interactive"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const colors = ["#8a2be2", "#22d3ee", "#ff2e88"];
      const newBursts: BurstRing[] = colors.map((color, idx) => ({
        id: Date.now() + idx,
        x: e.clientX,
        y: e.clientY,
        size: 10 + idx * 8,
        maxSize: 120 + idx * 40,
        opacity: 0.9,
        color,
      }));

      setBursts((prev) => [...prev, ...newBursts]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // Canvas Trail Renderer Loop
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      const trail = trailRef.current;

      // Filter out points older than ~300ms
      trailRef.current = trail.filter((pt) => now - pt.time < 300);

      // Draw light trail
      if (trailRef.current.length > 1) {
        for (let i = 1; i < trailRef.current.length; i++) {
          const pt1 = trailRef.current[i - 1];
          const pt2 = trailRef.current[i];
          const age = now - pt2.time;
          const alpha = Math.max(0, 1 - age / 300);

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);

          // Gradient color stroke
          const gradient = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
          gradient.addColorStop(0, `rgba(138, 43, 226, ${alpha * 0.8})`);
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${alpha * 0.9})`);
          gradient.addColorStop(1, `rgba(255, 46, 136, ${alpha * 0.7})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(1, 4 * alpha);
          ctx.lineCap = "round";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#22d3ee";
          ctx.stroke();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [isMobile]);

  // Burst animation updater
  useEffect(() => {
    if (bursts.length === 0) return;

    const interval = setInterval(() => {
      setBursts((prev) =>
        prev
          .map((b) => ({
            ...b,
            size: b.size + (b.maxSize - b.size) * 0.15,
            opacity: b.opacity * 0.85,
          }))
          .filter((b) => b.opacity > 0.05)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [bursts]);

  // Mobile companion float widget
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-30 pointer-events-none flex items-center gap-2 select-none">
        <motion.div
          animate={scrolling ? { y: [0, -6, 0], scale: 1.1 } : { y: [0, -3, 0] }}
          transition={{ duration: scrolling ? 0.4 : 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-black p-0.5 relative">
            <Image
              src="/New_images/character.png"
              alt="Miraethon Mobile Companion"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          {scrolling && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Light Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
      />

      {/* Radial Energy Bursts on Click */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="pointer-events-none fixed rounded-full z-[9999] border-2"
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            transform: "translate(-50%, -50%)",
            borderColor: b.color,
            boxShadow: `0 0 20px ${b.color}, inset 0 0 10px ${b.color}`,
            opacity: b.opacity,
          }}
        />
      ))}

      {/* Mascot Cursor Icon */}
      <div
        className={`pointer-events-none fixed z-[10000] transition-transform duration-100 ease-out flex items-center justify-center ${
          isHovered ? "scale-125" : "scale-100"
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Glow Ring behind mascot */}
        <div
          className={`absolute rounded-full transition-all duration-300 ${
            isHovered
              ? "w-10 h-10 bg-cyan-400/40 blur-md animate-pulse"
              : "w-8 h-8 bg-purple-600/30 blur-sm"
          }`}
        />

        {/* Mascot Avatar */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.8)] bg-black/90 p-0.5">
          <Image
            src="/New_images/character.png"
            alt="Miraethon Mascot Cursor"
            width={36}
            height={36}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </>
  );
}
