import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredDishes = popularDishes.filter(dish =>
    dish.toLowerCase().includes(searchValue.toLowerCase()) ||
    value.toLowerCase().includes(dish.toLowerCase())
  );

  const handleSelect = (dish: string) => {
    onChange(dish);
    setOpen(false);
    setSearchValue("");
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSearchValue(newValue);
    if (!open && newValue.length > 0) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={cn("pr-8", className)}
            disabled={disabled}
          />
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search dishes..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No dishes found.</CommandEmpty>
            <CommandGroup heading="Popular Dishes">
              {filteredDishes.slice(0, 8).map((dish) => (
                <CommandItem
                  key={dish}
                  value={dish}
                  onSelect={() => handleSelect(dish)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === dish ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {dish}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}