import Header from "@/components/Header";
import UploadMenuHeadline2 from "@/components/UploadMenuHeadline2";
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
import { useGATracking } from "@/hooks/useGATracking";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const UploadMenu3 = () => {
  // Initialize UTM tracking to capture parameters from URL
  useUtmTracking();
  const location = useLocation();
  
  // Initialize GA tracking for this page
  const { trackButtonClick, trackFileUpload, trackScroll } = useGATracking('Upload Menu V2');

  // Pass reset state to HeadlineSection if navigating back for new analysis
  const shouldResetForm = location.state?.resetForm;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      {/* <UploadMenuHeadline2 /> */}
      <div className="pt-6">
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

export default UploadMenu3;
