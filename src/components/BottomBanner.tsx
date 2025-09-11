import { useState, useEffect } from "react";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";
import { X } from "lucide-react";

const BottomBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { navigateWithUtm } = useUtmTracking();

  useEffect(() => {
    const dismissed = localStorage.getItem("bottom-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);
  
  const handleSignupClick = () => {
    try {
      // GA4 recommended event
       window.gtag?.('event', 'sign_up', {
        method: 'bottom_banner',
        button_id: 'bottom-banner-signup',
        button_text: siteContent.bottomBanner.buttonText,
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };

  const handleDismiss = () => {
    localStorage.setItem("bottom-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-t border-primary/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-sm text-primary-foreground font-medium">
              {siteContent.bottomBanner.text}
            </span>
            <button 
              onClick={handleSignupClick}
              className="text-sm bg-background text-primary px-3 py-1.5 rounded-md hover:bg-background/90 transition-colors font-medium whitespace-nowrap"
            >
              {siteContent.bottomBanner.buttonText}
              <span className="hidden sm:inline text-xs ml-1 opacity-80">
                — {siteContent.bottomBanner.buttonTextLight}
              </span>
            </button>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomBanner;