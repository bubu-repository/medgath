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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-16">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <p className="font-display text-lg tracking-[0.35em] text-brand">
          BUBU.COM
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-wider">
          ORGANIZER ACCESS
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            autoFocus
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3
                       text-ink placeholder:text-ink/35 outline-none transition
                       focus:border-ink focus:ring-2 focus:ring-ink/20"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
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
