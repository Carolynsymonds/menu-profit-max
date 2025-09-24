import React, { useMemo, useState } from "react";
import { Check, Plus, Minus, AlertCircle, RefreshCw, Search, Sparkles } from "lucide-react";

// -----------------------------
// Types
// -----------------------------
export type MenuItem = {
  id: string;
  title: string;
  price: number; // in same currency
  category: string;
  ingredients?: string[];
};

export type Strategy =
  | { type: "addExtra"; id: string; label: string; appliesTo: string[]; extraName: string; extraPrice: number }
  | { type: "bundleCombo"; id: string; label: string; items: string[]; bundleTitle: string; bundlePrice: number }
  | { type: "reprice"; id: string; label: string; appliesTo: string[]; pct: number }
  | { type: "reframeSuggestion"; id: string; label: string; suggestionText: string }
  | { type: "rename"; id: string; label: string; appliesTo: string[]; renameMap: Record<string, string> };

// -----------------------------
// Utils
// -----------------------------
const currency = (n: number, symbol = "$") => `${symbol}${n.toFixed(2)}`;

function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T) {
  return arr.reduce((acc: Record<string, T[]>, cur) => {
    const k = String(cur[key]);
    acc[k] = acc[k] || [];
    acc[k].push(cur);
    return acc;
  }, {});
}

// Apply strategies to a base menu and return a new list + change annotations per item
function applyStrategies(menu: MenuItem[], strategies: Strategy[]) {
  const idToItem = new Map(menu.map((m) => [m.id, { ...m }]));
  const changes: Record<string, { priceDelta?: number; badges: string[]; extras?: { name: string; price: number }[] }> = {};

  // Initialize change map
  for (const m of menu) changes[m.id] = { badges: [] };

  // Clone working menu array
  let working: MenuItem[] = menu.map((m) => ({ ...m }));

  for (const s of strategies) {
    console.log(`Applying strategy:`, {
      type: s.type,
      id: s.id,
      label: s.label,
      appliesTo: (s as any).appliesTo,
      pct: (s as any).pct
    });
    
    switch (s.type) {
      case "addExtra": {
        // Create new menu items for extras instead of adding to existing items
        const extraId = `extra_${s.id}`;
        working.push({ 
          id: extraId, 
          title: s.extraName, 
          price: 0, // Don't show price since it's already in the instruction text
          category: "Extras & Sides" 
        });
        // Initialize changes for the new extra item
        changes[extraId] = { badges: ["New Extra"] };
        break;
      }
      case "bundleCombo": {
        // Create a synthetic combo line item
        const comboId = `combo_${s.id}`;
        working.push({ id: comboId, title: s.bundleTitle, price: 0, category: "Combos" }); // Don't show price since it's already in the instruction text
        break;
      }
      case "reprice": {
        console.log(`Repricing strategy - appliesTo:`, s.appliesTo);
        for (const id of s.appliesTo) {
          const item = working.find((x) => x.id === id);
          console.log(`Looking for item with id: ${id}, found:`, item);
          if (!item) continue;
          const old = item.price;
          const delta = old * (s.pct / 100);
          console.log(`Repricing ${item.title}: ${old} -> ${+(old + delta).toFixed(2)} (${s.pct}%)`);
          item.price = +(old + delta).toFixed(2);
          changes[id].priceDelta = (changes[id].priceDelta || 0) + delta;
          changes[id].badges.push(`${s.pct > 0 ? "+" : ""}${s.pct}% price`);
        }
        break;
      }
      case "reframeSuggestion": {
        // Global suggestion (shown at top of AFTER column)
        break;
      }
      case "rename": {
        for (const id of s.appliesTo) {
          const item = working.find((x) => x.id === id);
          if (!item) continue;
          const newName = s.renameMap[id];
          if (newName && newName !== item.title) {
            changes[id].badges.push("Renamed");
            item.title = newName;
          }
        }
        break;
      }
    }
  }

  return { updated: working, changes } as const;
}

// -----------------------------
// UI subcomponents
// -----------------------------
const ColumnCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; accent?: "left" | "right" }> = ({ title, subtitle, children, accent }) => (
  <div className="bg-white/70 backdrop-blur border rounded-2xl shadow-sm p-4 md:p-6 relative">
    {accent && (
      <div className={`absolute inset-y-0 ${accent === "left" ? "left-0" : "right-0"} w-1 bg-gradient-to-b from-indigo-500 to-fuchsia-500 rounded-${accent === "left" ? "l" : "r"}-2xl`} />
    )}
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="w-4 h-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
    <div>{children}</div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full bg-slate-100 border text-slate-700 mr-2 mb-2 ${className}`}>
    {children}
  </span>
);

const PriceTag: React.FC<{ price: number; delta?: number }> = ({ price, delta }) => {
  // Don't show price if it's 0 (for extras/combos where price is in instruction text)
  if (price === 0) return null;
  
  // If there's a price delta, show original price + increase format
  if (typeof delta === "number" && delta !== 0) {
    const originalPrice = price - delta;
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{currency(originalPrice)}</span>
        <span className={`text-xs font-semibold ${delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {delta > 0 ? "+" : ""}{currency(delta)}
        </span>
      </div>
    );
  }
  
  // Normal price display for items without changes
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{currency(price)}</span>
    </div>
  );
};

// -----------------------------
// Main Component
// -----------------------------
export default function BeforeAfterMenuPreview({
  originalMenu,
  selectedStrategies,
  currencySymbol = "$",
}: {
  originalMenu: any;
  selectedStrategies: any[];
  currencySymbol?: string;
}) {
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => 
    Object.fromEntries(selectedStrategies.map((s, index) => [`strategy-${index}`, true]))
  );

  // Convert original menu to our format
  const convertedMenu: MenuItem[] = useMemo(() => {
    if (!originalMenu?.items) return [];
    return originalMenu.items.map((item: any, index: number) => ({
      id: `item_${index}`,
      title: item.dishTitle || item.name || 'Unknown Item',
      price: parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0'),
      category: item.category || 'Uncategorized',
      ingredients: item.ingredients || []
    }));
  }, [originalMenu]);

  // Convert strategies to our format
  const convertedStrategies: Strategy[] = useMemo(() => {
    return selectedStrategies.map((strategy, index) => {
      const strategyId = `strategy-${index}`;
      
      // Debug logging to see what we're working with
      console.log(`Strategy ${index}:`, {
        tag: strategy.tag,
        action: strategy.action,
        dish: strategy.dish,
        actionInstruction: strategy.actionInstruction,
        newPrice: strategy.newPrice,
        currentPrice: strategy.currentPrice
      });
      
      switch (strategy.tag || strategy.action) {
        case "New Extra":
          return {
            type: "addExtra",
            id: strategyId,
            label: strategy.actionInstruction || `Add ${strategy.dish}`,
            appliesTo: [], // No existing items to apply to - this creates a new item
            extraName: strategy.actionInstruction || `Add ${strategy.dish}`,
            extraPrice: strategy.newPrice || 0
          };
        
        case "New Combo":
          return {
            type: "bundleCombo",
            id: strategyId,
            label: strategy.actionInstruction || `Bundle ${strategy.dish}`,
            items: [`item_${convertedMenu.findIndex(item => 
              item.title.toLowerCase().includes(strategy.dish.toLowerCase())
            )}`].filter(id => id !== 'item_-1'),
            bundleTitle: strategy.actionInstruction || `Bundle ${strategy.dish}`,
            bundlePrice: strategy.newPrice || 0
          };
        
        case "Up Price":
        case "Up price": // Handle both cases
          const itemIndex = convertedMenu.findIndex(item => 
            item.title.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          const currentItem = itemIndex !== -1 ? convertedMenu[itemIndex] : null;
          const currentPrice = currentItem ? currentItem.price : 0;
          const newPrice = strategy.newPrice || 0;
          const pct = currentPrice > 0 ? Math.round(((newPrice - currentPrice) / currentPrice) * 100 * 10) / 10 : 0;
          
          console.log(`Up Price calculation:`, {
            dish: strategy.dish,
            currentPrice,
            newPrice,
            pct,
            itemIndex,
            currentItem: currentItem?.title
          });
          
          return {
            type: "reprice",
            id: strategyId,
            label: strategy.actionInstruction || `Reprice ${strategy.dish}`,
            appliesTo: [`item_${itemIndex}`].filter(id => id !== 'item_-1'),
            pct: pct
          };
        
        case "Reframe":
          const reframeItemIndex = convertedMenu.findIndex(item => 
            item.title.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          const reframeItemId = `item_${reframeItemIndex}`;
          
          // Extract new name from actionInstruction
          // Example: "Rename 'Dish from the chef' to 'Chef's Signature Dish'"
          let newName = strategy.dish; // fallback to original dish name
          if (strategy.actionInstruction) {
            console.log(`Parsing rename instruction: "${strategy.actionInstruction}"`);
            
            // Try multiple patterns to extract the new name
            let renameMatch = strategy.actionInstruction.match(/to ['"]([^'"]+)['"]/i);
            if (!renameMatch) {
              // Try without quotes
              renameMatch = strategy.actionInstruction.match(/to (.+)$/i);
            }
            if (!renameMatch) {
              // Try with different quote patterns
              renameMatch = strategy.actionInstruction.match(/to ['"]([^'"]+)['"]/i);
            }
            
            if (renameMatch) {
              newName = renameMatch[1].trim();
              console.log(`Extracted new name: "${newName}"`);
            } else {
              console.log(`Failed to extract new name from: "${strategy.actionInstruction}"`);
            }
          }
          
          console.log(`Reframe strategy:`, {
            dish: strategy.dish,
            actionInstruction: strategy.actionInstruction,
            newName,
            itemIndex: reframeItemIndex,
            itemId: reframeItemId
          });
          
          return {
            type: "rename",
            id: strategyId,
            label: strategy.actionInstruction || `Reframe ${strategy.dish}`,
            appliesTo: [reframeItemId].filter(id => id !== 'item_-1'),
            renameMap: { [reframeItemId]: newName }
          };
        
        default:
          return {
            type: "reframeSuggestion",
            id: strategyId,
            label: strategy.actionInstruction || strategy.rationale || 'Strategy suggestion',
            suggestionText: strategy.rationale || strategy.actionInstruction || 'Strategy applied'
          };
      }
    });
  }, [selectedStrategies, convertedMenu]);

  const activeStrategies = useMemo(() => 
    convertedStrategies.filter((s) => enabled[s.id]), 
    [enabled, convertedStrategies]
  );

  const { updated, changes } = useMemo(() => 
    applyStrategies(convertedMenu, activeStrategies), 
    [convertedMenu, activeStrategies]
  );

  const filteredOriginal = useMemo(() => 
    convertedMenu.filter((m) => m.title.toLowerCase().includes(query.toLowerCase())), 
    [convertedMenu, query]
  );
  
  const filteredUpdated = useMemo(() => 
    updated.filter((m) => m.title.toLowerCase().includes(query.toLowerCase())), 
    [updated, query]
  );

  const byCatOriginal = groupBy(filteredOriginal, "category");
  const byCatUpdated = groupBy(filteredUpdated, "category");

  const suggestionTexts = activeStrategies
    .filter((s) => s.type === "reframeSuggestion")
    .map((s) => (s as Extract<Strategy, { type: "reframeSuggestion" }>).suggestionText);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full outline-none text-sm"
            placeholder="Search dishes..."
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="text-xs px-3 py-2 border rounded-lg hover:bg-slate-50"
            onClick={() => setEnabled(Object.fromEntries(convertedStrategies.map((s) => [s.id, true])))}
            title="Enable all"
          >
            <Check className="w-3.5 h-3.5 inline mr-1" /> Enable all
          </button>
          <button
            className="text-xs px-3 py-2 border rounded-lg hover:bg-slate-50"
            onClick={() => setEnabled(Object.fromEntries(convertedStrategies.map((s) => [s.id, false])))}
            title="Disable all"
          >
            <Minus className="w-3.5 h-3.5 inline mr-1" /> Disable all
          </button>
          <button
            className="text-xs px-3 py-2 border rounded-lg hover:bg-slate-50"
            onClick={() => {
              setEnabled(Object.fromEntries(convertedStrategies.map((s) => [s.id, true])));
              setQuery("");
            }}
            title="Reset"
          >
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reset
          </button>
        </div>
      </div>

      {/* Strategy toggles */}
      <div className="bg-white border rounded-2xl p-4 mb-4">
        <div className="text-sm font-medium mb-2">Strategies</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {convertedStrategies.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm bg-slate-50 border rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={!!enabled[s.id]}
                onChange={(e) => setEnabled((prev) => ({ ...prev, [s.id]: e.target.checked }))}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* LEFT: AFTER (menu with strategies) */}
        <ColumnCard title="AFTER – Menu with Strategies" subtitle="Live preview with selected strategy changes applied" accent="left">
          {/* Global suggestions */}
          {suggestionTexts.length > 0 && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm rounded-xl p-3">
              <span className="font-medium">Suggested upsell:</span> {suggestionTexts.join(" · ")}
            </div>
          )}

          {Object.keys(byCatUpdated).length === 0 ? (
            <EmptyState message="No visible changes yet. Try enabling a strategy or clear the search." />
          ) : (
            <div className="space-y-6">
              {Object.entries(byCatUpdated).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">{cat}</h4>
                  <div className="divide-y">
                    {items.map((item) => {
                      const c = changes[item.id];
                      return (
                        <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium leading-tight">{item.title}</div>
                            {item.ingredients && item.ingredients.length > 0 && (
                              <div className="text-xs text-slate-500">{item.ingredients.join(", ")}</div>
                            )}
                            <div className="mt-2">
                              {c?.badges?.map((b, i) => (
                                <Badge key={i} className={b === "New Extra" ? "bg-purple-100 text-purple-800 border-purple-200" : ""}>
                                  {b}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <PriceTag price={item.price} delta={c?.priceDelta} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ColumnCard>

        {/* RIGHT: BEFORE (original) */}
        <ColumnCard title="BEFORE – Original Menu" subtitle="Unchanged baseline for side‑by‑side comparison" accent="right">
          {Object.keys(byCatOriginal).length === 0 ? (
            <EmptyState message="No dishes match your search." />
          ) : (
            <div className="space-y-6">
              {Object.entries(byCatOriginal).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">{cat}</h4>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium leading-tight">{item.title}</div>
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="text-xs text-slate-500">{item.ingredients.join(", ")}</div>
                          )}
                        </div>
                        <span className="font-medium">{currency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ColumnCard>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
        <AlertCircle className="w-4 h-4" />
        <span>Live preview of your menu with selected strategies applied.</span>
      </div>
    </div>
  );
}

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border rounded-xl p-3">
    <AlertCircle className="w-4 h-4" /> {message}
  </div>
);
