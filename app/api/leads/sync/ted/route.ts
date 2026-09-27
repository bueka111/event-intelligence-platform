import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTedNotices } from "@/lib/connectors/ted";

/**
 * Stoesst einen Sync mit TED an: neue Ausschreibungen (Event-CPV-Codes) werden
 * als Leads angelegt, bereits importierte (gleiche source_reference) werden
 * uebersprungen. Gedacht zum manuellen Anstossen ueber die UI oder spaeter per Cron.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sinceDate = searchParams.get("since") ?? undefined;

  let notices;
  try {
    notices = await fetchTedNotices(sinceDate);
  } catch (err) {
    const message = err instanceof Error ? err.message : "TED-Abruf fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (notices.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
  }

  const supabase = getSupabaseServerClient();
  const noticeIds = notices.map((n) => n.noticeId);
  const { data: existing } = await supabase
    .from("leads")
    .select("source_reference")
    .in("source_reference", noticeIds);

  const existingIds = new Set((existing ?? []).map((row) => row.source_reference));
  const newNotices = notices.filter((n) => !existingIds.has(n.noticeId));

  if (newNotices.length === 0) {
    return NextResponse.json({ imported: 0, skipped: notices.length, total: notices.length });
  }

  const { error } = await supabase.from("leads").insert(
    newNotices.map((n) => ({
      source: "tender_portal" as const,
      source_reference: n.noticeId,
      source_url: n.noticeUrl,
      title: n.title,
      organization: n.buyerName,
      description: n.description,
      location: n.country,
      deadline: n.deadline,
      raw_data: n.raw,
    })),
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    imported: newNotices.length,
    skipped: notices.length - newNotices.length,
    total: notices.length,
  });
}
