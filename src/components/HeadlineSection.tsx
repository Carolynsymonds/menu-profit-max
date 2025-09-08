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
        <div className="space-y-6 mt-32 sm:mt-32">
          <h1 className="text-[42px] md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
            Profitize Your Menu Now
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full sm:w-auto px-6 py-3 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 rounded-lg font-medium"
            >
              <Upload size={20} className="text-primary" />
              Upload Menu
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block w-px h-8 bg-border"></div>
              <span className="text-muted-foreground font-medium text-sm px-3 py-1 bg-muted/50 rounded-full">
                OR
              </span>
              <div className="hidden sm:block w-px h-8 bg-border"></div>
            </div>
            
            <Input 
              placeholder="Enter dish name..." 
              className="w-full sm:w-auto min-w-[200px] px-4 py-3 border-2 border-primary/20 focus:border-primary/60 rounded-lg font-medium placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

       
      </div>
    </section>
  );
};

export default HeadlineSection;