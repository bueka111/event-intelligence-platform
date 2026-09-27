"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEAD_SOURCES } from "@/lib/types";

const SOURCE_LABELS: Record<(typeof LEAD_SOURCES)[number], string> = {
  manual: "Manuelle Eingabe",
  tender_portal: "Ausschreibungsportal",
  crm_import: "CRM-Import",
};

export function NewLeadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Ungueltige Eingabe");
        return;
      }
      router.push(`/leads/${json.lead.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <Field label="Quelle" name="source" as="select">
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>
            {SOURCE_LABELS[s]}
          </option>
        ))}
      </Field>
      <Field label="Titel *" name="title" required />
      <Field label="Organisation / Kunde" name="organization" />
      <Field label="Beschreibung" name="description" as="textarea" />
      <Field label="Ort" name="location" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget (EUR, geschaetzt)" name="budget_estimate" type="number" />
        <Field label="Frist" name="deadline" type="date" />
      </div>
      <Field label="Quell-URL" name="source_url" type="url" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isSubmitting ? "Speichere..." : "Lead anlegen"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  as = "input",
  type = "text",
  required = false,
  children,
}: {
  label: string;
  name: string;
  as?: "input" | "textarea" | "select";
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  const baseClass = "w-full rounded border border-slate-300 px-3 py-2 text-sm";
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} rows={4} className={baseClass} />
      ) : as === "select" ? (
        <select name={name} className={baseClass}>
          {children}
        </select>
      ) : (
        <input name={name} type={type} required={required} className={baseClass} />
      )}
    </label>
  );
}
