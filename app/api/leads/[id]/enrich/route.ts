import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { enrichLead } from "@/lib/claude";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: fetchError?.message ?? "Lead nicht gefunden" }, { status: 404 });
  }

  let enrichment;
  try {
    enrichment = await enrichLead(lead);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Anreicherung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("leads")
    .update({
      score: enrichment.score,
      score_reasoning: enrichment.score_reasoning,
      ai_summary: enrichment.ai_summary,
      budget_estimate: lead.budget_estimate ?? enrichment.extracted_budget_estimate,
      deadline: lead.deadline ?? enrichment.extracted_deadline,
      enriched_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ lead: updated });
}
