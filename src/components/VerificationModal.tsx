import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishesData: any[];
  purpose?: 'unlock-analysis' | 'download-report';
}

export const VerificationModal = ({ isOpen, onClose, dishesData, purpose = 'unlock-analysis' }: VerificationModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerification = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('report_requests')
        .insert({
          email: email.trim(),
          dishes_data: dishesData,
          purpose
        });

      if (error) throw error;

      toast({
        title: "Full Report Sent!",
        description: "Your report request has been successfully submitted.",
      });
      
      // Close modal immediately after success
      handleClose();
    } catch (error: any) {
      console.error('Error saving report request:', error);
      toast({
        title: "Failed to Submit Request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-32 h-32 flex items-center justify-center mb-4">
            {emailSent ? (
              <img 
                src="/lovable-uploads/5b64c1c1-e8c8-46a3-9e33-4e45b6bdd701.png" 
                alt="Success Checkmark"
                className="w-32 h-32"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
          <DialogTitle className="text-xl font-semibold mx-auto">
            {emailSent 
              ? "Full Report Sent!" 
              : (purpose === 'download-report' ? "Download Full Report" : "Unlock Full Analysis")
            }
          </DialogTitle>
          <DialogDescription className="text-center">
            {emailSent
              ? "Your report request has been successfully submitted and processed"
              : (purpose === 'download-report'
                  ? "Get a comprehensive PDF report with detailed analysis, optimization strategies, and profit projections sent directly to your email."
                  : "Get complete access to all dish analyses and detailed optimization recommendations."
                )
            }
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendVerification()}
                />
              </div>
            </div>


            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading 
                  ? "Submitting..." 
                  : (purpose === 'download-report' ? "Submit Request" : "Unlock")
                }
              </Button>
            </div>

          </div>
        ) : (
          <div className="space-y-4 mt-6">
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};