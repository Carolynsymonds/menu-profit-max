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
}

export const VerificationModal = ({ isOpen, onClose, dishesData }: VerificationModalProps) => {
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
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email.trim(),
          dishesData
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Verification Email Sent!",
        description: "Check your inbox and click the verification link to unlock your analysis.",
      });
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Failed to Send Email",
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
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {emailSent ? (
              <CheckCircle className="w-6 h-6 text-primary" />
            ) : (
              <Lock className="w-6 h-6 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {emailSent ? "Check Your Email!" : "Unlock Full Analysis"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {emailSent
              ? "We've sent a verification link to your email. Click it to unlock your complete dish analysis."
              : "Get complete access to all dish analyses and detailed optimization recommendations."
            }
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
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
                {isLoading ? "Sending..." : "Send Verification"}
              </Button>
            </div>

          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Verification email sent to <strong>{email}</strong>
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't see the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="text-sm"
              >
                Use Different Email
              </Button>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};