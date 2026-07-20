"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EventType, Guest } from "@/lib/types";

type Filter = "all" | EventType;

const EVENT_LABEL: Record<EventType, string> = {
  media: "Media",
  bubu30: "BUBU 30",
};

function Badge({ event }: { event: EventType }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        event === "media" ? "bg-brand/15 text-brand" : "bg-ink/10 text-ink"
      }`}
    >
      {EVENT_LABEL[event]}
    </span>
  );
}

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/guests");
      const data = await res.json();
      if (res.ok) setGuests(data.guests);
      else setError(data.error ?? "Could not load guests.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter !== "all" && g.event_type !== filter) return false;
      if (!q) return true;
      return [g.name, g.email, g.phone, g.company, g.ticket_hash]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [guests, filter, query]);

  const stats = useMemo(() => {
    const by = (t: Filter) =>
      guests.filter((g) => t === "all" || g.event_type === t);
    const scope = by(filter);
    return {
      total: scope.length,
      checkedIn: scope.filter((g) => g.check_in_status).length,
    };
  }, [guests, filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "media", label: "Media Gathering" },
    { key: "bubu30", label: "30th Anniversary" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg tracking-[0.35em] text-brand">
            BUBU.COM
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-wider">GUEST LIST</h1>
        </div>
        <Link
          href="/admin/scan"
          className="rounded-lg bg-brand px-6 py-3 font-display text-xl
                     tracking-widest text-ink transition hover:brightness-110"
        >
          SCAN TICKET
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
            RSVPs
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
            Checked in
          </p>
          <p className="text-2xl font-bold">
            {stats.checkedIn}
            <span className="text-sm font-normal text-ink/50">
              {" "}
              / {stats.total}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="glass flex rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? "bg-ink text-paper"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, code…"
          className="w-full max-w-xs rounded-lg border border-ink/15 bg-white
                     px-4 py-2 text-sm outline-none transition
                     focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
        <button
          onClick={load}
          className="rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm
                     font-medium transition hover:bg-ink/5"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="glass mt-4 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-175 text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink/50">
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Loading…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  No guests match.
                </td>
              </tr>
            ) : (
              visible.map((g) => (
                <tr key={g.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-ink/50">
                      {g.email} · {g.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge event={g.event_type} />
                  </td>
                  <td className="px-4 py-3">
                    <p>{g.company}</p>
                    {g.bubu_period && (
                      <p className="text-xs text-ink/50">
                        Era: {g.bubu_period}
                        {g.contribution ? ` · Brings: ${g.contribution}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">
                    {g.ticket_hash}
                  </td>
                  <td className="px-4 py-3">
                    {g.check_in_status ? (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        In · {fmtTime(g.checked_in_at)}
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink/50">
                        Not yet
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
