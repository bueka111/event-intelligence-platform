import { z } from "zod";

export const LEAD_SOURCES = ["tender_portal", "manual", "crm_import"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "new",
  "reviewing",
  "qualified",
  "pursuing",
  "won",
  "lost",
  "rejected",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  source: LeadSource;
  source_url: string | null;
  source_reference: string | null;
  title: string;
  organization: string | null;
  description: string | null;
  location: string | null;
  budget_estimate: number | null;
  currency: string;
  deadline: string | null; // ISO date
  status: LeadStatus;
  score: number | null;
  score_reasoning: string | null;
  ai_summary: string | null;
  enriched_at: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const NewLeadSchema = z.object({
  source: z.enum(LEAD_SOURCES).default("manual"),
  source_url: z.string().url().optional().or(z.literal("")),
  source_reference: z.string().optional(),
  title: z.string().min(3, "Titel ist zu kurz"),
  organization: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  budget_estimate: z.coerce.number().nonnegative().optional(),
  currency: z.string().default("EUR"),
  deadline: z.string().optional().or(z.literal("")),
});
export type NewLeadInput = z.infer<typeof NewLeadSchema>;

// Strukturierte Ausgabe der KI-Anreicherung (Claude Structured Output)
export const LeadEnrichmentSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      "Relevanz-Score 0-100 fuer eine Eventagentur: passt Budget, Thema und Umfang zum Geschaeft?",
    ),
  score_reasoning: z
    .string()
    .describe("Kurze Begruendung des Scores in 1-2 Saetzen, auf Deutsch."),
  ai_summary: z
    .string()
    .describe("Knappe Zusammenfassung des Leads in 2-4 Saetzen, auf Deutsch."),
  extracted_budget_estimate: z
    .number()
    .nonnegative()
    .nullable()
    .describe("Geschaetztes Budget in EUR, falls aus dem Text ableitbar, sonst null."),
  extracted_deadline: z
    .string()
    .nullable()
    .describe("Bewerbungs-/Abgabefrist als ISO-Datum (YYYY-MM-DD), falls erkennbar, sonst null."),
});
export type LeadEnrichment = z.infer<typeof LeadEnrichmentSchema>;
