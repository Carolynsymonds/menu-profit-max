import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Check, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUtmTracking } from "@/hooks/useUtmTracking";

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
            <img 
              src="/src/assets/toast-logo.png" 
              alt="MenuProfitMax" 
              className="h-8 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to MenuProfitMax
            </h1>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-gray-300"
                />
              </div>

              <Button
                onClick={handleEmailContinue}
                disabled={!email || isCreatingAccount}
                className="w-full rounded-lg shadow-sm"
              >
                {isCreatingAccount ? "Getting Started..." : "Continue"}
              </Button>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                  or
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleSignUp}
                className="w-full rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
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
            <p>
              By continuing, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
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
            <blockquote className="text-lg text-gray-800 leading-relaxed">
              "MenuProfitMax transformed how I understand my restaurant's profitability. 
              The real-time ingredient costing and profit margin analysis helped me increase 
              our bottom line by 23% in just three months."
            </blockquote>
            <div>
              <div className="font-semibold text-gray-900">Elinor B.</div>
              <div className="text-sage-600 text-sm">Restaurant Owner</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="space-y-4">
            <p className="text-sage-600 text-sm text-center">
              Trusted by Restaurateurs at
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
                <span className="text-gray-800 font-semibold text-sm">Papa John's</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
                <span className="text-gray-800 font-semibold text-sm">Chipotle</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
                <span className="text-gray-800 font-semibold text-sm">Chick-fil-A</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
                <span className="text-gray-800 font-semibold text-sm">Applebee's</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSplit;