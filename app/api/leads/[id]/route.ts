import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LEAD_STATUSES } from "@/lib/types";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", params.id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ lead: data });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!LEAD_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Ungueltiger Status" }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.organization === "string") updates.organization = body.organization;
  if (typeof body.description === "string") updates.description = body.description;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine gueltigen Felder zum Aktualisieren" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lead: data });
}
