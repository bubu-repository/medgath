import type { EventType } from "./types";

export interface RsvpInput {
  event_type: EventType;
  name: string;
  email: string;
  phone: string;
  company: string;
  bubu_period?: string;
  contribution?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-()]{8,20}$/;

// Returns a map of field -> error message; empty object means valid.
// Used verbatim on both the client (instant feedback) and the server (trust boundary).
export function validateRsvp(input: Partial<RsvpInput>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.event_type !== "media" && input.event_type !== "bubu30") {
    errors.event_type = "Unknown event.";
  }
  if (!input.name?.trim() || input.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!input.email?.trim() || !EMAIL_RE.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!input.phone?.trim() || !PHONE_RE.test(input.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!input.company?.trim()) {
    errors.company =
      input.event_type === "media"
        ? "Please enter your media or company name."
        : "Please enter your company.";
  }
  if (input.event_type === "bubu30" && !input.bubu_period?.trim()) {
    errors.bubu_period = "Please tell us your Bubu era.";
  }
  return errors;
}

// Canonical phone form: keep a leading +, drop spaces/dashes/parens.
// "+62 812-0000 1111" and "+62812 00001111" are the same number, and the
// exact-match duplicate rule must treat them as such.
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

export function normalizeRsvp(input: RsvpInput): RsvpInput {
  return {
    event_type: input.event_type,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: normalizePhone(input.phone),
    company: input.company.trim(),
    bubu_period: input.bubu_period?.trim() || undefined,
    contribution: input.contribution?.trim() || undefined,
  };
}
