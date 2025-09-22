const UnlockProfitSection = () => {
  return (
    <section id="unlock-profit-section" className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="space-y-8">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] text-foreground">
            The simplest way to unlock hidden profit from your menu
          </h1>
          
          {/* Testimonial */}
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto">
              "Honestly shocked—the tool uncovered $3–$5 extra profit per dish in minutes, without raising prices."
            </p>
            <p className="text-lg font-semibold text-foreground">
              – Khaled H.
            </p>
          </div>
          
          {/* Social Proof */}
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              1M+ happy users
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 space-y-6">
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Try for free
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnlockProfitSection;
