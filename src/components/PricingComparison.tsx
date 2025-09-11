import React, { useState, useEffect } from 'react';
import HighMarginAppetizers from './HighMarginAppetizers';
import UpSellToppings from './UpSellToppings';
import { Button } from "@/components/ui/button";
import { RecipeModal } from './RecipeModal';
import { VerificationModal } from './VerificationModal';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  cost: number;
}

interface PricingStrategy {
  dishName: string;
  strategy: string;
  recipeRating: number;
  recipeUrl: string;
  ingredients?: Ingredient[];
  price: number;
  prepLabor: number;
  foodCost: number;
  primeCost: number;
  plateProfit: number;
  profitUplift?: {
    percentage: number;
    amount: number;
  };
  estimatedVolume?: number;
  annualProfitUplift?: number;
}

interface AppetizerSuggestion {
  starter: string;
  ingredientCost: 'Very Low' | 'Low' | 'Medium' | 'High';
  marginPotential: number;
  perceivedPremium: number;
  whyItWorks: string;
}

interface ToppingSuggestion {
  name: string;
  ingredientCost: 'Low' | 'Med' | 'High';
  marginPotential: number;
  perceivedPremium: number;
  whyItWorks: string;
}

interface PricingComparisonProps {
  data: {
    standard: PricingStrategy;
    highMargin: PricingStrategy;
    premium: PricingStrategy;
    appetizers?: AppetizerSuggestion[];
    toppings?: ToppingSuggestion[];
  };
}

export default function PricingComparison({ data }: PricingComparisonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<{
    name: string;
    rating: number;
    ingredients: Ingredient[];
  } | null>(null);

  const [strategies, setStrategies] = useState(() => {
    // Initialize calculated fields for all strategies
    const initializeStrategy = (strategy: PricingStrategy) => {
      // Ensure all values are numbers
      const price = Number(strategy.price) || 0;
      const prepLabor = Number(strategy.prepLabor) || 0;
      const foodCost = Number(strategy.foodCost) || 0;
      const estimatedVolume = strategy.estimatedVolume ? Number(strategy.estimatedVolume) : undefined;
      
      const primeCost = prepLabor + foodCost;
      const plateProfit = price - primeCost;
      
      return {
        ...strategy,
        price,
        prepLabor,
        foodCost,
        estimatedVolume,
        primeCost,
        plateProfit,
        profitUplift: undefined,
        annualProfitUplift: undefined
      };
    };

    const initialized = {
      standard: initializeStrategy(data.standard),
      highMargin: initializeStrategy(data.highMargin),
      premium: initializeStrategy(data.premium)
    };

    // Calculate profit uplifts for non-standard strategies
    const standardProfit = initialized.standard.plateProfit;
    
    ['highMargin', 'premium'].forEach(key => {
      const strategy = initialized[key as keyof typeof initialized];
      const uplift = strategy.plateProfit - standardProfit;
      const percentage = standardProfit > 0 ? (uplift / standardProfit) * 100 : 0;
      
      strategy.profitUplift = {
        percentage: Math.round(percentage * 10) / 10,
        amount: Math.round(uplift * 100) / 100
      };
      
      if (strategy.estimatedVolume) {
        strategy.annualProfitUplift = uplift * strategy.estimatedVolume * 12;
      }
    });

    return initialized;
  });

  // Update calculated fields when inputs change
  const updateStrategy = (strategyKey: keyof typeof strategies, field: string, value: number) => {
    setStrategies(prev => {
      const updated = { ...prev };
      const strategy = { ...updated[strategyKey] };
      
      // Update the field, ensuring it's a number
      (strategy as any)[field] = Number(value) || 0;
      
      // Recalculate derived fields
      strategy.primeCost = Number(strategy.prepLabor) + Number(strategy.foodCost);
      strategy.plateProfit = Number(strategy.price) - strategy.primeCost;
      
      // Calculate profit uplift compared to standard
      if (strategyKey !== 'standard') {
        const standardProfit = updated.standard.plateProfit;
        const uplift = strategy.plateProfit - standardProfit;
        const percentage = standardProfit > 0 ? (uplift / standardProfit) * 100 : 0;
        strategy.profitUplift = {
          percentage: Math.round(percentage * 10) / 10,
          amount: Math.round(uplift * 100) / 100
        };
        
        // Calculate annual profit uplift if volume is set
        if (strategy.estimatedVolume) {
          strategy.annualProfitUplift = uplift * strategy.estimatedVolume * 12;
        }
      }
      
      updated[strategyKey] = strategy;
      return updated;
    });
  };

  const handleInputChange = (strategyKey: keyof typeof strategies, field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) || 0;
    updateStrategy(strategyKey, field, value);
  };

  const handleViewRecipe = (strategy: PricingStrategy) => {
    if (strategy.ingredients && strategy.ingredients.length > 0) {
      setSelectedRecipe({
        name: strategy.dishName,
        rating: strategy.recipeRating,
        ingredients: strategy.ingredients
      });
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full bg-white py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight text-center capitalize">
        {strategies.standard.dishName}
      </h1>
      <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed text-center mb-10">
        Plans & strategies
      </h2>
      
      <section className="mx-auto max-w-6xl px-4">
        {/* Column headers */}
        <div className="grid grid-cols-4">
        <div className="text-[15px] font-medium text-gray-500 border-b border-gray-200"> </div>
        <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Standard</div>
        <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">High Margin</div>
        <div className="flex flex-col pb-[10px] border-b border-gray-200">
          <span className="text-[15px] font-semibold mb-2">Premium</span>
          <Button 
            variant="default" 
            size="sm"
            className="self-start font-normal text-xs h-8"
            onClick={() => setShowReportModal(true)}
          >
            Download full report
          </Button>
        </div>

        {/* Strategy */}
        <div className="py-4 text-[15px] font-medium text-gray-700 pt-6">Strategy</div>
        <div className="py-4 text-[15px] text-gray-600 pt-6">—</div>
        <div className="py-4 px-[10px] text-[15px] text-gray-800 pt-6">{strategies.highMargin.strategy}</div>
        <div className="py-4 text-[15px] text-gray-800 pt-6 blur-sm">{strategies.premium.strategy}</div>

        {/* Rating */}
        <div className="py-4 text-[15px] font-medium text-gray-700">Recipe rating</div>
        <div className="py-4">
          <span className="text-amber-400">
            {'★'.repeat(strategies.standard.recipeRating)}{'☆'.repeat(5 - strategies.standard.recipeRating)}
          </span>
          <button 
            onClick={() => handleViewRecipe(strategies.standard)} 
            className="ml-2 underline decoration-dotted text-[15px] text-gray-700 hover:text-black bg-transparent border-none cursor-pointer"
          >
            View recipe
          </button>
        </div>
        <div className="py-4">
          <span className="text-amber-400">
            {'★'.repeat(strategies.highMargin.recipeRating)}{'☆'.repeat(5 - strategies.highMargin.recipeRating)}
          </span>
          <button 
            onClick={() => handleViewRecipe(strategies.highMargin)} 
            className="ml-2 underline decoration-dotted text-[15px] text-gray-700 hover:text-black bg-transparent border-none cursor-pointer"
          >
            View recipe
          </button>
        </div>
        <div className="py-4 blur-sm">
          <span className="text-amber-400">
            {'★'.repeat(strategies.premium.recipeRating)}{'☆'.repeat(5 - strategies.premium.recipeRating)}
          </span>
          <button 
            onClick={() => handleViewRecipe(strategies.premium)} 
            className="ml-2 underline decoration-dotted text-[15px] text-gray-700 hover:text-black bg-transparent border-none cursor-pointer"
          >
            View recipe
          </button>
        </div>

        {/* Sales (per dish) */}
        <div className="pt-6 pb-2 text-[15px] font-semibold text-gray-900 border-t border-gray-200">Sales (per dish)</div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Price</div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px] text-gray-900" 
            value={strategies.standard.price.toFixed(2)}
            onChange={(e) => handleInputChange('standard', 'price', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px] text-gray-900" 
            value={strategies.highMargin.price.toFixed(2)}
            onChange={(e) => handleInputChange('highMargin', 'price', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3 blur-sm">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px] text-gray-900" 
            value={strategies.premium.price.toFixed(2)}
            onChange={(e) => handleInputChange('premium', 'price', e)}
            type="number"
            step="0.01"
          />
        </div>

        {/* Costs (per dish) */}
        <div className="pt-6 pb-2 text-[15px] font-semibold text-gray-900 border-t border-gray-200">Costs (per dish)</div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Prep labor <span className="ml-1 text-gray-400">(£)</span></div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.standard.prepLabor.toFixed(2)}
            onChange={(e) => handleInputChange('standard', 'prepLabor', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.highMargin.prepLabor.toFixed(2)}
            onChange={(e) => handleInputChange('highMargin', 'prepLabor', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3 blur-sm">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.premium.prepLabor.toFixed(2)}
            onChange={(e) => handleInputChange('premium', 'prepLabor', e)}
            type="number"
            step="0.01"
          />
        </div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Food cost <a className="ml-2 underline decoration-dotted text-[15px] text-gray-700 hover:text-black" href="#">See estimate</a></div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.standard.foodCost.toFixed(2)}
            onChange={(e) => handleInputChange('standard', 'foodCost', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.highMargin.foodCost.toFixed(2)}
            onChange={(e) => handleInputChange('highMargin', 'foodCost', e)}
            type="number"
            step="0.01"
          />
        </div>
        <div className="py-3 blur-sm">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.premium.foodCost.toFixed(2)}
            onChange={(e) => handleInputChange('premium', 'foodCost', e)}
            type="number"
            step="0.01"
          />
        </div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Prime cost</div>
        <div className="py-3 text-[15px] text-gray-900">£{strategies.standard.primeCost.toFixed(2)}</div>
        <div className="py-3 text-[15px] text-gray-900">£{strategies.highMargin.primeCost.toFixed(2)}</div>
        <div className="py-3 text-[15px] text-gray-900 blur-sm">£{strategies.premium.primeCost.toFixed(2)}</div>

        {/* Profit per dish */}
        <div className="pt-6 pb-2 text-[15px] font-semibold text-gray-900 border-t border-gray-200">Profit (per dish)</div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Plate profit</div>
        <div className="py-3 text-[15px] font-semibold">£{strategies.standard.plateProfit.toFixed(2)}</div>
        <div className="py-3 text-[15px] font-semibold">£{strategies.highMargin.plateProfit.toFixed(2)}</div>
        <div className="py-3 text-[15px] font-semibold blur-sm">£{strategies.premium.plateProfit.toFixed(2)}</div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Profit uplift</div>
        <div className="py-3 text-[15px] text-gray-500">—</div>
        <div className="py-3">
          {strategies.highMargin.profitUplift && (
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              +{strategies.highMargin.profitUplift.percentage}% (£{strategies.highMargin.profitUplift.amount})
            </span>
          )}
        </div>
        <div className="py-3 blur-sm">
          {strategies.premium.profitUplift && (
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              +{strategies.premium.profitUplift.percentage}% (£{strategies.premium.profitUplift.amount})
            </span>
          )}
        </div>

        {/* Annual */}
        <div className="pt-6 pb-2 text-[15px] font-semibold text-gray-900 border-t border-gray-200">Profit (annual)</div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>
        <div className="pt-6 pb-2 border-t border-gray-200"></div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Est. sales volume</div>
        <div className="py-3 text-[15px] text-gray-500">—</div>
        <div className="py-3">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.highMargin.estimatedVolume || 5000}
            onChange={(e) => handleInputChange('highMargin', 'estimatedVolume', e)}
            type="number"
          />
        </div>
        <div className="py-3 blur-sm">
          <input 
            className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-[15px]" 
            value={strategies.premium.estimatedVolume || 5000}
            onChange={(e) => handleInputChange('premium', 'estimatedVolume', e)}
            type="number"
          />
        </div>

        <div className="py-3 text-[15px] font-medium text-gray-700">Annual profit uplift</div>
        <div className="py-3 text-[15px] text-gray-500">—</div>
        <div className="py-3 text-[15px] font-semibold">
          £{strategies.highMargin.annualProfitUplift ? strategies.highMargin.annualProfitUplift.toLocaleString() : '0'}
        </div>
        <div className="py-3 text-[15px] font-semibold blur-sm">
          £{strategies.premium.annualProfitUplift ? strategies.premium.annualProfitUplift.toLocaleString() : '0'}
        </div>
        </div>
      </section>
      
      {/* High Margin Appetizers Section */}
      {data.appetizers && data.appetizers.length > 0 && (
        <HighMarginAppetizers 
          dishName={strategies.standard.dishName}
          appetizers={data.appetizers}
        />
      )}

      {/* Up Sell Toppings Section */}
      {data.toppings && data.toppings.length > 0 && (
        <UpSellToppings 
          dishName={strategies.standard.dishName}
          toppings={data.toppings}
        />
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          recipeName={selectedRecipe.name}
          rating={selectedRecipe.rating}
          ingredients={selectedRecipe.ingredients}
        />
      )}

      {/* Report Download Modal */}
      <VerificationModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        dishesData={[data]}
        purpose="download-report"
      />
    </div>
  );
}