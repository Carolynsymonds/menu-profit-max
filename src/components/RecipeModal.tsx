import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  cost: number;
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  rating: number;
  ingredients: Ingredient[];
  method?: string[];
  strategy?: string;
  strategyType?: 'standard' | 'highMargin' | 'premium';
}

export function RecipeModal({ isOpen, onClose, recipeName, rating, ingredients, method, strategy, strategyType }: RecipeModalProps) {
  const totalCost = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  
  const getStrategyBadgeColor = (type?: string) => {
    switch (type) {
      case 'standard': return 'bg-gray-100 text-gray-800';
      case 'highMargin': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrategyDescription = (type?: string) => {
    switch (type) {
      case 'standard': return 'Base recipe with standard ingredients';
      case 'highMargin': return 'Optimized for cost efficiency and higher margins';
      case 'premium': return 'Premium ingredients for elevated dining experience';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{recipeName}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-amber-400">
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
              </span>
              <span className="text-sm text-gray-600">({rating}/5)</span>
            </div>
            {strategy && (
              <div className="mt-3 flex flex-col gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStrategyBadgeColor(strategyType)}`}>
                  {strategy}
                </span>
                {strategyType && (
                  <span className="text-sm text-gray-600">
                    {getStrategyDescription(strategyType)}
                  </span>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          {/* Ingredients Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Ingredients</h3>
            
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium">{ingredient.name}</span>
                    <div className="text-sm text-gray-600">
                      {ingredient.quantity} {ingredient.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-medium">${ingredient.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                  <span className="text-lg font-semibold text-gray-900">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Method Section */}
          {method && method.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Method</h3>
              <div className="space-y-3">
                {method.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}