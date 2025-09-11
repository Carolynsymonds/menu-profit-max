import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HeroBanner = () => {
  const [dishName, setDishName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your dish...");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadingMessages = [
    "Analyzing your dish...",
    "Finding optimization opportunities...",
    "Calculating profit margins...",
    "Comparing ingredient costs...",
    "Generating recommendations..."
  ];

  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleAnalyzeDish = async () => {
    if (!dishName.trim()) {
      toast({
        title: "Please enter a dish name",
        description: "We need a dish name to analyze profit opportunities.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting dish analysis for:', dishName);
    setIsLoading(true);

    try {
      console.log('Invoking analyze-dish function...');
      const { data, error } = await supabase.functions.invoke('analyze-dish', {
        body: { dishName: dishName.trim() }
      });

      console.log('analyze-dish response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.analyses || data.analyses.length === 0) {
        throw new Error('No analysis data received');
      }

      console.log('Navigation to dish analysis results with data:', data);
      navigate('/dish-analysis-results', { 
        state: { 
          analyses: data.analyses,
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

  return (
    <div className="bg-white py-20 my-2 relative">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-[42px] md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-[700px] mx-auto pb-3">
          Type a dish and get instant suggestions to increase margins with smarter pricing, ingredient swaps, and upsell ideas.
        </h1>
        
        <div className="max-w-md mx-auto mb-6">
          <Input
            type="text"
            placeholder="Enter a dish name (e.g., Margherita Pizza)"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeDish()}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={handleAnalyzeDish}
          disabled={isLoading}
          className="px-8 py-3 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          Get My Profit Report
        </Button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Dish</p>
            <p className="text-sm text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;