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
- Ausschreibungsportale — angebunden ist [TED](https://ted.europa.eu) (Tenders Electronic Daily,
  offizielle EU-Plattform für öffentliche Ausschreibungen). Kostenlose, öffentliche API, kein
  Login nötig. Gefiltert nach Event-relevanten CPV-Codes (Kongress-/Messe-/Event-/Festivalorganisation,
  siehe `lib/connectors/ted.ts`). Button "TED-Ausschreibungen abrufen" auf `/leads` stößt den Sync an;
  Dedupe läuft über `source_reference` (TED-Publikationsnummer).

  **Wichtig:** Die Feldnamen der TED-API-Response wurden aus der offiziellen Doku übernommen, aber
  in dieser Entwicklungsumgebung nicht live gegen die echte API getestet (kein Internetzugriff in der
  Build-Sandbox). Der komplette Rohdatensatz landet trotzdem immer in `raw_data` — geht also nichts
  verloren, falls beim ersten echten Sync ein einzelner Feldname (z.B. Titel oder Frist) nicht ankommt.
  Bei Bedarf `lib/connectors/ted.ts` → `pickField()`-Kandidatenlisten nach dem ersten Testlauf anpassen.

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

### Kosten beim Testen vermeiden

Drei Stufen, je nachdem was du testen willst:

1. **UI/Flow ohne jeden API-Call testen (0 €):** `ANTHROPIC_MOCK=true` in `.env.local` setzen.
   `ANTHROPIC_API_KEY` kann dabei leer bleiben. Score/Zusammenfassung sind dann nur eine
   Heuristik (klar als `[MOCK]` markiert), aber der komplette Klick-Flow funktioniert.
2. **Echtes Scoring, minimale Kosten:** `ANTHROPIC_MOCK=false` + `ANTHROPIC_LEAD_MODEL=claude-haiku-4-5`.
   Ein einzelner Lead kostet damit einen winzigen Bruchteil eines Cents.
3. **Produktion / beste Qualität:** `ANTHROPIC_LEAD_MODEL=claude-opus-5` (Standard) oder `claude-sonnet-5`
   als Mittelweg zwischen Kosten und Qualität.

Ein `ANTHROPIC_API_KEY` braucht ein Guthaben in der [Anthropic Console](https://console.anthropic.com)
(Pay-as-you-go, kein Abo) — für Stufe 1 aber gar nicht nötig.

### Nächste Schritte (Vorschlag)

1. **Ersten echten TED-Sync fahren** und prüfen, ob Titel/Auftraggeber/Frist korrekt ankommen
   (Button auf `/leads`). Falls ein Feld leer bleibt: `raw_data` des betroffenen Leads in Supabase
   ansehen und die passende Kandidaten-Liste in `lib/connectors/ted.ts` ergänzen.
2. Sync als Cron-Job automatisieren (z.B. täglich), sobald die Feld-Zuordnung stimmt.
3. Mit echten Leads aus dem eigenen Tagesgeschäft (manuell/CSV) befüllen und Scoring-Qualität validieren.
4. Erst danach: Auth/Multi-Tenant, falls Verkauf an andere Agenturen ansteht (Phase 2 der Business-Entscheidung).
