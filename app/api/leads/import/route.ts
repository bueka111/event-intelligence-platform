import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseLeadsCsv } from "@/lib/csv";

/**
 * CRM-Import: erwartet multipart/form-data mit Feld "file" (CSV).
 * Spalten: title,organization,description,location,budget_estimate,deadline
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Kein CSV-File unter Feld 'file' gefunden" }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors } = parseLeadsCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Keine gueltigen Zeilen gefunden", details: errors }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .insert(
      rows.map((row) => ({
        source: "crm_import" as const,
        title: row.title,
        organization: row.organization || null,
        description: row.description || null,
        location: row.location || null,
        budget_estimate: row.budget_estimate ? Number(row.budget_estimate) : null,
        deadline: row.deadline || null,
        raw_data: row.raw,
      })),
    )
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: data.length, skipped: errors.length, errors }, { status: 201 });
}
