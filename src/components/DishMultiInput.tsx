import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Freeform multi-entry input for dish names
 * - Type dish names
 * - Press Enter / Tab / Comma to add
 * - Paste multiple entries separated by comma / semicolon / newline
 * - Backspace removes last chip when input is empty
 * - Chips show initials + remove button
 * - Auto-suggest popular dishes when typing
 */

const popularDishes = [
  // Pasta
  "Spaghetti Carbonara", "Chicken Alfredo", "Penne Arrabbiata", "Lasagna", "Fettuccine Bolognese",
  "Shrimp Scampi", "Linguine Pesto", "Ravioli", "Gnocchi", "Mac and Cheese",
  
  // Pizza
  "Margherita Pizza", "Pepperoni Pizza", "Hawaiian Pizza", "BBQ Chicken Pizza", "Meat Lovers Pizza",
  "Veggie Pizza", "White Pizza", "Buffalo Chicken Pizza",
  
  // American Classics
  "Cheeseburger", "Chicken Wings", "Fish and Chips", "Grilled Cheese", "BLT Sandwich",
  "Club Sandwich", "Caesar Salad", "Cobb Salad", "Chicken Tenders", "Mozzarella Sticks",
  
  // Mexican
  "Chicken Tacos", "Beef Burrito", "Quesadilla", "Nachos", "Chicken Enchiladas",
  "Fish Tacos", "Carnitas", "Guacamole", "Chimichanga",
  
  // Asian
  "Pad Thai", "Chicken Teriyaki", "Fried Rice", "Lo Mein", "General Tso's Chicken",
  "Sushi Roll", "Ramen", "Kung Pao Chicken", "Sweet and Sour Pork", "Orange Chicken",
  
  // Steaks & Seafood
  "Ribeye Steak", "Filet Mignon", "Grilled Salmon", "Fish Tacos", "Shrimp Cocktail",
  "Lobster Roll", "Crab Cakes", "Clam Chowder",
  
  // Breakfast
  "Pancakes", "French Toast", "Eggs Benedict", "Omelet", "Breakfast Burrito",
  "Avocado Toast", "Chicken and Waffles",
  
  // Appetizers
  "Buffalo Wings", "Spinach Artichoke Dip", "Calamari", "Bruschetta", "Loaded Potato Skins",
  "Onion Rings", "Jalapeño Poppers", "Sliders"
];

function initials(text: string): string {
  const base = text?.trim() || "";
  if (!base) return "?";
  const cleaned = base.replace(/<.*?>/, "").replace(/[^A-Za-z ]/g, " ");
  const parts = cleaned.split(" ").filter(Boolean).slice(0, 2);
  if (!parts.length) return base.slice(0, 2).toUpperCase();
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface DishItem {
  id: string;
  name: string;
}

export function parseDishEntry(raw: string): DishItem | null {
  const text = (raw || "").trim();
  if (!text) return null;
  
  // For dishes, we just use the text as both name and id (lowercased for id)
  const id = text.toLowerCase();
  return { id, name: text };
}

interface ChipProps {
  item: DishItem;
  onRemove: () => void;
}

function Chip({ item, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-sm text-primary">
      <span className="max-w-[12rem] truncate">
        {item.name}
      </span>
      <button
        onClick={onRemove}
        className="rounded-full p-1 text-primary/60 hover:bg-primary/20 hover:text-primary"
        aria-label={`Remove ${item.name}`}
        type="button"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

interface DishMultiInputProps {
  value?: DishItem[];
  onChange?: (dishes: DishItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function DishMultiInput({ 
  value, 
  onChange, 
  placeholder = "Chicken Parmesan, Lentil Pasta, Caesar Salad",
  disabled = false
}: DishMultiInputProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DishItem[]>(value ?? []);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDishes = popularDishes.filter(dish =>
    dish.toLowerCase().includes(query.toLowerCase()) && 
    !selected.some(s => s.name.toLowerCase() === dish.toLowerCase())
  );

  // emit changes
  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  function addTokenFromQuery() {
    const token = parseDishEntry(query);
    if (!token) return;
    addToken(token);
  }

  function addMany(raw: string) {
    // Replace newlines with commas for easier parsing
    const normalized = raw.replace(/\n/g, ",");
    const parts = normalized
      .split(/[;,]/)
      .map((s) => parseDishEntry(s))
      .filter(Boolean) as DishItem[];
    if (!parts.length) return;
    
    setSelected((prev) => {
      const seen = new Set(prev.map((p) => p.id.toLowerCase()));
      const merged = [...prev];
      for (const p of parts) {
        const key = p.id.toLowerCase();
        if (!seen.has(key)) {
          merged.push(p);
          seen.add(key);
        }
      }
      return merged;
    });
  }

  function addToken(token: DishItem) {
    setSelected((prev) => {
      const key = token.id.toLowerCase();
      if (prev.some((p) => p.id.toLowerCase() === key)) return prev;
      return [...prev, token];
    });
    setQuery("");
    inputRef.current?.focus();
  }

  function removeToken(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const commitKeys = ["Enter", "Tab", ",", ";"]; // add on these
    if (commitKeys.includes(e.key)) {
      if (query.trim()) {
        e.preventDefault();
        addTokenFromQuery();
      }
      return;
    }
    if (e.key === "Backspace" && query === "" && selected.length) {
      const last = selected[selected.length - 1];
      removeToken(last.id);
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    addMany(text);
  }

  function onBlur() {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      if (query.trim()) addTokenFromQuery();
      setOpen(false);
    }, 150);
  }

  function handleSuggestionSelect(dish: string) {
    const token = parseDishEntry(dish);
    if (token) {
      addToken(token);
      setOpen(false);
    }
  }

  return (
    <div className="w-full">
      <Popover open={open && filteredDishes.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={`min-h-[41px] w-full rounded-xl border border-gray-300 px-3 py-2 pl-10 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all ${query.trim() ? 'bg-white' : 'bg-card/70'}`}>
            {/* Display existing dishes as chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selected.map((dish) => (
                  <Chip key={dish.id} item={dish} onRemove={() => removeToken(dish.id)} />
                ))}
              </div>
            )}

            {/* Input field */}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length > 0) {
                  setOpen(true);
                }
              }}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={onBlur}
              onFocus={() => {
                if (query.length > 0) setOpen(true);
              }}
              placeholder={selected.length === 0 ? placeholder : 'Add another dish...'}
              disabled={disabled}
              className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No dishes found.</CommandEmpty>
              <CommandGroup heading="Popular Dishes">
                {filteredDishes.slice(0, 6).map((dish) => (
                  <CommandItem
                    key={dish}
                    value={dish}
                    onSelect={() => handleSuggestionSelect(dish)}
                    className="cursor-pointer"
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    {dish}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper hint when typing */}
      {query.trim() && !open && (
        <div className="mt-2 w-full rounded-lg border border-gray-200 bg-card p-3 text-sm text-muted-foreground shadow-sm">
          Press <kbd className="rounded border px-1.5 py-0.5 bg-muted">Enter</kbd> to add <span className="font-medium text-foreground">{query}</span> · Paste multiple with comma / semicolon / newline.
        </div>
      )}
    </div>
  );
}

export default DishMultiInput;