import Papa from "papaparse";
import { z } from "zod";

/**
 * Erwartetes CSV-Format fuer CRM-Import: title,organization,description,location,budget_estimate,deadline
 * Unbekannte Spalten landen unangetastet in raw_data (siehe api/leads/import).
 */
const CsvRowSchema = z.object({
  title: z.string().min(1),
  organization: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  budget_estimate: z.string().optional(),
  deadline: z.string().optional(),
});
export type CsvRow = z.infer<typeof CsvRowSchema>;

export interface CsvParseResult {
  rows: (CsvRow & { raw: Record<string, string> })[];
  errors: string[];
}

export function parseLeadsCsv(fileContent: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const rows: CsvParseResult["rows"] = [];
  const errors: string[] = [...parsed.errors.map((e) => `Zeile ${e.row}: ${e.message}`)];

  parsed.data.forEach((raw, index) => {
    const result = CsvRowSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`Zeile ${index + 2}: ${result.error.issues.map((i) => i.message).join(", ")}`);
      return;
    }
    rows.push({ ...result.data, raw });
  });

  return { rows, errors };
}
