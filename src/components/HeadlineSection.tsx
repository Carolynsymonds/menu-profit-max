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
            Price Smarter. Profit Faster.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your menu and get instant insights on costs, pricing, and margins — in minutes.
          </p>

          {/* Input card */}
          <div className="mt-8 p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                onClick={handleSignupClick}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Upload size={20} />
                Analyze My Menu
              </Button>

              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 px-2 text-xs bg-card/70 text-muted-foreground">Or type a dish</label>
                <Input
                  placeholder='e.g., "Chicken Parmesan"'
                  className="w-full rounded-xl border border-primary/20 bg-card/70 px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                />
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