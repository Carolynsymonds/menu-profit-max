import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Users, Clock, CheckCircle, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerificationModal } from '@/components/VerificationModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimizationSuggestion {
  title: string;
  description: string;
  impact: string;
  implementation: string;
  monthlyImpact: number;
  marginImprovement: number; // percentage points improvement
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  cost: number;
}

interface CostBreakdown {
  menuPrice: number;
  ingredientCost: number;
  laborCost: number;
}

interface OriginalDish {
  name: string;
  estimatedMargin: number;
  costBreakdown: CostBreakdown;
  ingredientList: string[];
}

interface DishAnalysisData {
  originalDish: OriginalDish;
  optimizations: OptimizationSuggestion[];
}

interface MultiDishAnalysisData {
  dishes: DishAnalysisData[];
}

const DishAnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<MultiDishAnalysisData | null>(null);
  const [selectedDishIndex, setSelectedDishIndex] = useState(0);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(100);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      const verifyToken = searchParams.get('verify');
      
      if (verifyToken) {
        try {
          const { data: verificationData, error } = await supabase
            .from('dish_analysis_verifications')
            .select('*')
            .eq('verification_token', verifyToken)
            .gt('expires_at', new Date().toISOString())
            .is('verified_at', null)
            .single();

          if (error || !verificationData) {
            toast({
              title: "Verification Failed",
              description: "The verification link is invalid or has expired.",
              variant: "destructive",
            });
            return;
          }

          // Mark as verified
          const { error: updateError } = await supabase
            .from('dish_analysis_verifications')
            .update({ verified_at: new Date().toISOString() })
            .eq('verification_token', verifyToken);

          if (updateError) {
            console.error('Error updating verification:', updateError);
            return;
          }

          // Set the dishes data and mark as verified
          setAnalysisData({ dishes: verificationData.dishes_data as unknown as DishAnalysisData[] });
          setIsVerified(true);
          
          toast({
            title: "Analysis Unlocked!",
            description: "You now have full access to all dish analyses.",
          });

          // Clean up URL
          window.history.replaceState({}, document.title, '/dish-analysis-results');

          return;
        } catch (error) {
          console.error('Verification error:', error);
          toast({
            title: "Verification Error",
            description: "Something went wrong during verification.",
            variant: "destructive",
          });
        }
      }
    };

    // Handle regular analysis data from location state
    const data = location.state?.analysisData;
    
    if (data) {
      // Handle both single and multi-dish data formats
      if (Array.isArray(data)) {
        setAnalysisData({ dishes: data });
      } else if (data.dishes) {
        setAnalysisData(data);
      } else {
        // Convert single dish to multi-dish format
        setAnalysisData({ dishes: [data] });
      }
      return;
    }

    // If no location state and no verification token, redirect home
    if (!searchParams.get('verify')) {
      navigate('/');
      return;
    }

    // Handle verification
    handleVerification();
  }, [location.state, navigate, searchParams, toast]);

  if (!analysisData || !analysisData.dishes || analysisData.dishes.length === 0) {
    return null;
  }

  const selectedDish = analysisData.dishes[selectedDishIndex];

  // Helper function to parse ingredient strings
  const parseIngredients = (ingredientList: string[]): Ingredient[] => {
    if (!ingredientList || !Array.isArray(ingredientList)) return [];
    
    return ingredientList.map(ingredientStr => {
      // Parse strings like "2 cups lentil pasta ($2.00)"
      const match = ingredientStr.match(/^(.+?)\s*\(\$?([\d.]+)\)$/);
      if (match) {
        const [, description, cost] = match;
        const parts = description.trim().split(' ');
        const quantity = parts[0] || '';
        const unit = parts[1] || '';
        const name = parts.slice(2).join(' ') || description.trim();
        
        return {
          name: name || description.trim(),
          quantity,
          unit,
          cost: parseFloat(cost) || 0
        };
      }
      
      // Fallback for unparseable strings
      return {
        name: ingredientStr,
        quantity: '',
        unit: '',
        cost: 0
      };
    });
  };

  // Helper functions for margin calculations
  const calculateCurrentMarginPercentage = (dishPrice: number, totalCost: number): number => {
    if (dishPrice <= 0) return 0;
    return ((dishPrice - totalCost) / dishPrice) * 100;
  };

  const calculateMarginImprovement = (dishPrice: number, totalCost: number, monthlySavings: number): number => {
    if (dishPrice <= 0 || monthlyVolume <= 0) return 0;
    
    const currentMargin = calculateCurrentMarginPercentage(dishPrice, totalCost);
    const costSavingsPerDish = monthlySavings / monthlyVolume; // Convert monthly savings to per-dish savings
    const newCost = totalCost - costSavingsPerDish;
    const newMargin = calculateCurrentMarginPercentage(dishPrice, newCost);
    
    return newMargin - currentMargin;
  };

  // Helper function to get dish data in expected format
  const getDishData = (dish: DishAnalysisData) => {
    const ingredients = parseIngredients(dish.originalDish?.ingredientList || []);
    const dishPrice = dish.originalDish?.costBreakdown?.menuPrice || 0;
    const ingredientCost = dish.originalDish?.costBreakdown?.ingredientCost || 0;
    const laborCost = dish.originalDish?.costBreakdown?.laborCost || 0;
    const totalCost = ingredientCost + laborCost;
    
    // Map optimizations to expected format
    const suggestions = (dish.optimizations || []).map((opt: any): OptimizationSuggestion => {
      const monthlySavings = opt.costSavings?.netSavings || opt.monthlyImpact || 0;
      const marginImprovement = opt.marginImprovement || 2; // Default to 2% if not provided
      
      return {
        title: opt.optimization || opt.title || '',
        description: opt.impact || opt.description || '',
        impact: opt.impact || '',
        implementation: opt.implementation || '',
        monthlyImpact: monthlySavings,
        marginImprovement
      };
    }).sort((a, b) => b.marginImprovement - a.marginImprovement);
    
    return {
      dishName: dish.originalDish?.name || '',
      dishPrice,
      totalCost,
      profitMargin: dish.originalDish?.estimatedMargin || 0,
      ingredients,
      suggestions
    };
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return "default";
    if (margin >= 25) return "secondary";
    return "destructive";
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNewAnalysis = () => {
    navigate('/', { state: { resetForm: true } });
  };

  const calculateOriginalMonthlyEarnings = (dish: DishAnalysisData, volume: number) => {
    const dishData = getDishData(dish);
    const profitPerDish = dishData.dishPrice - dishData.totalCost;
    return profitPerDish * volume;
  };

  const calculateOptimizedMonthlyEarnings = (dish: DishAnalysisData, suggestion: OptimizationSuggestion, volume: number) => {
    const originalEarnings = calculateOriginalMonthlyEarnings(dish, volume);
    return originalEarnings + (suggestion.monthlyImpact * volume);
  };

  const getBestOptimization = (dish: DishAnalysisData) => {
    const suggestions = dish.optimizations || [];
    if (!suggestions.length) return null;
    return suggestions.reduce((best, current) => {
      return (current.monthlyImpact || 0) > (best.monthlyImpact || 0) ? current : best;
    });
  };

  // New calculation functions for enhanced banner
  const calculateTotalOptimizedEarnings = (volume: number) => {
    return (analysisData.dishes || []).reduce((total, dish) => {
      const originalEarnings = calculateOriginalMonthlyEarnings(dish, volume);
      const bestOptimization = getBestOptimization(dish);
      if (bestOptimization) {
        return total + originalEarnings + (bestOptimization.monthlyImpact * volume);
      }
      return total + originalEarnings;
    }, 0);
  };

  const calculateTotalOriginalEarnings = (volume: number) => {
    return (analysisData.dishes || []).reduce((total, dish) => 
      total + calculateOriginalMonthlyEarnings(dish, volume), 0
    );
  };

  const calculateOptimizationImpact = (volume: number) => {
    const original = calculateTotalOriginalEarnings(volume);
    const optimized = calculateTotalOptimizedEarnings(volume);
    const monthlyImprovement = optimized - original;
    const percentageImprovement = original > 0 ? (monthlyImprovement / original) * 100 : 0;
    
    return {
      original,
      optimized,
      monthlyImprovement,
      annualImprovement: monthlyImprovement * 12,
      percentageImprovement
    };
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
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Analysis</span>
            </Button>
            <h1 className="text-4xl font-bold text-center flex-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {analysisData.dishes.length} Dish{analysisData.dishes.length !== 1 ? 'es' : ''} Analyzed
            </h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>

          {/* Actual vs Suggested Earnings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Actual vs Suggested Earnings</span>
              </CardTitle>
              <CardDescription>
                Compare your current earnings with optimized projections across all dishes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Volume Input */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyVolume" className="text-sm font-medium">
                    Monthly sales volume (per dish)
                  </Label>
                  <Input
                    id="monthlyVolume"
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center font-medium"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Across {analysisData.dishes.length} dishes
                  </p>
                </div>

                {/* Actual vs Suggested Comparison */}
                <div className="lg:col-span-2 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/20 p-6 rounded-lg border">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Actual Column */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">ACTUAL</h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          ${calculateOptimizationImpact(monthlyVolume).original.toFixed(0)}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <p className="text-lg text-muted-foreground">
                          ${(calculateOptimizationImpact(monthlyVolume).original * 12).toFixed(0)}
                          <span className="text-sm">/yr</span>
                        </p>
                      </div>
                    </div>

                    {/* Suggested Column */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-600 mb-2">SUGGESTED</h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-600">
                          ${calculateOptimizationImpact(monthlyVolume).optimized.toFixed(0)}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <p className="text-lg text-green-600">
                          ${(calculateOptimizationImpact(monthlyVolume).optimized * 12).toFixed(0)}
                          <span className="text-sm">/yr</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Improvement Metrics */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-6 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-muted-foreground">Monthly Boost:</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          +${Math.abs(calculateOptimizationImpact(monthlyVolume).monthlyImprovement).toFixed(0)} 
                          <span className="text-sm font-medium">
                            (+{calculateOptimizationImpact(monthlyVolume).percentageImprovement.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-muted-foreground">Annual Boost:</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          +${Math.abs(calculateOptimizationImpact(monthlyVolume).annualImprovement).toFixed(0)}
                          <span className="text-sm font-medium">
                            (+{calculateOptimizationImpact(monthlyVolume).percentageImprovement.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {(analysisData.dishes || []).map((dish, index) => {
              const isLocked = index > 0 && !isVerified;
              const dishData = getDishData(dish);
              
              return (
                <Card
                  key={index}
                  className={`relative transition-all duration-200 ${
                    selectedDishIndex === index && !isLocked
                      ? 'ring-2 ring-primary border-primary shadow-lg'
                      : isLocked
                      ? 'opacity-60'
                      : 'hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => !isLocked && setSelectedDishIndex(index)}
                >
                  <CardContent className={`p-6 ${isLocked ? 'blur-sm' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">{dishData.dishName}</h3>
                      <Badge variant={getMarginColor(dishData.profitMargin)}>
                        {dishData.profitMargin.toFixed(1)}% margin
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                        <p className="text-lg font-semibold">${dishData.dishPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                        <p className="text-lg font-semibold">${dishData.totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Earnings Potential</p>
                      <p className="text-2xl font-bold text-primary">
                        ${calculateOriginalMonthlyEarnings(dish, monthlyVolume).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Based on {monthlyVolume} dishes/month
                      </p>
                    </div>
                  </CardContent>
                  
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                      <div className="text-center p-6">
                        <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Analysis Locked</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Unlock to see complete optimization suggestions
                        </p>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowVerificationModal(true);
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          🔓 Unlock Analysis
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Selected Dish Analysis - Only show if not locked */}
          {(!selectedDish || (selectedDishIndex > 0 && !isVerified)) ? (
            <Card className="mb-8">
              <CardContent className="text-center py-12">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a dish to view analysis</h3>
                <p className="text-muted-foreground">
                  {selectedDishIndex > 0 && !isVerified 
                    ? "This dish analysis is locked. Verify your email to unlock."
                    : "Click on a dish above to see detailed optimization suggestions."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Dish Analysis */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Original Dish Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Current performance and cost breakdown for {getDishData(selectedDish).dishName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem value="dish-details" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className="font-medium">Dish Details</span>
                          <Badge variant={getMarginColor(getDishData(selectedDish).profitMargin)}>
                            {getDishData(selectedDish).profitMargin.toFixed(1)}% margin
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                              <p className="text-xl font-bold">${getDishData(selectedDish).dishPrice.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                              <p className="text-xl font-bold">${getDishData(selectedDish).totalCost.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-1">Profit per Dish</p>
                            <p className="text-2xl font-bold text-primary">
                              ${(getDishData(selectedDish).dishPrice - getDishData(selectedDish).totalCost).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cost-breakdown" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="font-medium">Cost Breakdown</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-3">
                          {getDishData(selectedDish).ingredients.map((ingredient, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="font-medium">{ingredient.name}</span>
                              <div className="text-right">
                                <p className="font-semibold">${ingredient.cost.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{ingredient.quantity} {ingredient.unit}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20 font-semibold">
                            <span>Total Cost</span>
                            <span className="text-primary">${getDishData(selectedDish).totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="monthly-projections" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="font-medium">Monthly Projections</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                              <p className="text-lg font-bold">
                                ${(getDishData(selectedDish).dishPrice * monthlyVolume).toFixed(0)}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Costs</p>
                              <p className="text-lg font-bold">
                                ${(getDishData(selectedDish).totalCost * monthlyVolume).toFixed(0)}
                              </p>
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-600 mb-1">Monthly Profit</p>
                            <p className="text-2xl font-bold text-green-700">
                              ${calculateOriginalMonthlyEarnings(selectedDish, monthlyVolume).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Profit Optimization Opportunities */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Profit Optimization Opportunities</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered suggestions to maximize profitability for {getDishData(selectedDish).dishName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {getDishData(selectedDish).suggestions.map((suggestion, index) => (
                      <AccordionItem key={index} value={`suggestion-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <span className="font-medium text-left">{suggestion.title}</span>
                            <Badge variant="default" className="ml-2 bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
                              +{suggestion.marginImprovement.toFixed(1)}%
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            <p className="text-muted-foreground">{suggestion.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-600 mb-1">Impact</p>
                                <p className="font-semibold text-blue-700">{suggestion.impact}</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-600 mb-1">Margin Improvement</p>
                                <p className="font-semibold text-purple-700">
                                  +{suggestion.marginImprovement.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Implementation Steps</span>
                              </h4>
                              <p className="text-sm text-muted-foreground">{suggestion.implementation}</p>
                            </div>

                            {monthlyVolume > 0 && (
                              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm text-primary mb-1">Projected Monthly Earnings</p>
                                <p className="text-xl font-bold text-primary">
                                  ${calculateOptimizedMonthlyEarnings(selectedDish, suggestion, monthlyVolume).toFixed(0)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  vs ${calculateOriginalMonthlyEarnings(selectedDish, monthlyVolume).toFixed(0)} current
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-12">
            <Button onClick={handleNewAnalysis} variant="outline" size="lg">
              Analyze Another Dish
            </Button>
            <Button onClick={handleBackToHome} size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Verification Modal */}
      {analysisData && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          dishesData={analysisData.dishes}
        />
      )}
    </div>
  );
};

export default DishAnalysisResults;