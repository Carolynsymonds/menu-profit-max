import React from "react";
import { Button } from "@/components/ui/button";

// Accent color per your brand
const ACCENT = "#FE714D";

export default function HowItWorksSection() {
    const steps = [
        {
            n: 1,
            title: "Upload Menu",
            text: "Drag & drop your menu (PDF, image, or POS export).",
        },
        {
            n: 2,
            title: "Analyze",
            text: "AI scans dishes, costs & prices to spot hidden profit opportunities.",
        },
        {
            n: 3,
            title: "Optimize",
            text: "Get easy changes to increase profit—without raising prices.",
        },
    ];

    return (
        <section className="w-full bg-white">
            {/* Hero Header */}
            <div className="mx-auto max-w-5xl px-6 md:px-8 pt-16 text-center">
                {/* Subheading */}
                <p className="text-base md:text-lg text-slate-500 font-medium mb-4">
                    It's really simple...
                </p>
                {/* Heading */}
                <h1 className="text-[3rem] leading-[1.05] font-bold tracking-tight text-foreground mb-8">
                    How it works
                </h1>

                 {/* CTA */}
                 <Button
                     onClick={() => {
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
                     className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                 >
                     Try it out free
                 </Button>
            </div>
            {/* gentle bottom fade like screenshot */}
            <div className="h-5" />

            <div className="mx-auto max-w-6xl px-6 md:px-10 py-14 md:py-20">

                {/* Content */}
                <div className="HowItWorks_contentContainer__2NpIi grid md:grid-cols-2 gap-10 md:gap-14 items-start">
                    {/* Steps */}
                    <div className="HowItWorks_stepsContainer__MWVvt">
                        <div className="relative">
                            <div className="HowItWorks_line__tS99- hidden md:block absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
                            <div className="space-y-7">
                                {steps.map((s, i) => (
                                    <div
                                        key={s.n}
                                        className="HowItWorks_box__SAWTv relative flex gap-4 opacity-100 translate-y-0 transition-all duration-300"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        <div
                                            className="HowItWorks_ellipse__7lJSn shrink-0 grid place-items-center rounded-full h-10 w-10 text-white font-semibold shadow"
                                            style={{ background: ACCENT }}
                                        >
                                            {s.n}
                                        </div>
                                        <div className="HowItWorks_step__b7K7z bg-slate-50/80 border border-slate-200 rounded-2xl p-4 md:p-5">
                                            <div className="HowItWorks_stepTitle__dpKWj text-slate-900 font-semibold text-lg">{s.title}</div>
                                            <p className="HowItWorks_stepText__RW7Vu text-slate-600 mt-1 leading-relaxed">{s.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Demo / Video placeholder */}
                    <div
                        className="HowItWorks_stepVideo__LLx0y relative opacity-100 scale-100 transition-all duration-400"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                            <div className="aspect-video bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="mx-auto mb-4 h-14 w-14 rounded-full grid place-items-center" style={{ background: ACCENT }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                    </div>
                                    <div className="text-slate-900 font-semibold text-lg">Menu Optimizer Demo</div>
                                    <p className="text-slate-600 mt-1">Upload → Analyze → Optimize (preview)</p>
                                </div>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
                                <div className="text-sm text-slate-600">Drop in <code className="bg-slate-100 px-1.5 py-0.5 rounded">/assets/img/demo.gif</code> to replace.</div>
                                <a href="#" className="text-sm font-medium" style={{ color: ACCENT }}>Watch full demo →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
