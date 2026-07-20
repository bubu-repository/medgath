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

      <main className="relative mx-auto w-full max-w-md px-4 py-4 sm:px-5 sm:py-8">
        <div className="glass overflow-hidden rounded-2xl">
          {/* Header */}
          <div className={`px-5 py-3 text-center ${a.ticketBand}`}>
            <p className="font-display text-xl tracking-[0.2em]">
              {d.title.toUpperCase()}
            </p>
          </div>

          {/* Content - compact */}
          <div className="px-5 py-4 text-center space-y-3">
            <Bubu30Logo size="sm" />

            {/* QR Code */}
            <div ref={qrWrapRef} className="flex justify-center">
              <div className="overflow-hidden rounded-lg shadow-sm">
                <QRCodeCanvas
                  value={guest.ticket_hash}
                  size={180}
                  level="M"
                  marginSize={3}
                />
              </div>
            </div>

            {/* Ticket Code */}
            <div className="mx-auto rounded-lg border border-dashed border-ink/20 bg-white/40 px-3 py-2">
              <p className="text-[8px] uppercase tracking-[0.3em] text-ink/50">
                Code
              </p>
              <p className="font-mono text-2xl font-bold tracking-[0.2em]">
                {guest.ticket_hash}
              </p>
            </div>

            {/* Guest Info */}
            <div>
              <p className="text-base font-semibold">{guest.name}</p>
              <p className="text-xs text-ink/60">{guest.company}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-3 gap-2 border-t border-dashed border-ink/15 pt-3 text-[10px] text-ink/65">
              <div>
                <p className="font-medium">{d.date}</p>
              </div>
              <div>
                <p className="font-medium">{d.time}</p>
              </div>
              <div>
                <p className="font-medium">{d.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Instructions */}
        <div className="glass mt-3 rounded-lg border border-blue-200/50 bg-blue-50/40 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-ink/80">
            📸 SAVE THIS TICKET
          </p>
          <p className="mt-1.5 text-xs text-ink/65 leading-relaxed">
            Screenshot or download. You need this QR code to enter.
          </p>
        </div>

        {/* Download Button */}
        <button
          onClick={download}
          className={`mt-3 w-full rounded-lg px-4 py-2.5 font-display text-lg
                     tracking-widest transition ${a.button}`}
        >
          DOWNLOAD
        </button>

        {/* Recovery Info */}
        <p className="mt-3 rounded-lg bg-ink/5 px-4 py-3 text-center text-xs text-ink/55 leading-relaxed">
          Lost your ticket? Fill the form again with the same email and phone to retrieve it.
        </p>

        {existing && (
          <p className="mt-3 rounded-lg border border-amber-200/50 bg-amber-50/40 px-4 py-2.5 text-center text-xs text-amber-700">
            This is your original ticket from a previous RSVP.
          </p>
        )}
      </main>
    </div>
  );
}
