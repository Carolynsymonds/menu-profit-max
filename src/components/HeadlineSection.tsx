import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const HeadlineSection = () => {
  const { navigateWithUtm } = useUtmTracking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dishName, setDishName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const brandLogos = [
    { 
      src: "/lovable-uploads/9efe8d5f-1e81-42b0-8803-d420694c0d6d.png", 
      alt: "Papa John's",
      className: "h-4"
    },
    { 
      src: "/lovable-uploads/ec3ab3f1-fac3-42f8-80b5-c88c5a6ca92f.png", 
      alt: "Chipotle Mexican Grill",
      className: "h-8"
    },
    { 
      src: "/lovable-uploads/2e57f3ae-6eeb-4f88-8a90-a459f7dc5c67.png", 
      alt: "Chick-fil-A",
      className: "h-8"
    },
    { 
      src: "/lovable-uploads/8881ee5b-e5b5-4950-a384-bf791c2cb69a.png", 
      alt: "Applebee's",
      className: "[height:3.25rem]"
    }
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

  const handleAnalyzeDish = async () => {
    if (!dishName.trim()) {
      toast({
        title: "Please enter a dish name",
        description: "Enter a dish name to get profit optimization strategies.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dish', {
        body: {
          dishName: dishName.trim(),
          analysisType: 'pricing-comparison'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No analysis data received');
      }

      console.log('Analysis response:', data);

      // Navigate to results page with pricing comparison data
      navigate('/dish-analysis-results', {
        state: {
          pricingComparison: data.data,
          analysisType: 'pricing-comparison'
        }
      });

    } catch (error) {
      console.error('Error analyzing dish:', error);
      toast({
        title: "Analysis Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  <div className="relative">
                    {/* Search icon with sparkles - gradient */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 z-10">
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
                      placeholder="Enter a dish name (e.g., Margherita Pizza)"
                      className="pl-12 pr-4 py-3 text-base border-2 border-input bg-background rounded-xl focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleAnalyzeDish}
                  disabled={isLoading}
                  className="rounded-xl px-6 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap disabled:opacity-50"
                >
                  {isLoading ? "Analyzing..." : "Get My Profit Report"}
                </Button>
              </div>

            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/80 rounded-xl flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-6">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing your dish...</h3>
                    <p className="text-base text-muted-foreground animate-pulse">Evaluating competitor menus</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Brand logos section */}
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
              {brandLogos.map((brand, index) => (
                <div key={index} className="flex items-center justify-center">
                  <img 
                    src={brand.src} 
                    alt={brand.alt} 
                    className={`${brand.className} max-w-full object-contain`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineSection;