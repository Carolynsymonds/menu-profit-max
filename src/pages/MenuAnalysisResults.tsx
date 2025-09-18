import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuAnalysisTable from "@/components/MenuAnalysisTable";
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

interface AnalysisResult {
  items: MenuItem[];
  categories: string[];
  totalItems: number;
  analysisDate: string;
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
      setAnalysisResult(result);
    } else {
      // Try to get from localStorage as fallback
      const stored = localStorage.getItem('menuAnalysisResult');
      if (stored) {
        try {
          setAnalysisResult(JSON.parse(stored));
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Menu Analysis Results
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered analysis of your restaurant menu
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Table */}
        <MenuAnalysisTable analysisResult={analysisResult} />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleNewUpload} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Analyze Another Menu
          </Button>
          <Button variant="outline" onClick={handleBackToHome}>
            Back to Home
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MenuAnalysisResults;
