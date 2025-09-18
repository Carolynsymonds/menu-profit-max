import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Share2, Mail, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GeneratedMenuImage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const imageData = location.state?.imageUrl;
    if (imageData) {
      setImageUrl(imageData);
    } else {
      // Try to get from localStorage as fallback
      const storedImage = localStorage.getItem('generatedMenuImage');
      if (storedImage) {
        setImageUrl(storedImage);
      }
    }
  }, [location.state]);

  const handleBackToGeneratedMenu = () => {
    navigate('/generated-menu');
  };

  const handleBackToStrategies = () => {
    navigate('/menu-analysis-results');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDownloadImage = () => {
    setShowDownloadModal(true);
  };

  const handleSendMenu = async () => {
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

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email,
          purpose: 'download-menu',
          menuImageUrl: imageUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setEmailSent(true);
        toast({
          title: "Menu Sent!",
          description: "Your generated menu has been sent to your email.",
        });
      } else {
        throw new Error(data.error || 'Failed to send menu');
      }
    } catch (error) {
      console.error('Error sending menu:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send menu. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
    setEmail("");
    setEmailSent(false);
    setIsSubmitting(false);
  };

  const handleShareImage = async () => {
    if (imageUrl && navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'generated-menu.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Generated Menu',
          text: 'Check out my AI-generated menu!',
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: "Share Failed",
          description: "Unable to share the image. Please try downloading instead.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback: copy image URL to clipboard
      navigator.clipboard.writeText(imageUrl || '');
      toast({
        title: "Image URL Copied",
        description: "The image URL has been copied to your clipboard.",
      });
    }
  };

  if (!imageUrl) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                No Image Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We couldn't find any generated menu image. Please go back and create a menu first.
              </p>
              <div className="flex gap-4">
                <Button onClick={handleBackToGeneratedMenu} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Generated Menu
                </Button>
                <Button variant="outline" onClick={handleBackToStrategies}>
                  Back to Strategies
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
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Your Generated Menu
          </h1>
          <p className="text-xl text-gray-600 font-light">
            AI-powered menu design ready for your restaurant
          </p>
        </div>

        {/* Image Display */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Generated Menu"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '80vh' }}
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Generating your menu...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          <Button 
            onClick={handleBackToGeneratedMenu}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Menu
          </Button>
          <Button 
            onClick={handleDownloadImage}
            className="flex items-center gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Download Menu
          </Button>
          
        </div>
      </div>

      <Footer />

      {/* Download Modal */}
      <Dialog open={showDownloadModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-32 h-32 flex items-center justify-center">
              {emailSent ? (
                <img 
                  src="/lovable-uploads/5b64c1c1-e8c8-46a3-9e33-4e45b6bdd701.png" 
                  alt="Success Checkmark"
                  className="w-32 h-32"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            <DialogTitle className="text-xl font-semibold mx-auto">
              {emailSent 
                ? "Full Menu Sent!" 
                : "Download Full Menu"
              }
            </DialogTitle>
            <DialogDescription className="text-center">
              {emailSent
                ? "Your menu request has been successfully submitted and processed"
                : "Get your professional menu image delivered instantly to your inbox."
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMenu()}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMenu}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting 
                    ? "Submitting..." 
                    : "Get Menu"
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              <Button
                onClick={handleCloseModal}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedMenuImage;
