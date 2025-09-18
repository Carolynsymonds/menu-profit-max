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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisResult.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisResult.categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Analysis Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(analysisResult.analysisDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center gap-2"
          >
            {showIngredients ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showIngredients ? "Hide" : "Show"} Ingredients
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

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
