import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Check, Upload, Search, Sparkles, X } from "lucide-react";
import { siteContent } from "@/config/site-content";
import BenefitsSection from "@/components/BenefitsSection";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const HeadlineSection = () => {
  const { navigateWithUtm } = useUtmTracking();
  
  const handleSignupClick = () => {
    try {
      window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Start Free Trial',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }
    navigateWithUtm('/signup');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-radial from-primary/30 to-transparent" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full blur-3xl opacity-40 bg-gradient-radial from-secondary/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16 text-center">
        <div className="animate-fade-in grid gap-3 mt-[49px]">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-[-0.02em] text-foreground">
             Profitize Your Menu Now
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your menu or type a dish and get instant insights on costs, pricing, and margins — in seconds.
          </p>

          {/* Input card */}
          <div className="mt-8 rounded-2xl p-4 md:p-5 backdrop-blur bg-card/70 ring-1 ring-border/50 shadow-sm">
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSignupClick}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Upload size={20} />
                Upload menu now
              </Button>

              {/* OR separator */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground font-medium">OR type a dish</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="relative flex-1">
                <div className="relative flex items-center">
                  {/* Search icon with sparkles - gradient */}
                  <div className="absolute left-3 flex items-center gap-1 z-10">
                    <Search size={18} className="text-blue-600" />
                    <Sparkles size={14} className="text-purple-600" />
                  </div>
                  
                  <Input
                    placeholder='e.g., "Chicken Parmesan"'
                    className="w-full rounded-xl border border-primary/20 bg-card/70 pl-14 pr-10 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                  />
                  
                  {/* Clear button */}
                  <button 
                    className="absolute right-3 w-5 h-5 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition-colors z-10"
                    onClick={() => {/* Clear input logic */}}
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check size={16} className="text-green-600" />
                Free
              </span>
              <span className="flex items-center gap-1">
                <Check size={16} className="text-green-600" />
                No credit card
              </span>
              <span className="flex items-center gap-1">
                <Check size={16} className="text-green-600" />
                PDF / Photo / CSV
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineSection;