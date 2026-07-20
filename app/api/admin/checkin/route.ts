import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

// One endpoint serves both entry paths: the QR scanner posts the decoded
// value, the manual fallback posts the hand-typed ticket code.
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body.code?.trim();
  if (!raw) {
    return NextResponse.json({ error: "No code provided." }, { status: 422 });
  }

  const db = supabaseAdmin();

  // Exact match first (QR payload), then uppercased (hand-typed code).
  let { data: guest } = await db
    .from("guests")
    .select("*")
    .eq("ticket_hash", raw)
    .maybeSingle();
  if (!guest && raw.toUpperCase() !== raw) {
    ({ data: guest } = await db
      .from("guests")
      .select("*")
      .eq("ticket_hash", raw.toUpperCase())
      .maybeSingle());
  }

  if (!guest) {
    return NextResponse.json(
      { status: "not_found", code: raw },
      { status: 404 }
    );
  }

  if (guest.check_in_status) {
    return NextResponse.json(
      { status: "already_checked_in", guest },
      { status: 409 }
    );
  }

  // Guarded update: the check_in_status=false filter makes a double scan
  // race resolve to exactly one winner.
  const { data: updated, error } = await db
    .from("guests")
    .update({ check_in_status: true, checked_in_at: new Date().toISOString() })
    .eq("id", guest.id)
    .eq("check_in_status", false)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Check-in update failed:", error);
    return NextResponse.json(
      { error: "Check-in failed. Try again." },
      { status: 500 }
    );
  }
  if (!updated) {
    return NextResponse.json(
      { status: "already_checked_in", guest },
      { status: 409 }
    );
  }

  return NextResponse.json({ status: "checked_in", guest: updated });
}
