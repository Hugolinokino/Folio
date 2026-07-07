import type { SourceDto } from './api';

/** Deterministic citation formatting following Forstmoser/Ogorek/Schindler,
 * Juristisches Arbeiten (7. A. Zürich 2023), § 18 — no AI, pure templating.
 * Vollzitat = entry for the Verzeichnis; Kurzzitat = footnote form. */

export interface KurzzitatOptions {
  /** BGE: Erwägung, z.B. "3.5.1" */
  erwaegung?: string;
  /** BGE: konkrete Seite / Literatur & Materialien: Fundstelle (S. oder Rz.) */
  fundstelle?: string;
  /** Gesetz: Artikel */
  artikel?: string;
  /** Gesetz: Absatz */
  absatz?: string;
  /** Gesetz: Ziffer/Bst. */
  ziffer?: string;
}

const t = (s?: string | null) => (s ?? '').trim();

/** "Koller Alfred/Forstmoser Peter" → "Koller/Forstmoser" — the footnote
 * uses last names only; entry convention is "Nachname Vorname" per author. */
function lastNames(author: string): string {
  return author
    .split('/')
    .map((a) => a.trim().split(/\s+/)[0])
    .filter(Boolean)
    .join('/');
}

/** Vollzitat für das jeweilige Verzeichnis. */
export function formatVollzitat(source: SourceDto): string {
  const title = t(source.title);
  const key = t(source.citationKey);
  const author = t(source.author);
  const edition = t(source.edition);
  const place = t(source.place);
  const year = source.year != null ? String(source.year) : '';

  switch (source.type) {
    case 'BGE':
      // Amtlich publizierte Entscheide stehen für sich: "BGE 145 IV 364."
      return `${key || title}.`;
    case 'Gesetz': {
      // "Bundesgesetz über ... (Kartellgesetz, KG) vom 6. Oktober 1995 (SR 251)."
      const abbrev = key && key !== title ? ` (${key})` : '';
      return `${title}${abbrev}${year ? `, ${year}` : ''}.`;
    }
    case 'Literatur': {
      // "Koller Alfred: Schweizerisches Obligationenrecht, AT (4. A. Bern 2017)."
      const imprint = [edition ? `${edition.replace(/\.?\s*A\.?$/i, '')}. A.` : '', place, year]
        .filter(Boolean)
        .join(' ');
      const head = author ? `${author}: ${title}` : title;
      return `${head}${imprint ? ` (${imprint})` : ''}.`;
    }
    case 'Materialien':
    default: {
      // "Botschaft ... vom 2008, BBl ... (zit. Botsch. X)."
      const zit = key && key !== title ? ` (zit. ${key})` : '';
      return `${title}${year ? `, ${year}` : ''}${zit}.`;
    }
  }
}

/** Kurzzitat (Fussnote) mit typspezifischer Fundstelle. */
export function formatKurzzitat(source: SourceDto, opts: KurzzitatOptions = {}): string {
  const key = t(source.citationKey);
  const title = t(source.title);
  const author = t(source.author);
  const erw = t(opts.erwaegung);
  const fundstelle = t(opts.fundstelle);
  const artikel = t(opts.artikel);
  const absatz = t(opts.absatz);
  const ziffer = t(opts.ziffer);

  switch (source.type) {
    case 'BGE': {
      const ref = key || title;
      if (/^BGE/i.test(ref)) {
        // "BGE 145 IV 364 E. 3.5.1 S. 371."
        return `${ref}${erw ? ` E. ${erw}` : ''}${fundstelle ? ` S. ${fundstelle}` : ''}.`;
      }
      // Nicht amtlich publiziert: "Urteil des Bundesgerichts 1C_344/2017 E. 4.1."
      return `Urteil des Bundesgerichts ${ref}${source.year != null ? ` (${source.year})` : ''}${erw ? ` E. ${erw}` : ''}.`;
    }
    case 'Gesetz': {
      // "Art. 74 Abs. 2 Ziff. 2 KG."
      const abbrev = key || title;
      if (!artikel) return `${abbrev}.`;
      return `Art. ${artikel}${absatz ? ` Abs. ${absatz}` : ''}${ziffer ? ` Ziff. ${ziffer}` : ''} ${abbrev}.`;
    }
    case 'Literatur': {
      // "Koller, 52." bzw. "Koller, § 38 Rz. 18."
      const name = author ? lastNames(author) : key || title;
      return `${name}${fundstelle ? `, ${fundstelle}` : ''}.`;
    }
    case 'Materialien':
    default: {
      const zit = key || title;
      return `${zit}${fundstelle ? `, ${fundstelle}` : ''}.`;
    }
  }
}

/** Verzeichnisse nach Forstmoser-Gliederung; Literatur alphabetisch nach
 * Nachnamen, Erlasse/Judikatur in Erfassungsreihenfolge. */
export function buildBibliography(sources: SourceDto[]): { label: string; entries: string[] }[] {
  const sections: { label: string; type: string; sort: boolean }[] = [
    { label: 'Literaturverzeichnis', type: 'Literatur', sort: true },
    { label: 'Rechtsprechungsverzeichnis', type: 'BGE', sort: false },
    { label: 'Erlassverzeichnis', type: 'Gesetz', sort: false },
    { label: 'Materialienverzeichnis', type: 'Materialien', sort: false },
  ];
  return sections
    .map(({ label, type, sort }) => {
      const entries = sources.filter((s) => s.type === type).map(formatVollzitat);
      if (sort) entries.sort((a, b) => a.localeCompare(b, 'de'));
      return { label, entries };
    })
    .filter((section) => section.entries.length > 0);
}
