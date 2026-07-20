import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  validateRsvp,
  normalizeRsvp,
  normalizePhone,
  type RsvpInput,
} from "@/lib/validate";

// 5-char code the door team can type by hand: uppercase only, ambiguous
// glyphs removed (0/O, 1/I/L). 31^5 = 28.6M combinations; collisions are
// handled by the retry loop below.
const genTicketCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 5);

const MISMATCH_MSG =
  "You are already registered for this event, but with a different email or " +
  "phone number. Enter the exact same email AND phone number you used when " +
  "you first registered to retrieve your QR ticket, or contact widi@bubu.com.";

export async function POST(request: Request) {
  let body: Partial<RsvpInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const errors = validateRsvp(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const input = normalizeRsvp(body as RsvpInput);
  const db = supabaseAdmin();

  // Duplicate rule: the original QR is returned ONLY when email AND phone
  // both match the existing registration exactly. A partial match (one of
  // the two already taken) is rejected so someone can't probe a guest's
  // ticket with just their email, or register twice with a new phone.
  const [byEmail, byPhone] = await Promise.all([
    db
      .from("guests")
      .select("email, phone, ticket_hash")
      .eq("event_type", input.event_type)
      .eq("email", input.email)
      .maybeSingle(),
    db
      .from("guests")
      .select("email, phone, ticket_hash")
      .eq("event_type", input.event_type)
      .eq("phone", input.phone)
      .maybeSingle(),
  ]);

  if (byEmail.data) {
    if (normalizePhone(byEmail.data.phone) === input.phone) {
      return NextResponse.json({
        ticket_hash: byEmail.data.ticket_hash,
        already_registered: true,
      });
    }
    return NextResponse.json({ error: MISMATCH_MSG }, { status: 409 });
  }
  if (byPhone.data) {
    return NextResponse.json({ error: MISMATCH_MSG }, { status: 409 });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const ticket_hash = genTicketCode();
    const { data, error } = await db
      .from("guests")
      .insert({
        event_type: input.event_type,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        bubu_period: input.event_type === "bubu30" ? input.bubu_period : null,
        contribution: input.event_type === "bubu30" ? input.contribution ?? null : null,
        ticket_hash,
      })
      .select("ticket_hash")
      .single();

    if (!error) {
      return NextResponse.json({ ticket_hash: data.ticket_hash });
    }
    if (error.code === "23505") {
      // Ticket-code collision: roll a new code and retry.
      if (error.message.includes("ticket_hash")) continue;
      // Otherwise it's the email/phone constraint (double-submit race).
      return NextResponse.json({ error: MISMATCH_MSG }, { status: 409 });
    }
    console.error("RSVP insert failed:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your RSVP. Please try again." },
      { status: 500 }
    );
  }

  console.error("RSVP failed: 5 ticket-code collisions in a row");
  return NextResponse.json(
    { error: "Something went wrong saving your RSVP. Please try again." },
    { status: 500 }
  );
}
