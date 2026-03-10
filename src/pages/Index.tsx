import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import BatchesPreview from "@/components/BatchesPreview";
import SalesChannelsSection from "@/components/SalesChannelsSection";
import RolesSection from "@/components/RolesSection";

import TransparencySection from "@/components/TransparencySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <div id="how-it-works"><HowItWorksSection /></div>
      <BatchesPreview />
      <div id="features"><SalesChannelsSection /></div>
      <div id="roles"><RolesSection /></div>
      <ProfitCalculator />
      <TransparencySection />
      <CTASection />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
