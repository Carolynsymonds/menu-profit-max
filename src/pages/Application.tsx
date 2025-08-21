import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Package, Plus, Search, Bell, Settings, BarChart3, TrendingUp, Calendar, DollarSign, Warehouse, ChefHat, Trash2, Calculator, ClipboardList, CheckCircle2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import ProfitByMenuCategory from "@/components/ProfitByMenuCategory";
import { OnboardingModal } from "@/components/OnboardingModal";
import { supabase } from "@/integrations/supabase/client";
import { siteContent } from "@/config/site-content";

const Application = () => {
  
  const [staffData] = useState([
    { id: 1, name: "Kitchen Manager", shifts: 5, status: "scheduled", lastUpdated: "2 mins ago" },
    { id: 2, name: "Line Cook", shifts: 3, status: "understaffed", lastUpdated: "5 mins ago" },
    { id: 3, name: "Prep Cook", shifts: 2, status: "critical", lastUpdated: "1 hour ago" },
    { id: 4, name: "Dishwasher", shifts: 4, status: "scheduled", lastUpdated: "10 mins ago" },
    { id: 5, name: "Server", shifts: 6, status: "scheduled", lastUpdated: "15 mins ago" }
  ]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

 useEffect(() => {
    const checkUserAccess = () => {
      // Get user ID from local storage
      
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.log('No user ID found in localStorage, redirecting to home');
        window.location.href = '/login';
        return;
      }

      // Show onboarding modal by default
      setShowOnboarding(true);
    };

    checkUserAccess();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSuccessModal(true);
  };

  const handleRedirectToPreview = () => {
    window.location.href = '/';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-green-100 text-green-800";
      case "understaffed": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-white border-l border-border">
          <DashboardHeader />
          <div className="p-6">
            {/* Today's Snapshot */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Today's Schedule Overview</h2>
              <p className="text-sm text-muted-foreground">Current staffing status and shift performance</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard 
                title="Total Staff Scheduled" 
                value="24" 
                change="+4.2%" 
              />
              <MetricCard 
                title="On-Duty Now" 
                value="12" 
                change="+2.1%" 
              />
              <MetricCard 
                title="Upcoming Shifts" 
                value="8" 
                change="+1.5%" 
              />
              <MetricCard 
                title="Open Shifts" 
                value="3" 
                change="-1.2%" 
              />
            </div>
            
            {/* Profit by Menu Category */}
            <div className="mb-6">
              <ProfitByMenuCategory />
            </div>
          
          </div>
        </main>
      </div>
      
      <OnboardingModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      {/* Success Modal for completed onboarding */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg" hideClose={true}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/f37ec620-3f96-4f90-809e-0fd1daa4a175.png" 
                alt="Rocket Launch" 
                className="w-32 h-32"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">Your {siteContent.brand.name} dashboard is on its way.</p>
              <p className="text-sm text-muted-foreground">You'll soon gain early access to our Beta program — and get a chance to shape the future of kitchen management alongside us.</p>
              <p className="text-sm text-muted-foreground">Stay tuned — exciting updates are coming your way.</p>
            </div>
            <Button onClick={handleRedirectToPreview} className="w-full">
             Continue learning about what's next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Application;