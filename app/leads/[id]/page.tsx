import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusSelect } from "@/components/StatusSelect";
import { EnrichButton } from "@/components/EnrichButton";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const l = lead as Lead;

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{l.title}</h1>
          <p className="text-sm text-slate-500">{l.organization ?? "Organisation unbekannt"}</p>
        </div>
        <ScoreBadge score={l.score} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <StatusSelect leadId={l.id} status={l.status} />
        <EnrichButton leadId={l.id} />
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-4 rounded border border-slate-200 p-4 text-sm">
        <Info label="Ort" value={l.location} />
        <Info
          label="Budget"
          value={l.budget_estimate ? `${l.budget_estimate.toLocaleString("de-DE")} ${l.currency}` : null}
        />
        <Info label="Frist" value={l.deadline ? new Date(l.deadline).toLocaleDateString("de-DE") : null} />
        <Info label="Quelle" value={l.source} />
        {l.source_url && <Info label="Quell-URL" value={l.source_url} />}
      </dl>

      {l.description && (
        <section className="mb-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">Beschreibung</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{l.description}</p>
        </section>
      )}

      {l.ai_summary && (
        <section className="mb-6 rounded border border-indigo-200 bg-indigo-50 p-4">
          <h2 className="mb-1 text-sm font-semibold text-indigo-900">KI-Zusammenfassung</h2>
          <p className="text-sm text-indigo-800">{l.ai_summary}</p>
          {l.score_reasoning && (
            <p className="mt-2 text-xs text-indigo-700">
              <strong>Score-Begruendung:</strong> {l.score_reasoning}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value ?? "–"}</dd>
    </div>
  );
}
