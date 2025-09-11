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

      {/* Wine Pairing Section */}
      <div className="mx-auto max-w-6xl px-4 mt-12">
        <div className="pt-8 pb-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Wine Pairing Ideas to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
          </h3>
        </div>

        {/* Wine Pairing Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-t border-gray-200">
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Example Wine Brand / Type
                </th>
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Est. Cost Per Bottle (Range)
                </th>
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Margin Potential (Menu Price / Profit)
                </th>
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Perceived Premium Feel
                </th>
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Why It Works with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
                </th>
              </tr>
            </thead>
            <tbody>
              {winePairings.map((wine, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-[15px] font-medium text-gray-900 blur-sm">
                    {wine.name}
                  </td>
                  <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                    {wine.costRange}
                  </td>
                  <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                    {wine.marginPotential}
                  </td>
                  <td className="py-3 px-2 text-[15px] blur-sm">
                    <div className="flex flex-col">
                      <StarRating rating={wine.premiumRating} />
                      <span className="text-[13px] text-gray-500 mt-1">
                        {wine.premiumDescription}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                    {wine.whyItWorks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Wine pairing data for Risotto
const winePairings = [
  {
    name: "Barolo (Brunate Vineyard)",
    costRange: "$80–$150",
    marginPotential: "Price: $280 Profit: +$130–$200",
    premiumRating: 5,
    premiumDescription: "elegant, prestigious",
    whyItWorks: "Barolo's structured tannins complement risotto's creamy richness without overwhelming."
  },
  {
    name: "Soave Classico (Pieropan)",
    costRange: "$18–$28",
    marginPotential: "Price: $85 Profit: +$57–$67",
    premiumRating: 4,
    premiumDescription: "crisp, refined",
    whyItWorks: "Soave's mineral freshness cuts through risotto's butter while enhancing grain flavors."
  },
  {
    name: "Franciacorta DOCG (Ca' del Bosco)",
    costRange: "$35–$55",
    marginPotential: "Price: $140 Profit: +$85–$105",
    premiumRating: 5,
    premiumDescription: "luxurious, celebratory",
    whyItWorks: "Sparkling acidity cleanses the palate between rich, creamy spoonfuls of risotto."
  },
  {
    name: "Pinot Grigio Alto Adige (Alois Lageder)",
    costRange: "$22–$32",
    marginPotential: "Price: $95 Profit: +$63–$73",
    premiumRating: 4,
    premiumDescription: "clean, sophisticated",
    whyItWorks: "Alto Adige's bright acidity balances risotto's richness while adding alpine freshness."
  },
  {
    name: "Chianti Classico Riserva (Felsina)",
    costRange: "$30–$45",
    marginPotential: "Price: $115 Profit: +$70–$85",
    premiumRating: 4,
    premiumDescription: "classic, authentic",
    whyItWorks: "Chianti's savory herbs and moderate tannins complement mushroom or meat risottos perfectly."
  },
  {
    name: "Barbera d'Alba (Giacomo Conterno)",
    costRange: "$25–$40",
    marginPotential: "Price: $105 Profit: +$65–$80",
    premiumRating: 4,
    premiumDescription: "vibrant, food-friendly",
    whyItWorks: "Barbera's bright acidity cuts through cream while its fruit enhances risotto's comfort."
  },
  {
    name: "Vermentino di Sardegna (Argiolas)",
    costRange: "$16–$24",
    marginPotential: "Price: $75 Profit: +$51–$59",
    premiumRating: 3,
    premiumDescription: "coastal, refreshing",
    whyItWorks: "Vermentino's sea-breeze freshness pairs beautifully with seafood risottos."
  },
  {
    name: "Prosecco di Valdobbiadene DOCG (Nino Franco)",
    costRange: "$20–$30",
    marginPotential: "Price: $90 Profit: +$60–$70",
    premiumRating: 4,
    premiumDescription: "festive, approachable",
    whyItWorks: "Prosecco's gentle bubbles and fruit balance risotto's richness with celebration."
  },
  {
    name: "Dolcetto d'Alba (Paolo Scavino)",
    costRange: "$18–$28",
    marginPotential: "Price: $85 Profit: +$57–$67",
    premiumRating: 3,
    premiumDescription: "approachable, rustic",
    whyItWorks: "Dolcetto's soft tannins and cherry fruit complement risotto without competing."
  },
  {
    name: "Gavi di Gavi (La Scolca)",
    costRange: "$24–$35",
    marginPotential: "Price: $105 Profit: +$70–$81",
    premiumRating: 4,
    premiumDescription: "mineral, elegant",
    whyItWorks: "Gavi's crisp minerality enhances risotto's grain while cleansing the palate."
  }
];