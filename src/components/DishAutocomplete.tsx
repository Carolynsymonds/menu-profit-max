import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

interface DishAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DishAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter a dish name...",
  className,
  disabled = false 
}: DishAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredDishes = popularDishes.filter(dish =>
    dish.toLowerCase().includes(value.toLowerCase()) && 
    dish.toLowerCase() !== value.toLowerCase()
  ).slice(0, 5);

  const handleSelect = (dish: string) => {
    onChange(dish);
    setShowSuggestions(false);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(value.length > 0)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {showSuggestions && filteredDishes.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-auto">
          {filteredDishes.map((dish) => (
            <button
              key={dish}
              onClick={() => handleSelect(dish)}
              className="w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted focus:outline-none first:rounded-t-md last:rounded-b-md transition-colors"
            >
              {dish}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}