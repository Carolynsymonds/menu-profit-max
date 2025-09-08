import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OptimizationSuggestion {
  optimization: string;
  marginImprovement: number;
  impact: string;
  implementation: string;
  costSavings: {
    ingredientSavings: string;
    newIngredientCost: string;
    netSavings: string;
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
  ingredientList: string[];
}

interface DishAnalysisData {
  dishName?: string;
  originalDish: OriginalDish;
  optimizations: OptimizationSuggestion[];
}

interface MultiDishAnalysisData {
  dishes: DishAnalysisData[];
}

const DishAnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<DishAnalysisData[] | null>(null);
  const [selectedDishIndex, setSelectedDishIndex] = useState<number>(0);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(100);

  useEffect(() => {
    const data = location.state?.analysisData;
    if (!data) {
      navigate('/');
      return;
    }
    
    // Handle both single dish and multi-dish formats
    if (data.dishes) {
      // Multi-dish format
      setAnalysisData(data.dishes);
    } else {
      // Single dish format (backward compatibility)
      setAnalysisData([data]);
    }
  }, [location.state, navigate]);

  if (!analysisData || analysisData.length === 0) {
    return null;
  }

  const currentDish = analysisData[selectedDishIndex];
  const { originalDish, optimizations } = currentDish;

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

  // Calculate monthly earnings for current dish
  const calculateOriginalMonthlyEarnings = () => {
    const menuPrice = parseFloat(originalDish.costBreakdown.menuPrice);
    const ingredientCost = parseFloat(originalDish.costBreakdown.ingredientCost);
    const laborCost = parseFloat(originalDish.costBreakdown.laborCost);
    const profitPerDish = menuPrice - ingredientCost - laborCost;
    return profitPerDish * monthlyVolume;
  };

  const calculateOptimizedMonthlyEarnings = (optimization: OptimizationSuggestion) => {
    const originalMonthlyEarnings = calculateOriginalMonthlyEarnings();
    const savings = parseFloat(optimization.costSavings?.netSavings || '0');
    const additionalProfit = savings * monthlyVolume;
    return originalMonthlyEarnings + additionalProfit;
  };

  const getBestOptimization = () => {
    if (!optimizations.length) return null;
    return optimizations.reduce((best, current) => {
      const bestSavings = parseFloat(best.costSavings?.netSavings || '0');
      const currentSavings = parseFloat(current.costSavings?.netSavings || '0');
      return currentSavings > bestSavings ? current : best;
    });
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
            
            <h1 className="text-2xl font-bold text-center flex-1">
              Dish Profitability Analysis
            </h1>
            
            <div className="w-32" /> {/* Spacer for centering */}
          </div>

          {/* Dish Selector (if multiple dishes) */}
          {analysisData.length > 1 && (
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50 mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Analyzed Dishes ({analysisData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisData.map((dish, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDishIndex(index)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        index === selectedDishIndex 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                      }`}
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {dish.originalDish.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ${dish.originalDish.costBreakdown.menuPrice}
                        </span>
                        <Badge className={`text-xs px-2 py-1 ${getMarginColor(dish.originalDish.estimatedMargin)}`}>
                          {dish.originalDish.estimatedMargin}% margin
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {/* Monthly Volume Input */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Monthly Earnings Calculator - {originalDish.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <Label htmlFor="monthlyVolume" className="text-sm font-medium">
                      Estimated monthly sales volume
                    </Label>
                    <Input
                      id="monthlyVolume"
                      type="number"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-1"
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Number of dishes sold per month
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Original Monthly Profit</p>
                      <p className="text-xl font-bold text-foreground">
                        ${calculateOriginalMonthlyEarnings().toFixed(0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Best Optimized Profit</p>
                      <p className="text-xl font-bold text-primary">
                        ${getBestOptimization() ? calculateOptimizedMonthlyEarnings(getBestOptimization()!).toFixed(0) : '0'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Monthly Increase
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        +${getBestOptimization() ? (calculateOptimizedMonthlyEarnings(getBestOptimization()!) - calculateOriginalMonthlyEarnings()).toFixed(0) : '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Grid Layout for Dish Analysis and Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Dish Analysis */}
              <div className="space-y-4">
              <h2 className="text-xl text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light px-0">
                Original
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="original-dish" className="border rounded-lg bg-card shadow-sm">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center w-full p-4">
                      {/* Left side - Dish details */}
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-semibold text-foreground mb-1">{originalDish.name}</h3>
                        <p className="text-sm font-medium text-foreground">${originalDish.costBreakdown.menuPrice}</p>
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
                      
                      {originalDish.ingredientList && Array.isArray(originalDish.ingredientList) && originalDish.ingredientList.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-foreground mb-3">Main Ingredients</h4>
                          <div className="space-y-1">
                            {originalDish.ingredientList.map((ingredient, index) => (
                              <div key={index} className="text-sm text-muted-foreground flex justify-between">
                                <span>{ingredient}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                       )}
                       
                       {/* Monthly Earnings for Original Dish */}
                       <div className="mt-4 pt-4 border-t">
                         <h4 className="font-medium text-foreground mb-3">Monthly Earnings Projection</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <p className="text-sm text-muted-foreground">Profit per Dish</p>
                             <p className="text-lg font-semibold text-foreground">
                               ${(calculateOriginalMonthlyEarnings() / monthlyVolume).toFixed(2)}
                             </p>
                           </div>
                           <div>
                             <p className="text-sm text-muted-foreground">Monthly Profit ({monthlyVolume} dishes)</p>
                             <p className="text-lg font-semibold text-foreground">
                               ${calculateOriginalMonthlyEarnings().toFixed(0)}
                             </p>
                           </div>
                         </div>
                         <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                           <p className="text-sm text-muted-foreground">Annual Projection</p>
                           <p className="text-xl font-bold text-foreground">
                             ${(calculateOriginalMonthlyEarnings() * 12).toFixed(0)}
                           </p>
                         </div>
                       </div>
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               </Accordion>
               </div>

              {/* Profit Optimization Opportunities */}
              <div className="space-y-4">
              <h2 className="text-xl text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light px-0">
                Optimized Suggestions
              </h2>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {optimizations.map((optimization, index) => {
                  const originalPrice = parseFloat(originalDish.costBreakdown.menuPrice);
                  const savings = parseFloat(optimization.costSavings?.netSavings || '0');
                  const newPrice = originalPrice - savings;
                  
                  return (
                    <AccordionItem key={index} value={`optimization-${index}`} className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                      <AccordionTrigger className="hover:no-underline p-0">
                        <div className="w-full p-6 space-y-3">
                          {/* Title */}
                          <h3 className="text-base font-semibold text-foreground text-left">
                            {optimization.optimization}
                          </h3>
                          
                          {/* Price and Margin - Stacked below title */}
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-sm font-medium text-foreground">
                              ${newPrice.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <Badge className={`${getMarginColor(originalDish.estimatedMargin + optimization.marginImprovement)} text-sm px-2 py-1`}>
                              +{optimization.marginImprovement}% margin
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Description</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {optimization.impact}
                            </p>
                          </div>
                           <div>
                             <h4 className="font-medium text-foreground mb-2">Implementation</h4>
                             <p className="text-muted-foreground text-sm leading-relaxed">
                               {optimization.implementation}
                             </p>
                           </div>
                           
                           {/* Monthly Earnings for Optimization */}
                           <div className="pt-4 border-t">
                             <h4 className="font-medium text-foreground mb-3">Monthly Earnings with Optimization</h4>
                             <div className="grid grid-cols-3 gap-4">
                               <div>
                                 <p className="text-sm text-muted-foreground">New Monthly Profit</p>
                                 <p className="text-lg font-semibold text-primary">
                                   ${calculateOptimizedMonthlyEarnings(optimization).toFixed(0)}
                                 </p>
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Monthly Increase</p>
                                 <p className="text-lg font-semibold text-green-600">
                                   +${(calculateOptimizedMonthlyEarnings(optimization) - calculateOriginalMonthlyEarnings()).toFixed(0)}
                                 </p>
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Annual Increase</p>
                                 <p className="text-lg font-semibold text-green-600">
                                   +${((calculateOptimizedMonthlyEarnings(optimization) - calculateOriginalMonthlyEarnings()) * 12).toFixed(0)}
                                 </p>
                               </div>
                             </div>
                             <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                               <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-green-800">ROI Improvement:</span>
                                 <span className="text-lg font-bold text-green-800">
                                   +{((calculateOptimizedMonthlyEarnings(optimization) - calculateOriginalMonthlyEarnings()) / calculateOriginalMonthlyEarnings() * 100).toFixed(1)}%
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              </div>
            </div>


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
                className="px-6 py-3 rounded-lg border-border hover:bg-muted transition-colors font-medium"
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