"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";
import type { Guest } from "@/lib/types";

type Result =
  | { kind: "checked_in"; guest: Guest }
  | { kind: "already_checked_in"; guest: Guest }
  | { kind: "not_found"; code: string }
  | { kind: "error"; message: string };

const EVENT_LABEL = { media: "Media Gathering", bubu30: "30th Anniversary" };

export default function Scanner() {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState(false);
  // Blocks the double-fire a QR scanner produces while the same code is in frame.
  const inFlight = useRef(false);

  async function checkIn(code: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.status === "checked_in") {
        setResult({ kind: "checked_in", guest: data.guest });
      } else if (data.status === "already_checked_in") {
        setResult({ kind: "already_checked_in", guest: data.guest });
      } else if (data.status === "not_found") {
        setResult({ kind: "not_found", code });
      } else {
        setResult({
          kind: "error",
          message: data.error ?? "Something went wrong.",
        });
      }
    } catch {
      setResult({ kind: "error", message: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setManualCode("");
    inFlight.current = false;
  }

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) checkIn(code);
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wider">SCAN TICKET</h1>
        <Link
          href="/admin"
          className="rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm
                     font-medium transition hover:bg-ink/5"
        >
          Guest list
        </Link>
      </div>

      {/* Result banner replaces the scanner until "scan next" */}
      {result ? (
        <div className="mt-6">
          {result.kind === "checked_in" && (
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-6 text-center">
              <p className="text-5xl">✓</p>
              <p className="mt-2 font-display text-3xl tracking-wider text-green-700">
                CHECKED IN
              </p>
              <p className="mt-3 text-xl font-semibold">{result.guest.name}</p>
              <p className="text-sm text-ink/60">
                {result.guest.company} · {EVENT_LABEL[result.guest.event_type]}
              </p>
              <p className="mt-1 font-mono text-sm text-ink/50">
                {result.guest.ticket_hash}
              </p>
            </div>
          )}
          {result.kind === "already_checked_in" && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-center">
              <p className="text-5xl">⚠</p>
              <p className="mt-2 font-display text-3xl tracking-wider text-red-600">
                ALREADY CHECKED IN
              </p>
              <p className="mt-3 text-xl font-semibold">{result.guest.name}</p>
              <p className="text-sm text-ink/60">
                {result.guest.company} · {EVENT_LABEL[result.guest.event_type]}
              </p>
              <p className="mt-2 text-sm font-medium text-red-600">
                First scan:{" "}
                {result.guest.checked_in_at
                  ? new Date(result.guest.checked_in_at).toLocaleTimeString()
                  : "unknown"}
              </p>
            </div>
          )}
          {result.kind === "not_found" && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-center">
              <p className="text-5xl">✕</p>
              <p className="mt-2 font-display text-3xl tracking-wider text-red-600">
                TICKET NOT FOUND
              </p>
              <p className="mt-3 font-mono text-lg">{result.code}</p>
              <p className="mt-1 text-sm text-ink/60">
                Check the code or ask the guest for their confirmation email.
              </p>
            </div>
          )}
          {result.kind === "error" && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-center">
              <p className="font-display text-2xl tracking-wider text-red-600">
                ERROR
              </p>
              <p className="mt-2 text-sm">{result.message}</p>
            </div>
          )}
          <button
            onClick={reset}
            className="mt-5 w-full rounded-lg bg-ink px-6 py-3.5 font-display
                       text-2xl tracking-widest text-paper transition hover:bg-black"
          >
            SCAN NEXT
          </button>
        </div>
      ) : (
        <>
          <div className="glass mt-6 overflow-hidden rounded-2xl">
            {cameraError ? (
              <div className="px-6 py-10 text-center text-sm text-ink/60">
                Camera unavailable. Check permissions, or type the ticket code
                below instead.
              </div>
            ) : (
              <QrScanner
                onScan={(codes) => {
                  const value = codes[0]?.rawValue;
                  if (value && !busy) checkIn(value);
                }}
                onError={() => setCameraError(true)}
                constraints={{ facingMode: "environment" }}
                styles={{ container: { width: "100%" } }}
              />
            )}
          </div>

          <form onSubmit={onManualSubmit} className="glass mt-5 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-ink/50">
              Or enter ticket code
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="e.g. BJW6Y"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={24}
                className="w-full rounded-lg border border-ink/15 bg-white px-4
                           py-3 font-mono text-lg tracking-[0.2em] outline-none
                           transition focus:border-ink focus:ring-2 focus:ring-ink/20"
              />
              <button
                type="submit"
                disabled={busy || !manualCode.trim()}
                className="rounded-lg bg-ink px-5 font-display text-xl
                           tracking-widest text-paper transition hover:bg-black
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "…" : "GO"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
