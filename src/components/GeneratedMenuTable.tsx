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
import { Download, ArrowLeft, Eye, EyeOff, Edit, Save, X, FileText, Loader2, Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  dishTitle: string;
  ingredients: string[];
  price: string;
  category?: string;
}

interface ProfitizationStrategy {
  id: string;
  tag: string;
  dish: string;
  currentPrice?: number;
  actionInstruction: string;
  newPrice?: number;
  rationale: string;
  monthlySales?: number;
  profitUpliftPct?: number;
  // Legacy properties for backward compatibility
  strategy?: string;
  category?: string;
  action?: string;
  why?: string;
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
  const [email, setEmail] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Generate default email body content
  const generateDefaultEmailBody = () => {
    const strategiesText = selectedStrategies.map((strategy) => {
      // Use the full suggestion text from actionInstruction (same as displayed in table)
      const suggestionText = strategy.actionInstruction || `${strategy.tag || "Strategy"} — ${strategy.dish || "Menu Item"}`;
      const rationale = strategy.rationale || strategy.why || "Strategy rationale";
      
      const upliftPct = Math.floor(Math.random() * 15) + 5; // Mock profit uplift percentage
      
      return `${suggestionText}\n${rationale}`;
    }).join('\n\n');

    return `Hey team,
Here are the latest menu suggestions from Menu Profit Max — what do you think?

Suggestions:

${strategiesText}

Thanks,`;
  };

  // Initialize email body when component mounts or strategies change
  React.useEffect(() => {
    if (selectedStrategies.length > 0 && !emailBody) {
      setEmailBody(generateDefaultEmailBody());
    }
  }, [selectedStrategies]);

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
        Applied Strategies ({selectedStrategies.length})
      </h1>
      <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed text-center mb-10">
        Review strategies and send to your kitchen
      </h2>

      {/* Email Send Form */}
      <div className="mx-auto max-w-6xl mb-8">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="kitchen@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emailBody">Email Body</Label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter your email message here..."
                className="mt-2 min-h-48 focus-visible:ring-1 focus-visible:ring-offset-1"
                rows={12}
              />
              
            </div>
            <Button
              onClick={() => {
                setIsSendingEmail(true);
                // Simulate email sending with the editable email body
                setTimeout(() => {
                  setIsSendingEmail(false);
                  toast({
                    title: "Email Sent!",
                    description: `Email with ${selectedStrategies.length} strategies has been sent to ${email}.`,
                  });
                }, 2000);
              }}
              disabled={!email || !emailBody.trim() || isSendingEmail}
              className="w-full"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Kitchen
                </>
              )}
            </Button>
          </div>
        </Card>
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
              Add more strategies
            </Button>
          </div>
          
        </div>
      </div>


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
