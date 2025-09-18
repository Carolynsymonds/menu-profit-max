import React from "react";

/**
 * AchievementsRow – compact style using external <use href="#svg-laurel-left"> sprite
 * The laurel symbol is injected once via <SpriteDefs/> using the exact paths you provided.
 * Each item layout: [laurel-left] [caption + value] [mirrored laurel-right]
 */
export default function AchievementsRow({ items = defaultItems }: { items?: AchievementItem[] }) {
  return (
    <section
      aria-label="Achievements and recognitions"
      className="relative w-full rounded-3xl px-6 py-10 md:px-10 md:py-12"
    >
      {/* Inject the laurel symbol once */}
      <SpriteDefs />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {items.map((it, idx) => (
          <article
            key={idx}
            className="mx-auto flex w-full max-w-md items-center justify-center text-center"
            aria-label={`${it.caption}: ${it.value}`}
          >
            {/* Left laurel via <use> */}
            <LaurelUse style={{ marginRight: 13.5 }} />

            {/* Text block */}
            <div>
              <h3
                style={{
                  margin: 0,
                  height: 14,
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "112.5%",
                  textAlign: "center",
                  color: "rgb(55, 67, 86)",
                  whiteSpace: "nowrap",
                }}
              >
                {it.caption}
              </h3>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: "28px",
                  textAlign: "center",
                  color: "rgb(7, 13, 27)",
                  whiteSpace: "nowrap",
                }}
              >
                {it.value}
              </div>
            </div>

            {/* Right laurel (mirrored) */}
            <LaurelUse mirror style={{ marginLeft: 13.5 }} />
          </article>
        ))}
      </div>
    </section>
  );
}

export type AchievementItem = {
  caption: string;
  value: string;
};

// Default content matching the screenshot
const defaultItems: AchievementItem[] = [
  { caption: "#1 Menu Profit Analyzer", value: "Original" },
  { caption: "Used by chefs and managers worldwide", value: "1,000,000+" },
  { caption: "Gen AI apps of 2024", value: "Top 50" },
];

/**
 * SVG sprite injected once per page. Contains the laurel symbol from the user.
 */
function SpriteDefs() {
  return (
    <svg aria-hidden width={0} height={0} style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <symbol id="svg-laurel-left" viewBox="0 0 28 53">
          <path fill="#60717A" d="M27 2q-1 3-7 4c0-2 3-6 7-4M17 8q2-2 2-8-3 2-2 8" />
          <path fill="#60717A" d="M16 9q2-3 8-1-2 3-8 1m-2 3q2-2 1-8-3 2-1 8m0 0 7-1q-3 4-7 1m-3 5q3-4-1-8-3 3 1 8" />
          <path fill="#60717A" d="M11 17q3 1 8-2-3-4-8 2" />
          <path fill="#60717A" d="M9 22q4 1 8-4-4-1-8 4" />
          <path fill="#60717A" d="M8 27q5 0 8-6-5 0-8 6" />
          <path fill="#60717A" d="M9 31c1 0 6-2 6-6q-4 1-6 6" />
          <path fill="#60717A" d="M10 35q3 0 6-6-4 0-6 6" />
          <path fill="#60717A" d="M12 38q3-1 4-6-4 0-4 6" />
          <path fill="#60717A" d="M14 41q2-1 3-6-3 0-3 6m3 4q3-1 2-7c-4 1-2 4-2 7" />
          <path fill="#60717A" d="M21 47q2-1 1-7-4 3-1 7" />
          <path fill="#60717A" d="M27 51v-1c-4-2-13-5-17-16-5-12 5-24 10-29-6 5-15 17-12 28 4 13 16 17 19 18" />
          <path fill="#60717A" d="M9 22q2-4-2-9-3 4 2 9m-1 4c1-1 0-6-4-7-1 1 1 7 4 7m0 5c0-1-2-7-6-6 0 1 3 6 6 6m1 3c-1-1-4-5-8-3q2 4 8 3" />
          <path fill="#60717A" d="M10 38c0-1-5-5-8-2q3 4 8 2m4 4c-1-1-5-4-8-1q3 4 8 1m3 3q-3-2-8 1 5 2 8-1m4 3q-3-2-8 2 5 2 8-2" />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Laurel that references the injected symbol via <use>.
 */
function LaurelUse({ mirror = false, style = {} as React.CSSProperties }: { mirror?: boolean; style?: React.CSSProperties }) {
  return (
    <svg
      width={28}
      height={53}
      aria-hidden
      style={{ ...(style || {}), transform: mirror ? "scaleX(-1)" : undefined }}
      viewBox="0 0 28 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href="#svg-laurel-left" />
    </svg>
  );
}
