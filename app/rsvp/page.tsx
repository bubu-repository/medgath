import type { Metadata } from "next";
import EventShell from "@/components/EventShell";
import RsvpForm from "@/components/RsvpForm";

export const metadata: Metadata = {
  title: "RSVP — BUBU 30th Anniversary",
  description: "RSVP for the BUBU.COM 30th anniversary celebration.",
};

export default function RsvpPage() {
  return (
    <EventShell
      eventType="bubu30"
      kicker="RSVP"
      subline="30th Anniversary"
      blurb="Thirty years is not a number. It's every person who ever walked through our door. This time, we celebrate all of you."
    >
      <RsvpForm eventType="bubu30" />
    </EventShell>
  );
}
