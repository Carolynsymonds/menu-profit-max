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

export default function HighMarginAppetizers({ dishName, appetizers }: HighMarginAppetizersProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      {/* Section Header */}
      <div className="pt-8 pb-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          High Margin Appetizer Ideas For {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
        </h3>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-5 gap-0 border-t border-gray-200 pt-4">
        <div className="text-[15px] font-medium text-gray-700">Starter</div>
        <div className="text-[15px] font-medium text-gray-700">Ingredient Cost</div>
        <div className="text-[15px] font-medium text-gray-700">Margin Potential</div>
        <div className="text-[15px] font-medium text-gray-700">Perceived Premium</div>
        <div className="text-[15px] font-medium text-gray-700">Why It Works</div>

        {/* Appetizer Rows */}
        {appetizers.map((appetizer, index) => (
          <React.Fragment key={index}>
            <div className={`p-[10px] font-medium text-gray-900 text-[15px] ${index === 0 ? 'mb-2.5' : ''}`}>
              {appetizer.starter}
            </div>
            <div className="p-[10px] text-[15px]">
              {appetizer.ingredientCost}
            </div>
            <div className="p-[10px]">
              <div className="flex flex-col">
                <StarRating rating={appetizer.marginPotential} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {appetizer.marginPotential === 5 ? '85–90%' :
                   appetizer.marginPotential === 4 ? '75–85%' :
                   appetizer.marginPotential === 3 ? '65–75%' :
                   appetizer.marginPotential === 2 ? '55–65%' : '45–55%'}
                </span>
              </div>
            </div>
            <div className="p-[10px]">
              <div className="flex flex-col">
                <StarRating rating={appetizer.perceivedPremium} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {appetizer.perceivedPremium === 5 ? 'Indulgent' :
                   appetizer.perceivedPremium === 4 ? 'Upmarket' :
                   appetizer.perceivedPremium === 3 ? 'Standard' :
                   appetizer.perceivedPremium === 2 ? 'Casual' : 'Basic'}
                </span>
              </div>
            </div>
            <div className="p-[10px] text-[15px] text-gray-700">
              {appetizer.whyItWorks}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}