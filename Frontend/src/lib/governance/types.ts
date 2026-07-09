import type { GovernanceViewId } from './modules';

export interface GvMeta {
  mandat: string;
  rechtsform: string;
  /** Formatted "as of today" label, recomputed live on every load — never persisted. */
  stand: string;
}

export type ErlassStatus = 'in-kraft' | 'revision' | 'problem';

export interface ErlassVersion {
  datum: string;
  hinweis: string;
}

export interface Erlass {
  id: string;
  kurz: string;
  titel: string;
  typ: string;
  /** Normhierarchie-Stufe: 1 = Grundlagenerlass, 2 = Reglement, 3 = Subdelegation/Beschluss. */
  stufe: number;
  organ: string;
  erlass: string;
  revision: string;
  basis: string;
  basisRef: string | null;
  status: ErlassStatus;
  artikel: number;
  versionen: ErlassVersion[];
}

export type VerweisArt = 'Delegation' | 'Verweis' | 'Konkretisierung' | 'Kollision';

export interface Verweis {
  id: string;
  von: string;
  nach: string;
  art: VerweisArt;
  label: string;
}

export type BefundSchwere = 'hoch' | 'mittel' | 'tief';
export type BefundStatus = 'offen' | 'behoben' | 'beobachten';

export interface Befund {
  id: string;
  typ: string;
  schwere: BefundSchwere;
  fund: string;
  erlass: string;
  text: string;
  status: BefundStatus;
}

export interface Organ {
  id: string;
  name: string;
  kurz: string;
  art: string;
  quelle: string;
  mitglieder: string;
  /** Organ this one reports to, or null for the top organ (e.g. Generalversammlung). */
  bericht: string | null;
}

export interface Kompetenz {
  id: string;
  befugnis: string;
  organ: string;
  quelle: string;
  quorum: string;
  luecke: boolean;
}

export type RaciValue = 'R' | 'A' | 'C' | 'I' | '—';

export interface RaciRow {
  id: string;
  prozess: string;
  zellen: Record<string, RaciValue>;
  luecke: string | null;
}

export interface Unterschrift {
  id: string;
  wer: string;
  art: string;
  bereich: string;
  limite: string;
  quelle: string;
}

export interface ProzessSchritt {
  organ: string;
  aktion: string;
  frist: string | null;
  quorum: string | null;
  quelle: string;
}

export interface Prozess {
  id: string;
  titel: string;
  rechtsmittel: string | null;
  schritte: ProzessSchritt[];
}

export type CheckStatus = 'vorhanden' | 'teilweise' | 'fehlt';

export interface Check {
  id: string;
  bereich: string;
  mechanismus: string;
  status: CheckStatus;
  quelle: string | null;
  luecke: string | null;
}

export type KonfliktStatus = 'aktiv' | 'prüfen' | 'unbedenklich';

export interface Konflikt {
  id: string;
  rolle: string;
  konflikt: string;
  regel: string;
  offenlegung: string;
  status: KonfliktStatus;
}

export interface KalenderEintrag {
  id: string;
  titel: string;
  dueDateIso: string;
  organ: string;
  quelle: string;
  rhythmus: string;
}

export interface ScorecardDim {
  id: string;
  label: string;
  score: number;
  vorjahr: number;
  note: string;
}

export interface Benchmark {
  id: string;
  name: string;
  werte: Record<string, number>;
}

export type ReformAufwand = 'tief' | 'mittel' | 'hoch';

export interface ReformSchritt {
  organ: string;
  schritt: string;
}

export interface Reform {
  id: string;
  titel: string;
  aufwand: ReformAufwand;
  wirkung: ReformAufwand;
  these: string;
  beschlussweg: ReformSchritt[];
  erlasse: string[];
  behebt: string[];
  prozesse: string[];
  kompetenzen: string[];
  risiken: string[];
  delta: Record<string, number>;
}

export interface Mandat {
  meta: GvMeta;
  erlasse: Erlass[];
  verweise: Verweis[];
  befunde: Befund[];
  organe: Organ[];
  kompetenzen: Kompetenz[];
  raci: RaciRow[];
  unterschriften: Unterschrift[];
  prozesse: Prozess[];
  checks: Check[];
  konflikte: Konflikt[];
  kalender: KalenderEintrag[];
  scorecard: ScorecardDim[];
  benchmarks: Benchmark[];
  reformen: Reform[];
}

/** Fresh "as of today" marker, recomputed on every load — never persisted. */
export function liveMeta(mandat: string, rechtsform: string): GvMeta {
  return { mandat, rechtsform, stand: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) };
}

export function emptyMandat(titel: string, rechtsform: string): Mandat {
  return {
    meta: liveMeta(titel || 'Neues Mandat', rechtsform || ''),
    erlasse: [],
    verweise: [],
    befunde: [],
    organe: [],
    kompetenzen: [],
    raci: [],
    unterschriften: [],
    prozesse: [],
    checks: [],
    konflikte: [],
    kalender: [],
    scorecard: [],
    benchmarks: [],
    reformen: [],
  };
}

export const GV_TYP: Record<string, { label: string; view: GovernanceViewId }> = {
  gov: { label: 'Erlass', view: 'g-normen' },
  vw: { label: 'Verweis', view: 'g-netz' },
  bf: { label: 'Befund', view: 'g-netz' },
  og: { label: 'Organ', view: 'g-organe' },
  kp: { label: 'Kompetenz', view: 'g-organe' },
  pz: { label: 'Prozess', view: 'g-prozesse' },
  cb: { label: 'Check', view: 'g-prozesse' },
  ik: { label: 'Interessenkonflikt', view: 'g-compliance' },
  ka: { label: 'Termin', view: 'g-compliance' },
  rf: { label: 'Reform', view: 'g-simulator' },
};

/** Rückwärtstraversierung: alles, was (transitiv) auf `id` verweist — für den Revisions-Impact. */
export function gvImpact(d: Mandat, id: string): { erlass: string; via: Verweis }[] {
  const seen = new Set<string>();
  const queue = [id];
  const treffer: { erlass: string; via: Verweis }[] = [];
  while (queue.length) {
    const cur = queue.shift() as string;
    d.verweise.forEach((v) => {
      if (v.nach === cur && !seen.has(v.von)) {
        seen.add(v.von);
        treffer.push({ erlass: v.von, via: v });
        queue.push(v.von);
      }
    });
  }
  return treffer;
}

let seq = 0;
export function gvId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;
}
