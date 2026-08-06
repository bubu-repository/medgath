"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      setError("Wrong passcode.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-5 py-16">
      <div className="glass rounded-2xl p-6 sm:p-8 w-full">
        <p className="font-display text-lg tracking-[0.35em] text-brand">
          BUBU.COM
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-wider">
          ORGANIZER ACCESS
        </h1>
        <p className="mt-2 text-xs text-ink/50">Enter passcode to access the guest list and check-in scanner.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              autoFocus
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3
                         text-ink placeholder:text-ink/35 outline-none transition
                         focus:border-ink focus:ring-2 focus:ring-ink/20"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !passcode}
            className="w-full rounded-lg bg-ink px-6 py-3 font-display text-2xl
                       tracking-widest text-paper transition hover:bg-black
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "CHECKING…" : "ENTER"}
          </button>
        </form>
      </div>
    </main>
  );
}
