const TrustedBySection = () => {
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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
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
          
          {/* reCAPTCHA Terms */}
          <div className="recaptcha-terms mt-8">
            <p className="text-xs text-muted-foreground">
              This site is protected by reCAPTCHA and the Google{" "}
              <a 
                href="https://policies.google.com/privacy" 
                className="text-primary hover:text-primary/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a 
                href="https://policies.google.com/terms" 
                className="text-primary hover:text-primary/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
