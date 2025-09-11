import { useState, useEffect } from "react";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";
import { X } from "lucide-react";
import { VerificationModal } from "./VerificationModal";

const BottomBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { navigateWithUtm } = useUtmTracking();

  useEffect(() => {
    const dismissed = localStorage.getItem("bottom-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
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

  const handleDismiss = () => {
    localStorage.setItem("bottom-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex-1 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-800 font-medium">
                {siteContent.bottomBanner.text}
              </span>
              <button 
                onClick={handleDownloadClick}
                className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
              >
                {siteContent.bottomBanner.buttonText}
                <span className="hidden sm:inline text-xs ml-1 opacity-90">
                  — {siteContent.bottomBanner.buttonTextLight}
                </span>
              </button>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
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