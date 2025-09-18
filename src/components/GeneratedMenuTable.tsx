import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, ArrowLeft, Eye, EyeOff, Edit, Save, X, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  dishTitle: string;
  ingredients: string[];
  price: string;
  category?: string;
}

interface ProfitizationStrategy {
  strategy: string;
  actionInstruction: string;
  category: string;
  action: string;
  dish: string;
  newPrice?: number;
  why: string;
}

interface GeneratedMenuData {
  originalMenu: {
    items: MenuItem[];
    categories: string[];
    totalItems: number;
    analysisDate: string;
  };
  selectedStrategies: ProfitizationStrategy[];
  generatedAt: string;
}

interface GeneratedMenuTableProps {
  generatedMenuData: GeneratedMenuData;
  onBack: () => void;
}

const GeneratedMenuTable = ({ generatedMenuData, onBack }: GeneratedMenuTableProps) => {
  const { originalMenu, selectedStrategies } = generatedMenuData;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showIngredients, setShowIngredients] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    dishTitle: '',
    ingredients: '',
    price: ''
  });
  const [showMenuText, setShowMenuText] = useState(false);
  const [menuText, setMenuText] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Apply strategies to create new menu
  const generateNewMenuItems = () => {
    const newItems = [...originalMenu.items];
    
    selectedStrategies.forEach(strategy => {
      switch (strategy.action) {
        case "Up price":
          // Find and update price for existing dish
          const itemIndex = newItems.findIndex(item => 
            item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          if (itemIndex !== -1 && strategy.newPrice) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              price: `$${strategy.newPrice}`
            };
          }
          break;
          
        case "New Dish":
          // Add new dish
          if (strategy.newPrice) {
            newItems.push({
              dishTitle: strategy.dish,
              ingredients: [], // Would need to be provided by GPT
              price: `$${strategy.newPrice}`,
              category: strategy.category
            });
          }
          break;
          
        case "New Extra":
          // Add new extra/upsell item
          if (strategy.newPrice) {
            newItems.push({
              dishTitle: `${strategy.dish} (+$${strategy.newPrice})`,
              ingredients: [],
              price: `+$${strategy.newPrice}`,
              category: strategy.category
            });
          }
          break;
          
        case "Remove Dish":
          // Remove dish
          const removeIndex = newItems.findIndex(item => 
            item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          if (removeIndex !== -1) {
            newItems.splice(removeIndex, 1);
          }
          break;
          
        case "Reframe":
          // Update dish title/description
          const reframeIndex = newItems.findIndex(item => 
            item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase())
          );
          if (reframeIndex !== -1) {
            newItems[reframeIndex] = {
              ...newItems[reframeIndex],
              dishTitle: strategy.dish,
              price: strategy.newPrice ? `$${strategy.newPrice}` : newItems[reframeIndex].price
            };
          }
          break;
      }
    });
    
    return newItems;
  };

  const [menuItems, setMenuItems] = useState(generateNewMenuItems());

  // Get unique categories for filtering
  const categories = Array.from(new Set(menuItems.map(item => item.category || 'Uncategorized')));

  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => (item.category || 'Uncategorized') === selectedCategory);

  // Format price to remove unnecessary .00
  const formatPrice = (price: string) => {
    if (!price) return price;
    // Remove $ if present, parse as number, then format
    const numericPrice = parseFloat(price.replace('$', ''));
    if (isNaN(numericPrice)) return price;
    
    // If it's a whole number, don't show .00
    if (numericPrice % 1 === 0) {
      return `$${numericPrice}`;
    }
    // Otherwise show with 2 decimal places
    return `$${numericPrice.toFixed(2)}`;
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      dishTitle: item.dishTitle,
      ingredients: item.ingredients.join(', '),
      price: item.price.replace('$', '')
    });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = menuItems.map(item => {
      if (item === editingItem) {
        return {
          ...item,
          dishTitle: editForm.dishTitle,
          ingredients: editForm.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing),
          price: editForm.price.startsWith('$') ? editForm.price : `$${editForm.price}`
        };
      }
      return item;
    });

    setMenuItems(updatedItems);
    setEditingItem(null);
    setEditForm({ dishTitle: '', ingredients: '', price: '' });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({ dishTitle: '', ingredients: '', price: '' });
  };

  // Create menu text from current menu items
  const createMenuText = async () => {
    const categories = Array.from(new Set(menuItems.map(item => item.category || 'Uncategorized')));
    let text = '';
    
    categories.forEach(category => {
      const categoryItems = menuItems.filter(item => (item.category || 'Uncategorized') === category);
      
      // Add category header
      text += `${category.toUpperCase()}\n`;
      
      // Add items in the category
      categoryItems.forEach(item => {
        const ingredients = item.ingredients.join(', ');
        const price = item.price.replace('$', '');
        
        // Format: dish name + ingredients + price
        text += `${item.dishTitle}  ${ingredients}  ${price}\n`;
      });
      
      text += '\n'; // Add spacing between categories
    });
    
    const updatedMenuText = text.trim();
    setMenuText(updatedMenuText);
    setShowMenuText(true);

    // Generate menu image using Gemini API
    setIsGeneratingImage(true);
    try {
      // Get original menu text from localStorage or create a placeholder
      const originalMenuText = localStorage.getItem('originalMenuText') || 'Original menu text not available';
      
      const { data, error } = await supabase.functions.invoke('generate-menu-image', {
        body: {
          originalMenuText: originalMenuText,
          updatedMenuText: updatedMenuText,
          restaurantName: 'Your Restaurant' // You could make this configurable
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.imageData) {
        // Store the image URL in localStorage
        localStorage.setItem('generatedMenuImage', data.imageData);
        
        // Navigate to the image display page
        navigate('/generated-menu-image', {
          state: { imageUrl: data.imageData }
        });
        
        toast({
          title: "Menu Image Generated!",
          description: "Your professional menu image has been created successfully.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }

    } catch (error) {
      console.error('Error generating menu image:', error);
      toast({
        title: "Image Generation Failed",
        description: "Could not generate menu image. The text menu is still available.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Dish Title", "Category", "Price", "Ingredients", "Applied Strategy"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => {
        // Find which strategy was applied to this item
        const appliedStrategy = selectedStrategies.find(strategy => 
          item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase()) ||
          strategy.dish.toLowerCase().includes(item.dishTitle.toLowerCase())
        );
        
        return [
          `"${item.dishTitle}"`,
          `"${item.category || 'Uncategorized'}"`,
          `"${formatPrice(item.price)}"`,
          `"${item.ingredients.join(', ')}"`,
          `"${appliedStrategy?.strategy || 'Original'}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-menu-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white pb-12 pt-28">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight text-center capitalize">
        Generated Menu
      </h1>
      <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed text-center mb-10">
        Your optimized menu with {selectedStrategies.length} strategies applied
      </h2>

      {/* Summary Cards */}
      <div className="mx-auto max-w-6xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Original Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{originalMenu.totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Strategies Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selectedStrategies.length}</div>
            </CardContent>
          </Card>
          
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto max-w-6xl mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Strategies
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createMenuText}
              disabled={isGeneratingImage}
              className="flex items-center gap-2"
            >
              {isGeneratingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isGeneratingImage ? 'Generating...' : 'Create Menu'}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>

        <TabsContent value={selectedCategory} className="mx-auto max-w-6xl mt-4">
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
                      <th className="text-left p-3 font-medium">Applied Strategy</th>
                      <th className="text-center p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => {
                      // Find which strategy was applied to this item
                      const appliedStrategy = selectedStrategies.find(strategy => 
                        item.dishTitle.toLowerCase().includes(strategy.dish.toLowerCase()) ||
                        strategy.dish.toLowerCase().includes(item.dishTitle.toLowerCase())
                      );

                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{item.dishTitle}</td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {item.category || 'Uncategorized'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right text-sm">
                            {formatPrice(item.price)}
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
                          <td className="p-3">
                            {appliedStrategy ? (
                              <Badge variant="outline" className="text-xs">
                                {appliedStrategy.strategy}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">Original</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
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

      {/* Menu Text Display */}
      {showMenuText && (
        <div className="mx-auto max-w-6xl mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Menu Text</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMenuText(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Generated Image */}
              {generatedImage && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Generated Menu Image</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img 
                      src={`data:image/png;base64,${generatedImage}`} 
                      alt="Generated Menu" 
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${generatedImage}`;
                        link.download = 'generated-menu.png';
                        link.click();
                      }}
                    >
                      Download Image
                    </Button>
                  </div>
                </div>
              )}

              {/* Menu Text */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">Menu Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                    {menuText}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(menuText);
                    toast({
                      title: "Copied!",
                      description: "Menu text copied to clipboard.",
                    });
                  }}
                >
                  Copy Text to Clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([menuText], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'generated-menu.txt';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Download as Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="dishTitle">Dish Title</Label>
              <Input
                id="dishTitle"
                value={editForm.dishTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, dishTitle: e.target.value }))}
                placeholder="Enter dish title"
              />
            </div>
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={editForm.ingredients}
                onChange={(e) => setEditForm(prev => ({ ...prev, ingredients: e.target.value }))}
                placeholder="Enter ingredients separated by commas"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={editForm.price}
                onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price (e.g., 12.99)"
                type="number"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedMenuTable;
