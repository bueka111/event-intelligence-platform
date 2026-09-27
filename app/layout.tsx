import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Intelligence Platform",
  description: "Lead Engine - KI-gestuetzte Akquise fuer Eventagenturen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
            <Link href="/leads" className="text-lg font-semibold text-slate-900">
              Event Intelligence Platform
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/leads" className="hover:text-slate-900">
                Leads
              </Link>
              <Link href="/leads/new" className="hover:text-slate-900">
                + Neuer Lead
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
