import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, TrendingUp, DollarSign, Target, Lightbulb, Plus, Eye } from "lucide-react";
import MenuAnalysisTable from "@/components/MenuAnalysisTable";

interface ProfitizationStrategy {
  strategy: string;
  actionInstruction: string;
  category: string;
  action: string;
  dish: string;
  newPrice?: number;
  why: string;
}

interface ProfitizationStrategiesTableProps {
  strategies: ProfitizationStrategy[];
  originalMenu?: any; // The original menu data to pass along
}

const ProfitizationStrategiesTable = ({ strategies, originalMenu }: ProfitizationStrategiesTableProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStrategies, setSelectedStrategies] = useState<Set<number>>(new Set());

  // Get unique categories for filtering
  const categories = Array.from(new Set(strategies.map(s => s.category)));

  // Filter strategies by category
  const filteredStrategies = selectedCategory === "all" 
    ? strategies 
    : strategies.filter(strategy => strategy.category === selectedCategory);

  // Handle toggle for individual strategies
  const handleToggleStrategy = (index: number) => {
    const newSelected = new Set(selectedStrategies);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedStrategies(newSelected);
  };

  // Handle generate new menu
  const handleGenerateNewMenu = () => {
    const selectedStrategyObjects = Array.from(selectedStrategies).map(index => strategies[index]);
    
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

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "up price": return "bg-green-100 text-green-800";
      case "new dish": return "bg-blue-100 text-blue-800";
      case "new extra": return "bg-purple-100 text-purple-800";
      case "reframe": return "bg-orange-100 text-orange-800";
      case "remove dish": return "bg-red-100 text-red-800";
      case "staffing": return "bg-yellow-100 text-yellow-800";
      case "ingredients": return "bg-indigo-100 text-indigo-800";
      case "reposition": return "bg-pink-100 text-pink-800";
      case "new combo": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportToCSV = () => {
    const headers = ["Strategy", "Action Instruction", "Category", "Action", "Dish", "New Price", "Why"];
    const csvContent = [
      headers.join(","),
      ...filteredStrategies.map(strategy => [
        `"${strategy.strategy}"`,
        `"${strategy.actionInstruction}"`,
        `"${strategy.category}"`,
        `"${strategy.action}"`,
        `"${strategy.dish}"`,
        strategy.newPrice || "",
        `"${strategy.why}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profitization-strategies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white pb-24">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight text-center capitalize">
        Profitization Strategies
      </h1>
      <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed text-center mb-10">
        AI-generated strategies to maximize your menu profitability
      </h2>

      {/* See Menu Button - Top Right */}
      <div className="mx-auto max-w-6xl mb-6">
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-primary underline hover:no-underline transition-all duration-200 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                See Menu
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Original Menu Analysis</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <MenuAnalysisTable analysisResult={originalMenu} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <section className="mx-auto max-w-6xl">
        <ScrollArea className="w-full">
          <div className="grid grid-cols-8 min-w-[1100px] overflow-x-auto">
            {/* Column headers */}
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Strategy</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Action Instruction</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Category</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Action</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Dish</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200 text-center">New Price</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200">Why</div>
            <div className="text-[15px] font-semibold pb-[10px] border-b border-gray-200 text-center">Select</div>

            {/* Table rows */}
            {filteredStrategies.map((strategy, index) => (
              <React.Fragment key={index}>
                {/* Strategy */}
                <div className="py-4 text-[15px] font-medium text-gray-700 pt-6">
                  <Badge variant="outline" className="text-xs">
                    {strategy.strategy}
                  </Badge>
                </div>
                
                {/* Action Instruction */}
                <div className="py-4 text-[15px] text-gray-600 pt-6 max-w-sm">
                  <p className="break-words">
                    {strategy.actionInstruction}
                  </p>
                </div>
                
                {/* Category */}
                <div className="py-4 text-[15px] text-gray-600 pt-6">
                  <Badge variant="secondary">
                    {strategy.category}
                  </Badge>
                </div>
                
                {/* Action */}
                <div className="py-4 text-[15px] text-gray-600 pt-6">
                  <Badge className={`text-xs ${getActionBadgeColor(strategy.action)}`}>
                    {strategy.action}
                  </Badge>
                </div>
                
                {/* Dish */}
                <div className="py-4 text-[15px] font-medium text-gray-800 pt-6">
                  {strategy.dish}
                </div>
                
                {/* New Price */}
                <div className="py-4 text-[15px] text-gray-600 pt-6 text-center">
                  {strategy.newPrice ? (
                    <span className="font-semibold text-green-600">
                      ${strategy.newPrice}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                
                {/* Why */}
                <div className="py-4 text-[15px] text-gray-600 pt-6 max-w-sm">
                  <p className="break-words">
                    {strategy.why}
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className="py-4 pt-6 flex justify-center">
                  <Switch
                    checked={selectedStrategies.has(index)}
                    onCheckedChange={() => handleToggleStrategy(index)}
                  />
                </div>
              </React.Fragment>
            ))}

            {filteredStrategies.length === 0 && (
              <div className="col-span-8 text-center py-8 text-gray-500">
                No strategies found in this category.
              </div>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* Sticky Generate New Menu Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="mx-auto max-w-6xl flex justify-center">
          <Button
            onClick={handleGenerateNewMenu}
            disabled={selectedStrategies.size === 0}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8"
          >
            <Plus className="h-5 w-5" />
            Generate New Menu ({selectedStrategies.size} strategies selected)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfitizationStrategiesTable;
