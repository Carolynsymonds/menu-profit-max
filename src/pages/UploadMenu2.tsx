import Header from "@/components/Header";
import UploadMenuHeadline2 from "@/components/UploadMenuHeadline2";
import UploadMenuSection from "@/components/UploadMenuSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RaveReviews from "@/components/RaveReviews";
import PricingThreeTiers from "@/components/PricingThreeTiers";
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
import FAQTwoColSimple from "@/components/FAQTwoColSimple";

const UploadMenu2 = () => {
  // Initialize UTM tracking to capture parameters from URL
  useUtmTracking();
  const location = useLocation();
  
  // Initialize GA tracking for this page
  const { trackButtonClick, trackFileUpload, trackScroll } = useGATracking('Upload Menu V1');

  // Pass reset state to HeadlineSection if navigating back for new analysis
  const shouldResetForm = location.state?.resetForm;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <UploadMenuHeadline2 onButtonClick={trackButtonClick} />
      <UploadMenuSection />
      <HowItWorksSection />
      <div style={{ backgroundColor: 'rgb(245, 249, 247)' }}>
        <RaveReviews />
      </div>

      <PricingThreeTiers />
      <div style={{ backgroundColor: 'rgb(245, 249, 247)' }}>
        <FAQTwoColSimple />
      </div>
      <HeroBanner />
      
      {/* <FeaturesSection /> */}
      {/* <TeamRolesSection /> */}
      <FeatureIntroSection />
      <SplitScreenSection />
      {/* <AllFeaturesSection /> */}
     
      <Footer />
    </div>
  );
};

export default UploadMenu2;
