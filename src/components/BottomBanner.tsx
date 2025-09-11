import { useState, useEffect } from "react";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";
import { VerificationModal } from "./VerificationModal";

const BottomBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { navigateWithUtm } = useUtmTracking();

  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleDownloadClick = () => {
    try {
      // GA4 recommended event
       window.gtag?.('event', 'generate_lead', {
        method: 'bottom_banner',
        button_id: 'bottom-banner-download',
        button_text: siteContent.bottomBanner.buttonText,
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    setShowVerificationModal(true);
  };


  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-3 gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadClick}
                className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
              >
                {siteContent.bottomBanner.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        dishesData={[]}
        purpose="download-report"
      />
    </>
  );
};

export default BottomBanner;