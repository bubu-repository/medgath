"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType } from "@/lib/types";
import { validateRsvp } from "@/lib/validate";
import { ACCENT } from "@/lib/theme";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink/80">{label}</span>
        {hint && <span className="text-xs text-ink/50">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

export default function RsvpForm({ eventType }: { eventType: EventType }) {
  const router = useRouter();
  const a = ACCENT[eventType];
  const inputCls =
    "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink " +
    "placeholder:text-ink/35 outline-none transition " +
    a.input;

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    bubu_period: "",
    contribution: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const payload = { event_type: eventType, ...values };
    const clientErrors = validateRsvp(payload);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse response:", parseErr);
        setServerError("Invalid server response. Please try again.");
        setSubmitting(false);
        return;
      }

      if (res.ok && data.ticket_hash) {
        const flag = data.already_registered ? "?existing=1" : "";
        try {
          router.push(`/ticket/${data.ticket_hash}${flag}`);
        } catch (navErr) {
          console.error("Navigation error:", navErr);
          setServerError("Redirect failed. Please refresh the page.");
          setSubmitting(false);
        }
        return;
      }

      // 409 = conflict (email/phone mismatch)
      if (res.status === 409) {
        setServerError(
          data.error ||
            "Email or phone number already registered with different details."
        );
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        const errorMsg = data.error ?? "Something went wrong. Please try again.";
        console.error("RSVP API error:", {
          status: res.status,
          statusText: res.statusText,
          data,
          headers: Object.fromEntries(res.headers.entries()),
        });
        setServerError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("RSVP submission error:", errorMsg, err);
      setServerError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isBubu30 = eventType === "bubu30";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Full name" error={errors.name}>
        <input
          className={inputCls}
          value={values.name}
          onChange={set("name")}
          placeholder="Your name"
          autoComplete="name"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          className={inputCls}
          type="email"
          value={values.email}
          onChange={set("email")}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Phone number" error={errors.phone}>
        <input
          className={inputCls}
          type="tel"
          value={values.phone}
          onChange={set("phone")}
          placeholder="+62 812 3456 7890"
          autoComplete="tel"
        />
      </Field>

      <Field
        label={isBubu30 ? "Company" : "Media / Company"}
        error={errors.company}
      >
        <input
          className={inputCls}
          value={values.company}
          onChange={set("company")}
          placeholder={isBubu30 ? "Where you work now" : "Your outlet or company"}
          autoComplete="organization"
        />
      </Field>

      {isBubu30 && (
        <>
          <Field
            label="Your Bubu era (what period were you in Bubu?)"
            error={errors.bubu_period}
          >
            <input
              className={inputCls}
              value={values.bubu_period}
              onChange={set("bubu_period")}
              placeholder="e.g. 2003–2008, the IDByte years"
            />
          </Field>

          <Field label="Would you like to contribute?" hint="optional">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={values.contribution}
              onChange={set("contribution")}
              placeholder="A performance, food, or another gift: tell us here"
            />
          </Field>
        </>
      )}

      {serverError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-lg px-6 py-3.5 font-display text-2xl
                   tracking-widest transition
                   disabled:cursor-not-allowed disabled:opacity-60 ${a.button}`}
      >
        {submitting ? "SAVING YOUR SEAT…" : "RSVP NOW"}
      </button>

      <p className="text-center text-xs text-ink/50">
        Seats are limited and by invitation only. Kindly confirm by 30 July 2026.
      </p>
    </form>
  );
}
