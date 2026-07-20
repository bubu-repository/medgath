import type { EventType } from "./types";

// Light theme for both events, different accent per event:
// media = vivid orange (poster banner), bubu30 = ink black (poster card).
// Tailwind needs literal class strings, so each variant is written out in full.
export const ACCENT: Record<
  EventType,
  {
    kicker: string;
    on: string; // tagline "ON" highlight
    button: string;
    input: string;
    link: string;
    ticketBand: string;
    glowA: string;
    glowB: string;
  }
> = {
  media: {
    kicker: "bg-brand text-ink",
    on: "text-brand",
    button:
      "bg-brand text-ink hover:brightness-110 focus-visible:outline-brand",
    input:
      "focus:border-brand focus:ring-2 focus:ring-brand/30",
    link: "text-brand",
    ticketBand: "bg-brand text-ink",
    glowA: "bg-brand/25",
    glowB: "bg-orange-200/50",
  },
  bubu30: {
    kicker: "bg-ink text-paper",
    on: "text-brand",
    button:
      "bg-ink text-paper hover:bg-black focus-visible:outline-ink",
    input:
      "focus:border-ink focus:ring-2 focus:ring-ink/20",
    link: "text-ink underline",
    ticketBand: "bg-ink text-paper",
    glowA: "bg-neutral-500/25",
    glowB: "bg-brand/15",
  },
};
