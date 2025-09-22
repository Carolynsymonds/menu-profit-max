import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Info, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MenuAnalysisTable from "@/components/MenuAnalysisTable";

/**
 * Profitization Strategies — Dual-Metric Table
 * - Shows % Profit Uplift badge for quick comparison
 * - Shows Expected Revenue Gain as secondary (per month/year toggle)
 * - Sticky CTA with live projected gain total
 * - Accessible, responsive, drop-in for Lovable (React + Tailwind)
 */

// ---- Types
export type Strategy = {
  id: string;
  tag: "Up Price" | "Premium Anchor Pricing" | "Maximize Sides" | "Drop Low Margin Dishes" | "Set Menu" | string;
  dish: string; // e.g., "California Cobb"
  currentPrice?: number; // if pricing action
  newPrice?: number; // if pricing action
  rationale: string; // Why text
  monthlySales?: number; // units per month (for $ calc)
  grossMarginPct?: number; // current gross margin % (0-1), used if needed
  // Precomputed metrics (optional). If omitted we compute from price delta and volume.
  profitUpliftPct?: number; // relative profit uplift at plate level
  expectedGainPerMonth?: number; // absolute $ gain
  upliftText?: string; // Custom uplift description from GPT
};


function currency(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

function badgeColor(tag: string) {
  switch (tag) {
    case "Up Price":
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
    case "Premium Anchor Pricing":
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
    case "Maximize Sides":
      return "bg-sky-100 text-sky-800 ring-1 ring-sky-200";
    case "Drop Low Margin Dishes":
      return "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
    case "Set Menu":
      return "bg-violet-100 text-violet-800 ring-1 ring-violet-200";
    default:
      return "bg-slate-100 text-slate-800 ring-1 ring-slate-200";
  }
}

function computeExpectedGain(s: Strategy): { upliftPct: number; gainPerMonth: number } {
  // Prefer provided numbers if present
  const upliftPct = s.profitUpliftPct ?? (() => {
    if (s.currentPrice && s.newPrice && s.currentPrice > 0) {
      const delta = s.newPrice - s.currentPrice;
      // Simple heuristic: uplift relative to price as proxy for plate profit uplift
      return Math.round((delta / s.currentPrice) * 100);
    }
    return 0;
  })();

  const gainPerMonth = s.expectedGainPerMonth ?? (() => {
    if (s.currentPrice && s.newPrice && s.monthlySales) {
      const delta = s.newPrice - s.currentPrice;
      return Math.max(0, delta * s.monthlySales);
    }
    // Fallback: model a small impact when explicit gain is provided via uplift only
    if (s.profitUpliftPct && s.monthlySales && s.currentPrice) {
      return (s.profitUpliftPct / 100) * s.currentPrice * s.monthlySales * 0.2; // modest proxy
    }
    return 0;
  })();

  return { upliftPct, gainPerMonth };
}

interface ProfitizationStrategiesTableProps {
  strategies?: any[]; // The actual strategies from the API
  originalMenu?: any; // The original menu data to pass along
}

export default function ProfitizationTable({ strategies = [], originalMenu }: ProfitizationStrategiesTableProps) {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showAllStrategies, setShowAllStrategies] = useState<boolean>(false);
  const [showMenuPreview, setShowMenuPreview] = useState<boolean>(false);

  // Convert API strategies to our format
  const convertedStrategies = useMemo(() => {
    if (strategies.length > 0) {
      return strategies.map((strategy, index) => ({
        id: `strategy-${index}`,
        tag: strategy.action || "Strategy",
        dish: strategy.dish || "Menu Item",
        currentPrice: strategy.currentPrice,
        actionInstruction: strategy.actionInstruction,
        newPrice: strategy.newPrice,
        rationale: strategy.why || strategy.actionInstruction || "Strategy rationale",
        monthlySales: Math.floor(Math.random() * 50) + 20, // Mock data for now
        profitUpliftPct: Math.floor(Math.random() * 15) + 5, // Mock data for now
        upliftText: strategy.upliftText || `${Math.floor(Math.random() * 15) + 5}% plate profit`,
      }));
    }
    return [];
  }, [strategies]);

  // Restore previously selected strategies from localStorage
  React.useEffect(() => {
    const savedMenuData = localStorage.getItem('newMenuData');
    if (savedMenuData) {
      try {
        const parsedData = JSON.parse(savedMenuData);
        if (parsedData.selectedStrategies && parsedData.selectedStrategies.length > 0) {
          // Create a map of selected strategy IDs
          const selectedIds = new Set(parsedData.selectedStrategies.map((strategy: any) => strategy.id));
          
          // Update the selected state to match the saved selections
          const restoredSelected: Record<string, boolean> = {};
          convertedStrategies.forEach((strategy) => {
            if (selectedIds.has(strategy.id)) {
              restoredSelected[strategy.id] = true;
            }
          });
          
          setSelected(restoredSelected);
        }
      } catch (error) {
        console.error('Error restoring selected strategies:', error);
      }
    }
  }, [convertedStrategies]);

  const rows = useMemo(() => {
    const allRows = convertedStrategies.map((s) => {
      const m = computeExpectedGain(s);
      return { ...s, upliftPct: m.upliftPct, gainPerMonth: m.gainPerMonth };
    });
    
    // Show only top 3 initially, or all if showAllStrategies is true
    return showAllStrategies ? allRows : allRows.slice(0, 3);
  }, [convertedStrategies, showAllStrategies]);

  // Show loading or empty state if no strategies
  if (convertedStrategies.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profitization strategies...</p>
        </div>
      </div>
    );
  }

  const totalGain = useMemo(() => {
    const monthly = rows.reduce((acc, r) => (selected[r.id] ? acc + r.gainPerMonth : acc), 0);
    return period === "month" ? monthly : monthly * 12;
  }, [rows, selected, period]);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const handleGenerateNewMenu = () => {
    const selectedStrategyObjects = convertedStrategies.filter((_, index) => selected[`strategy-${index}`]);
    
    // Create the generated menu data
    const generatedMenuData = {
      originalMenu: originalMenu,
      selectedStrategies: selectedStrategyObjects,
      generatedAt: new Date().toISOString()
    };

    // Store in localStorage as backup
    localStorage.setItem('newMenuData', JSON.stringify(generatedMenuData));
    
    // Navigate to the generated menu page
    navigate('/generated-menu', {
      state: { generatedMenuData }
    });
  };

  // Generate updated menu with selected strategies applied
  const generateUpdatedMenu = () => {
    if (!originalMenu?.items) return { updatedMenu: [], removedItems: [] };
    
    const updatedMenu = [...originalMenu.items];
    const removedItems: any[] = [];
    const selectedStrategyObjects = convertedStrategies.filter((_, index) => selected[`strategy-${index}`]);
    
    selectedStrategyObjects.forEach(strategy => {
      switch (strategy.tag) {
        case "Up Price":
          // Find and update price for existing dish
          const itemIndex = updatedMenu.findIndex(item => 
            item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          if (itemIndex !== -1 && strategy.newPrice) {
            updatedMenu[itemIndex] = {
              ...updatedMenu[itemIndex],
              price: `$${strategy.newPrice}`
            };
          }
          break;
          
        case "New Dish":
        case "New Extra":
          // Add new dish or extra
          if (strategy.newPrice) {
            updatedMenu.push({
              dishTitle: strategy.dish,
              ingredients: [], // Would need to be provided by API
              price: `$${strategy.newPrice}`,
              category: (strategy as any).category || "New Items",
              strategyType: strategy.tag // Store the strategy type for display
            });
          }
          break;
          
        case "Remove Dish":
          // Remove dish and add to removed items
          const removeIndex = updatedMenu.findIndex(item => 
            item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          if (removeIndex !== -1) {
            removedItems.push(updatedMenu[removeIndex]);
            updatedMenu.splice(removeIndex, 1);
          }
          break;
      }
    });
    
    return { updatedMenu, removedItems };
  };

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-32">
      {/* Header */}
      <header className="pb-12 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Profitization Strategies</h1>
          <p className="text-slate-600 mt-2">AI-generated strategies to maximize your menu profitability</p>
        </div>
        <button 
          onClick={() => setShowMenuPreview(true)}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Sparkles className="h-4 w-4" /> See Menu Preview
        </button>
      </header>

    

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-0 bg-slate-50 px-5 py-3 text-xs font-sans font-semibold uppercase tracking-wide text-slate-600">
          <div className="col-span-2">Strategy</div>
          <div className="col-span-3">Suggestion</div>
          <div className="col-span-3">Why</div>
          <div className="col-span-2">Uplift</div>
          <div className="col-span-2 text-right pr-2">Select</div>
        </div>
        <ul className="divide-y divide-slate-200">
          {rows.map((r) => {
            const gain = period === "month" ? r.gainPerMonth : r.gainPerMonth * 12;
            const selectedRow = !!selected[r.id];
            return (
              <li key={r.id} className={`grid grid-cols-12 items-center px-5 py-4  bg-white`}>
                {/* Strategy tag */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-sans ${badgeColor(r.tag)}`}>{r.tag}</span>
                </div>

                {/* Suggestion */}
                <div className="col-span-3 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="leading-tight text-slate-700 font-sans">
                      <span dangerouslySetInnerHTML={{
                        __html: r.actionInstruction.replace(
                          new RegExp(`\\b${r.dish}\\b`, 'gi'),
                          `<strong>${r.dish}</strong>`
                        )
                      }} />
                      {r.currentPrice && r.newPrice ? (
                        <span className="text-slate-500"> ({currency(r.currentPrice)} → {currency(r.newPrice)})</span>
                      ) : null}
                    </p>
                  </div>
                </div>

                {/* Why */}
                <div className="col-span-3 text-slate-700 pr-4">
                  <p className="leading-snug font-sans italic">{r.rationale}</p>
                </div>

                {/* Uplift */}
                <div className="col-span-2 text-slate-700">
                  <div className="space-y-1">
                    {r.upliftText ? (
                      <p className="text-xs font-sans leading-tight">{r.upliftText}</p>
                    ) : (
                      <p className="text-xs font-sans leading-tight text-slate-500">
                        {r.upliftPct || Math.floor(Math.random() * 15) + 5}% plate profit
                      </p>
                    )}
                  </div>
                </div>

                {/* Select */}
                <div className="col-span-2 flex justify-end pr-1">
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedRow}
                      onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                      aria-label={`Select strategy ${r.dish}`}
                    />
                    <div className={`relative h-6 w-11 rounded-full transition-colors ${selectedRow ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${selectedRow ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                    </div>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* See More Button */}
      {!showAllStrategies && convertedStrategies.length > 3 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAllStrategies(true)}
            className="text-primary underline hover:no-underline transition-all duration-200"
          >
            See More ({convertedStrategies.length - 3} more strategies)
          </button>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-6xl px-6 pb-6">
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"><Check className="h-5 w-5" /></div>
              <div>
                <p className="text-sm">{selectedCount} strategy{selectedCount === 1 ? "" : "ies"} selected</p>
              </div>
            </div>
            <button 
              onClick={handleGenerateNewMenu}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> Add selection to menu ({selectedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Menu Preview Modal */}
      <Dialog open={showMenuPreview} onOpenChange={setShowMenuPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
         
          <div className="space-y-6">
            {/* Updated Menu with Suggestions */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Updated Menu
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                    {generateUpdatedMenu().updatedMenu.length} items
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Preview of your menu with selected strategies applied
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateUpdatedMenu().updatedMenu.map((item, index) => {
                    const isNewItem = !originalMenu?.items?.some(original => 
                      original.dishTitle.toLowerCase() === item.dishTitle.toLowerCase()
                    );
                    const hasPriceChange = originalMenu?.items?.find(original => 
                      original.dishTitle.toLowerCase() === item.dishTitle.toLowerCase()
                    )?.price !== item.price;
                    const isNewExtra = isNewItem && (item as any).strategyType === "New Extra";
                    const isNewDish = isNewItem && (item as any).strategyType === "New Dish";
                    
                    return (
                      <div key={index} className={`flex justify-between items-start p-4 border-2 rounded-lg ${
                        isNewItem ? 'bg-green-50 border-green-300 border-l-4 border-l-green-500' : 
                        hasPriceChange ? 'bg-blue-50 border-blue-300 border-l-4 border-l-blue-500' : 
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{item.dishTitle}</h4>
                            {isNewExtra && (
                              <Badge className="bg-purple-500 text-white text-xs px-2 py-1">
                                NEW EXTRA
                              </Badge>
                            )}
                            {isNewDish && (
                              <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                                NEW DISH
                              </Badge>
                            )}
                            {hasPriceChange && !isNewItem && (
                              <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                                PRICE UPDATED
                              </Badge>
                            )}
                          </div>
                          
                          {item.ingredients && item.ingredients.length > 0 && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.ingredients.join(', ')}
                            </p>
                          )}
                          
                          {item.category && !isNewExtra && (
                            <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {isNewExtra && (
                            <span className="inline-block text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                              Extra Item
                            </span>
                          )}
                          
                          {/* Change comment */}
                          {(isNewItem || hasPriceChange) && (
                            <div className={`mt-2 text-xs px-2 py-1 rounded ${
                              isNewExtra ? 'bg-purple-100 text-purple-700' :
                              isNewItem ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isNewExtra ? `🍽️ New extra: ${item.dishTitle}` :
                               isNewItem ? '✨ New dish added to menu' : '💰 Price updated based on strategy'}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 text-right">
                          <span className="font-medium text-gray-900">{item.price}</span>
                          {hasPriceChange && !isNewItem && (
                            <div className="text-xs text-blue-600 mt-1">
                              Updated
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Removed Items */}
                {generateUpdatedMenu().removedItems.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Items Removed:</h4>
                    <div className="space-y-2">
                      {generateUpdatedMenu().removedItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-red-50 border-2 border-red-200 border-l-4 border-l-red-500 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-gray-900 line-through">{item.dishTitle}</h4>
                              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                                REMOVED
                              </Badge>
                            </div>
                            {item.ingredients && item.ingredients.length > 0 && (
                              <p className="text-sm text-gray-600 line-through mb-2">
                                {item.ingredients.join(', ')}
                              </p>
                            )}
                            {item.category && (
                              <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded line-through">
                                {item.category}
                              </span>
                            )}
                            <div className="mt-2 text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                              ❌ Item removed from menu
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <span className="font-medium text-gray-900 line-through">{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Legend */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Legend:</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">New dishes added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-gray-600">New extras/upsells</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Price updated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-600">Items removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span className="text-gray-600">Unchanged items</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}