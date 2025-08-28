import { useState } from "react";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { navigateWithUtm } = useUtmTracking();

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-muted border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-3">
          <div className="text-center">
            <span className="text-sm text-foreground">
              {siteContent.topBanner.text}
            </span>
            <button 
              onClick={() => navigateWithUtm('/signup')}
              className="ml-2 text-sm underline hover:text-primary transition-colors"
            >
              {siteContent.topBanner.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;