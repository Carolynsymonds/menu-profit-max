import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeneratedMenuTable from "@/components/GeneratedMenuTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

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

interface GeneratedMenuData {
  originalMenu: AnalysisResult;
  selectedStrategies: ProfitizationStrategy[];
  generatedAt: string;
}

const GeneratedMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedMenuData, setGeneratedMenuData] = useState<GeneratedMenuData | null>(null);

  useEffect(() => {
    // Get generated menu data from location state or localStorage
    const data = location.state?.generatedMenuData;
    if (data) {
      console.log('Generated menu data from location state:', data);
      setGeneratedMenuData(data);
    } else {
      // Try to get from localStorage as fallback
      const stored = localStorage.getItem('newMenuData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('Generated menu data from localStorage:', parsed);
          setGeneratedMenuData(parsed);
        } catch (error) {
          console.error('Error parsing stored generated menu data:', error);
        }
      }
    }
  }, [location.state]);

  const handleBackToStrategies = () => {
    // Navigate back to the strategies page
    navigate('/menu-analysis-results');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!generatedMenuData) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                No Generated Menu Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We couldn't find any generated menu data. Please go back to select strategies and generate a new menu.
              </p>
              <div className="flex gap-4">
                <Button onClick={handleBackToStrategies} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Strategies
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
      
      <GeneratedMenuTable 
        generatedMenuData={generatedMenuData} 
        onBack={handleBackToStrategies}
      />
      
      <Footer />
    </div>
  );
};

export default GeneratedMenu;
