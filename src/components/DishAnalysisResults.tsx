import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Lightbulb } from "lucide-react";

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

interface DishAnalysisResultsProps {
  analysisData: DishAnalysisData;
  onNewAnalysis: () => void;
}

export const DishAnalysisResults = ({ analysisData, onNewAnalysis }: DishAnalysisResultsProps) => {
  const { originalDish, suggestions, tip } = analysisData;

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return "text-green-600 bg-green-50";
    if (margin >= 25) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
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

      {/* New Analysis Button */}
      <div className="text-center">
        <button
          onClick={onNewAnalysis}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Analyze Another Dish
        </button>
      </div>
    </div>
  );
};