import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PricingComparison from '@/components/PricingComparison';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Users, Clock, CheckCircle, Lock, Info, Pencil } from 'lucide-react';
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
  const [showEditModal, setShowEditModal] = useState(false);

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

    const handleMenuUpload = async () => {
      const menuUploadId = searchParams.get('menuUploadId');
      
      if (menuUploadId) {
        try {
          const { data: menuUploadData, error } = await supabase
            .from('menu_uploads')
            .select('*')
            .eq('id', menuUploadId)
            .eq('processing_status', 'completed')
            .single();

          if (error || !menuUploadData) {
            toast({
              title: "Menu Upload Not Found",
              description: "The menu upload was not found or is still processing.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }

          // Convert menu upload results to dish analysis format
          const analysisResults = menuUploadData.analysis_results as any;
          const dishes = analysisResults?.dishes?.map((dishResult: any) => {
            const analysis = dishResult.analysis || {};
            const costBreakdown = analysis.costBreakdown || {};
            const profitabilityMetrics = analysis.profitabilityMetrics || {};
            
            return {
              originalDish: {
                name: dishResult.dish || 'Unknown Dish',
                estimatedMargin: profitabilityMetrics.grossMargin || 0,
                costBreakdown: {
                  menuPrice: analysis.currentPrice || 0,
                  ingredientCost: costBreakdown.ingredients || 0,
                  laborCost: (costBreakdown.labor || 0) + (costBreakdown.overhead || 0)
                },
                ingredientList: analysis.ingredients || []
              },
              optimizations: analysis.optimizationSuggestions || []
            };
          }) || [];

          setAnalysisData({ dishes });
          setIsVerified(true); // Menu uploads are automatically verified
          
          toast({
            title: "Menu Analysis Complete!",
            description: `Successfully analyzed ${dishes.length} dishes from your menu.`,
          });

          return;
        } catch (error) {
          console.error('Menu upload loading error:', error);
          toast({
            title: "Loading Error",
            description: "Something went wrong loading your menu analysis.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      }
    };

    // Handle pricing comparison data
    const pricingComparisonData = location.state?.pricingComparison;
    const analysisType = location.state?.analysisType;
    
    if (pricingComparisonData && analysisType === 'pricing-comparison') {
      // Don't process further, we'll render PricingComparison component
      return;
    }

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

    // Check for menu upload ID
    if (searchParams.get('menuUploadId')) {
      handleMenuUpload();
      return;
    }

    // If no location state and no verification token and no menu upload, redirect home
    if (!searchParams.get('verify')) {
      navigate('/');
      return;
    }

    // Handle verification
    handleVerification();
  }, [location.state, navigate, searchParams, toast]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNewAnalysis = () => {
    navigate('/', { state: { resetForm: true } });
  };

  // Handle pricing comparison display
  const pricingComparisonData = location.state?.pricingComparison;
  const analysisType = location.state?.analysisType;
  
  if (pricingComparisonData && analysisType === 'pricing-comparison') {
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
            {/* Back to Home Button */}
            <div className="mb-8">
              <Button
                onClick={handleBackToHome}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <PricingComparison data={pricingComparisonData} />

            {/* New Analysis Button */}
            <div className="text-center mt-12">
              <Button
                onClick={handleNewAnalysis}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-semibold"
              >
                Analyze Another Dish
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

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

  const calculateOriginalMonthlyEarnings = (dish: DishAnalysisData, volume: number) => {
    const dishData = getDishData(dish);
    const profitPerDish = dishData.dishPrice - dishData.totalCost;
    return profitPerDish * volume;
  };

  const calculateOptimizedMonthlyEarnings = (dish: DishAnalysisData, suggestion: OptimizationSuggestion, volume: number) => {
    const originalEarnings = calculateOriginalMonthlyEarnings(dish, volume);
    return originalEarnings + (suggestion.monthlyImpact * volume);
  };

  const calculateOriginalAnnualEarnings = (dish: DishAnalysisData, volume: number) => {
    return calculateOriginalMonthlyEarnings(dish, volume) * 12;
  };

  const calculateOptimizedAnnualEarnings = (dish: DishAnalysisData, suggestion: OptimizationSuggestion, volume: number) => {
    return calculateOptimizedMonthlyEarnings(dish, suggestion, volume) * 12;
  };

  const getBestOptimization = (dish: DishAnalysisData) => {
    const suggestions = dish.optimizations || [];
    if (!suggestions.length) return null;
    return suggestions.reduce((best, current) => {
      return (current.monthlyImpact || 0) > (best.monthlyImpact || 0) ? current : best;
    });
  };

  // Helper function to categorize suggestions
  const getSuggestionCategory = (title: string): { category: string; color: string } => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('offer') || titleLower.includes('add') || titleLower.includes('side') || titleLower.includes('upsell')) {
      return { category: 'Upsell', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    if (titleLower.includes('replace') || titleLower.includes('substitute') || titleLower.includes('swap')) {
      return { category: 'Swap', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (titleLower.includes('reduce') || titleLower.includes('portion') || titleLower.includes('size')) {
      return { category: 'Portion', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    if (titleLower.includes('supplier') || titleLower.includes('switch') || titleLower.includes('source')) {
      return { category: 'Supplier', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    if (titleLower.includes('prep') || titleLower.includes('method') || titleLower.includes('technique')) {
      return { category: 'Prep', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    if (titleLower.includes('menu') || titleLower.includes('copy') || titleLower.includes('description') || titleLower.includes('name')) {
      return { category: 'Menu copy', color: 'bg-pink-100 text-pink-700 border-pink-200' };
    }
    
    // Default fallback
    return { category: 'Swap', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  // Simplified earnings calculations
  const calculateEarningsData = (volume: number) => {
    let totalOriginal = 0;
    let totalOptimized = 0;
    
    (analysisData.dishes || []).forEach((dish) => {
      const dishData = getDishData(dish);
      const profitPerDish = dishData.dishPrice - dishData.totalCost;
      const dishEarnings = profitPerDish * volume;
      
      totalOriginal += dishEarnings;
      
      // Add best optimization if available
      const bestOptimization = getBestOptimization(dish);
      const additionalEarnings = bestOptimization ? (bestOptimization.monthlyImpact || 0) : 0;
      totalOptimized += dishEarnings + additionalEarnings;
    });
    
    const monthlyBoost = totalOptimized - totalOriginal;
    const annualBoost = monthlyBoost * 12;
    const percentageBoost = totalOriginal > 0 ? (monthlyBoost / totalOriginal) * 100 : 0;
    
    return {
      actualMonthly: totalOriginal,
      suggestedMonthly: totalOptimized,
      actualAnnual: totalOriginal * 12,
      suggestedAnnual: totalOptimized * 12,
      monthlyBoost,
      annualBoost,
      percentageBoost
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

          {/* Results Header */}
          <div className="text-center mb-16 mx-auto max-w-[600px]">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">Dish profit analysis</h1>
          </div>

          {/* Dish Chips Selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {(analysisData.dishes || []).map((dish, index) => {
              const isLocked = index > 0 && !isVerified;
              const dishData = getDishData(dish);
              const isActive = selectedDishIndex === index && !isLocked;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isLocked) {
                      setShowVerificationModal(true);
                    } else {
                      setSelectedDishIndex(index);
                    }
                  }}
                  className={`rounded-full px-6 py-3 text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isActive
                      ? 'bg-white text-slate-900 border border-primary ring-2 ring-primary/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dishData.dishName.charAt(0).toUpperCase() + dishData.dishName.slice(1)}
                  {isLocked && <Lock className="w-3 h-3 ml-2 inline" />}
                </button>
              );
            })}
          </div>

          {/* Blur overlay for locked dishes */}
          {selectedDishIndex > 0 && !isVerified && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md mx-4">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analysis Locked</h3>
                <p className="text-muted-foreground mb-6">
                  Unlock to see complete optimization suggestions for all dishes
                </p>
                <Button 
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  🔓 Unlock Full Analysis
                </Button>
              </div>
            </div>
          )}

          {/* Selected Dish Analysis - Only show if valid dish is selected */}
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
                  <h1 className="text-center font-bold text-gray-900 leading-tight" style={{fontSize: '1rem'}}>
                    Profit overview
                  </h1>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-8">
                      <div className="inline-flex flex-col items-start p-4">
                        <div className="text-4xl font-semibold leading-none text-slate-900">
                          {Math.round(getDishData(selectedDish).profitMargin)}%
                        </div>
                        <div className="mt-2 text-base text-slate-600">
                          margin
                        </div>
                      </div>
                      <div className="inline-flex flex-col items-start p-4">
                        <div className="text-4xl font-semibold leading-none text-slate-900">
                          ${((getDishData(selectedDish).dishPrice - getDishData(selectedDish).totalCost) * monthlyVolume * 12).toLocaleString()}
                        </div>
                        <div className="mt-2 text-base text-slate-600">
                          profit per year
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Explanation Banner */}
                  <div className="pb-4">
                    <div className="flex items-start gap-3 border border-primary border-l-4 border-l-primary rounded-lg shadow-sm p-2.5">
                      <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-base text-primary">
                        Based on a standard US-style {getDishData(selectedDish).dishName} recipe — tweak details to match yours.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem value="dish-details" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <span className="font-medium">Dish Details</span>
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
                     
                      {/* Edit Button */}
                      <div className="mt-6 flex justify-center">
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => setShowVerificationModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit Dish Details
                        </Button>
                      </div>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Profit Optimization Opportunities */}
              <Card className="h-fit">
                <CardHeader>
                  <h1 className="text-center font-bold text-gray-900 leading-tight" style={{fontSize: '1rem'}}>
                    Improvement ideas
                  </h1>
                  <CardDescription className="text-center">
                    Estimated impact on margin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {getDishData(selectedDish).suggestions.map((suggestion, index) => (
                      <AccordionItem key={index} value={`suggestion-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-3 text-left">
                              <span className="font-medium">{suggestion.title}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs ml-2">
                              +{Math.round(suggestion.marginImprovement)}% est.
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            <p className="text-muted-foreground">{suggestion.description}</p>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-600 mb-1">Impact</p>
                                <p className="font-semibold text-blue-700">{suggestion.impact}</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-600 mb-1">Margin Improvement</p>
                                <p className="font-semibold text-purple-700">
                                  +{Math.round(suggestion.marginImprovement)}%
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-600 mb-1">Annual Profit Boost</p>
                                <p className="font-semibold text-green-700">
                                  +${((calculateOptimizedAnnualEarnings(selectedDish, suggestion, monthlyVolume) - calculateOriginalAnnualEarnings(selectedDish, monthlyVolume)).toLocaleString())}
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
                              <div className="space-y-3">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                  <p className="text-sm text-primary mb-1">Projected Monthly Earnings</p>
                                  <p className="text-xl font-bold text-primary">
                                    ${calculateOptimizedMonthlyEarnings(selectedDish, suggestion, monthlyVolume).toFixed(0)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    vs ${calculateOriginalMonthlyEarnings(selectedDish, monthlyVolume).toFixed(0)} current
                                  </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-sm text-green-600 mb-1">Projected Annual Earnings</p>
                                  <p className="text-xl font-bold text-green-700">
                                    ${calculateOptimizedAnnualEarnings(selectedDish, suggestion, monthlyVolume).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    vs ${calculateOriginalAnnualEarnings(selectedDish, monthlyVolume).toLocaleString()} current
                                  </p>
                                </div>
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