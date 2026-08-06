import Link from "next/link";
import Bubu30Logo from "@/components/Bubu30Logo";
import { EVENT_DETAILS } from "@/lib/types";

// Two doors, one poster. Each destination names its audience so a visitor
// lands on the right form instead of guessing between two events on the
// same night at the same venue.
const DOORS = [
  {
    href: "/media",
    label: "For press & media",
    title: "MEDIA GATHERING",
    time: EVENT_DETAILS.media.time,
    className:
      "bg-brand text-ink transition-[filter,box-shadow] duration-200 ease-out " +
      "hover:brightness-105 hover:shadow-[0_10px_30px_rgba(255,89,0,0.3)] " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink",
    // Full ink, not a tint: dropping black to 65% over the orange fill lands
    // at 1.8:1. Hierarchy here comes from size and tracking instead.
    labelClass: "text-ink",
  },
  {
    href: "/rsvp",
    label: "For the Bubu family",
    title: "30TH ANNIVERSARY",
    time: EVENT_DETAILS.bubu30.time,
    className:
      "bg-ink text-paper transition-[background-color,box-shadow] duration-200 ease-out " +
      "hover:bg-black hover:shadow-[0_10px_30px_rgba(17,17,17,0.26)] " +
      "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink",
    labelClass: "text-paper/80",
  },
];

export default function Home() {
  return (
    // The glows hang outside the viewport on purpose, so the clip belongs on
    // a full-width wrapper. Clipping the centered column instead would cut
    // them at the column edge and leave two visible vertical seams.
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[-12%] h-72 w-72 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[-14%] h-64 w-64 rounded-full bg-neutral-500/20 blur-3xl"
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <div className="rise">
          <p className="font-display text-lg tracking-[0.35em] text-brand-deep">
            BUBU.COM
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/60">
            The Cultural Intelligence Agency
          </p>
        </div>

        <div
          className="rise mt-10"
          style={{ "--rise-delay": "70ms" } as React.CSSProperties}
        >
          <Bubu30Logo />
        </div>

        <div
          className="rise mt-8"
          style={{ "--rise-delay": "140ms" } as React.CSSProperties}
        >
          <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
            AHEAD. <span className="text-brand-deep">ON</span> REPEAT.
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.4em] text-ink/60">
            30th Anniversary
          </p>
        </div>

        <p
          className="rise mt-8 text-sm leading-relaxed text-ink/70"
          style={{ "--rise-delay": "200ms" } as React.CSSProperties}
        >
          Two gatherings, one night. {EVENT_DETAILS.media.date} at{" "}
          {EVENT_DETAILS.media.venue}. Pick the room you belong in.
        </p>

        <nav
          className="rise mt-8 grid w-full gap-3 sm:grid-cols-2"
          style={{ "--rise-delay": "260ms" } as React.CSSProperties}
        >
          {DOORS.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className={`press ring-focus block rounded-xl px-5 py-5 text-left ${door.className}`}
            >
              <span
                className={`block text-[10px] uppercase tracking-[0.28em] ${door.labelClass}`}
              >
                {door.label}
              </span>
              <span className="mt-1.5 block font-display text-xl tracking-[0.09em] sm:text-2xl sm:tracking-[0.06em]">
                {door.title}
              </span>
              <span className={`mt-0.5 block text-xs ${door.labelClass}`}>
                {door.time}
              </span>
            </Link>
          ))}
        </nav>

        <p
          className="rise mt-10 text-xs text-ink/60"
          style={{ "--rise-delay": "320ms" } as React.CSSProperties}
        >
          visit{" "}
          <a
            href="https://bubu.com"
            className="text-brand-deep underline decoration-brand-deep/40 underline-offset-2 transition-[text-decoration-color] duration-200 ease-out hover:decoration-brand-deep"
          >
            bubu.com
          </a>{" "}
          for more
        </p>
      </main>
    </div>
  );
}
