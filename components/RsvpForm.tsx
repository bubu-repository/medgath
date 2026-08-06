"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType } from "@/lib/types";
import { validateRsvp } from "@/lib/validate";
import { ACCENT } from "@/lib/theme";

function Label({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {hint && <span className="text-xs text-ink/60">{hint}</span>}
    </span>
  );
}

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <span id={id} className="mt-1 block text-xs text-red-700">
      {children}
    </span>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: {
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const errorId = useId();
  return (
    <label className="block">
      <Label label={label} hint={hint} />
      {children(
        error ? { "aria-invalid": true, "aria-describedby": errorId } : {}
      )}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </label>
  );
}

// Two-option segmented control. The selected thumb slides rather than
// cutting, so the change reads as one control changing state instead of two
// buttons swapping colors. Transform only, 220ms, strong ease-out.
//
// Built on real radio inputs, not ARIA-labelled buttons: native radios bring
// roving tab focus and arrow-key selection with them, which a pair of
// role="radio" buttons would each have to reimplement.
function PaxToggle({
  name,
  value,
  onChange,
  accentClass,
  selectedTextClass,
}: {
  name: string;
  value: "solo" | "duo";
  onChange: (next: "solo" | "duo") => void;
  accentClass: string;
  selectedTextClass: string;
}) {
  const options = [
    { key: "solo" as const, label: "1 PAX" },
    { key: "duo" as const, label: "2 PAX" },
  ];
  return (
    <div
      role="group"
      aria-label="How many people attending"
      className="relative grid grid-cols-2 rounded-lg border border-ink/15 bg-white p-1"
    >
      {/* Thumb spans exactly one cell: the container has no gap, so
          50% of the padding box minus the 0.25rem inset is one column. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md
                    transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${accentClass}`}
        style={{
          transform: value === "duo" ? "translateX(100%)" : "translateX(0)",
        }}
      />
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <label
            key={option.key}
            className="press relative z-10 cursor-pointer text-center"
          >
            <input
              type="radio"
              name={name}
              value={option.key}
              checked={selected}
              onChange={() => onChange(option.key)}
              className="peer sr-only"
            />
            <span
              className={`block rounded-md py-2.5 text-sm font-semibold
                          transition-[color] duration-200 ease-out
                          peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3
                          peer-focus-visible:outline-ink
                          ${selected ? selectedTextClass : "text-ink/70 hover:text-ink"}`}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function RsvpForm({ eventType }: { eventType: EventType }) {
  const router = useRouter();
  const paxName = useId();
  const a = ACCENT[eventType];
  const inputCls =
    "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink " +
    "placeholder:text-ink/60 outline-none " +
    "aria-[invalid]:border-red-500 aria-[invalid]:focus:ring-red-500/25 " +
    a.input;

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    bubu_period: "",
    contribution: "",
    attendance_type: "solo" as "solo" | "duo",
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
        {(aria) => (
          <input
            {...aria}
            className={inputCls}
            value={values.name}
            onChange={set("name")}
            placeholder="Your full name"
            autoComplete="name"
          />
        )}
      </Field>

      <Field label="Email address" error={errors.email}>
        {(aria) => (
          <input
            {...aria}
            className={inputCls}
            type="email"
            value={values.email}
            onChange={set("email")}
            placeholder="your@email.com"
            autoComplete="email"
          />
        )}
      </Field>

      <Field label="Phone number" error={errors.phone}>
        {(aria) => (
          <input
            {...aria}
            className={inputCls}
            type="tel"
            value={values.phone}
            onChange={set("phone")}
            placeholder="+62 812 3456 7890"
            autoComplete="tel"
          />
        )}
      </Field>

      <Field
        label={isBubu30 ? "LinkedIn profile" : "Media outlet or company"}
        error={errors.company}
      >
        {(aria) => (
          <input
            {...aria}
            className={inputCls}
            value={values.company}
            onChange={set("company")}
            placeholder={isBubu30 ? "linkedin.com/in/yourprofile" : "Your outlet"}
            autoComplete={isBubu30 ? "url" : "organization"}
          />
        )}
      </Field>

      {!isBubu30 && (
        <div className="block">
          <Label label="How many people attending?" hint="2 pax max" />
          <PaxToggle
            name={paxName}
            value={values.attendance_type}
            onChange={(next) =>
              setValues((v) => ({ ...v, attendance_type: next }))
            }
            accentClass={eventType === "media" ? "bg-brand" : "bg-ink"}
            selectedTextClass={eventType === "media" ? "text-ink" : "text-paper"}
          />
        </div>
      )}

      {isBubu30 && (
        <>
          <Field
            label="Your Bubu era"
            error={errors.bubu_period}
            hint="which years were you involved"
          >
            {(aria) => (
              <input
                {...aria}
                className={inputCls}
                value={values.bubu_period}
                onChange={set("bubu_period")}
                placeholder="e.g. 2003–2008"
              />
            )}
          </Field>

          <Field label="Contribution" hint="optional" error={errors.contribution}>
            {(aria) => (
              <textarea
                {...aria}
                className={`${inputCls} min-h-20 resize-none`}
                value={values.contribution}
                onChange={set("contribution")}
                placeholder="A performance, food, gift, or idea you'd like to bring"
              />
            )}
          </Field>
        </>
      )}

      {serverError && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className={`press w-full rounded-lg px-6 py-3.5 font-display text-2xl tracking-widest
                   disabled:cursor-not-allowed disabled:opacity-60 ${a.button}`}
      >
        {submitting ? "SAVING…" : "RSVP NOW"}
      </button>

      <div className="space-y-1.5 text-center text-xs text-ink/60">
        <p>Confirm your seat by July 30. Seats are limited and by invitation only.</p>
        <p>
          Questions?{" "}
          <a
            href="https://wa.me/+6285697661637"
            target="_blank"
            rel="noopener noreferrer"
            className={a.link}
          >
            Contact Widi
          </a>
        </p>
      </div>
    </form>
  );
}
