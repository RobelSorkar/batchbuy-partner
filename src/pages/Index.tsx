import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RolesSection from "@/components/RolesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="features"><FeaturesSection /></div>
      <div id="how-it-works"><HowItWorksSection /></div>
      <div id="roles"><RolesSection /></div>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
