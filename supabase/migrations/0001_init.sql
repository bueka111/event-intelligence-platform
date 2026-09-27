-- Event Intelligence Platform - Phase 1: Lead Engine
create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),

  -- Herkunft des Leads
  source text not null check (source in ('tender_portal', 'manual', 'crm_import')),
  source_url text,
  source_reference text, -- z.B. Ausschreibungs-/Aktenzeichen

  -- Kerndaten
  title text not null,
  organization text, -- Ausschreibende Stelle / potenzieller Kunde
  description text,
  location text,
  budget_estimate numeric,
  currency text default 'EUR',
  deadline date,

  -- Pipeline-Status
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'qualified', 'pursuing', 'won', 'lost', 'rejected')),

  -- KI-Anreicherung (Claude)
  score integer check (score between 0 and 100),
  score_reasoning text,
  ai_summary text,
  enriched_at timestamptz,

  -- Rohdaten aus Import/Scraping, fuer Nachvollziehbarkeit
  raw_data jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_score_idx on leads (score desc);
create index if not exists leads_deadline_idx on leads (deadline);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- RLS: fuer die interne MVP-Phase mit Service-Role-Key aus der App bedient;
-- Policies werden verschaerft, sobald Auth/Multi-Tenant dazukommt.
alter table leads enable row level security;

create policy "Service role full access" on leads
  for all
  using (true)
  with check (true);
