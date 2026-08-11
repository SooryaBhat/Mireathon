"use client";

import React, { useRef, useEffect, useState } from "react";

interface VideoBackgroundProps {
  variant?: "hero" | "themes";
  webmSrc?: string;
  mp4Src?: string;
  posterSrc?: string;
  overlayOpacity?: number;
}

export default function VideoBackground({
  variant = "hero",
  webmSrc = "/assets/rift-loop.webm",
  mp4Src = "/assets/rift-loop.mp4",
  posterSrc = "/assets/rift-bg.png",
  overlayOpacity = 0.45,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLowPower, setIsLowPower] = useState(false);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // IntersectionObserver to pause video when offscreen
  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsLowPower(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsOffscreen(false);
            if (videoRef.current && !isLowPower) {
              videoRef.current.play().catch(() => {
                // Autoplay policy fallback
              });
            }
          } else {
            setIsOffscreen(true);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isLowPower]);

  // High performance procedural canvas fallback / supplement for drifting fog, neon light pulses & cracked rift energy
  useEffect(() => {
    if (isLowPower || isOffscreen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes for fog and glowing rift embers
    const particleCount = variant === "hero" ? 40 : 25;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2, // Slow upward drift
      radius: Math.random() * 2.5 + 1,
      color:
        variant === "hero"
          ? Math.random() > 0.4
            ? "rgba(34, 211, 238, " // Cyan
            : "rgba(168, 85, 247, " // Purple
          : Math.random() > 0.5
          ? "rgba(255, 46, 136, " // Pink
          : "rgba(245, 158, 11, ", // Amber
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw faint pulsing cracked rift energy lines
      ctx.save();
      ctx.strokeStyle = variant === "hero" ? "rgba(138, 43, 226, 0.15)" : "rgba(236, 72, 153, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const riftY = height * 0.5 + Math.sin(time) * 15;
      ctx.moveTo(0, riftY);
      ctx.quadraticCurveTo(width * 0.25, riftY - 40, width * 0.5, riftY + 20);
      ctx.quadraticCurveTo(width * 0.75, riftY + 60, width, riftY - 10);
      ctx.stroke();
      ctx.restore();

      // Render drifting particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(time * p.pulseSpeed * 10) * 0.01;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = Math.max(0.1, Math.min(0.8, p.alpha));

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `${p.color}${currentAlpha})`);
        gradient.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, isLowPower, isOffscreen]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Reduced motion static poster frame or video background */}
      {isLowPower ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 mix-blend-screen ${
            videoLoaded ? "opacity-60" : "opacity-30"
          }`}
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}

      {/* Procedural Canvas Motion Layer (Drifting Fog & Neon Particle Glows) */}
      {!isLowPower && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70"
        />
      )}

      {/* Subtle Dark Vignette & Color Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#05050a]/40 via-transparent to-[#05050a]/80"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
