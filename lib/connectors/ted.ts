/**
 * Connector fuer TED (Tenders Electronic Daily, ted.europa.eu) - die offizielle
 * EU-Plattform fuer oeffentliche Ausschreibungen oberhalb der EU-Schwellenwerte.
 * Kostenlose, oeffentliche API, kein Login/API-Key noetig.
 *
 * WICHTIG: Die exakten Feldnamen der TED-API-v3-Response wurden aus der
 * offiziellen Doku uebernommen, aber in dieser Umgebung nicht live gegen die
 * echte API verifiziert (kein Netzwerkzugriff in der Build-Sandbox). Die
 * Rohantwort landet deshalb IMMER vollstaendig in `raw_data` - falls ein
 * Feldname nicht (mehr) passt, geht kein Lead verloren, es fehlt nur ein
 * einzelner Anzeigewert. `pickField()` probiert bewusst mehrere bekannte
 * Varianten durch. Nach dem ersten echten Sync in `checkedFields` (siehe
 * Rueckgabe von syncTedNotices) pruefen, ob Titel/Auftraggeber/Frist ankommen -
 * falls nicht, die Kandidaten-Listen unten anpassen.
 */

const TED_API_URL = "https://api.ted.europa.eu/v3/notices/search";

// CPV-Codes fuer Event-/Kongress-/Messeorganisation (Common Procurement Vocabulary)
export const EVENT_CPV_CODES = [
  "79950000", // Exhibition, fair and congress organisation services
  "79951000", // Seminar organisation services
  "79952000", // Event services
  "79952100", // Organisation of cultural events
  "79953000", // Festival organisation services
  "79954000", // Party organisation services
  "79956000", // Organisation of fairs and exhibitions
];

interface TedSearchResponse {
  totalNoticeCount?: number;
  notices?: Record<string, unknown>[];
  results?: Record<string, unknown>[];
}

export interface TedNotice {
  noticeId: string;
  title: string;
  buyerName: string | null;
  description: string | null;
  country: string | null;
  publicationDate: string | null;
  deadline: string | null;
  noticeUrl: string | null;
  raw: Record<string, unknown>;
}

function pickField(notice: Record<string, unknown>, candidates: string[]): unknown {
  for (const key of candidates) {
    if (notice[key] !== undefined && notice[key] !== null && notice[key] !== "") {
      return notice[key];
    }
  }
  return null;
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") {
    // Mehrsprachige Felder kommen oft als { de: "...", en: "..." } o.ae.
    const obj = value as Record<string, string>;
    return obj.deu ?? obj.de ?? obj.eng ?? obj.en ?? Object.values(obj)[0] ?? null;
  }
  return String(value);
}

/** Normalisiert Datums-/Datetime-Strings auf YYYY-MM-DD fuer die Postgres-date-Spalte. */
function asDate(value: unknown): string | null {
  const text = asText(value);
  if (!text) return null;
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

/** "links" kommt oft verschachtelt (z.B. { html: { ENG: "https://..." } }), daher eigene Extraktion. */
function extractNoticeUrl(raw: Record<string, unknown>): string | null {
  const direct = asText(pickField(raw, ["notice-url", "URI_DOC", "uri"]));
  if (direct) return direct;

  const links = raw["links"];
  if (links && typeof links === "object") {
    for (const format of Object.values(links as Record<string, unknown>)) {
      if (format && typeof format === "object") {
        const byLang = Object.values(format as Record<string, unknown>)[0];
        if (typeof byLang === "string") return byLang;
      } else if (typeof format === "string") {
        return format;
      }
    }
  }
  return null;
}

function mapNotice(raw: Record<string, unknown>): TedNotice {
  const noticeId =
    asText(pickField(raw, ["publication-number", "ND", "notice-id", "id"])) ?? crypto.randomUUID();

  return {
    noticeId,
    title: asText(pickField(raw, ["notice-title", "TI", "title"])) ?? "Ausschreibung ohne Titel",
    buyerName: asText(pickField(raw, ["buyer-name", "organisation-name-buyer", "AA", "buyer"])),
    description: asText(pickField(raw, ["description-lot", "description-proc", "short-description", "DS"])),
    country: asText(
      pickField(raw, ["place-of-performance-country", "country-buyer", "CY", "ISO_COUNTRY"]),
    ),
    publicationDate: asDate(pickField(raw, ["publication-date", "PD", "publication-date-notice"])),
    deadline: asDate(
      pickField(raw, ["deadline-receipt-tender-date-lot", "deadline-receipt-request-lot", "DT"]),
    ),
    noticeUrl: extractNoticeUrl(raw),
    raw,
  };
}

/**
 * Fragt aktuelle TED-Ausschreibungen fuer die Event-relevanten CPV-Codes ab.
 * @param sinceDate ISO-Datum (YYYY-MM-DD), Standard: letzte 14 Tage.
 */
export async function fetchTedNotices(sinceDate?: string): Promise<TedNotice[]> {
  const since = sinceDate ?? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cpvQuery = EVENT_CPV_CODES.join(" OR classification-cpv=");
  const query = `(classification-cpv=${cpvQuery}) AND publication-date>=${since.replace(/-/g, "")}`;

  const response = await fetch(TED_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      fields: [
        "publication-number",
        "notice-title",
        "buyer-name",
        "description-lot",
        "place-of-performance-country",
        "publication-date",
        "deadline-receipt-tender-date-lot",
        "links",
      ],
      page: 1,
      limit: 100,
      scope: "ALL",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TED-API antwortete mit ${response.status}: ${body.slice(0, 500)}`);
  }

  const json = (await response.json()) as TedSearchResponse;
  const rawNotices = json.notices ?? json.results ?? [];
  return rawNotices.map(mapNotice);
}
