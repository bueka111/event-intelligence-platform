# event-intelligence-platform
AI-powered platform for lead generation, tender analysis, event planning and project management.
# Event Intelligence Platform

## Vision

Aus Leads werden Projekte.

## Mission

Wir nutzen KI, um Eventagenturen bei Akquise,
Ausschreibungen, Konzeptentwicklung und Projektmanagement
zu unterstützen.

## Ziel

Mehr Projekte gewinnen.
Weniger manuelle Arbeit.
Besseres Wissensmanagement.

## MVP

1. Lead Intelligence
2. Ausschreibungsanalyse
3. Konzeptdatenbank
4. Projektmanagement

## Roadmap

Phase 1:
Lead Engine

Phase 2:
Tender Analyzer

Phase 3:
Concept Intelligence

Phase 4:
Project Intelligence

---

## Phase 1: Lead Engine (aktueller Stand)

Erste Ausbaustufe für den internen Einsatz in der eigenen Agentur. Erfasst Leads aus drei Quellen,
bewertet sie automatisch per Claude (Relevanz-Score, Zusammenfassung, extrahiertes Budget/Frist)
und verwaltet sie in einer einfachen Pipeline (Neu -> In Prüfung -> Qualifiziert -> In Verfolgung -> Gewonnen/Verloren).

**Lead-Quellen:**

- Manuelle Eingabe (`/leads/new`)
- CRM-Import per CSV (`title,organization,description,location,budget_estimate,deadline`)
- Ausschreibungsportale — Tabelle/Schema ist vorbereitet (`source = 'tender_portal'`, `raw_data` jsonb),
  ein konkreter Portal-Connector (Scraper/API) ist der nächste Schritt und noch nicht angebunden.

### Tech-Stack

- **Next.js 14** (App Router, TypeScript) — Frontend + API-Routen
- **Supabase** (Postgres) — Datenhaltung, später Auth/Multi-Tenant
- **Claude API** (`@anthropic-ai/sdk`, Structured Outputs) — Scoring & Anreicherung

### Setup

1. **Supabase-Projekt anlegen** unter [supabase.com](https://supabase.com).
2. Migration ausführen: Inhalt von `supabase/migrations/0001_init.sql` im SQL-Editor des Projekts einfügen und ausführen.
3. `.env.example` nach `.env.local` kopieren und ausfüllen:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — aus den Supabase-Projekteinstellungen (API).
   - `ANTHROPIC_API_KEY` — aus der [Anthropic Console](https://console.anthropic.com).
4. Abhängigkeiten installieren und starten:

   ```bash
   npm install
   npm run dev
   ```

5. Öffnen: `http://localhost:3000/leads`

### Kosten-Hinweis zum Scoring-Modell

`ANTHROPIC_LEAD_MODEL` steuert, welches Claude-Modell für die Anreicherung genutzt wird
(Standard: `claude-opus-5`, höchste Qualität). Bei hohem Lead-Volumen ist `claude-sonnet-5`
oder `claude-haiku-4-5` deutlich günstiger bei weiterhin guter Qualität für diese Aufgabe —
einfach in `.env.local` umstellen.

### Nächste Schritte (Vorschlag)

1. Ersten echten Ausschreibungsportal-Connector bauen (ein Portal, ein Cron-Job, Insert mit `source='tender_portal'`).
2. Mit echten Leads aus dem eigenen Tagesgeschäft befüllen und Scoring-Qualität validieren.
3. Erst danach: Auth/Multi-Tenant, falls Verkauf an andere Agenturen ansteht (Phase 2 der Business-Entscheidung).
