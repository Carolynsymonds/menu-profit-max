import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuAnalysisTable from "@/components/MenuAnalysisTable";
import ProfitizationStrategiesTable from "@/components/ProfitizationStrategiesTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, AlertCircle } from "lucide-react";
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

interface AnalysisResult {
  items: MenuItem[];
  categories: string[];
  totalItems: number;
  analysisDate: string;
  strategies?: ProfitizationStrategy[];
}

const MenuAnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get analysis result from location state or fetch from storage
    const result = location.state?.analysisResult;
    if (result) {
      console.log('Analysis result from location state:', result);
      setAnalysisResult(result);
    } else {
      // Try to get from localStorage as fallback
      const stored = localStorage.getItem('menuAnalysisResult');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('Analysis result from localStorage:', parsed);
          setAnalysisResult(parsed);
        } catch (error) {
          console.error('Error parsing stored analysis result:', error);
        }
      }
    }
  }, [location.state]);

  const handleNewUpload = () => {
    navigate('/upload-menu');
  };

  const handleBackToHome = () => {
    navigate('/');
  };


  if (!analysisResult) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                No Analysis Data Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We couldn't find any menu analysis data. Please upload a menu to get started.
              </p>
              <div className="flex gap-4">
                <Button onClick={handleNewUpload} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New Menu
                </Button>
                <Button variant="outline" onClick={handleBackToHome}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          
          
          {/* Analysis Table */}
          {/* <MenuAnalysisTable analysisResult={analysisResult} /> */}

          {/* Profitization Strategies Table */}
          <div className="mt-8">
            {analysisResult.strategies && analysisResult.strategies.length > 0 ? (
              <ProfitizationStrategiesTable 
                strategies={analysisResult.strategies} 
                originalMenu={analysisResult}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Profitization Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No strategies available. This might be because:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                    <li>The analysis is still processing</li>
                    <li>There was an error generating strategies</li>
                    <li>The menu didn't contain enough data for analysis</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

        </div>

      <Footer />
    </div>
  );
};

export default MenuAnalysisResults;
