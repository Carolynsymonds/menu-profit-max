import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { siteContent } from "@/config/site-content";
import BenefitsSection from "@/components/BenefitsSection";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const HeadlineSection = () => {
  const { navigateWithUtm } = useUtmTracking();
   const handleSignupClick = () => {
    try {
      // GA4 recommended event
       window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Start Free Trial',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };
  return (
    <section className="min-h-[80vh] bg-white flex items-center justify-center px-5 md:px-[125px] py-5">
      <div className="max-w-4xl mx-auto text-center flex flex-col md:space-y-8 animate-fade-in">
        <div className="space-y-6 mt-32 sm:mt-32 order-1">
          <h1 className="text-[42px] md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
            Profitize Your Menu Now
          </h1>
        </div>

       
      </div>
    </section>
  );
};

export default HeadlineSection;