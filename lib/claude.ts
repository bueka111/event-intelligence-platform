import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { LeadEnrichmentSchema, type Lead, type LeadEnrichment } from "./types";

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_LEAD_MODEL ?? "claude-opus-5";

/**
 * Reichert einen Lead mit einem Relevanz-Score, einer Begruendung und einer
 * Zusammenfassung an. Nutzt Claude Structured Outputs, damit das Ergebnis
 * garantiert dem LeadEnrichmentSchema entspricht - kein manuelles JSON-Parsing.
 */
export async function enrichLead(
  lead: Pick<Lead, "title" | "organization" | "description" | "location" | "budget_estimate" | "deadline" | "raw_data">,
): Promise<LeadEnrichment> {
  const context = [
    `Titel: ${lead.title}`,
    lead.organization ? `Organisation: ${lead.organization}` : null,
    lead.location ? `Ort: ${lead.location}` : null,
    lead.budget_estimate ? `Bekanntes Budget: ${lead.budget_estimate} EUR` : null,
    lead.deadline ? `Bekannte Frist: ${lead.deadline}` : null,
    lead.description ? `Beschreibung:\n${lead.description}` : null,
    lead.raw_data ? `Zusatzdaten:\n${JSON.stringify(lead.raw_data)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system:
      "Du bist ein erfahrener Business-Development-Analyst fuer eine Eventagentur " +
      "(Konferenzen, Firmenevents, Ausschreibungen mit mehreren hundert bis tausenden Gaesten). " +
      "Bewerte eingehende Leads danach, wie gut sie zu einer Eventagentur passen: " +
      "Themenrelevanz, Budgethoehe, Umfang/Groesse, Realistische Gewinnchance. " +
      "Antworte ausschliesslich auf Deutsch.",
    messages: [{ role: "user", content: `Bewerte folgenden Lead:\n\n${context}` }],
    output_config: {
      format: zodOutputFormat(LeadEnrichmentSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude hat keine gueltige strukturierte Antwort geliefert.");
  }

  return response.parsed_output;
}
