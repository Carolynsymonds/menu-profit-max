import React from 'react';

interface AppetizerSuggestion {
  starter: string;
  ingredientCost: 'Very Low' | 'Low' | 'Medium' | 'High';
  marginPotential: number; // 1-5 stars
  perceivedPremium: number; // 1-5 stars
  whyItWorks: string;
}

interface HighMarginAppetizersProps {
  dishName: string;
  appetizers: AppetizerSuggestion[];
  isVerified?: boolean;
  onUnlock?: () => void;
}

const StarRating = ({ rating }: { rating: number }) => (
  <span className="text-amber-400">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

const getCostBadgeColor = (cost: string) => {
  switch (cost) {
    case 'Very Low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Low':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function HighMarginAppetizers({ dishName, appetizers, isVerified = false, onUnlock }: HighMarginAppetizersProps) {
  return (
    <div className="w-full bg-gray-50 py-12 mt-8">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
          High Margin Appetizer Ideas For {dishName}
        </h3>
        
        <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
          {!isVerified && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <button
                  onClick={onUnlock}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Unlock Premium Features
                </button>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your email to access high-margin appetizer suggestions
                </p>
              </div>
            </div>
          )}
          
          <div className={`overflow-x-auto ${!isVerified ? 'blur-md' : ''}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ingredient Cost</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Margin Potential</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Perceived Premium Feel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Why It Works with {dishName}</th>
                </tr>
              </thead>
              <tbody>
                {appetizers.map((appetizer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {appetizer.starter}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCostBadgeColor(appetizer.ingredientCost)}`}>
                        {appetizer.ingredientCost}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <StarRating rating={appetizer.marginPotential} />
                        <span className="text-xs text-gray-500 mt-1">
                          {appetizer.marginPotential === 5 ? '85–90%' :
                           appetizer.marginPotential === 4 ? '75–85%' :
                           appetizer.marginPotential === 3 ? '65–75%' :
                           appetizer.marginPotential === 2 ? '55–65%' : '45–55%'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <StarRating rating={appetizer.perceivedPremium} />
                        <span className="text-xs text-gray-500 mt-1">
                          {appetizer.perceivedPremium === 5 ? 'Indulgent' :
                           appetizer.perceivedPremium === 4 ? 'Upmarket' :
                           appetizer.perceivedPremium === 3 ? 'Standard' :
                           appetizer.perceivedPremium === 2 ? 'Casual' : 'Basic'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {appetizer.whyItWorks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}