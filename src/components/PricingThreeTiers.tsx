import React from "react";
import { useNavigate } from "react-router-dom";
import { useUtmTracking } from "@/hooks/useUtmTracking";

/**
 * Three-tier pricing table matching the provided layout
 * - Tiny / Solo (Most Popular) / Pro
 * - Rounded cards, subtle borders/shadows
 * - Gradient CTA buttons
 * - Middle card highlighted with a top ribbon and thicker border
 * TailwindCSS required
 */

const btnGradientPrimary =
  "px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300";
const btnOutlinePrimary = "px-6 py-2 text-sm font-semibold border-2 border-primary bg-white hover:bg-primary text-primary hover:text-white shadow-md hover:shadow-lg transition-all duration-300";
const btnGradientGold = "px-6 py-2 text-sm font-semibold bg-[#ffbe0b] hover:bg-[#ffbe0b]/90 text-[#1a1a1a] shadow-md hover:shadow-lg transition-all duration-300";

function Check({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function MonitorIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function UploadIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function BarChartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}

function FlowerIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
      <path d="M12 1a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM12 17a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM1 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0zM17 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0z"/>
    </svg>
  );
}

function Feature({ icon, children }) {
  return (
    <li className="flex items-start gap-3 text-slate-700">
      {icon}
      <span>{children}</span>
    </li>
  );
}

const pricingPlans = [
  {
    id: "tiny",
    name: "Starter",
    description: "Perfect for a single, professional link",
    price: "£7",
    period: "/ month",
    buttonText: "Get started for FREE →",
    buttonClass: btnOutlinePrimary,
    features: [
      { icon: <MonitorIcon className="text-primary" />, text: "1 active menu" },
      { icon: <UploadIcon className="text-primary" />, text: "25 MB upload limit/menu" },
      { icon: <BarChartIcon className="text-primary" />, text: "Basic AI analysis (up to 25 insights/mo)" }
    ],
    additionalFeatures: [
      { icon: "check", text: "Remove watermark" },
      { icon: "check", text: "Menu QR Codes" },
      { icon: "check", text: "Built-in reporting" }
    ],
    isPopular: false
  },
  {
    id: "solo",
    name: "Growth",
    description: "Great for individuals & small projects",
    price: "£14",
    period: "/ month",
    buttonText: "Get started for FREE →",
    buttonClass: btnGradientPrimary,
    features: [
      { icon: <MonitorIcon className="text-primary" />, text: "5 active menus" },
      { icon: <UploadIcon className="text-primary" />, text: "75 MB upload limit/menu" },
      { icon: <BarChartIcon className="text-primary" />, text: "Advanced AI insights + competitor benchmarking" }
    ],
    additionalFeatures: [
      { icon: "check", text: "Everything in Starter" },
      { icon: "check", text: "Menu editor & style lock" },
      { icon: "check", text: "Brand kit & custom logo" },
      { icon: "check", text: "Password protection" }
    ],
    isPopular: true
  }
 
];

export default function PricingThreeTiers() {
  const { navigateWithUtm } = useUtmTracking();
  
  const handleSignupClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Get started for FREE',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };

  return (
    <section className="w-full">
      <div className="mx-auto max-w-4xl px-6 md:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[28px] bg-white p-6 md:p-8 flex flex-col ${
                plan.isPopular
                  ? 'border-2 border-primary shadow-[0_20px_60px_hsl(var(--primary)/0.15)]'
                  : 'border border-slate-200 shadow-sm'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full text-white text-sm font-semibold bg-primary shadow-md">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-2xl font-extrabold text-primary">{plan.name}</h3>
                <p className="mt-1 text-slate-500">{plan.description}</p>
              </div>
              
              <div className="mt-8">
                <div className="flex items-end gap-2">
                  <div className="text-5xl font-extrabold text-[#3a3a3a]">{plan.price}</div>
                  <div className="text-slate-600 mb-1">{plan.period}</div>
                </div>
              </div>
              
              <button 
                className={`mt-6 ${plan.buttonClass}`} 
                style={{ borderRadius: '32px' }}
                onClick={handleSignupClick}
              >
                {plan.buttonText}
              </button>
              <p className="mt-3 text-slate-500 text-xs text-center flex items-center justify-center gap-1">
                7 day money back guarantee
              </p>
              <hr className="my-6 border-slate-200" />
              
              <ul className="space-y-3 text-[15px]">
                {plan.features.map((feature, index) => (
                  <Feature key={index} icon={feature.icon}>
                    {feature.text}
                  </Feature>
                ))}
              </ul>
              
              <div className="mt-6">
                <div className="text-slate-900 font-semibold mb-2">Additional Features:</div>
                <ul className="space-y-3 text-[15px]">
                  {plan.additionalFeatures.map((feature, index) => (
                    <Feature key={index} icon={<Check className="text-primary" />}>
                      {feature.text}
                    </Feature>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
