"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Bubu30Logo from "./Bubu30Logo";
import type { Guest } from "@/lib/types";
import { EVENT_DETAILS } from "@/lib/types";
import { ACCENT } from "@/lib/theme";

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

      <main className="relative mx-auto w-full max-w-md px-5 py-10">
        {existing && (
          <p className="glass mb-6 rounded-lg px-4 py-3 text-center text-sm text-ink/70">
            You had already RSVP&apos;d. Here is your original ticket.
          </p>
        )}

        <div className="glass overflow-hidden rounded-2xl">
          <div className={`px-6 py-4 text-center ${a.ticketBand}`}>
            <p className="font-display text-2xl tracking-[0.2em]">
              {d.title.toUpperCase()}
            </p>
          </div>

          <div className="px-6 py-8 text-center">
            <Bubu30Logo size="sm" />

            {/* marginSize bakes the QR quiet zone into the canvas itself, so
                the downloaded PNG carries its own white margin. */}
            <div ref={qrWrapRef} className="mt-6 flex justify-center">
              <div className="overflow-hidden rounded-xl shadow-sm">
                <QRCodeCanvas
                  value={guest.ticket_hash}
                  size={240}
                  level="M"
                  marginSize={4}
                />
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-64 rounded-xl border border-dashed border-ink/25 bg-white/50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.35em] text-ink/50">
                Ticket code
              </p>
              <p className="mt-0.5 font-mono text-3xl font-bold tracking-[0.25em]">
                {guest.ticket_hash}
              </p>
              <p className="mt-1 text-[10px] text-ink/45">
                Backup: show this code at the door if the QR won&apos;t scan.
              </p>
            </div>

            <p className="mt-6 text-lg font-semibold">{guest.name}</p>
            <p className="text-sm text-ink/60">{guest.company}</p>

            <div className="mt-6 grid grid-cols-1 gap-1 border-t border-dashed border-ink/15 pt-6 text-sm text-ink/70">
              <p>{d.date}</p>
              <p>{d.time}</p>
              <p>{d.venue}</p>
            </div>
          </div>
        </div>

        <button
          onClick={download}
          className={`mt-6 w-full rounded-lg px-6 py-3.5 font-display text-2xl
                     tracking-widest transition ${a.button}`}
        >
          DOWNLOAD QR TICKET
        </button>

        <p className="mt-4 text-center text-xs text-ink/50">
          Save this QR code: it is your entry pass. We&apos;ll scan it at the door.
        </p>
      </main>
    </div>
  );
}
