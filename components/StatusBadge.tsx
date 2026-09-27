import type { LeadStatus } from "@/lib/types";

const LABELS: Record<LeadStatus, string> = {
  new: "Neu",
  reviewing: "In Pruefung",
  qualified: "Qualifiziert",
  pursuing: "In Verfolgung",
  won: "Gewonnen",
  lost: "Verloren",
  rejected: "Abgelehnt",
};

const COLORS: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  reviewing: "bg-blue-100 text-blue-800",
  qualified: "bg-violet-100 text-violet-800",
  pursuing: "bg-indigo-100 text-indigo-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-slate-200 text-slate-600",
  rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}

export { LABELS as STATUS_LABELS };
