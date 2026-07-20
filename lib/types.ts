export type EventType = "media" | "bubu30";

export interface Guest {
  id: string;
  event_type: EventType;
  name: string;
  email: string;
  phone: string;
  company: string;
  bubu_period: string | null;
  contribution: string | null;
  ticket_hash: string;
  check_in_status: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export const EVENT_DETAILS: Record<
  EventType,
  { title: string; tagline: string; date: string; time: string; venue: string }
> = {
  media: {
    title: "Media Gathering",
    tagline: "Ahead. On Repeat.",
    date: "Friday, July 31st, 2026",
    time: "6PM - til drop",
    venue: "Berkala Coffee",
  },
  bubu30: {
    title: "BUBU 30 — Thirtieth Anniversary",
    tagline: "Ahead. On Repeat.",
    date: "Friday, July 31st, 2026",
    time: "6PM - til drop",
    venue: "Berkala Coffee",
  },
};
