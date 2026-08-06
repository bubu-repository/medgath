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
  attendance_type: "solo" | "duo";
  guest_count: number;
  ticket_hash: string;
  check_in_status: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export const EVENT_LIMITS: Record<EventType, number> = {
  media: 30,    // companies
  bubu30: 75,   // people
};

export const EVENT_DETAILS: Record<
  EventType,
  { title: string; tagline: string; date: string; time: string; venue: string }
> = {
  media: {
    title: "Media Gathering",
    tagline: "Ahead. On Repeat.",
    date: "Friday, August 14, 2026",
    time: "2PM – 4PM",
    venue: "Berkala Coffee Ampera",
  },
  bubu30: {
    title: "BUBU 30th Anniversary",
    tagline: "Ahead. On Repeat.",
    date: "Friday, August 14, 2026",
    // No leading dash: in the 3-up this wraps, and "- til drop" on its own
    // line reads as a dangling fragment.
    time: "5.30PM til drop",
    venue: "Berkala Coffee Ampera",
  },
};

// RSVP cut-off, shown on both forms.
export const RSVP_DEADLINE = "August 11";
