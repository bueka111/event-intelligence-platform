"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function ImportCsvForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/leads/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setStatus(`Fehler: ${json.error}`);
      } else {
        setStatus(`${json.imported} Leads importiert, ${json.skipped} Zeilen uebersprungen.`);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 text-sm">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        required
        className="text-xs text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isSubmitting ? "Importiere..." : "CRM-CSV importieren"}
      </button>
      {status && <span className="text-xs text-slate-500">{status}</span>}
    </form>
  );
}
