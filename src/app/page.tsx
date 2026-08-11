import CustomCursor from "@/components/CustomCursor";
import Hero3D from "@/components/Hero3D";
import AboutSection from "@/components/AboutSection";
import ThemesGrid from "@/components/ThemesGrid";
import RulesTimeline from "@/components/RulesTimeline";
import RegistrationFlow from "@/components/RegistrationFlow";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#05050a] text-white overflow-hidden selection:bg-[#8a2be2] selection:text-white">
      {/* Custom Mascot Cursor with Trail and Burst */}
      <CustomCursor />

      {/* 1. 3D Hero Section */}
      <Hero3D />

      {/* 2. About Mission Briefing */}
      <AboutSection />

      {/* 3. Themes Track Portals */}
      <ThemesGrid />

      {/* 4. Rules Timeline Objectives */}
      <RulesTimeline />

      {/* 5. Live Supabase Team Registration System */}
      <RegistrationFlow />

      {/* 6. Coordinators & Contact Section */}
      <CoordinatorsSection />

      {/* 7. Event Sponsors & Partners Continuous Marquee Loop Section */}
      <SponsorSidebars />

      {/* 8. Event Footer */}
      <Footer />
    </main>
  );
}
