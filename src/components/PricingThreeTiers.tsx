import React from "react";

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
const btnGradientGold = "px-6 py-2 text-sm font-semibold bg-[#ffbe0b] hover:bg-[#ffbe0b]/90 text-[#1a1a1a] shadow-md hover:shadow-lg transition-all duration-300";

function Check({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
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
    buttonText: "Get started →",
    buttonClass: btnGradientPrimary,
    features: [
      { icon: "🖥️", text: "1 active menu" },
      { icon: "⬆️", text: "25 MB upload limit/menu" },
      { icon: "📊", text: "Basic AI analysis (up to 25 insights/mo)" }
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
    buttonText: "Get started →",
    buttonClass: btnGradientPrimary,
    features: [
      { icon: "🖥️", text: "5 active menus" },
      { icon: "⬆️", text: "75 MB upload limit/menu" },
      { icon: "📊", text: "Advanced AI insights + competitor benchmarking" }
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
  return (
    <section className="w-full bg-white">
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
              
              <button className={`mt-6 ${plan.buttonClass}`} style={{ borderRadius: '32px' }}>
                {plan.buttonText}
              </button>
              <p className="mt-3 text-slate-500 text-xs text-center">🌼 7 day money back guarantee</p>
              <hr className="my-6 border-slate-200" />
              
              <ul className="space-y-3 text-[15px]">
                {plan.features.map((feature, index) => (
                  <Feature key={index} icon={<span className="text-primary">{feature.icon}</span>}>
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
