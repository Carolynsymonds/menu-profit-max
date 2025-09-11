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
      <div className="pt-8 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Up Sell Toppings & Extras to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
        </h3>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-5 gap-0 border-t border-gray-200 pt-4">
        <div className="text-[15px] font-medium text-gray-700"></div>
        <div className="text-[15px] font-medium text-gray-700">Ingredient Cost (Low/Med/High)</div>
        <div className="text-[15px] font-medium text-gray-700">Margin Potential</div>
        <div className="text-[15px] font-medium text-gray-700">Perceived Premium Feel</div>
        <div className="text-[15px] font-medium text-gray-700">Why It Works with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}</div>

        {/* Topping Rows */}
        {toppings.slice(0, Math.ceil(toppings.length / 2)).map((topping, index) => (
          <React.Fragment key={index}>
            <div className={`p-[10px] font-medium text-gray-900 text-[15px] blur-sm ${index === 0 ? 'mb-2.5' : ''}`}>
              {topping.name}
            </div>
            <div className="p-[10px] blur-sm">
              {topping.ingredientCost}
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
              {topping.ingredientCost}
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
        <div className="pt-8 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Wine Pairing Ideas to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
          </h3>
        </div>

        {/* Wine Pairing Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-t border-gray-200">
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
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
                  Why It Works with
                </th>
              </tr>
            </thead>
            <tbody>
              {winePairings.slice(0, Math.ceil(winePairings.length / 2)).map((wine, index) => (
                <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'mb-2.5' : ''}`}>
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
               
               {/* Download Report Button in the middle */}
               <tr>
                 <td colSpan={5} className="py-8">
                   <div className="flex justify-center">
                     <Button 
                       variant="default" 
                       size="sm"
                       className="self-start font-normal text-xs h-8"
                       onClick={() => setShowReportModal(true)}
                     >
                       Download full report
                     </Button>
                   </div>
                 </td>
               </tr>
               
               {/* Remaining Wine Rows */}
              {winePairings.slice(Math.ceil(winePairings.length / 2)).map((wine, index) => (
                <tr key={index + Math.ceil(winePairings.length / 2)} className="border-b border-gray-100">
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

      {/* Non-Alcoholic Pairing Section */}
      <div className="mx-auto max-w-6xl px-4 mt-12">
        <div className="pt-8 pb-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Non-Alcoholic Pairing Ideas to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
          </h3>
        </div>

        {/* Non-Alcoholic Pairing Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-t border-gray-200">
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
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
                  Why It Works
                </th>
              </tr>
            </thead>
            <tbody>
               {nonAlcoholicPairings.slice(0, Math.ceil(nonAlcoholicPairings.length / 2)).map((drink, index) => (
                 <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'mb-2.5' : ''}`}>
                   <td className="py-3 px-2 text-[15px] font-medium text-gray-900 blur-sm">
                     {drink.name}
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.costRange}
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.marginPotential}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={drink.premiumRating} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {drink.premiumDescription}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.whyItWorks}
                   </td>
                 </tr>
               ))}
               
               {/* Download Report Button in the middle */}
               <tr>
                 <td colSpan={5} className="py-8">
                   <div className="flex justify-center">
                     <Button 
                       variant="default" 
                       size="sm"
                       className="self-start font-normal text-xs h-8"
                       onClick={() => setShowReportModal(true)}
                     >
                       Download full report
                     </Button>
                   </div>
                 </td>
               </tr>
               
               {/* Remaining Non-Alcoholic Rows */}
               {nonAlcoholicPairings.slice(Math.ceil(nonAlcoholicPairings.length / 2)).map((drink, index) => (
                 <tr key={index + Math.ceil(nonAlcoholicPairings.length / 2)} className="border-b border-gray-100">
                   <td className="py-3 px-2 text-[15px] font-medium text-gray-900 blur-sm">
                     {drink.name}
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.costRange}
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.marginPotential}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={drink.premiumRating} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {drink.premiumDescription}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {drink.whyItWorks}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* High Margin Dessert Ideas Section */}
      <div className="mx-auto max-w-6xl px-4 mt-12">
        <div className="pt-8 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            High Margin Dessert Ideas to go with {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
          </h3>
        </div>

        {/* Dessert Ideas Table */}
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
                  Perceived Premium Feel
                </th>
                <th className="text-left py-3 px-2 text-[15px] font-medium text-gray-700 border-b border-gray-200">
                  Why It Works After {dishName.charAt(0).toUpperCase() + dishName.slice(1)}
                </th>
              </tr>
            </thead>
            <tbody>
               {dessertIdeas.slice(0, Math.ceil(dessertIdeas.length / 2)).map((dessert, index) => (
                 <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'mb-2.5' : ''}`}>
                   <td className="py-3 px-2 text-[15px] font-medium text-gray-900 blur-sm">
                     {dessert.name}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     {dessert.ingredientCost}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={dessert.marginPotential} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {dessert.marginPotential === 5 ? '85–90%' :
                          dessert.marginPotential === 4 ? '75–85%' :
                          dessert.marginPotential === 3 ? '65–75%' :
                          dessert.marginPotential === 2 ? '55–65%' : '45–55%'}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={dessert.premiumRating} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {dessert.premiumDescription}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {dessert.whyItWorks}
                   </td>
                 </tr>
               ))}
               
               {/* Download Report Button in the middle */}
               <tr>
                 <td colSpan={5} className="py-8">
                   <div className="flex justify-center">
                     <Button 
                       variant="default" 
                       size="sm"
                       className="self-start font-normal text-xs h-8"
                       onClick={() => setShowReportModal(true)}
                     >
                       Download full report
                     </Button>
                   </div>
                 </td>
               </tr>
               
               {/* Remaining Dessert Rows */}
               {dessertIdeas.slice(Math.ceil(dessertIdeas.length / 2)).map((dessert, index) => (
                 <tr key={index + Math.ceil(dessertIdeas.length / 2)} className="border-b border-gray-100">
                   <td className="py-3 px-2 text-[15px] font-medium text-gray-900 blur-sm">
                     {dessert.name}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     {dessert.ingredientCost}
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={dessert.marginPotential} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {dessert.marginPotential === 5 ? '85–90%' :
                          dessert.marginPotential === 4 ? '75–85%' :
                          dessert.marginPotential === 3 ? '65–75%' :
                          dessert.marginPotential === 2 ? '55–65%' : '45–55%'}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] blur-sm">
                     <div className="flex flex-col">
                       <StarRating rating={dessert.premiumRating} />
                       <span className="text-[13px] text-gray-500 mt-1">
                         {dessert.premiumDescription}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-2 text-[15px] text-gray-700 blur-sm">
                     {dessert.whyItWorks}
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

// Non-alcoholic pairing data for Risotto
const nonAlcoholicPairings = [
  {
    name: "San Pellegrino Sparkling Water",
    costRange: "$1.00–$2.00",
    marginPotential: "Price: $6 Profit: +$4–$5",
    premiumRating: 4,
    premiumDescription: "refreshing, refined",
    whyItWorks: "Bubbles cleanse the palate between rich, creamy spoonfuls of risotto."
  },
  {
    name: "Italian Lemon Soda (Sanpellegrino Limonata)",
    costRange: "$1.50–$2.50",
    marginPotential: "Price: $7 Profit: +$4.50–$5.50",
    premiumRating: 4,
    premiumDescription: "vibrant, authentic",
    whyItWorks: "Citrus brightness cuts through risotto's richness while maintaining Italian authenticity."
  },
  {
    name: "Elderflower Sparkling (Fever-Tree)",
    costRange: "$2.00–$3.00",
    marginPotential: "Price: $8 Profit: +$5–$6",
    premiumRating: 4,
    premiumDescription: "floral, sophisticated",
    whyItWorks: "Elderflower's delicate sweetness complements risotto's grain without overpowering."
  },
  {
    name: "NA White Wine (Ariel Chardonnay)",
    costRange: "$6–$10",
    marginPotential: "Price: $22 Profit: +$12–$16",
    premiumRating: 4,
    premiumDescription: "authentic, wine-like",
    whyItWorks: "Maintains traditional white wine pairing with risotto, alcohol-free."
  },
  {
    name: "Craft Ginger Beer (Fever-Tree)",
    costRange: "$2.00–$3.00",
    marginPotential: "Price: $8 Profit: +$5–$6",
    premiumRating: 4,
    premiumDescription: "spicy, sophisticated",
    whyItWorks: "Ginger's warmth and spice complement mushroom or truffle risottos beautifully."
  },
  {
    name: "Kombucha (GT's Gingerade)",
    costRange: "$2.50–$4.00",
    marginPotential: "Price: $9 Profit: +$5–$6.50",
    premiumRating: 4,
    premiumDescription: "trendy, health-conscious",
    whyItWorks: "Natural acidity and fermentation notes provide complexity alongside creamy risotto."
  },
  {
    name: "House-Made Herb Lemonade",
    costRange: "$0.80–$1.50",
    marginPotential: "Price: $8 Profit: +$6.50–$7.20",
    premiumRating: 4,
    premiumDescription: "fresh, artisanal",
    whyItWorks: "Fresh herbs echo risotto seasonings while lemon cuts through richness."
  },
  {
    name: "Seedlip Garden 108 (NA Spirit with Tonic)",
    costRange: "$8–$12",
    marginPotential: "Price: $16 Profit: +$4–$8",
    premiumRating: 5,
    premiumDescription: "elegant, modern",
    whyItWorks: "Botanical complexity elevates the dining experience, matching risotto's sophistication."
  },
  {
    name: "Iced Green Tea (House Brewed)",
    costRange: "$0.30–$0.60",
    marginPotential: "Price: $4.50 Profit: +$3.90–$4.20",
    premiumRating: 3,
    premiumDescription: "clean, refreshing",
    whyItWorks: "Green tea's subtle earthiness complements risotto while cleansing the palate."
  },
  {
    name: "Artisanal Shrub (House-Made Berry)",
    costRange: "$1.50–$2.50",
    marginPotential: "Price: $12 Profit: +$9.50–$10.50",
    premiumRating: 4,
    premiumDescription: "craft, upscale",
    whyItWorks: "Vinegar acidity and fruit complexity provide wine-like pairing experience, alcohol-free."
  }
];

// High margin dessert ideas for Risotto
const dessertIdeas = [
  {
    name: "Affogato (espresso over gelato)",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "elegant, sophisticated",
    whyItWorks: "Light finish after rich risotto; espresso's intensity cleanses creamy palate."
  },
  {
    name: "Panna Cotta with Berry Coulis",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "silky, refined",
    whyItWorks: "Creamy continuation of risotto's texture; berry acidity provides fresh contrast."
  },
  {
    name: "Tiramisu",
    ingredientCost: "Med",
    marginPotential: 4,
    premiumRating: 5,
    premiumDescription: "iconic, indulgent",
    whyItWorks: "Classic Italian pairing; coffee cuts through risotto's richness beautifully."
  },
  {
    name: "Limoncello Sorbet",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "refreshing, authentic",
    whyItWorks: "Citrus cleanses palate after creamy risotto; alcohol adds sophistication."
  },
  {
    name: "Mini Cannoli Trio",
    ingredientCost: "Med",
    marginPotential: 4,
    premiumRating: 4,
    premiumDescription: "playful, classic",
    whyItWorks: "Portion-controlled indulgence; ricotta echoes risotto's Italian heritage."
  },
  {
    name: "Zabaglione with Fresh berries",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "luxurious, traditional",
    whyItWorks: "Light egg foam contrasts risotto's density; Marsala adds Italian authenticity."
  },
  {
    name: "Chocolate Budino",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "trendy, upscale",
    whyItWorks: "Rich but not heavy; chocolate's intensity complements savory risotto finish."
  },
  {
    name: "Amaretto Panna Cotta",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "almond-scented, elegant",
    whyItWorks: "Almond's nuttiness pairs with risotto grains; light texture after hearty main."
  },
  {
    name: "Gelato Trio (3 small scoops)",
    ingredientCost: "Med",
    marginPotential: 4,
    premiumRating: 4,
    premiumDescription: "artisanal, shareable",
    whyItWorks: "Variety encourages sharing; cold temperature refreshes after warm risotto."
  },
  {
    name: "Biscotti with Vin Santo",
    ingredientCost: "Low",
    marginPotential: 5,
    premiumRating: 4,
    premiumDescription: "traditional, authentic",
    whyItWorks: "Traditional Italian ending; wine pairing drives additional beverage revenue."
  }
];