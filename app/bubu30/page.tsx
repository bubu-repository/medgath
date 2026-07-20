import type { Metadata } from "next";
import EventShell from "@/components/EventShell";
import RsvpForm from "@/components/RsvpForm";

export const metadata: Metadata = {
  title: "BUBU 30 — Thirtieth Anniversary",
  description:
    "RSVP for the BUBU.COM thirtieth anniversary celebration.",
};

export default function Bubu30Page() {
  return (
    <EventShell
      eventType="bubu30"
      kicker="THIRTIETH ANNIVERSARY"
      subline="Thirtieth Anniversary"
      blurb="Thirty years is not a number. It's every person who ever walked
             through our door. This time, we celebrate all of you."
    >
      <RsvpForm eventType="bubu30" />
    </EventShell>
  );
}
