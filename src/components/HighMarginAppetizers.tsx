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
    <section className="mx-auto max-w-6xl mt-12">
      {/* Section Header */}
      <div className="pt-8 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          High Margin Appetizer Ideas For {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
        </h3>
      </div>

      {/* Appetizer Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-t border-gray-200">
              <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
              </th>
              <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                Ingredient Cost
              </th>
              <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                Margin Potential
              </th>
              <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                Perceived Premium
              </th>
              <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                Why It Works with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Appetizer Rows */}
            {appetizers.map((appetizer, index) => (
              <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'mb-5' : ''}`}>
                <td className="py-3 px-2 text-[15px] font-medium text-gray-900">
                  {appetizer.starter}
                </td>
                <td className="py-3 px-2 text-[15px] text-gray-700">
                  {appetizer.ingredientCost}
                </td>
                <td className="py-3 px-2 text-[15px]">
                  <div className="flex flex-col">
                    <StarRating rating={appetizer.marginPotential} />
                    <span className="text-[15px] text-gray-500 mt-1">
                      {appetizer.marginPotential === 5 ? '85–90%' :
                       appetizer.marginPotential === 4 ? '75–85%' :
                       appetizer.marginPotential === 3 ? '65–75%' :
                       appetizer.marginPotential === 2 ? '55–65%' : '45–55%'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-[15px]">
                  <div className="flex flex-col">
                    <StarRating rating={appetizer.perceivedPremium} />
                    <span className="text-[15px] text-gray-500 mt-1">
                      {appetizer.perceivedPremium === 5 ? 'Indulgent' :
                       appetizer.perceivedPremium === 4 ? 'Upmarket' :
                       appetizer.perceivedPremium === 3 ? 'Standard' :
                       appetizer.perceivedPremium === 2 ? 'Casual' : 'Basic'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-[15px] text-gray-700">
                  {appetizer.whyItWorks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}