import { Button } from "@/components/ui/button";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const UploadMenuHeadline2 = ({ onButtonClick }: { onButtonClick?: (buttonName: string) => void }) => {
  const { navigateWithUtm } = useUtmTracking();
  const navigate = useNavigate();

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
    // Scroll to the upload menu section with offset to show the title
    const element = document.getElementById('upload-menu-section');
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 100; // Scroll 100px less to show the title

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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
    // Scroll to the upload menu section with offset to show the title
    const element = document.getElementById('upload-menu-section');
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 100; // Scroll 100px less to show the title

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };


  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col pt-12 md:pt-0">
      {/* Background */}

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 flex-1 flex flex-col justify-between">
        <div className="animate-fade-in grid gap-16 flex-1 flex flex-col justify-center">
          {/* Main Banner Section - Side by Side */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 text-center md:text-left order-1 md:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] text-foreground">
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

            {/* Right: Video */}
            <div className="flex justify-center order-2 md:order-2">
              <video
                className="w-full max-w-lg rounded-2xl shadow-2xl"
                autoPlay
                loop
                muted
                playsInline
                controls
                preload="metadata"
                poster=""
              >
                <source src="/lovable-uploads/FLORA-original-8297db98.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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

export default UploadMenuHeadline2;

