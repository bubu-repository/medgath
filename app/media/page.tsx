import type { Metadata } from "next";
import EventShell from "@/components/EventShell";
import RsvpForm from "@/components/RsvpForm";

export const metadata: Metadata = {
  title: "Media Gathering — BUBU 30",
  description:
    "Exclusive media gathering for the BUBU.COM thirtieth anniversary.",
};

export default function MediaPage() {
  return (
    <EventShell
      eventType="media"
      kicker="MEDIA GATHERING"
      subline="Media Gathering"
      blurb="You are among a selected few. Thirty years in the making, and before the world sees it, you will. Join us for an exclusive evening as we mark three decades of Bubu.com and unveil what comes next."
    >
      <RsvpForm eventType="media" />
    </EventShell>
  );
}
