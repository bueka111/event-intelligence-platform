import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NewLeadSchema } from "@/lib/types";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leads: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = NewLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      source: input.source,
      source_url: input.source_url || null,
      source_reference: input.source_reference || null,
      title: input.title,
      organization: input.organization || null,
      description: input.description || null,
      location: input.location || null,
      budget_estimate: input.budget_estimate ?? null,
      currency: input.currency,
      deadline: input.deadline || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lead: data }, { status: 201 });
}
