import type { EventType } from "./types";

// Light theme for both events, different accent per event:
// media = vivid orange (poster banner), bubu30 = ink black (poster card).
// Tailwind needs literal class strings, so each variant is written out in full.
//
// Interaction classes name their exact properties. `transition: all` sweeps up
// layout properties the browser then has to re-measure every frame; naming
// color and border keeps the work on the compositor.
export const ACCENT: Record<
  EventType,
  {
    kicker: string;
    on: string; // tagline "ON" highlight
    button: string;
    buttonGhost: string; // secondary action in the same accent family
    input: string;
    link: string;
    ticketBand: string;
    glowA: string;
    glowB: string;
  }
> = {
  media: {
    kicker: "bg-brand text-ink",
    on: "text-brand-deep",
    button:
      "bg-brand text-ink transition-[filter,box-shadow] duration-200 ease-out " +
      "hover:brightness-105 hover:shadow-[0_6px_20px_rgba(255,89,0,0.28)] " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink",
    buttonGhost:
      "border border-brand/40 text-ink transition-[background-color,border-color] duration-200 ease-out " +
      "hover:border-brand hover:bg-brand/8 " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand",
    input:
      "transition-[border-color,box-shadow] duration-200 ease-out " +
      "focus:border-brand focus:ring-2 focus:ring-brand/25 hover:border-ink/25",
    link:
      "text-brand-deep underline decoration-brand-deep/40 underline-offset-2 " +
      "transition-[text-decoration-color] duration-200 ease-out hover:decoration-brand-deep",
    ticketBand: "bg-brand text-ink",
    glowA: "bg-brand/25",
    glowB: "bg-orange-200/50",
  },
  bubu30: {
    kicker: "bg-ink text-paper",
    on: "text-brand-deep",
    button:
      "bg-ink text-paper transition-[background-color,box-shadow] duration-200 ease-out " +
      "hover:bg-black hover:shadow-[0_6px_20px_rgba(17,17,17,0.24)] " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink",
    buttonGhost:
      "border border-ink/25 text-ink transition-[background-color,border-color] duration-200 ease-out " +
      "hover:border-ink hover:bg-ink/5 " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink",
    input:
      "transition-[border-color,box-shadow] duration-200 ease-out " +
      "focus:border-ink focus:ring-2 focus:ring-ink/20 hover:border-ink/25",
    link:
      "text-ink underline decoration-ink/30 underline-offset-2 " +
      "transition-[text-decoration-color] duration-200 ease-out hover:decoration-ink",
    ticketBand: "bg-ink text-paper",
    glowA: "bg-neutral-500/25",
    glowB: "bg-brand/15",
  },
};
