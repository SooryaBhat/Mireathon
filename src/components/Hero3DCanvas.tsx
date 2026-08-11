"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sparkles, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

// 3D Moving Sci-Fi City Mesh Plane with Interactive Parallax & Wave Motion
function MovingHero3DPlane({
  mouse,
  isLightning,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isLightning: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vortexRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/New_images/hero_section1.png");

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    if (meshRef.current) {
      // Dynamic 3D interactive camera tilt + wave rotation motion
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        mouse.current.x * 0.12 + Math.sin(elapsed * 0.4) * 0.03,
        0.05
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        -mouse.current.y * 0.08 + Math.cos(elapsed * 0.5) * 0.02,
        0.05
      );
      // Dynamic 3D floating movement
      meshRef.current.position.y = Math.sin(elapsed * 0.6) * 0.1;
    }

    if (vortexRef.current) {
      vortexRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <group>
      {/* 3D Moving Hero Image Mesh (100% Bright, Vivid, and Clear Artwork) */}
      <mesh ref={meshRef} position={[0, 0, -1.2]}>
        <planeGeometry args={[18.0, 11.5, 32, 32]} />
        <meshBasicMaterial
          map={texture}
          transparent={false}
          toneMapped={false}
        />
      </mesh>

      {/* Rotating Sky Vortex Energy Ring */}
      <mesh ref={vortexRef} position={[0.5, 2.2, -0.8]}>
        <torusGeometry args={[3.2, 0.15, 24, 90]} />
        <MeshWobbleMaterial
          color="#a855f7"
          emissive={isLightning ? "#ff2e88" : "#8a2be2"}
          emissiveIntensity={isLightning ? 4.5 : 2.2}
          factor={0.4}
          speed={2}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Independent Sci-Fi Drones flying through the 3D Moving Environment
function AutonomousDroneFleet({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const heroDroneRef = useRef<THREE.Group>(null);
  const distantDrone1Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (heroDroneRef.current) {
      const cycle = (elapsed * 0.08) % 1;
      const zPos = THREE.MathUtils.lerp(-4.5, 3.2, cycle);
      const xPos = THREE.MathUtils.lerp(-2.8, 3.8, cycle) + Math.sin(elapsed * 0.8) * 0.4;
      const yPos = THREE.MathUtils.lerp(1.2, -1.5, cycle) + Math.cos(elapsed * 0.6) * 0.2;

      heroDroneRef.current.position.set(xPos, yPos, zPos);
      heroDroneRef.current.rotation.z = Math.sin(elapsed * 1.2) * 0.1;
      const scale = THREE.MathUtils.lerp(0.3, 1.2, cycle);
      heroDroneRef.current.scale.set(scale, scale, scale);
    }

    if (distantDrone1Ref.current) {
      const cycle1 = ((elapsed * 0.05) % 1);
      distantDrone1Ref.current.position.x = THREE.MathUtils.lerp(-7, 7, cycle1);
      distantDrone1Ref.current.position.y = 1.8 + Math.sin(elapsed * 0.5) * 0.3;
    }
  });

  return (
    <group>
      <group ref={heroDroneRef} position={[-2, 0, -3]}>
        <mesh>
          <boxGeometry args={[0.7, 0.15, 0.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.28]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={4} />
        </mesh>
        <pointLight color="#22d3ee" intensity={1.8} distance={3} />
      </group>

      <group ref={distantDrone1Ref} position={[-5, 2, -2.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} wireframe />
        </mesh>
        <pointLight color="#38bdf8" intensity={1.2} distance={2} />
      </group>
    </group>
  );
}

// 3D Particles & Atmospheric Accents
function AtmosphereParticles() {
  return (
    <group>
      <Sparkles count={100} scale={[12, 8, 8]} size={3.8} speed={1.1} color="#22d3ee" />
      <Sparkles count={70} scale={[10, 7, 7]} size={4.5} speed={1.5} color="#ff2e88" />
    </group>
  );
}

export default function Hero3DCanvas() {
  const mouse = useRef({ x: 0, y: 0 });
  const [isLightning, setIsLightning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLightning(true);
      setTimeout(() => setIsLightning(false), 380);
    }, 7500);
    return () => clearInterval(interval);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    const { innerWidth, innerHeight } = window;
    mouse.current.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / innerHeight) * 2 + 1;
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="absolute inset-0 w-full h-full pointer-events-auto select-none"
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <pointLight
          position={[0, 3, 2]}
          intensity={isLightning ? 4.5 : 1.5}
          color={isLightning ? "#a855f7" : "#22d3ee"}
        />

        <React.Suspense fallback={null}>
          <MovingHero3DPlane mouse={mouse} isLightning={isLightning} />
        </React.Suspense>
        <AutonomousDroneFleet mouse={mouse} />
        <AtmosphereParticles />
      </Canvas>
    </div>
  );
}
