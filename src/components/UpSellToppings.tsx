import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { VerificationModal } from './VerificationModal';

interface ToppingSuggestion {
  name: string;
  ingredientCost: 'Low' | 'Med' | 'High';
  marginPotential: number; // 1-5 stars
  perceivedPremium: number; // 1-5 stars
  whyItWorks: string;
}

interface UpSellToppingsProps {
  dishName: string;
  toppings: ToppingSuggestion[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <span className="text-amber-400">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

const getCostBadgeColor = (cost: string) => {
  switch (cost) {
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Med':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function UpSellToppings({ dishName, toppings }: UpSellToppingsProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      {/* Section Header */}
      <div className="pt-8 pb-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Up Sell Toppings & Extras to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
        </h3>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-5 gap-0 border-t border-gray-200 pt-4">
        <div className="text-[15px] font-medium text-gray-700">Topping & Extra</div>
        <div className="text-[15px] font-medium text-gray-700">Ingredient Cost (Low/Med/High)</div>
        <div className="text-[15px] font-medium text-gray-700">Margin Potential</div>
        <div className="text-[15px] font-medium text-gray-700">Perceived Premium Feel</div>
        <div className="text-[15px] font-medium text-gray-700">Why It Works with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}</div>

        {/* Topping Rows */}
        {toppings.slice(0, Math.ceil(toppings.length / 2)).map((topping, index) => (
          <React.Fragment key={index}>
            <div className="p-[10px] font-medium text-gray-900 text-[15px] blur-sm">
              {topping.name}
            </div>
            <div className="p-[10px] blur-sm">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[15px] font-medium border ${getCostBadgeColor(topping.ingredientCost)}`}>
                {topping.ingredientCost}
              </span>
            </div>
            <div className="p-[10px] blur-sm">
              <div className="flex flex-col">
                <StarRating rating={topping.marginPotential} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {topping.marginPotential === 5 ? '85–90%' :
                   topping.marginPotential === 4 ? '75–85%' :
                   topping.marginPotential === 3 ? '65–75%' :
                   topping.marginPotential === 2 ? '55–65%' : '45–55%'}
                </span>
              </div>
            </div>
            <div className="p-[10px] blur-sm">
              <div className="flex flex-col">
                <StarRating rating={topping.perceivedPremium} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {topping.perceivedPremium === 5 ? 'Luxury, indulgent' :
                   topping.perceivedPremium === 4 ? 'Creamy, indulgent' :
                   topping.perceivedPremium === 3 ? 'Rustic, artisanal' :
                   topping.perceivedPremium === 2 ? 'Standard' : 'Basic'}
                </span>
              </div>
            </div>
            <div className="p-[10px] text-[15px] text-gray-700 blur-sm">
              {topping.whyItWorks}
            </div>
          </React.Fragment>
        ))}

        {/* Download Report Button in the middle */}
        <div className="col-span-5 py-8 flex justify-center">
          <Button 
            variant="default" 
            size="sm"
            className="self-start font-normal text-xs h-8"
            onClick={() => setShowReportModal(true)}
          >
            Download full report
          </Button>
        </div>

        {/* Remaining Topping Rows */}
        {toppings.slice(Math.ceil(toppings.length / 2)).map((topping, index) => (
          <React.Fragment key={index + Math.ceil(toppings.length / 2)}>
            <div className="p-[10px] font-medium text-gray-900 text-[15px] blur-sm">
              {topping.name}
            </div>
            <div className="p-[10px] blur-sm">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[15px] font-medium border ${getCostBadgeColor(topping.ingredientCost)}`}>
                {topping.ingredientCost}
              </span>
            </div>
            <div className="p-[10px] blur-sm">
              <div className="flex flex-col">
                <StarRating rating={topping.marginPotential} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {topping.marginPotential === 5 ? '85–90%' :
                   topping.marginPotential === 4 ? '75–85%' :
                   topping.marginPotential === 3 ? '65–75%' :
                   topping.marginPotential === 2 ? '55–65%' : '45–55%'}
                </span>
              </div>
            </div>
            <div className="p-[10px] blur-sm">
              <div className="flex flex-col">
                <StarRating rating={topping.perceivedPremium} />
                <span className="text-[15px] text-gray-500 mt-1">
                  {topping.perceivedPremium === 5 ? 'Luxury, indulgent' :
                   topping.perceivedPremium === 4 ? 'Creamy, indulgent' :
                   topping.perceivedPremium === 3 ? 'Rustic, artisanal' :
                   topping.perceivedPremium === 2 ? 'Standard' : 'Basic'}
                </span>
              </div>
            </div>
            <div className="p-[10px] text-[15px] text-gray-700 blur-sm">
              {topping.whyItWorks}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Report Download Modal */}
      <VerificationModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        dishesData={[{ toppings, dishName }]}
        purpose="download-report"
      />
    </section>
  );
}