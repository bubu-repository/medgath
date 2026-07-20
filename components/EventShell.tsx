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
        className="h-0 w-0 border-x-[6px] border-t-[9px] border-x-transparent border-t-brand"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`h-2.5 w-2.5 bg-brand ${shape === "circle" ? "rounded-full" : ""}`}
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
    <div className="flex items-center gap-3.5 px-5 py-4">
      <Marker shape={shape} />
      <div className="text-left">
        <p className="text-[9px] uppercase tracking-[0.35em] text-ink/45">
          {label}
        </p>
        <p className="text-sm font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}

// Shared landing-page layout: light glassmorphism over soft chrome/orange
// glows; accent color and sub-tagline switch per event.
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

      <main className="relative mx-auto w-full max-w-xl px-5 py-10 sm:py-14">
        <header className="text-center">
          <p className="font-display text-lg tracking-[0.35em] text-brand">
            BUBU.COM
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
            The Cultural Intelligence Agency
          </p>

          <div className={`mt-8 inline-block px-5 py-1.5 ${a.kicker}`}>
            <span className="font-display text-2xl tracking-[0.2em]">
              {kicker}
            </span>
          </div>

          <div className="mt-8">
            <Bubu30Logo />
          </div>

          <h1 className="mt-6 font-display text-4xl tracking-wide sm:text-5xl">
            AHEAD. <span className={a.on}>ON</span> REPEAT.
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-ink/55">
            {subline}
          </p>

          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/70">
            {blurb}
          </p>
        </header>

        <div className="glass mt-8 grid grid-cols-1 divide-y divide-ink/10 rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Detail shape="square" label="Date" value={d.date} />
          <Detail shape="circle" label="Time" value={d.time} />
          <Detail shape="triangle" label="Venue" value={d.venue} />
        </div>

        <section className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <h2 className="mb-6 font-display text-3xl tracking-wider">
            RESERVE YOUR SEAT
          </h2>
          {children}
        </section>

        <footer className="mt-10 text-center text-xs text-ink/45">
          check out{" "}
          <a href="https://bubu.com" className={a.link}>
            bubu.com
          </a>{" "}
          for more info
        </footer>
      </main>
    </div>
  );
}
