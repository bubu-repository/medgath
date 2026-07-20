import { notFound } from "next/navigation";
import TicketCard from "@/components/TicketCard";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { Guest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ existing?: string }>;
}) {
  const { hash } = await params;
  const { existing } = await searchParams;

  const db = supabaseAdmin();
  const { data: guest } = await db
    .from("guests")
    .select("*")
    .eq("ticket_hash", hash)
    .single<Guest>();

  if (!guest) notFound();

  return <TicketCard guest={guest} existing={existing === "1"} />;
}
