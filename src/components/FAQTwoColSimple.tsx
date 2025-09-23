import React, { useState } from "react";

/**
 * FAQ – Two Column Accordion (Simple)
 * Layout matches the screenshot: big stacked title on the left, clean accordion on the right.
 * TailwindCSS required. Minimal JS, no animation libs.
 */

const QUESTIONS: { q: string; a: string }[] = [
  { q: "What type of menu files can I upload?", a: "PDFs, images of menus, or POS/CSV exports." },
  { q: "How long does it take to analyze my menu?", a: "Most menus process in under 1 minute." },
  { q: "Do I need to enter ingredient costs?", a: "No, but adding them gives more accurate profit insights." },
  { q: "Is my menu data private and secure?", a: "Yes, encrypted and never shared. You control access." },
  { q: "Can Menu Profitizer suggest price changes?", a: "Yes, it benchmarks against competitors and highlights profitable adjustments—without forcing price increases." },
  { q: "Does it work for multi-location restaurants or groups?", a: "Yes, you can manage multiple menus and compare performance across locations." },
  { q: "What's the fastest way to get support?", a: "Use in-app chat or email—our team responds quickly." },
  { q: "How does the 7-day money-back guarantee work?", a: "Try it risk-free; cancel within 7 days for a full refund." },
  { q: "Can I cancel anytime?", a: "Yes, subscriptions are flexible and month-to-month." },
  { q: "What happens after I cancel?", a: "You'll keep access until the end of your billing cycle. Your menus and reports remain downloadable." },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button
        className="w-full flex items-center justify-between gap-6 py-4 text-left hover:bg-slate-50 transition-colors duration-200"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[18px] text-slate-800">{q}</span>
        <Chevron open={open} />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-5 text-slate-600 leading-relaxed">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQTwoColSimple() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-14 md:py-20 grid lg:grid-cols-[360px,1fr] gap-10">
        {/* Left big title */}
        <div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[0.95]">
            Frequently
            <br />
            Asked
            <br />
            Questions
          </h2>
        </div>

        {/* Right accordion list */}
        <div className="border-t border-slate-200">
          {QUESTIONS.map((qa, i) => (
            <Item key={qa.q + i} q={qa.q} a={qa.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
