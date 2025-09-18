import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, EyeOff } from "lucide-react";

interface MenuItem {
  dishTitle: string;
  ingredients: string[];
  price: string;
  category?: string;
}

interface AnalysisResult {
  items: MenuItem[];
  categories: string[];
  totalItems: number;
  analysisDate: string;
}

interface MenuAnalysisTableProps {
  analysisResult: AnalysisResult;
}

const MenuAnalysisTable = ({ analysisResult }: MenuAnalysisTableProps) => {
  const [showIngredients, setShowIngredients] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredItems = selectedCategory === "all" 
    ? analysisResult.items 
    : analysisResult.items.filter(item => item.category === selectedCategory);

  const exportToCSV = () => {
    const headers = ["Dish Title", "Category", "Price", "Ingredients"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => [
        `"${item.dishTitle}"`,
        `"${item.category || 'Uncategorized'}"`,
        `"${item.price}"`,
        `"${item.ingredients.join(', ')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      


      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="all">All ({analysisResult.totalItems})</TabsTrigger>
          {analysisResult.categories.map((category) => {
            const count = analysisResult.items.filter(item => item.category === category).length;
            return (
              <TabsTrigger key={category} value={category}>
                {category} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory === "all" 
                  ? `All Menu Items (${filteredItems.length})` 
                  : `${selectedCategory} (${filteredItems.length})`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Dish Title</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      {showIngredients && (
                        <th className="text-left p-3 font-medium">Ingredients</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{item.dishTitle}</td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {item.category || 'Uncategorized'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-medium text-primary">
                          {item.price}
                        </td>
                        {showIngredients && (
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {item.ingredients.map((ingredient, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found in this category.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MenuAnalysisTable;
