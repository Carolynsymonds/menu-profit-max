import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Check, Upload } from "lucide-react";
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 max-w-md mx-auto">
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <Upload size={20} />
            Upload Menu
          </Button>
          <Input 
            placeholder="Enter dish name..." 
            className="w-full sm:w-auto"
          />
        </div>

       
      </div>
    </section>
  );
};

export default HeadlineSection;