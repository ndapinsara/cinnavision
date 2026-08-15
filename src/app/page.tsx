import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import MarketPriceTicker from "@/components/landing/MarketPriceTicker";
import RoleSelection from "@/components/landing/RoleSelection";
import DiseaseDetectionPreview from "@/components/landing/DiseaseDetectionPreview";
import MarketplacePreview from "@/components/landing/MarketplacePreview";
import AIAssistantPreview from "@/components/landing/AIAssistantPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ImpactSection from "@/components/landing/ImpactSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

const Home = async () => {
  const user = await getCurrentUserWithRole();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <MarketPriceTicker />
        <RoleSelection />
        <DiseaseDetectionPreview />
        <MarketplacePreview />
        <AIAssistantPreview />
        <HowItWorks />
        <BenefitsSection />
        <ImpactSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
