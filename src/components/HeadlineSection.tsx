import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Check, Upload, Sparkles, X } from "lucide-react";
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
          <p className="text-xl text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light px-0">
            Type a dish or upload your menu. Get instant suggestions to increase margins with smarter pricing, ingredient swaps, and upsell ideas.
          </p>

          {/* Input card */}
          <div className="mt-8 p-4 md:p-5">
            <div className="flex flex-col gap-3">
               <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative flex items-center">
                    {/* Search icon with sparkles - gradient */}
                    <div className="absolute left-3 flex items-center gap-1 z-10">
                      <svg width="20" height="20" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"
                           role="img" aria-label="AI search icon" className="text-primary">
                        {/* Magnifying glass (outlined circle + handle) */}
                        <circle cx="12" cy="12" r="6.5"
                                fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16.8" y1="16.8" x2="22" y2="22"
                              stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>

                        {/* Sparkles (flat, minimal) */}
                        {/* Large sparkle above/right of lens */}
                        <path d="M20.2 6.2c.45 1.35 1.35 2.25 2.7 2.7-1.35.45-2.25 1.35-2.7 2.7-.45-1.35-1.35-2.25-2.7-2.7 1.35-.45 2.25-1.35 2.7-2.7Z"
                              fill="currentColor"/>
                        {/* Small sparkle inside lens (upper-left quadrant) */}
                        <path d="M11 8.4c.28.82.86 1.4 1.68 1.68-.82.28-1.4.86-1.68 1.68-.28-.82-.86-1.4-1.68-1.68.82-.28 1.4-.86 1.68-1.68Z"
                              fill="currentColor"/>
                      </svg>
                    </div>
                    
                    <Input
                      placeholder='Chicken Parmesan'
                      className="w-full rounded-xl border-gray-300 bg-card/70 pl-10 pr-10 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                    />
                    
                  </div>
                </div>
                
                <Button
                  onClick={handleSignupClick}
                  className="rounded-xl px-6 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap"
                >
                  Generate AI Menu
                </Button>
              </div>

              {/* OR separator */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <Button
                onClick={handleSignupClick}
                className="flex items-center underline justify-center gap-2 rounded-xl px-4 py-3 !bg-white font-semibold text-primary hover:bg-primary/10 transition-all"
              >
                <Upload size={20} />
                Upload menu
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineSection;