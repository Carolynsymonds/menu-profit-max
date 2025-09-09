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
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  cost: number;
}

interface OriginalDish {
  dishName: string;
  dishPrice: number;
  totalCost: number;
  profitMargin: number;
  ingredients: Ingredient[];
  suggestions: OptimizationSuggestion[];
}

interface DishAnalysisData {
  dishName: string;
  dishPrice: number;
  totalCost: number;
  profitMargin: number;
  ingredients: Ingredient[];
  suggestions: OptimizationSuggestion[];
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
    const dishPrice = dish.dishPrice || 0;
    const totalCost = dish.totalCost || 0;
    const profitPerDish = dishPrice - totalCost;
    return profitPerDish * volume;
  };

  const calculateOptimizedMonthlyEarnings = (dish: DishAnalysisData, suggestion: OptimizationSuggestion, volume: number) => {
    const originalEarnings = calculateOriginalMonthlyEarnings(dish, volume);
    return originalEarnings + (suggestion.monthlyImpact * volume);
  };

  const getBestOptimization = (dish: DishAnalysisData) => {
    if (!dish.suggestions || !dish.suggestions.length) return null;
    return dish.suggestions.reduce((best, current) => {
      return (current.monthlyImpact || 0) > (best.monthlyImpact || 0) ? current : best;
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

          {/* Monthly Earnings Calculator */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Monthly Earnings Calculator</span>
              </CardTitle>
              <CardDescription>
                Adjust the monthly sales volume to see projected earnings for all dishes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="flex-1 max-w-xs">
                  <Label htmlFor="monthlyVolume" className="text-sm font-medium">
                    Monthly sales volume (per dish)
                  </Label>
                  <Input
                    id="monthlyVolume"
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-2"
                    min="1"
                  />
                </div>
                
                <div className="flex-1 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Monthly Potential</p>
                  <p className="text-2xl font-bold text-primary">
                    ${(analysisData.dishes || []).reduce((total, dish) => 
                      total + calculateOriginalMonthlyEarnings(dish, monthlyVolume), 0
                    ).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across all {analysisData.dishes.length} dishes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {(analysisData.dishes || []).map((dish, index) => {
              const isLocked = index > 0 && !isVerified;
              
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
                      <h3 className="font-bold text-xl">{dish.dishName}</h3>
                      <Badge variant={getMarginColor(dish.profitMargin || 0)}>
                        {(dish.profitMargin || 0).toFixed(1)}% margin
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                        <p className="text-lg font-semibold">${(dish.dishPrice || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                        <p className="text-lg font-semibold">${(dish.totalCost || 0).toFixed(2)}</p>
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
                    Current performance and cost breakdown for {selectedDish.dishName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem value="dish-details" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className="font-medium">Dish Details</span>
                          <Badge variant={getMarginColor(selectedDish.profitMargin || 0)}>
                            {(selectedDish.profitMargin || 0).toFixed(1)}% margin
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                              <p className="text-xl font-bold">${(selectedDish.dishPrice || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                              <p className="text-xl font-bold">${(selectedDish.totalCost || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-1">Profit per Dish</p>
                            <p className="text-2xl font-bold text-primary">
                              ${((selectedDish.dishPrice || 0) - (selectedDish.totalCost || 0)).toFixed(2)}
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
                          {(selectedDish.ingredients || []).map((ingredient, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="font-medium">{ingredient.name}</span>
                              <div className="text-right">
                                <p className="font-semibold">${(ingredient.cost || 0).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{ingredient.quantity} {ingredient.unit}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20 font-semibold">
                            <span>Total Cost</span>
                            <span className="text-primary">${(selectedDish.totalCost || 0).toFixed(2)}</span>
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
                                ${((selectedDish.dishPrice || 0) * monthlyVolume).toFixed(0)}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Costs</p>
                              <p className="text-lg font-bold">
                                ${((selectedDish.totalCost || 0) * monthlyVolume).toFixed(0)}
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
                    AI-powered suggestions to maximize profitability for {selectedDish.dishName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {(selectedDish.suggestions || []).map((suggestion, index) => (
                      <AccordionItem key={index} value={`suggestion-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <span className="font-medium text-left">{suggestion.title}</span>
                            <Badge variant="secondary" className="ml-2">
                              +${(suggestion.monthlyImpact || 0).toFixed(0)}/mo
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
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-600 mb-1">Monthly Boost</p>
                                <p className="font-semibold text-green-700">
                                  +${(suggestion.monthlyImpact || 0).toFixed(0)}
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