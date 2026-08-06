import Link from "next/link";
import Bubu30Logo from "./Bubu30Logo";
import type { EventType } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/types";
import { ACCENT } from "@/lib/theme";

// Poster-style geometric markers: orange square / circle / triangle,
// same bullets the invitation posters use for date, time, and venue.
function Marker({ shape }: { shape: "square" | "circle" | "triangle" }) {
  if (shape === "triangle") {
    return (
      <span
        aria-hidden
        className="h-0 w-0 shrink-0 border-x-[6px] border-t-[9px] border-x-transparent border-t-brand"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`h-2.5 w-2.5 shrink-0 bg-brand ${shape === "circle" ? "rounded-full" : ""}`}
    />
  );
}

function Detail({
  shape,
  label,
  value,
}: {
  shape: "square" | "circle" | "triangle";
  label: string;
  value: string;
}) {
  return (
    // Markers align to the label line, not to the block's center, so all three
    // sit on one horizontal line even when a value wraps to two.
    <div className="flex items-start gap-3.5 px-5 py-4">
      <span className="mt-1 flex">
        <Marker shape={shape} />
      </span>
      <div className="text-left">
        <p className="text-[9px] uppercase tracking-[0.35em] text-ink/60">
          {label}
        </p>
        <p className="text-sm font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}

// Shared landing-page layout: light glassmorphism over soft chrome/orange
// glows; accent color and sub-tagline switch per event. Content settles in
// one staggered rise on mount, then the page holds still.
export default function EventShell({
  eventType,
  kicker,
  subline,
  blurb,
  children,
}: {
  eventType: EventType;
  kicker: string;
  subline: string;
  blurb: string;
  children: React.ReactNode;
}) {
  const d = EVENT_DETAILS[eventType];
  const a = ACCENT[eventType];
  return (
    <div className="relative flex-1 overflow-x-clip">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 right-[-12%] h-96 w-96 rounded-full blur-3xl ${a.glowA}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute top-[36%] left-[-16%] h-80 w-80 rounded-full blur-3xl ${a.glowB}`}
      />

      <main className="relative mx-auto w-full max-w-xl px-4 py-8 sm:px-5 sm:py-14">
        <header className="text-center">
          <div className="rise">
            <p className="font-display text-lg tracking-[0.35em] text-brand-deep">
              BUBU.COM
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/60">
              The Cultural Intelligence Agency
            </p>
          </div>

          <div
            className={`rise mt-8 inline-block px-5 py-1.5 ${a.kicker}`}
            style={{ "--rise-delay": "70ms" } as React.CSSProperties}
          >
            <span className="font-display text-2xl tracking-[0.2em]">
              {kicker}
            </span>
          </div>

          <div
            className="rise mt-8"
            style={{ "--rise-delay": "130ms" } as React.CSSProperties}
          >
            <Bubu30Logo />
          </div>

          <div
            className="rise mt-6"
            style={{ "--rise-delay": "190ms" } as React.CSSProperties}
          >
            <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
              AHEAD. <span className={a.on}>ON</span> REPEAT.
            </h1>
            <p className="text-xs uppercase tracking-[0.4em] text-ink/60">
              {subline}
            </p>
          </div>

          <p
            className="rise mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/70"
            style={{ "--rise-delay": "240ms" } as React.CSSProperties}
          >
            {blurb}
          </p>
        </header>

        <div
          className="glass rise mt-8 grid grid-cols-1 divide-y divide-ink/10 rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          style={{ "--rise-delay": "300ms" } as React.CSSProperties}
        >
          <Detail shape="square" label="Date" value={d.date} />
          <Detail shape="circle" label="Time" value={d.time} />
          <Detail shape="triangle" label="Venue" value={d.venue} />
        </div>

        <section
          className="glass rise mt-8 rounded-2xl p-6 sm:p-8"
          style={{ "--rise-delay": "360ms" } as React.CSSProperties}
        >
          <h2 className="mb-6 font-display text-3xl tracking-wider">
            RESERVE YOUR SEAT
          </h2>
          {children}
        </section>

        <footer
          className="rise mt-10 flex flex-col items-center gap-3 text-xs text-ink/60"
          style={{ "--rise-delay": "420ms" } as React.CSSProperties}
        >
          <Link
            href="/"
            className="ring-focus rounded transition-[color] duration-200 ease-out hover:text-ink"
          >
            ← Both events
          </Link>
          <p>
            visit{" "}
            <a href="https://bubu.com" className={a.link}>
              bubu.com
            </a>{" "}
            for more
          </p>
        </footer>
      </main>
    </div>
  );
}
