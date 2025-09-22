import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// PDF/file uploader component
const PdfUpload = ({
  onFiles,
  dragArrowUrl = "/_static/icons/drag-arrow.webp",
}: {
  onFiles?: (files: File[]) => void;
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
            <span className="hidden md:inline">Click to upload, or drag PDF here</span>
          </div>

          {/* Accepted file types */}
          <div className="mt-2">
            <p className="text-sm text-gray-500 text-center">
              PDF, DOCX, URL
            </p>
          </div>

          {/* Button */}
          <div style={{ position: "relative", marginTop: 20 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileDialog();
              }}
              style={{
                marginTop: 20,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "hsl(var(--primary))",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                height: 48,
                padding: 0,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 0.2,
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <span className="button-primary" style={{ display: "flex", alignItems: "center", padding: "0 24px", height: "100%" }}>
                <UploadArrowIcon />
                <span style={{ marginLeft: 10 }}>Upload PDF</span>
              </span>
              <span
                className="button-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: 40,
                  borderLeft: "1px solid rgba(255,255,255,0.3)",
                  cursor: "pointer",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
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

const UploadSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [apiProgress, setApiProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState(0);

  const loadingMessages = [
    "Extracting text from PDF...",
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

      // Convert file to base64
      const fileData = await fileToBase64(file);

      // Simulate progress updates during API call
      const progressInterval = setInterval(() => {
        setApiProgress(prev => {
          const newProgress = prev + Math.random() * 5; // Smaller random progress increments
          return Math.min(newProgress, 90); // Cap at 90% until completion
        });
      }, 1000); // Slower updates every 1 second

      // Call Supabase function to analyze the PDF
      const { data, error } = await supabase.functions.invoke('analyze-menu-pdf', {
        body: {
          fileData,
          fileName: file.name
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
      toast({
        title: "Analysis Failed",
        description: "Something went wrong while analyzing your menu. Please try again.",
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
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <section className="relative overflow-hidden py-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-radial from-primary/30 to-transparent" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full blur-3xl opacity-40 bg-gradient-radial from-secondary/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8">
            Start Your Analysis Now
          </h2>
          
          <div className="relative">
            <PdfUpload onFiles={handleFileUpload} />
              
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
