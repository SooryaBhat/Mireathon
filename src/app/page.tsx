import CustomCursor from "@/components/CustomCursor";
import Hero3D from "@/components/Hero3D";
import AboutSection from "@/components/AboutSection";
import ThemesGrid from "@/components/ThemesGrid";
import RulesTimeline from "@/components/RulesTimeline";
import RegistrationFlow from "@/components/RegistrationFlow";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#05050a] text-white overflow-hidden selection:bg-[#8a2be2] selection:text-white">
      {/* Fixed Scrolling Sponsor & Advisor Vertical Marquee Sidebars (Left & Right Viewport Edges) */}
      <SponsorSidebars />

      {/* Custom Mascot Cursor with Trail and Burst */}
      <CustomCursor />

      {/* 3D Hero Section with Volumetric 3D Portal + Rift Artwork */}
      <Hero3D />

      {/* About Mission Briefing */}
      <AboutSection />

      {/* Themes Track Portals */}
      <ThemesGrid />

      {/* Rules Timeline Objectives */}
      <RulesTimeline />

      {/* Live Supabase Team Registration System */}
      <RegistrationFlow />

      {/* Coordinators & Contact Section */}
      <CoordinatorsSection />

      {/* Event Footer */}
      <Footer />
    </main>
  );
}
