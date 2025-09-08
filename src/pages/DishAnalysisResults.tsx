import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DishSuggestion {
  dishName: string;
  margin: number;
  reasoning: string;
  ingredientOverlap: string;
  costBreakdown: {
    ingredientCost: string;
    laborCost: string;
    menuPrice: string;
  };
}

interface OriginalDish {
  name: string;
  estimatedMargin: number;
  costBreakdown: {
    ingredientCost: string;
    laborCost: string;
    menuPrice: string;
  };
}

interface DishAnalysisData {
  originalDish: OriginalDish;
  suggestions: DishSuggestion[];
  tip: string;
}

const DishAnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<DishAnalysisData | null>(null);

  useEffect(() => {
    const data = location.state?.analysisData;
    if (!data) {
      navigate('/');
      return;
    }
    setAnalysisData(data);
  }, [location.state, navigate]);

  if (!analysisData) {
    return null;
  }

  const { originalDish, suggestions, tip } = analysisData;

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return "text-green-600 bg-green-50";
    if (margin >= 25) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNewAnalysis = () => {
    navigate('/', { state: { resetForm: true } });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-radial from-primary/30 to-transparent" />
          <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full blur-3xl opacity-40 bg-gradient-radial from-secondary/30 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-32 pb-16">
          {/* Header with navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Button
              onClick={handleBackToHome}
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
            
            <h1 className="text-3xl font-bold text-center flex-1">
              Dish Profitability Analysis
            </h1>
            
            <div className="w-32" /> {/* Spacer for centering */}
          </div>

          <div className="space-y-6">
            {/* Main Grid Layout for Dish Analysis and Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Dish Analysis */}
              <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Your Dish Analysis
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="original-dish" className="border rounded-lg bg-card shadow-sm">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center w-full p-4">
                      {/* Left side - Dish details */}
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{originalDish.name}</h3>
                        <p className="text-base font-medium text-foreground">${originalDish.costBreakdown.menuPrice}</p>
                        <Badge className={`text-sm px-2 py-1 mt-2 ${getMarginColor(originalDish.estimatedMargin)}`}>
                          {originalDish.estimatedMargin}% margin
                        </Badge>
                      </div>
                     
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-foreground mb-3">Cost Breakdown</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Ingredient Cost</p>
                          <p className="font-semibold text-foreground">${originalDish.costBreakdown.ingredientCost}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Labor Cost</p>
                          <p className="font-semibold text-foreground">${originalDish.costBreakdown.laborCost}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Menu Price</p>
                          <p className="font-semibold text-foreground">${originalDish.costBreakdown.menuPrice}</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              </div>

              {/* Higher-Profit Suggestions */}
              <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Higher-Profit Suggestions
              </h2>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                {suggestions.map((suggestion, index) => (
                  <AccordionItem key={index} value={`suggestion-${index}`} className="border rounded-lg bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline p-0">
                      <div className="flex items-center w-full p-4">
                        {/* Left side - Dish details */}
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-semibold text-foreground mb-1">{suggestion.dishName}</h3>
                          <p className="text-base font-medium text-foreground">${suggestion.costBreakdown?.menuPrice || 'N/A'}</p>
                          <Badge className="bg-green-100 text-green-800 text-sm px-2 py-1 mt-2">
                            {suggestion.margin}% margin
                          </Badge>
                        </div>
                        
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="border-t pt-4 space-y-4">
                        {suggestion.costBreakdown && (
                          <div>
                            <h4 className="font-medium text-foreground mb-3">Cost Breakdown</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Ingredient Cost</p>
                                <p className="font-semibold text-foreground">${suggestion.costBreakdown.ingredientCost}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Labor Cost</p>
                                <p className="font-semibold text-foreground">${suggestion.costBreakdown.laborCost}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Menu Price</p>
                                <p className="font-semibold text-foreground">${suggestion.costBreakdown.menuPrice}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Why it's more profitable:</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Shared ingredients:</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.ingredientOverlap}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              </div>
            </div>

            {/* Profitability Tip */}
            {tip && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800">{tip}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              <Button
                onClick={handleNewAnalysis}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Analyze Another Dish
              </Button>
              
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="px-6 py-3 rounded-lg font-medium"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DishAnalysisResults;