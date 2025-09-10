import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MenuUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const MenuUploadModal: React.FC<MenuUploadModalProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [extractedDishes, setExtractedDishes] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'upload', label: 'Upload menu file', status: 'pending' },
    { id: 'parse', label: 'Parse menu structure', status: 'pending' },
    { id: 'extract', label: 'Extract dishes and ingredients', status: 'pending' },
    { id: 'analyze', label: 'Analyze profitability', status: 'pending' },
  ]);
  const navigate = useNavigate();

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/json') {
      toast.error('Please upload a JSON file');
      return;
    }

    setFile(uploadedFile);
    updateStepStatus('upload', 'completed');

    // Read and parse the JSON file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        updateStepStatus('parse', 'processing');
        const jsonData = JSON.parse(e.target?.result as string);
        setMenuData(jsonData);
        
        // Extract dishes for preview
        const dishes = extractDishesFromMenu(jsonData);
        setExtractedDishes(dishes);
        
        updateStepStatus('parse', 'completed');
        updateStepStatus('extract', 'completed');
        
        if (dishes.length === 0) {
          toast.error('No dishes found in the menu. Please check the JSON structure.');
          updateStepStatus('parse', 'failed');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast.error('Invalid JSON file. Please check the format.');
        updateStepStatus('parse', 'failed');
        setFile(null);
      }
    };
    reader.readAsText(uploadedFile);
  }, []);

  const extractDishesFromMenu = (jsonData: any): any[] => {
    const dishes: any[] = [];
    
    try {
      if (jsonData.menu && jsonData.menu.sections) {
        jsonData.menu.sections.forEach((section: any) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: any) => {
              dishes.push({
                name: item.name || item.title || 'Unknown Dish',
                price: item.price || null,
                ingredients: item.ingredients || [],
                category: section.name || 'Unknown Section'
              });
            });
          }
        });
      } else if (jsonData.sections && Array.isArray(jsonData.sections)) {
        jsonData.sections.forEach((section: any) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: any) => {
              dishes.push({
                name: item.name || item.title || 'Unknown Dish',
                price: item.price || null,
                ingredients: item.ingredients || [],
                category: section.name || 'Unknown Section'
              });
            });
          }
        });
      } else if (jsonData.items && Array.isArray(jsonData.items)) {
        jsonData.items.forEach((item: any) => {
          dishes.push({
            name: item.name || item.title || 'Unknown Dish',
            price: item.price || null,
            ingredients: item.ingredients || [],
            category: 'Menu Item'
          });
        });
      } else if (Array.isArray(jsonData)) {
        jsonData.forEach((item: any) => {
          dishes.push({
            name: item.name || item.title || 'Unknown Dish',
            price: item.price || null,
            ingredients: item.ingredients || [],
            category: 'Menu Item'
          });
        });
      }
    } catch (error) {
      console.error('Error extracting dishes:', error);
    }

    return dishes;
  };

  const handleProcessMenu = async () => {
    if (!file || !menuData) return;

    setIsProcessing(true);
    updateStepStatus('analyze', 'processing');

    try {
      // Get user email for tracking
      const userEmail = 'guest@example.com'; // Default for anonymous users
      
      const { data, error } = await supabase.functions.invoke('process-menu-upload', {
        body: {
          menuData,
          userEmail,
          filename: file.name
        }
      });

      if (error) throw error;

      updateStepStatus('analyze', 'completed');

      toast.success(`Successfully analyzed ${data.successfulAnalyses} out of ${data.totalDishes} dishes!`);
      
      // Navigate to results page with menu upload ID
      navigate(`/dish-analysis-results?menuUploadId=${data.menuUploadId}`);
      onOpenChange(false);

    } catch (error) {
      console.error('Error processing menu:', error);
      updateStepStatus('analyze', 'failed');
      toast.error('Failed to process menu. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setMenuData(null);
    setExtractedDishes([]);
    setIsProcessing(false);
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      handleFileUpload({ target: input } as any);
    } else {
      toast.error('Please upload a JSON file');
    }
  };

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetModal();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Menu for Analysis</DialogTitle>
          <DialogDescription>
            Upload your menu in JSON format to get comprehensive profitability analysis for all dishes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!file && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent 
                className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-muted/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('menu-file-input')?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Drag & drop your menu JSON file</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <input
                  id="menu-file-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Processing Steps */}
          {file && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{file.name}</span>
                </div>
                
                <div className="space-y-3">
                  {processingSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      {getStepIcon(step)}
                      <span className={`text-sm ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'processing' ? 'text-blue-600' :
                        step.status === 'failed' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dishes Preview */}
          {extractedDishes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Found {extractedDishes.length} dishes:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {extractedDishes.slice(0, 20).map((dish, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{dish.name}</p>
                        <p className="text-xs text-muted-foreground">{dish.category}</p>
                      </div>
                      {dish.price && (
                        <Badge variant="outline">${dish.price}</Badge>
                      )}
                    </div>
                  ))}
                  {extractedDishes.length > 20 && (
                    <div className="col-span-full text-center text-sm text-muted-foreground">
                      ...and {extractedDishes.length - 20} more dishes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {file && extractedDishes.length > 0 && (
              <Button 
                onClick={handleProcessMenu}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Analyze ${extractedDishes.length} Dishes`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};