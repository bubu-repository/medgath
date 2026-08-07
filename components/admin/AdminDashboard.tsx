"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EventType, Guest } from "@/lib/types";
import { EVENT_LIMITS } from "@/lib/types";

type Filter = "all" | EventType;

const EVENT_LABEL: Record<EventType, string> = {
  media: "Media",
  bubu30: "BUBU 30",
};

function Badge({ event }: { event: EventType }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        event === "media" ? "bg-brand/20 text-ink" : "bg-ink/10 text-ink"
      }`}
    >
      {EVENT_LABEL[event]}
    </span>
  );
}

function StatusPill({ guest }: { guest: Guest }) {
  if (!guest.check_in_status) {
    return (
      <span className="inline-block whitespace-nowrap rounded-full border border-ink/15 px-2.5 py-0.5 text-xs font-semibold text-ink/60">
        Not yet
      </span>
    );
  }
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
      In · {fmtTime(guest.checked_in_at)}
    </span>
  );
}

// The code is what the door team reads off a phone and matches by eye, so it
// gets monospace, real tracking, and its own column rather than a footnote.
function Code({ value }: { value: string }) {
  return (
    <span className="font-mono text-base font-bold tracking-[0.12em] whitespace-nowrap">
      {value}
    </span>
  );
}

// Time only. Everyone checks in on the one event day, so the date is noise
// on a screen the door team scans at speed.
function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Registrations arrive over weeks, so this one does need the date. Day and
// month lead; the time sits under it as the same-day tiebreaker.
function RegisteredAt({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-ink/40">—</span>;
  const d = new Date(iso);
  return (
    <span className="block whitespace-nowrap">
      <span className="block font-medium">
        {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </span>
      <span className="block text-xs text-ink/60">
        {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </span>
  );
}

// Guests skip optional fields by typing "-" or ".", which would otherwise
// render as "Era: -" noise in every row. Only show what carries information.
function meaningful(value: string | null): string | null {
  const v = value?.trim();
  return v && /[a-z0-9]/i.test(v) ? v : null;
}

// Company for media, LinkedIn for bubu30, plus whatever extra that event asked
// for. Kept in one cell so the column reads as "everything else about them".
function Details({ guest }: { guest: Guest }) {
  const company = meaningful(guest.company);
  const era = meaningful(guest.bubu_period);
  const brings = meaningful(guest.contribution);
  return (
    <div className="space-y-0.5">
      <p className="break-words">
        {company ?? <span className="text-ink/40">—</span>}
      </p>
      {era && <p className="text-xs break-words text-ink/60">Era: {era}</p>}
      {brings && (
        <p className="text-xs break-words text-ink/60">Brings: {brings}</p>
      )}
    </div>
  );
}

// A picker gives "2026-08-07"; the export needs the absolute instant that
// local day starts. Building the Date from parts (not Date.parse) keeps it in
// the organiser's own zone, where a bare "2026-08-07" would be read as UTC.
function localDayStart(day: string): string | null {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

// End of the picked day, exclusive: midnight at the start of the next day.
function localDayEnd(day: string): string | null {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d + 1, 0, 0, 0, 0).toISOString();
}

// Local YYYY-MM-DD for a timestamp, for seeding the pickers from real data.
function localDay(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

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

  // Seed the range to span every registration, so the default export is
  // "everyone" and narrowing it is the deliberate act.
  useEffect(() => {
    if (!guests.length || from || to) return;
    const days = guests.map((g) => localDay(g.created_at)).sort();
    setFrom(days[0]);
    setTo(days[days.length - 1]);
  }, [guests, from, to]);

  // What the export will actually contain, computed from the same rules the
  // server applies, so the count on the button is not a guess.
  const exportable = useMemo(() => {
    const start = from ? localDayStart(from) : null;
    const end = to ? localDayEnd(to) : null;
    return guests.filter((g) => {
      if (filter !== "all" && g.event_type !== filter) return false;
      if (start && g.created_at < start) return false;
      if (end && g.created_at >= end) return false;
      return true;
    });
  }, [guests, filter, from, to]);

  const rangeInvalid = Boolean(from && to && from > to);

  async function runExport() {
    if (rangeInvalid) return;
    setExporting(true);
    setExportError("");
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("event", filter);
      const start = from ? localDayStart(from) : null;
      const end = to ? localDayEnd(to) : null;
      if (start) params.set("from", start);
      if (end) params.set("to", end);
      params.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone);

      const res = await fetch(`/api/admin/export?${params}`);
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setExportError(msg?.error ?? "Export failed. Please try again.");
        return;
      }
      const blob = await res.blob();
      const name =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+?)"/)?.[1] ?? "bubu30-guestlist.xlsx";
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      setExportError("Network error. Please try again.");
    } finally {
      setExporting(false);
    }
  }

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
    const scope = guests.filter(
      (g) => filter === "all" || g.event_type === filter
    );
    const heads = scope.reduce((sum, g) => sum + (g.guest_count || 1), 0);
    // The two caps count different things: media limits COMPANIES (one per
    // RSVP), bubu30 limits PEOPLE. Show each against the unit it actually
    // caps, and show no cap on "All", where the two cannot be summed.
    const capped =
      filter === "all"
        ? null
        : filter === "media"
          ? { used: scope.length, cap: EVENT_LIMITS.media, unit: "companies" }
          : { used: heads, cap: EVENT_LIMITS.bubu30, unit: "people" };
    return {
      rsvps: scope.length,
      checkedIn: scope.filter((g) => g.check_in_status).length,
      heads,
      capped,
    };
  }, [guests, filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "media", label: "Media Gathering" },
    { key: "bubu30", label: "30th Anniversary" },
  ];

  const isEmpty = !loading && visible.length === 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg tracking-[0.35em] text-brand">
            BUBU.COM
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-wider">
            GUEST LIST
          </h1>
        </div>
        <Link
          href="/admin/scan"
          className="press ring-focus rounded-lg bg-brand px-6 py-3 font-display text-xl
                     tracking-widest text-ink transition-[filter] duration-200 ease-out
                     hover:brightness-105"
        >
          SCAN TICKET
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/60">
            RSVPs
          </p>
          <p className="text-2xl font-bold">{stats.rsvps}</p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/60">
            {stats.capped ? "Capacity" : "Guests"}
          </p>
          <p className="text-2xl font-bold">
            {stats.capped ? stats.capped.used : stats.heads}
            {stats.capped && (
              <span className="text-sm font-normal text-ink/60">
                {" "}
                / {stats.capped.cap}
              </span>
            )}
          </p>
          <p className="text-[10px] text-ink/60">
            {stats.capped
              ? `${stats.capped.unit} · ${stats.heads} total pax`
              : "total pax"}
          </p>
        </div>
        <div className="glass col-span-2 rounded-xl px-4 py-3 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink/60">
            Checked in
          </p>
          <p className="text-2xl font-bold">
            {stats.checkedIn}
            <span className="text-sm font-normal text-ink/60">
              {" "}
              / {stats.rsvps}
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
              className={`press ring-focus rounded-md px-3 py-1.5 text-sm font-medium
                          whitespace-nowrap transition-[background-color,color] duration-200 ease-out
                          sm:px-4 ${
                            filter === t.key
                              ? "bg-ink text-paper"
                              : "text-ink/70 hover:text-ink"
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
          aria-label="Search guests"
          className="w-full max-w-xs rounded-lg border border-ink/15 bg-white px-4 py-2
                     text-sm outline-none placeholder:text-ink/60
                     transition-[border-color,box-shadow] duration-200 ease-out
                     focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
        <button
          onClick={load}
          className="press ring-focus rounded-lg border border-ink/15 bg-white px-4 py-2
                     text-sm font-medium transition-[background-color] duration-200 ease-out
                     hover:bg-ink/5"
        >
          Refresh
        </button>
      </div>

      {/* Export. The range picks by registration date and follows whichever
          event tab is active, so what you see is what you get. */}
      <section className="glass mt-4 rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="export-from"
              className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-ink/60"
            >
              Registered from
            </label>
            <input
              id="export-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm
                         outline-none transition-[border-color,box-shadow] duration-200
                         ease-out focus:border-ink focus:ring-2 focus:ring-ink/15"
            />
          </div>
          <div>
            <label
              htmlFor="export-to"
              className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-ink/60"
            >
              Until
            </label>
            <input
              id="export-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm
                         outline-none transition-[border-color,box-shadow] duration-200
                         ease-out focus:border-ink focus:ring-2 focus:ring-ink/15"
            />
          </div>

          <button
            onClick={runExport}
            disabled={exporting || rangeInvalid || exportable.length === 0}
            aria-busy={exporting}
            className="press ring-focus rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold
                       text-paper transition-[background-color] duration-200 ease-out
                       hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting
              ? "Building…"
              : `Export ${exportable.length} to Excel`}
          </button>

          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="press ring-focus rounded-lg px-2 py-2.5 text-sm font-medium
                         text-ink/70 transition-[color] duration-200 ease-out hover:text-ink"
            >
              All dates
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-ink/60">
          {rangeInvalid
            ? "The start date is after the end date."
            : `Includes the QR image, ticket code and contact details for ${
                filter === "all"
                  ? "both events"
                  : tabs.find((t) => t.key === filter)?.label
              }. Dates are inclusive.`}
        </p>

        {exportError && (
          <p
            role="alert"
            className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {exportError}
          </p>
        )}
      </section>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading && (
        <p className="glass mt-4 rounded-2xl px-4 py-10 text-center text-sm text-ink/60">
          Loading…
        </p>
      )}

      {isEmpty && (
        <p className="glass mt-4 rounded-2xl px-4 py-10 text-center text-sm text-ink/60">
          {guests.length === 0
            ? "No RSVPs yet. They will appear here as guests register."
            : "No guests match this filter or search."}
        </p>
      )}

      {/* Below lg the table would have to scroll sideways and clip columns, so
          the same rows render as stacked cards instead. */}
      {!loading && !isEmpty && (
        <ul className="mt-4 space-y-3 lg:hidden">
          {visible.map((g) => (
            <li
              key={g.id}
              className={`glass rounded-xl p-4 ${g.check_in_status ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold break-words">{g.name}</p>
                  <p className="text-xs break-all text-ink/65">{g.email}</p>
                  <p className="text-xs text-ink/65">{g.phone}</p>
                </div>
                <Code value={g.ticket_hash} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill guest={g} />
                <Badge event={g.event_type} />
                <span className="text-xs font-semibold text-ink/70">
                  {g.guest_count || 1} pax
                </span>
              </div>
              <div className="mt-3 border-t border-ink/10 pt-2 text-sm">
                <Details guest={g} />
              </div>
              <p className="mt-2 text-xs text-ink/60">
                Registered{" "}
                {g.created_at
                  ? new Date(g.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!loading && !isEmpty && (
        <div className="glass mt-4 hidden rounded-2xl lg:block">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[6%]" />
              <col className="w-[14%]" />
              <col className="w-[9%]" />
              <col className="w-[11%]" />
              <col className="w-[26%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink/60">
                <th className="px-4 py-3 font-semibold">Guest</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Pax</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 font-semibold">Company</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => (
                <tr
                  key={g.id}
                  className={`border-b border-ink/5 align-top transition-[background-color]
                              duration-200 ease-out last:border-0 hover:bg-ink/[0.03]
                              ${g.check_in_status ? "text-ink/70" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold break-words text-ink">{g.name}</p>
                    <p className="text-xs break-all text-ink/65">{g.email}</p>
                    <p className="text-xs text-ink/65">{g.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Code value={g.ticket_hash} />
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {g.guest_count || 1}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill guest={g} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge event={g.event_type} />
                  </td>
                  <td className="px-4 py-3">
                    <RegisteredAt iso={g.created_at} />
                  </td>
                  <td className="px-4 py-3">
                    <Details guest={g} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
