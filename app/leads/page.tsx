import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ImportCsvForm } from "@/components/ImportCsvForm";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = getSupabaseServerClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return <ConfigHint message={error.message} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Lead Engine</h1>
          <p className="text-sm text-slate-500">
            {leads?.length ?? 0} Leads · sortiert nach KI-Score
          </p>
        </div>
        <ImportCsvForm />
      </div>

      {!leads?.length ? (
        <p className="rounded border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Noch keine Leads. Leg einen{" "}
          <Link href="/leads/new" className="underline">
            manuell an
          </Link>{" "}
          oder importiere eine CRM-CSV.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Score</th>
              <th className="py-2">Titel</th>
              <th className="py-2">Organisation</th>
              <th className="py-2">Budget</th>
              <th className="py-2">Frist</th>
              <th className="py-2">Status</th>
              <th className="py-2">Quelle</th>
            </tr>
          </thead>
          <tbody>
            {(leads as Lead[]).map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2">
                  <ScoreBadge score={lead.score} />
                </td>
                <td className="py-2">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:underline">
                    {lead.title}
                  </Link>
                </td>
                <td className="py-2 text-slate-600">{lead.organization ?? "–"}</td>
                <td className="py-2 text-slate-600">
                  {lead.budget_estimate ? `${lead.budget_estimate.toLocaleString("de-DE")} ${lead.currency}` : "–"}
                </td>
                <td className="py-2 text-slate-600">
                  {lead.deadline ? new Date(lead.deadline).toLocaleDateString("de-DE") : "–"}
                </td>
                <td className="py-2">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="py-2 text-xs text-slate-400">{lead.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ConfigHint({ message }: { message: string }) {
  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-medium">Datenbank nicht erreichbar</p>
      <p className="mt-1">
        {message}. Pruefe, ob <code>.env.local</code> gesetzt ist und die Migration
        <code> supabase/migrations/0001_init.sql</code> in deinem Supabase-Projekt ausgefuehrt wurde.
      </p>
    </div>
  );
}
