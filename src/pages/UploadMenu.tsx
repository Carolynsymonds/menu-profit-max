import Header from "@/components/Header";
import UploadMenuHeadline from "@/components/UploadMenuHeadline";
import FeaturesSection from "@/components/FeaturesSection";
import TeamRolesSection from "@/components/TeamRolesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import AllFeaturesSection from "@/components/AllFeaturesSection";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const UploadMenu = () => {
  // Initialize UTM tracking to capture parameters from URL
  useUtmTracking();
  const location = useLocation();

  // Pass reset state to HeadlineSection if navigating back for new analysis
  const shouldResetForm = location.state?.resetForm;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <UploadMenuHeadline />
      <FeaturesSection />
      <TeamRolesSection />
      <FeatureIntroSection />
      <SplitScreenSection />
      <AllFeaturesSection />
      <Footer />
    </div>
  );
};

export default UploadMenu;