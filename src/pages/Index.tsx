import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveActivityTicker from "@/components/LiveActivityTicker";
import TrustSection from "@/components/TrustSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProjectsPreview from "@/components/ProjectsPreview";
import SalesChannelsSection from "@/components/SalesChannelsSection";
import RolesSection from "@/components/RolesSection";
import HomeProfitCalculator from "@/components/HomeProfitCalculator";
import TransparencySection from "@/components/TransparencySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LiveActivityTicker />
      <TrustSection />
      <div id="how-it-works"><HowItWorksSection /></div>
      <div id="projects"><ProjectsPreview /></div>
      <div id="features"><SalesChannelsSection /></div>
      <div id="roles"><RolesSection /></div>
      <HomeProfitCalculator />
      <TransparencySection />
      <CTASection />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
