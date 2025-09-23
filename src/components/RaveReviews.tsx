import React from "react";

/**
 * Rave Reviews / Testimonials section
 * - Left column: avatars row, headline, subcopy, CTA
 * - Right: responsive grid of testimonial cards with avatar, name/role, and quote
 * TailwindCSS required. Framer Motion optional for subtle hover/entrance.
 */

const GRADIENT = "bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-blue-500";

const TESTIMONIALS = [
  {
    name: "Tim",
    role: "Restaurant Owner",
    avatar: "/lovable-uploads/social_proof1.png",
    quote:
      "The insights blew me away—within minutes I knew exactly which dishes were underperforming and how to fix them.",
  },
  {
    name: "Amanda",
    role: "Operations Manager",
    avatar: "/lovable-uploads/social_proof2.png",
    quote: "An incredible tool we now use daily to keep our menu optimized and margins healthy.",
  },
  {
    name: "Robert",
    role: "Head Chef",
    avatar: "/lovable-uploads/social_proof3.png",
    quote:
      "The AI insights showed me profit opportunities I never would have spotted on my own—game changer."
  },
  {
    name: "Julie",
    role: "Restaurant Consultant",
    avatar: "/lovable-uploads/social_proof4.png",
    quote:
      "Every restaurant should have this in their toolkit. It’s simple, powerful, and ensures menus stay optimized every day."
  }
];

export default function RaveReviews() {
  return (
    <section className="w-full" style={{ backgroundColor: '#f5f9f7' }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-[420px,1fr] items-start gap-2 md:gap-4">
          {/* Left column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((id) => (
                  <img
                    key={id}
                    src={`/lovable-uploads/social_proof${id}.png`}
                    alt="user avatar"
                    className="h-10 w-10 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <span className="text-slate-600 text-sm">1M+ happy users</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Rave
              <br />
              reviews.
            </h2>

            <p className="mt-5 text-slate-600 text-lg max-w-sm">
              We're loved by thousands because we're simple.
            </p>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('upload-menu-section');
                if (element) {
                  const elementPosition = element.offsetTop;
                  const offsetPosition = elementPosition - 100; // Scroll 100px less to show the title

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
              className="inline-flex items-center gap-2 text-primary-foreground rounded-full px-6 py-3 md:px-8 md:py-4 text-lg font-semibold mt-8 shadow-lg bg-primary hover:bg-primary/90"
            >
              Try it yourself
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Right grid */}
          <div
            className="justify-center md:justify-end"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '12px',
              width: '100%'
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name + i}
                className="opacity-100 translate-y-0 transition-all duration-300"
                style={{
                  background: 'white',
                  borderRadius: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '10px',
                  // width: 'calc(33.333% - 8px)', // 3 cards per row with gap
                  minWidth: '280px',
                  maxWidth: '310px',
                  padding: '24px',
                  animationDelay: `${i * 50}ms`
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
