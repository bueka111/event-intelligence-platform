"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncTedButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/leads/sync/ted", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`Fehler: ${json.error}`);
        return;
      }
      setMessage(`${json.imported} neue Ausschreibungen importiert (${json.skipped} bereits bekannt).`);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isLoading ? "Synchronisiere..." : "TED-Ausschreibungen abrufen"}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}
