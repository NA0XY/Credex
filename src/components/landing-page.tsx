import { AboutSection } from "@/components/landing/about-section";
import { FeaturedVideoSection } from "@/components/landing/featured-video-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PhilosophySection } from "@/components/landing/philosophy-section";
import { ServicesSection } from "@/components/landing/services-section";

export function LandingPage() {
  return (
    <main className="bg-black text-white">
      <HeroSection />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </main>
  );
}
