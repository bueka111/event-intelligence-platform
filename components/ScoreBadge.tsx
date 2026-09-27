export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">–</span>;
  }

  const color =
    score >= 70
      ? "bg-emerald-100 text-emerald-800"
      : score >= 40
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{score}</span>;
}
