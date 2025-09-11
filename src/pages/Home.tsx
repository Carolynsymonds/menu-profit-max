import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroBanner from "@/components/HeroBanner";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Shield, Smartphone, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import FeaturesSection from "@/components/FeaturesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DynamicSvgIcon = ({ url, className = '', ...props }) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    if (!url) return;

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        // Process SVG to ensure it uses primary color
        const processedSvg = text
          .replace(/fill="[^"]*"/g, 'fill="currentColor"')
          .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
          .replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">');
        setSvgContent(processedSvg);
      })
      .catch((err) => {
        console.error('Failed to load SVG:', err);
        setSvgContent('');
      });
  }, [url]);

  return (
    <div
      className={`text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

const Home = () => {
  const { navigateWithUtm } = useUtmTracking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dishName, setDishName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Evaluating competitor menus");
  
  useEffect(() => {
    if (!isLoading) return;

    const messages = ["Evaluating competitor menus", "Finding highest margin recipes"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

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

  const handleAnalyzeDish = async () => {
    if (!dishName.trim()) {
      toast({
        title: "Please enter a dish name",
        description: "We need a dish name to analyze pricing opportunities.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingText("Evaluating competitor menus");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-dish', {
        body: { 
          dishName: dishName.trim(),
          analysisType: 'pricing-comparison'
        }
      });

      if (error) {
        throw error;
      }

      // Navigate to results page with the pricing comparison data
      navigate('/dish-analysis-results', { 
        state: { 
          pricingComparison: data,
          dishName: dishName.trim()
        } 
      });
    } catch (error) {
      console.error('Error analyzing dish:', error);
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your dish right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Get features from site content - taking first 3 from the features section
  const features = siteContent.features.items.map(item => {
    const iconMap = {
      Calendar: <Calendar className="w-16 h-16 text-primary" />,
      Shield: <Shield className="w-16 h-16 text-primary" />,
      Smartphone: <Smartphone className="w-16 h-16 text-primary" />
    };
    
    // Check if icon is a URL (SVG) or lucide icon name
    const isUrl = item.icon.startsWith('http');
    
    return {
      icon: isUrl ? (
        <DynamicSvgIcon url={item.icon} className="w-16 h-16" />
      ) : (
        iconMap[item.icon as keyof typeof iconMap]
      ),
      title: item.title,
      description: item.description
    };
  });

  // Get pricing plans from site content
  const plans = siteContent.pricing.plans.map(plan => ({
    name: plan.name,
    price: plan.price,
    period: "per month",
    description: plan.description,
    features: plan.features,
    cta: plan.cta,
    popular: plan.popular,
    link: plan.name === "Free trial" ? "/free-plan" : "/signup"
  }));

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] bg-white flex items-center justify-center px-8 md:px-[125px] py-5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6 mt-24">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
              {siteContent.homePage.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light px-0">
              {siteContent.homePage.subtitle}
            </p>
          </div>

          <div className="mt-8 p-4 md:p-5 relative">
            <p className="text-lg text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light mb-6 text-center">
              Type a dish and get instant suggestions to increase margins with smarter pricing, ingredient swaps, and upsell ideas.
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI search icon">
                        <path d="M16.296 2.043c.407 1.817 1.284 2.716 3.317 3.089.14 0 .255.104.255.233s-.114.233-.255.233c-1.982.373-2.909 1.218-3.315 3.081a.246.246 0 0 1-.243.18.245.245 0 0 1-.245-.191c-.407-1.818-1.28-2.697-3.313-3.07-.14 0-.254-.104-.254-.233s.114-.233.254-.233c1.982-.373 2.91-1.223 3.317-3.087a.247.247 0 0 1 .241-.175c.117 0 .212.074.241.173Z" fill="url(#_3085173834__a)"/>
                        <path d="M15.094 17.436A7.5 7.5 0 1 1 10 4.046v1.503A6 6 0 1 0 16.446 11h1.504a7.466 7.466 0 0 1-1.46 5.003l4.25 4.25a1 1 0 0 1-1.414 1.414l-4.232-4.231Z" fill="url(#_3085173834__b)"/>
                        <path d="M13.666 8.964c-.857-.236-1.356-.615-1.527-1.4 0-.095-.084-.172-.187-.172s-.187.077-.187.171c-.257.786-.67 1.244-1.528 1.401-.103 0-.187.077-.187.171 0 .095.084.172.187.172.857.235 1.357.614 1.528 1.4 0 .095.084.171.187.171s.187-.076.187-.171c.257-.786.67-1.243 1.527-1.4.104 0 .187-.077.187-.172 0-.094-.083-.171-.187-.171Z" fill="url(#_3085173834__c)"/>
                        <defs>
                          <linearGradient id="_3085173834__a" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                            <stop offset="0.3" stopColor="hsl(var(--primary))" stopOpacity="1"/>
                            <stop offset="0.7" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.9"/>
                          </linearGradient>
                          <linearGradient id="_3085173834__b" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="1"/>
                            <stop offset="0.25" stopColor="hsl(var(--primary))" stopOpacity="0.7"/>
                            <stop offset="0.6" stopColor="hsl(var(--primary))" stopOpacity="0.9"/>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                          </linearGradient>
                          <linearGradient id="_3085173834__c" x1="-6.063" y1="11.915" x2="13.914" y2="29.878" gradientUnits="userSpaceOnUse">
                            <stop stopColor="hsl(var(--primary))" stopOpacity="0.9"/>
                            <stop offset="0.4" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
                            <stop offset="0.8" stopColor="hsl(var(--primary))" stopOpacity="1"/>
                            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.7"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter a dish name (e.g., Margherita Pizza)"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      className="flex w-full border bg-background pl-12 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-lg border-gray-300 h-[2.6rem]"
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAnalyzeDish()}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAnalyzeDish}
                  disabled={isLoading || !dishName.trim()}
                  className="rounded-xl px-6 py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Get My Profit Report'
                  )}
                </Button>
              </div>
              
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {loadingText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={handleSignupClick}
                  className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  Try for free - <span className="font-light">for 12 months</span>
                </Button>
                <Button 
                  onClick={() => navigateWithUtm('/features')}
                  variant="outline" 
                  className="px-6 py-2 w-full sm:w-auto"
                >
                  View features
                </Button>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Check size={16} className="text-primary" />
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-4xl mx-auto">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className={`grid gap-8 max-w-6xl mx-auto ${plans.length === 2 ? 'md:grid-cols-2 justify-center px-16' : 'md:grid-cols-3'}`}>
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'} transition-all duration-200 hover:shadow-lg`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.price === 0 ? '' : `/${plan.period}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-3">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                <Button 
                  onClick={() => navigateWithUtm(plan.link)}
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigateWithUtm('/pricing')}
              variant="outline" 
              className="px-6 py-2"
            >
              View more
            </Button>
          </div>
        </div>
      </section>

      
      <SplitScreenSection />

      <HeroBanner />

      <TopBanner />
      <Footer />
    </div>
  );
};

export default Home;