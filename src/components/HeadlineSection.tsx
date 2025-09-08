import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Check, Upload, Sparkles, X, Loader2 } from "lucide-react";
import { siteContent } from "@/config/site-content";
import BenefitsSection from "@/components/BenefitsSection";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const HeadlineSection = () => {
  const { navigateWithUtm } = useUtmTracking();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dishName, setDishName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const loadingMessages = [
    "Finding highest margin recipes",
    "Evaluating competitor menus", 
    "Finding highest margin upsells"
  ];
  
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, loadingMessages.length]);

  const handleAnalyzeDish = async () => {
    if (!dishName.trim()) {
      toast({
        title: "Please enter a dish name",
        description: "Type in a dish to analyze its profitability",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dish', {
        body: { dishName: dishName.trim() }
      });

      if (error) throw error;

      // Navigate to results page with analysis data
      navigate('/dish-analysis-results', {
        state: { analysisData: data }
      });
      
      // Track analysis event
      try {
        window.gtag?.('event', 'dish_analysis', {
          dish_name: dishName,
          page_location: window.location.href,
        });
      } catch (e) {
        // no-op if gtag not available
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your dish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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

          {/* Input card with overlay */}
          <div className="mt-8 p-4 md:p-5 relative">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative flex items-center">
                    {/* Search icon with sparkles - gradient */}
                    <div className="absolute left-3 flex items-center gap-1 z-10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI search icon">
                        <path d="M16.296 2.043c.407 1.817 1.284 2.716 3.317 3.089.14 0 .255.104.255.233s-.114.233-.255.233c-1.982.373-2.909 1.218-3.315 3.081a.246.246 0 0 1-.243.18.245.245 0 0 1-.245-.191c-.407-1.818-1.28-2.697-3.313-3.07-.14 0-.254-.104-.254-.233s.114-.233.254-.233c1.982-.373 2.91-1.223 3.317-3.087a.247.247 0 0 1 .241-.175c.117 0 .212.074.241.173Z" fill="url(#_3085173834__a)"></path>
                        <path d="M15.094 17.436A7.5 7.5 0 1 1 10 4.046v1.503A6 6 0 1 0 16.446 11h1.504a7.466 7.466 0 0 1-1.46 5.003l4.25 4.25a1 1 0 0 1-1.414 1.414l-4.232-4.231Z" fill="url(#_3085173834__b)"></path>
                        <path d="M13.666 8.964c-.857-.236-1.356-.615-1.527-1.4 0-.095-.084-.172-.187-.172s-.187.077-.187.171c-.257.786-.67 1.244-1.528 1.401-.103 0-.187.077-.187.171 0 .095.084.172.187.172.857.235 1.357.614 1.528 1.4 0 .095.084.171.187.171s.187-.076.187-.171c.257-.786.67-1.243 1.527-1.4.104 0 .187-.077.187-.172 0-.094-.083-.171-.187-.171Z" fill="url(#_3085173834__c)"></path>
                        <defs>
                          <linearGradient id="_3085173834__a" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="0.8"></stop>
                            <stop offset="0.3" stopColor="hsl(var(--primary))" stopOpacity="1"></stop>
                            <stop offset="0.7" stopColor="hsl(var(--primary))" stopOpacity="0.6"></stop>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.9"></stop>
                          </linearGradient>
                          <linearGradient id="_3085173834__b" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="1"></stop>
                            <stop offset="0.25" stopColor="hsl(var(--primary))" stopOpacity="0.7"></stop>
                            <stop offset="0.6" stopColor="hsl(var(--primary))" stopOpacity="0.9"></stop>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.8"></stop>
                          </linearGradient>
                          <linearGradient id="_3085173834__c" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="0.9"></stop>
                            <stop offset="0.4" stopColor="hsl(var(--primary))" stopOpacity="0.6"></stop>
                            <stop offset="0.8" stopColor="hsl(var(--primary))" stopOpacity="1"></stop>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.7"></stop>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    <Input
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyzeDish()}
                      placeholder='Chicken Parmesan'
                      disabled={isAnalyzing}
                      className="w-full rounded-xl border-gray-300 bg-card/70 pl-10 pr-10 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleAnalyzeDish}
                  disabled={isAnalyzing}
                  className="rounded-xl px-6 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap"
                >
                  Boost My Profits
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
                disabled={isAnalyzing}
                className="flex items-center underline justify-center gap-2 rounded-xl px-4 py-3 !bg-white font-semibold text-primary hover:bg-primary/10 transition-all"
              >
                <Upload size={20} />
                Upload menu
              </Button>
            </div>

            {/* Loading overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/80 rounded-xl flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-6">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing your dish...</h3>
                    <p className="text-base text-muted-foreground animate-pulse">
                      {loadingMessages[loadingMessageIndex]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineSection;