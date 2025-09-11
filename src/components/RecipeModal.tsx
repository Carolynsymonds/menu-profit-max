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
}

export function RecipeModal({ isOpen, onClose, recipeName, rating, ingredients }: RecipeModalProps) {
  const totalCost = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);

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
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Ingredients & Costs</h3>
          
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
      </DialogContent>
    </Dialog>
  );
}