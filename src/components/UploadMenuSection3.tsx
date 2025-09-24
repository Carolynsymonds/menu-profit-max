import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TrustedBy from "@/components/TrustedBy";
import TrustedBySection from "./TrustedBySection";

/**
 * Validation Error Card (Email)
 * - Warning icon
 * - Message text
 * - Primary CTA button (Try Again)
 * - Secondary support link
 * TailwindCSS required
 */

function EmailErrorCard({
  message = "Please enter a genuine email address",
  onTryAgain = () => { },
  supportHref = "#",
  supportLabel = "Contact support",
}: {
  message?: string;
  onTryAgain?: () => void;
  supportHref?: string;
  supportLabel?: string;
}) {
  return (
    <div className="w-full grid place-items-center py-10">
      <div
        className="w-[320px] sm:w-[380px] bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-7 text-center"
        role="alert"
        aria-live="assertive"
      >
        {/* Icon */}
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-50 grid place-items-center border border-slate-200">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12" y2="17" />
          </svg>
        </div>

        {/* Message */}
        <p className="text-slate-800 font-medium leading-relaxed">{message}</p>

        {/* Primary CTA */}
        <button
          onClick={onTryAgain}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold shadow-sm bg-[#0d6efd] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 hover:scale-105"
          style={{ borderRadius: '32px' }}
        >
          Try Again
        </button>

        {/* Secondary link */}
        <div className="mt-3">
          <a href={supportHref} className="text-sm text-[#0d6efd] hover:underline">
            {supportLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

// PDF/file uploader component
const PdfUpload = ({
  onFiles,
  dragArrowUrl = "/_static/icons/drag-arrow.webp",
  validationError,
  onTryAgain,
}: {
  onFiles?: (files: File[]) => void;
  dragArrowUrl?: string;
  validationError?: string | null;
  onTryAgain?: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      console.log('handleFiles called with:', files);
      if (!files || files.length === 0) {
        console.log('No files provided to handleFiles');
        return;
      }
      console.log('Calling onFiles with:', Array.from(files));
      onFiles?.(Array.from(files));
    },
    [onFiles]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileDialog = () => {
    console.log('triggerFileDialog called');
    console.log('inputRef.current:', inputRef.current);
    inputRef.current?.click();
    console.log('File dialog should have opened');
  };

  // Using CSS border instead of SVG for better primary color support
  const borderColor = "hsl(var(--primary))";

  return (
    <div className="relative mx-auto" style={{ width: "calc(100% - 32px)", maxWidth: 820 }}>
      {/* Outer card */}
      <div
        className="landing-dropzone relative"
        style={{
          position: "relative",
          boxSizing: "border-box",
          background: "#fff",
          border: "1px solid #EBEEF9",
          boxShadow: "0 0 28px hsl(var(--primary) / 0.22)",
          borderRadius: 24,
          padding: 26,
        }}
      >

        {/* Inner dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={triggerFileDialog}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className="flex select-none flex-col items-center justify-center text-center"
          style={{
            borderRadius: 8,
            padding: "54px 0",
            backgroundColor: isDragging ? "hsl(var(--primary) / 0.1)" : "#FDFBFF",
            border: `1px dashed ${borderColor}`,
            transition: "background-color .2s, border-color .2s",
            cursor: "pointer",
            height: 321,
            display: "flex",
          }}
          aria-label="Click to upload, or drag PDF here"
        >
          {validationError ? (
            <>
              {/* Warning Icon */}
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-50 grid place-items-center border border-red-200">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12" y2="17" />
                </svg>
              </div>

              {/* Error Message */}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: "24px",
                  textAlign: "center",
                  marginTop: 8,
                  color: "#dc2626",
                  maxWidth: "400px",
                }}
              >
                This file does not appear to be a restaurant menu. Please review your file and upload a valid menu document.
              </div>

              {/* Try Again Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTryAgain?.();
                }}
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold shadow-sm bg-[#0d6efd] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 hover:scale-105"
                style={{ borderRadius: '32px' }}
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              {/* Center icon (SVG copied) */}
              <UploadFileIcon height={83} />

              {/* Headline: mobile/desktop variants like original */}
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: "30px",
                  textAlign: "center",
                  marginTop: 12,
                  color: "#070D1B",
                }}
              >
                <span className="md:hidden">Upload PDF here</span>
                <span className="hidden md:inline">Click to upload, or drag Menu here</span>
              </div>

              {/* Accepted file types */}
              <div className="mt-2">
                <p className="text-sm text-gray-500 text-center">
                  PDF, JPG
                </p>
              </div>

              {/* Button */}
              <div style={{ position: "relative", marginTop: 20 }}>

                <button
                  onClick={(e) => {
                    console.log('Upload button clicked');
                    e.stopPropagation();
                    console.log('About to trigger file dialog');
                    triggerFileDialog();
                  }}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ borderRadius: '32px' }}
                >
                  Upload menu
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.odt,.odp,.txt,.rtf,.html,.htm,.md,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={(e) => {
            console.log('Input onChange triggered with files:', e.target.files);
            handleFiles(e.target.files);
          }}
        />
      </div>
    </div>
  );
};

function UploadArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19" width="19" height="19" aria-hidden>
      <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" clipPath="url(#a)">
        <path d="M5.92 9.55 9.5 5.37l3.58 4.18M9.5 5.37v8.36" />
        <path d="M9.5 17.3a7.76 7.76 0 1 0 0-15.51 7.76 7.76 0 0 0 0 15.52" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.5.55h18v18H.5z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function UploadFileIcon({ height = 83 }: { height?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 68 83" aria-label="Upload file icon" height={height}>
      <g filter="url(#a)"><path fill="#224E94" d="M12.2 16.4c0-1.7 1.4-3.1 3.2-3.1h21.4q2.8 0 4.8 2L53.3 27q2 2 2 4.8v35c0 1.8-1.4 3.2-3.2 3.2H15.4a3 3 0 0 1-3.2-3.2z" /></g>
      <g filter="url(#b)"><path fill="hsl(var(--primary))" fillOpacity=".3" d="M11.3 15c0-1.7 1.4-3 3.2-3H37q2.8 0 4.8 2l12.4 12.4q2 2 2 4.7v36.7c0 1.8-1.4 3.2-3.2 3.2H14.5a3 3 0 0 1-3.2-3.2z" /></g>
      <path fill="url(#c)" d="M9.8 12.2c0-1.8 1.4-3.2 3.1-3.2h24.5q2.9 0 4.8 2l13.6 13.6q1.9 2 2 4.7V69c0 1.8-1.5 3.2-3.2 3.2H12.9A3 3 0 0 1 9.7 69z" />
      <rect width="36" height="36" x="30.3" y="44.5" fill="#070D1B" rx="18" />
      <path fill="#fff" d="M54.5 62a1 1 0 0 1-1.3 0l-4-4v11.4a1 1 0 1 1-1.9 0V58l-4 4a1 1 0 1 1-1.3-1.3l5.6-5.6a1 1 0 0 1 1.3 0l5.6 5.6a1 1 0 0 1 0 1.4" />
      <defs>
        <radialGradient id="c" cx="0" cy="0" r="1" gradientTransform="rotate(126.8 26 19)scale(76.9642 58.6605)" gradientUnits="userSpaceOnUse"><stop stopColor="#EFEFEF" /><stop offset="1" stopColor="#FDFDFD" /></radialGradient>
        <filter id="a" width="52.1" height="65.8" x="7.7" y="8.8" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="2.3" /></filter>
        <filter id="b" width="67.4" height="81.6" x=".1" y=".7" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="5.6" /></filter>
      </defs>
    </svg>
  );
}

const UploadMenuSection3 = () => {
  const [linkName, setLinkName] = useState("");
  const [activeTab, setActiveTab] = useState("Documents");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [apiProgress, setApiProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadingMessages = [
    "Processing your menu...",
    "Analyzing menu items with AI...",
    "Identifying dishes and ingredients...",
    "Calculating profit insights...",
    "Almost ready!"
  ];

  // Cycle through loading messages
  useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [isUploading, loadingMessages.length]);

  // Timer for generation time
  useEffect(() => {
    if (!isUploading) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      setGenerationTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [isUploading]);

  const tabs = ["Documents", "Images", "Code"];
  const moreOptions = ["Audio", "Video", "Text"];

  const handleFileUpload = async (files: File[]) => {
    // Clear any previous validation errors
    setValidationError(null);
    
    console.log('handleFileUpload called with files:', files);
    try {
      window.gtag?.('event', 'file_upload', {
        method: 'upload_button',
        button_id: 'upload-menu-btn',
        button_text: 'Upload Menu',
        page_location: window.location.href,
        file_count: files.length,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    setIsUploading(true);
    setLoadingMessageIndex(0); // Reset to first message
    setApiProgress(0);
    setGenerationTime(0);

    try {
      // Process the first file (assuming single file upload for now)
      const file = files[0];

      // Detect file type
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      
      if (!isImage && !isPDF) {
        throw new Error('Please upload a PDF or image file');
      }

      // Convert file to base64
      const fileData = await fileToBase64(file);

      // Simulate progress updates during API call
      const progressInterval = setInterval(() => {
        setApiProgress(prev => {
          const newProgress = prev + Math.random() * 5; // Smaller random progress increments
          return Math.min(newProgress, 90); // Cap at 90% until completion
        });
      }, 1000); // Slower updates every 1 second

      // Call appropriate Supabase function based on file type
      const functionName = isImage ? 'analyze-menu-image' : 'analyze-menu-pdf';
      console.log(`Calling ${functionName} for file type: ${file.type}`);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          fileData,
          fileName: file.name,
          fileType: file.type
        }
      });

      // Clear progress interval and set to 100% on completion
      clearInterval(progressInterval);
      setApiProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Store result in localStorage as backup
        localStorage.setItem('menuAnalysisResult', JSON.stringify(data.data));

        // Store original text for image generation
        if (data.data.originalText) {
          localStorage.setItem('originalMenuText', data.data.originalText);
        }

        // Navigate to results page with analysis data
        navigate('/menu-analysis-results', {
          state: {
            analysisResult: data.data
          }
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Error analyzing menu:', error);
      
      // Check if it's a validation error (not a menu)
      const errorMessage = error.message || 'Something went wrong while analyzing your menu. Please try again.';
      const isValidationError = errorMessage.includes('does not appear to be a restaurant menu');
      
      
        // Set validation error state instead of showing toast
        setValidationError(errorMessage);
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleTryAgain = () => {
    setValidationError(null);
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // For images, return the full data URL
        // For PDFs, return only the base64 part
        if (file.type.startsWith('image/')) {
          resolve(result);
        } else {
          // Remove the data:application/pdf;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <section id="upload-menu-section" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center m-auto pb-10 max-w-md">
          <h2 className="font-bold text-foreground leading-tight max-w-[800px] text-[2rem] text-center mx-auto">
            The simplest way to unlock hidden profit from your menu
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Left Side - Testimonial & Social Proof */}
          <div className="text-center lg:text-left lg:col-span-1">
            <div>
              <div className="text-lg text-muted-foreground leading-relaxed font-light text-right mb-5">
                "Honestly shocked, the tool helped us raise AOV by $2.19"
              </div>
              <div className="text-end text-sm">
                – Tim H.
              </div>
            </div>

            <div className="mt-8 text-right">
              <div className="flex justify-end items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {[
                    { src: "/lovable-uploads/social_proof1.png", alt: "Review 1" },
                    { src: "/lovable-uploads/social_proof2.png", alt: "Review 2" },
                    { src: "/lovable-uploads/social_proof3.png", alt: "Review 3" },
                    { src: "/lovable-uploads/social_proof4.png", alt: "Review 4" }
                  ].map((review, i) => (
                    <img
                      key={i}
                      src={review.src}
                      alt={review.alt}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">1M+ happy users</p>
            </div>
          </div>

          {/* Center - Main Upload Box */}
          <div className="lg:col-span-3 relative">
            <PdfUpload 
              onFiles={handleFileUpload} 
              validationError={validationError}
              onTryAgain={handleTryAgain}
            />

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <div className="text-center space-y-6">

                  {/* Loading Message */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {loadingMessages[loadingMessageIndex]}
                    </h3>

                  </div>

                  {/* Progress Ring */}
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <div className="relative w-5 h-5 md:w-6 md:h-6">
                      {/* Progress Ring */}
                      <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-300 opacity-20"
                        />
                        {/* Progress */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          className="text-black"
                          style={{
                            strokeDasharray: '264px',
                            strokeDashoffset: `${264 * (1 - apiProgress / 100)}px`
                          }}
                        />
                      </svg>
                    </div>
                    <span className="text-xs md:text-sm text-foreground">Running {generationTime.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}
            {/* reCAPTCHA Terms */}
            <div className="recaptcha-terms mt-2 text-center">
              <p
                className="text-xs text-muted-foreground"
                style={{
                  color: '#dfdfdf',
                  fontSize: '12px',
                  margin: '8px auto 0',
                  maxWidth: '600px'
                }}
              >
                This site is protected by reCAPTCHA and the Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className="text-center lg:text-right lg:col-span-1">
            <div className="arrow-cta hidden xl:block" style={{
              flexGrow: 0,
              fontSize: '24px',
              marginRight: 'auto',
              marginTop: '50px',
              textAlign: 'left',
              width: '300px'
            }}>
              <div className="text-2xl font-bold text-primary mb-4 pl-[120px]">
                Try for free
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="208.701" height="112.316" viewBox="0 0 208.701 112.316" className="arrow" style={{ height: "90px" }}>
                <defs>
                  <style>
                    {`.cls-1 { fill: #fe714d; } /* arrow + curve */
                    .cls-2 { fill: #fe714d; } /* triangle outline (now orange too) */`}
                  </style>
                </defs>
                <g id="Arrow" transform="translate(-1479 -589.684)">
                  <path id="Path_1" className="cls-1" d="M1567.928,734.8q-8.125,0-16.562-.311l.111-3A384.4,384.4,0,0,0,1604.842,730a252.758,252.758,0,0,0,41.244-7.568,185.936,185.936,0,0,0,31.246-11.655A165.4,165.4,0,0,0,1700.723,697a109.752,109.752,0,0,0,23.43-21.872,82.579,82.579,0,0,0,11.7-20.045c4.727-11.77,4.523-20.07,4.52-20.152l3-.1a37.364,37.364,0,0,1-.492,6.073,68.577,68.577,0,0,1-4.243,15.293,85.576,85.576,0,0,1-12.119,20.776,112.746,112.746,0,0,1-24.066,22.477,168.382,168.382,0,0,1-23.811,14.024,188.951,188.951,0,0,1-31.751,11.845,255.757,255.757,0,0,1-41.736,7.661A362.872,362.872,0,0,1,1567.928,734.8Z" transform="translate(-55.67 -45.154)" />
                  <path id="Polygon_1" className="cls-1" d="M13.293,5.668a3,3,0,0,1,5.414,0L29.95,29.207A3,3,0,0,1,27.243,33.5H4.757A3,3,0,0,1,2.05,29.207Z" transform="translate(1479 702) rotate(-90)" />
                  <path id="Polygon_1_-_Outline" className="cls-2" d="M16,4.961A1.959,1.959,0,0,0,14.2,6.1L2.953,29.638a2,2,0,0,0,1.8,2.862H27.243a2,2,0,0,0,1.8-2.862L17.8,6.1A1.959,1.959,0,0,0,16,4.961Z" transform="translate(1479 702) rotate(-90)" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* TrustedBy Component - Mobile Only */}
        <div className="">
          <TrustedBySection />
        </div>
      </div>
    </section>
  );
};

export default UploadMenuSection3;
