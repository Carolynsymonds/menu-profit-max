import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Lightbulb, ArrowLeft, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DishSuggestion {
  dishName: string;
  margin: number;
  reasoning: string;
  ingredientOverlap: string;
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
            {/* Original Dish Analysis */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  Your Dish Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{originalDish.name}</h3>
                    <Badge className={`text-lg px-3 py-1 ${getMarginColor(originalDish.estimatedMargin)}`}>
                      {originalDish.estimatedMargin}% margin
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ingredient Cost</p>
                      <p className="font-semibold">${originalDish.costBreakdown.ingredientCost}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Labor Cost</p>
                      <p className="font-semibold">${originalDish.costBreakdown.laborCost}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Menu Price</p>
                      <p className="font-semibold">${originalDish.costBreakdown.menuPrice}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Higher-Profit Suggestions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Higher-Profit Suggestions
              </h2>
              
              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{suggestion.dishName}</h3>
                        <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                          {suggestion.margin}% margin
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Why it's more profitable:</strong> {suggestion.reasoning}</p>
                        <p><strong>Shared ingredients:</strong> {suggestion.ingredientOverlap}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Profitability Tip */}
            {tip && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Lightbulb className="h-5 w-5" />
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
                <Home className="h-4 w-4 mr-2" />
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