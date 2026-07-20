import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Guest list fetch failed:", error);
    return NextResponse.json(
      { error: "Could not load guests." },
      { status: 500 }
    );
  }
  return NextResponse.json({ guests: data });
}
