"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Bubu30Logo from "./Bubu30Logo";
import type { Guest } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/types";
import { ACCENT } from "@/lib/theme";

// Drawn, not borrowed: one stroke weight, one join, matches the poster's
// geometric markers rather than an emoji standing in for an icon.
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M10 2.5v9.5M6.5 8.75 10 12.25l3.5-3.5M3 13v3.5h14V13" />
    </svg>
  );
}

export default function TicketCard({
  guest,
  existing,
}: {
  guest: Guest;
  existing: boolean;
}) {
  const qrWrapRef = useRef<HTMLDivElement>(null);
  const d = EVENT_DETAILS[guest.event_type];
  const a = ACCENT[guest.event_type];

  function download() {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `bubu30-ticket-${guest.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="relative flex-1 overflow-x-clip">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-20 right-[-14%] h-80 w-80 rounded-full blur-3xl ${a.glowA}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute top-[42%] left-[-18%] h-72 w-72 rounded-full blur-3xl ${a.glowB}`}
      />

      <main className="relative mx-auto w-full max-w-md px-4 py-4 sm:px-5 sm:py-8">
        <div className="glass rise overflow-hidden rounded-2xl">
          <div className={`px-5 py-3 text-center ${a.ticketBand}`}>
            <p className="font-display text-xl tracking-[0.2em]">
              {d.title.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 px-5 py-4 text-center">
            <Bubu30Logo size="sm" />

            {/* marginSize bakes the QR quiet zone into the canvas itself, so
                the downloaded PNG carries its own white margin. */}
            <div ref={qrWrapRef} className="flex justify-center">
              <div className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(17,17,17,0.1)]">
                <QRCodeCanvas
                  value={guest.ticket_hash}
                  size={180}
                  level="M"
                  marginSize={3}
                />
              </div>
            </div>

            <div className="mx-auto rounded-lg border border-dashed border-ink/25 bg-white/50 px-3 py-2">
              <p className="text-[8px] uppercase tracking-[0.3em] text-ink/60">
                Code
              </p>
              <p className="font-mono text-2xl font-bold tracking-[0.2em]">
                {guest.ticket_hash}
              </p>
            </div>

            <div>
              <p className="text-base font-semibold">{guest.name}</p>
              <p className="text-xs text-ink/65">{guest.company}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-dashed border-ink/15 pt-3 text-[10px] font-medium text-ink/70">
              <p>{d.date}</p>
              <p>{d.time}</p>
              <p>{d.venue}</p>
            </div>
          </div>
        </div>

        {existing && (
          <p
            className="rise mt-3 rounded-lg border border-amber-300/60 bg-amber-50/60 px-4 py-2.5 text-center text-xs text-amber-800"
            style={{ "--rise-delay": "60ms" } as React.CSSProperties}
          >
            This is your original ticket from a previous RSVP.
          </p>
        )}

        <div
          className="glass rise mt-3 rounded-lg px-4 py-3 text-center"
          style={{ "--rise-delay": "80ms" } as React.CSSProperties}
        >
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink">
            <SaveIcon className="h-3.5 w-3.5" />
            SAVE THIS TICKET
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
            Screenshot or download. You need this QR code to enter.
          </p>
        </div>

        <button
          onClick={download}
          className={`press rise mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5
                     font-display text-lg tracking-widest ${a.button}`}
          style={{ "--rise-delay": "140ms" } as React.CSSProperties}
        >
          <SaveIcon className="h-4 w-4" />
          DOWNLOAD
        </button>

        <p
          className="rise mt-3 rounded-lg bg-ink/5 px-4 py-3 text-center text-xs leading-relaxed text-ink/65"
          style={{ "--rise-delay": "200ms" } as React.CSSProperties}
        >
          Lost your ticket? Fill the form again with the same email and phone to
          retrieve it.
        </p>
      </main>
    </div>
  );
}
