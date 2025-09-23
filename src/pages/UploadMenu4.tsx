import Header from "@/components/Header";
import UploadMenuHeadline4 from "@/components/UploadMenuHeadline4";
import UploadMenuSection3 from "@/components/UploadMenuSection3";
import HowItWorksSection from "@/components/HowItWorksSection";
import RaveReviews from "@/components/RaveReviews";
import PricingThreeTiers from "@/components/PricingThreeTiers";
import FAQTwoColSimple from "@/components/FAQTwoColSimple";
import UploadSection from "@/components/UploadSection";
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

const UploadMenu4 = () => {
  // Initialize UTM tracking to capture parameters from URL
  useUtmTracking();
  const location = useLocation();

  // Pass reset state to HeadlineSection if navigating back for new analysis
  const shouldResetForm = location.state?.resetForm;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <UploadMenuHeadline2 />
      <div className="pt-12">
        <UploadMenuSection3 />
      </div>
      <div style={{ backgroundColor: 'rgb(245, 249, 247)' }}>
        <HowItWorksSection />
      </div>
      <div style={{ backgroundColor: 'white' }}>
        <RaveReviews />
      </div>
      <div style={{ backgroundColor: 'rgb(245, 249, 247)' }}>
        <PricingThreeTiers />
      </div>
      <FAQTwoColSimple />
      {/* <FeaturesSection /> */}
      {/* <TeamRolesSection /> */}
      
      <FeatureIntroSection />
      <SplitScreenSection />
      <HeroBanner /> 
      {/* <AllFeaturesSection /> */}
      
      <Footer />
    </div>
  );
};

export default UploadMenu4;
