import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Check, Quote, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";

const SignupSplit = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { toast } = useToast();
  const { getStoredUtmParams, createUrlWithUtm } = useUtmTracking();

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 10,
    hasNumber: /\d/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Handle signup process
  const handleSignupProcess = async (email: string) => {
    try {
      const utmParams = getStoredUtmParams();
      const response = await supabase.functions.invoke('complete-signup', {
        body: { 
          email, 
          utm_params: utmParams,
          source: 'waitlist'
        }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in signup process:', error);
      throw error;
    }
  };

  const handleEmailContinue = async () => {
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingAccount(true);
      
      await handleSignupProcess(email);
      setStep(2);
      
      toast({
        title: "Welcome!",
        description: "Please create your password to complete signup.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingAccount(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        setStep(3);
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const redirectUrl = createUrlWithUtm('/auth/callback');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderValidationIcon = (isValid: boolean) => (
    isValid ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    )
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        handleEmailContinue();
      } else if (step === 2) {
        handleCreateAccount();
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-block">
              <img 
                src={siteContent.brand.logoUrl} 
                alt={siteContent.brand.name} 
                className="h-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to {siteContent.brand.name}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Boost Restaurant Profits with Smarter Menu Costing
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-8">
              <ShieldCheck size={16} className="text-gray-500" />
              Protected by enterprise grade security
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Business email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-gray-300 h-12"
                />
              </div>

              <Button
                onClick={handleEmailContinue}
                disabled={!email || isCreatingAccount}
                className="w-full rounded-lg shadow-sm h-12"
              >
                {isCreatingAccount ? "Getting Started..." : "Continue"}
              </Button>


             
              
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.minLength)}
                  <span className={passwordValidation.minLength ? "text-green-600" : "text-gray-500"}>
                    At least 10 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasNumber)}
                  <span className={passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}>
                    Contains a number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasLowercase)}
                  <span className={passwordValidation.hasLowercase ? "text-green-600" : "text-gray-500"}>
                    Contains lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasUppercase)}
                  <span className={passwordValidation.hasUppercase ? "text-green-600" : "text-gray-500"}>
                    Contains uppercase letter
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={!isPasswordValid || isCreatingAccount}
                className="w-full rounded-lg shadow-sm"
              >
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold">Check Your Email!</h2>
              <p className="text-gray-600">
                We've sent a verification link to {email}. Please check your email and click the link to activate your account.
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 space-y-1">
             <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Check size={16} className="text-primary" />
              No credit card required
            </p>

          </div>
        </div>
      </div>

      {/* Right Side - Testimonial & Social Proof */}
      <div className="flex-1 bg-gradient-to-br from-sage-50 to-sage-100 flex items-center justify-center p-8">
        <div className="max-w-lg space-y-8 bg-white rounded-2xl p-8 shadow-sm">
          {/* Testimonial */}
          <div className="space-y-4">
            <Quote className="w-8 h-8 text-coral-400" />
            <blockquote className="text-lg text-gray-800 leading-relaxed italic">
              "MenuProfitMax transformed how I understand my restaurant's profitability. 
              The real-time ingredient costing and profit margin analysis helped me increase 
              our bottom line by 23% in just three months."
            </blockquote>
            <div>
              <div className="font-semibold text-gray-900">Elinor B.</div>
              <div className="text-sm">Restaurant Owner</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="space-y-4">
            <p className="text-sm text-center">
              Trusted by Restaurateurs at
            </p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/9efe8d5f-1e81-42b0-8803-d420694c0d6d.png" 
                  alt="Papa John's" 
                  className="h-6 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/ec3ab3f1-fac3-42f8-80b5-c88c5a6ca92f.png" 
                  alt="Chipotle Mexican Grill" 
                  className="h-10 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/2e57f3ae-6eeb-4f88-8a90-a459f7dc5c67.png" 
                  alt="Chick-fil-A" 
                  className="h-10 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/8881ee5b-e5b5-4950-a384-bf791c2cb69a.png" 
                  alt="Applebee's" 
                  className="h-10 max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSplit;