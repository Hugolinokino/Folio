import type { SourceDto } from './api';

export interface CitationOptions {
  erwaegung?: string;
  zusatz?: string;
}

/** Deterministic Swiss-style footnote formatter — pure string templating, no AI. */
export function formatCitation(source: SourceDto, opts: CitationOptions = {}): string {
  const erw = opts.erwaegung?.trim();
  const zusatz = opts.zusatz?.trim();
  const tail = [erw, zusatz].filter(Boolean).join(', ');

  switch (source.type) {
    case 'BGE':
    case 'Gesetz':
      return `${source.citationKey}${tail ? ` ${tail}` : ''}.`;
    case 'Literatur': {
      const parts = [source.author, source.title].filter(Boolean);
      const base = parts.join(', ');
      const withYear = source.year ? `${base}, ${source.year}` : base;
      return `${withYear}${tail ? `, ${tail}` : ''}.`;
    }
    case 'Materialien':
    default: {
      const parts = [source.title, source.author, source.year != null ? String(source.year) : null].filter(Boolean);
      const base = parts.join(', ');
      return `${base}${tail ? `, ${tail}` : ''}.`;
    }
  }
}

/** Groups sources by type into ordered bibliography sections for the Verzeichnis-Builder / export. */
export function buildBibliography(sources: SourceDto[]): { label: string; entries: string[] }[] {
  const order = ['BGE', 'Gesetz', 'Literatur', 'Materialien'];
  const labels: Record<string, string> = {
    BGE: 'Rechtsprechung',
    Gesetz: 'Erlassverzeichnis',
    Literatur: 'Literaturverzeichnis',
    Materialien: 'Materialien',
  };
  return order
    .map((type) => ({
      label: labels[type],
      entries: sources.filter((s) => s.type === type).map((s) => formatCitation(s)),
    }))
    .filter((section) => section.entries.length > 0);
}
