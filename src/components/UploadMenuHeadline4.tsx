import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// PDF/file uploader component
const PdfUpload = ({
  onFiles,
  onRef,
  dragArrowUrl = "/_static/icons/drag-arrow.webp",
}: {
  onFiles?: (files: File[]) => void;
  onRef?: (ref: { triggerFileDialog: () => void }) => void;
  dragArrowUrl?: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
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

  const triggerFileDialog = () => inputRef.current?.click();

  // Expose triggerFileDialog method to parent
  React.useEffect(() => {
    if (onRef) {
      onRef({ triggerFileDialog });
    }
  }, [onRef, triggerFileDialog]);

  // Using CSS border instead of SVG for better primary color support
  const borderColor = "hsl(var(--primary))";

  return (
    <div className="relative mx-auto" style={{ width: "calc(100% - 32px)", maxWidth: 750 }}>
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
          padding: 20,
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
            padding: "40px 0",
            backgroundColor: isDragging ? "hsl(var(--primary) / 0.1)" : "#FDFBFF",
            border: `1px dashed ${borderColor}`,
            transition: "background-color .2s, border-color .2s",
            cursor: "pointer",
            height: 250,
            display: "flex",
          }}
          aria-label="Click to upload, or drag PDF here"
        >
          {/* Center icon (SVG copied) */}
          <UploadFileIcon height={60} />

          {/* Headline: mobile/desktop variants like original */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: "24px",
              textAlign: "center",
              marginTop: 8,
              color: "#070D1B",
            }}
          >
            <span className="md:hidden">Upload menu here</span>
            <span className="hidden md:inline">Click to upload, or drag menu here</span>
          </div>

          {/* Accepted file types */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 text-center">
              PDF, PNG, JPG, JPEG
            </p>
          </div>

          {/* Button */}
          <div style={{ position: "relative", marginTop: 15 }}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerFileDialog();
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 px-4 py-1 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
              style={{ borderRadius: '24px' }}
            >
              Upload menu
            </button>
          </div>
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.odt,.odp,.txt,.rtf,.html,.htm,.md,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
};

function UploadFileIcon({ height = 60 }: { height?: number }) {
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

const UploadMenuHeadline4 = ({ onButtonClick, onFileUpload }: { onButtonClick?: (buttonName: string) => void; onFileUpload?: () => void }) => {
  const { navigateWithUtm } = useUtmTracking();
  const navigate = useNavigate();
  const pdfUploadRef = useRef<{ triggerFileDialog: () => void } | null>(null);
  const { toast } = useToast();
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [apiProgress, setApiProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState(0);

  const loadingMessages = [
    "Processing your menu...",
    "Extracting text with AI...",
    "Analyzing menu items...",
    "Identifying dishes and ingredients...",
    "Calculating profit insights...",
    "Almost ready!"
  ];

  // Cycle through loading messages
  React.useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [isUploading, loadingMessages.length]);

  // Timer for generation time
  React.useEffect(() => {
    if (!isUploading) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      setGenerationTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [isUploading]);

  const brandLogos = [
    {
      src: "/lovable-uploads/9efe8d5f-1e81-42b0-8803-d420694c0d6d.png",
      alt: "Papa John's",
      className: "[height:2rem]"
    },
    {
      src: "/lovable-uploads/ec3ab3f1-fac3-42f8-80b5-c88c5a6ca92f.png",
      alt: "Chipotle Mexican Grill",
      className: "h-16"
    },
    {
      src: "/lovable-uploads/2e57f3ae-6eeb-4f88-8a90-a459f7dc5c67.png",
      alt: "Chick-fil-A",
      className: "h-16"
    },
    {
      src: "/lovable-uploads/8881ee5b-e5b5-4950-a384-bf791c2cb69a.png",
      alt: "Applebee's",
      className: "h-20"
    }
  ];

  const handleSignupClick = () => {
    onButtonClick?.('Try for free');
    try {
      window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Try for free',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }
    
    // Trigger file upload dialog
    pdfUploadRef.current?.triggerFileDialog();
  };

  const handleDemoClick = () => {
    onButtonClick?.('Watch demo');
    try {
      window.gtag?.('event', 'video_play', {
        method: 'demo_button',
        button_id: 'demo-btn',
        button_text: 'Watch demo',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }
    // Scroll to the main headline
    const element = document.getElementById('main-headline');
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 100; // Scroll 100px less to show the title

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
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
      const fileType = file.type;
      const isPDF = fileType === 'application/pdf';
      const isImage = fileType.startsWith('image/');

      if (!isPDF && !isImage) {
        throw new Error('Please upload a PDF or image file (PNG, JPG, JPEG, etc.)');
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

      let data, error;

      if (isPDF) {
        // Call Supabase function to analyze the PDF
        const result = await supabase.functions.invoke('analyze-menu-pdf', {
          body: {
            fileData,
            fileName: file.name
          }
        });
        data = result.data;
        error = result.error;
      } else {
        // Call Supabase function to analyze the image
        const result = await supabase.functions.invoke('analyze-menu-image', {
          body: {
            fileData,
            fileName: file.name,
            fileType: fileType
          }
        });
        data = result.data;
        error = result.error;
      }

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
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong while analyzing your menu. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // For images, we need the full data URL format for GPT-4o-mini
        // For PDFs, we only need the base64 part
        if (file.type.startsWith('image/')) {
          resolve(result); // Full data URL for images
        } else {
          // Remove the data:application/pdf;base64, prefix for PDFs
          const base64 = result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col pt-12 md:pt-0">
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Menu</h3>
              <p className="text-gray-600 mb-4">{loadingMessages[loadingMessageIndex]}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${apiProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                {Math.round(apiProgress)}% complete • {generationTime.toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      {/* <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-radial from-primary/30 to-transparent" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full blur-3xl opacity-40 bg-gradient-radial from-secondary/30 to-transparent" />
      </div> */}

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 flex-1 flex flex-col justify-between">
        <div className="animate-fade-in grid gap-16 flex-1 flex flex-col justify-center">
          {/* Main Banner Section - Side by Side */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 text-center md:text-left order-1 md:order-1">
              <h1 id="main-headline" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] text-foreground">
                Upload your menu. Get instant profit insights.

              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                Discover hidden revenue opportunities with our AI-powered menu analysis. <span className="underline text-primary">Join thousands of restaurants</span> already maximizing their profits.
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Button
                  onClick={handleSignupClick}
                  className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ borderRadius: '32px' }}
                >
                  Try for free
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDemoClick}
                  className="px-6 py-2 text-sm font-medium text-foreground transition-colors"
                >
                  Watch demo
                </Button>
              </div>

            </div>

            {/* Right: PDF Upload Component */}
            <div className="flex justify-center order-2 md:order-2">
              <PdfUpload onFiles={handleFileUpload} onRef={(ref) => { pdfUploadRef.current = ref; }} />
            </div>
          </div>
        </div>

        {/* Brand logos section - positioned at bottom */}
        <div className="text-center mt-16 md:mt-0">
          <p className="text-sm text-muted-foreground mb-4">Trusted by leading restaurants</p>
          <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
            {brandLogos.map((brand, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={brand.src}
                  alt={brand.alt}
                  className={`${brand.className} max-w-full object-contain hover:opacity-50 transition-opacity`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
};

export default UploadMenuHeadline4;
