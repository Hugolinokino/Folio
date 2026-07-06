import type { StrategieViewId } from './modules';

export interface Meta {
  vorhaben: string;
  horizont: string;
  /** Fractional year (e.g. 2026.5), computed live from the real clock — never persisted. */
  heute: number;
  heuteLabel: string;
}

export interface Akteur {
  id: string;
  name: string;
  rolle: 'Gegenspieler' | 'Stakeholder' | 'Partner';
  macht: number;
  interesse: number;
  ziele: string[];
  ressourcen: string;
  muster: string;
  tags: string[];
}

export type PestelKey = 'P' | 'E' | 'S' | 'T' | 'Ö' | 'L';

export interface Faktor {
  id: string;
  titel: string;
  art: 'Trend' | 'Signal' | 'Umweltfaktor';
  pestel: PestelKey;
  unsicherheit: number;
  impact: number;
  horizont: 'kurz' | 'mittel' | 'lang' | 'unklar';
  quelle: string;
  datum: string;
  relevanz: number;
  note: string;
  links: string[];
}

export interface Annahme {
  id: string;
  text: string;
  falsifikation: string;
  pruefdatum: string;
  /** Countdown days to pruefdatum — null until a parseable date is set. */
  tage: number | null;
  status: 'offen' | 'bestätigt' | 'kritisch' | 'falsifiziert';
  links: string[];
}

export interface SwotItem {
  id: string;
  text: string;
}
export interface Swot {
  S: SwotItem[];
  W: SwotItem[];
  O: SwotItem[];
  T: SwotItem[];
}
export interface Tows {
  SO: string;
  ST: string;
  WO: string;
  WT: string;
}

export interface Entscheidungspunkt {
  id: string;
  jahr: number;
  kurz: string;
  titel: string;
  tage: number;
  datum: string;
}

export interface StrangEvent {
  jahr: number;
  titel: string;
  art: 'ms' | 'ziel';
}
export interface Strang {
  id: string;
  titel: string;
  art: 'ziel' | 'basis' | 'stress' | 'wild';
  prob: number;
  parent: string;
  branch: number;
  laneY: number;
  kurz: string;
  zielbild: string;
  events: StrangEvent[];
  backcast: string[];
  links: string[];
}

export interface Zug {
  id: string;
  titel: string;
  status: 'offen' | 'laufend' | 'erledigt';
}
export interface Premortem {
  id: string;
  grund: string;
  gegen: string;
}
export interface Option {
  id: string;
  titel: string;
  these: string;
  reversibilitaet: number;
  ressourcen: number;
  optionswert: number;
  passung: number;
  horizont: string;
  status: 'pilot' | 'laufend' | 'geprüft' | 'zurückgestellt';
  zuege: Zug[];
  premortem: Premortem[];
  links: string[];
}
export interface MatrixKriterium {
  id: string;
  label: string;
  gewicht: number;
  invers: boolean;
}
export interface Matrix {
  kriterien: MatrixKriterium[];
}

export interface WargameZug {
  akteur: string;
  text: string;
  folge: string;
  ki?: boolean;
}
export interface WargameRunde {
  nr: number;
  zuege: WargameZug[];
}
export interface Wargame {
  runden: WargameRunde[];
}

export interface Meilenstein {
  titel: string;
  datum: string;
  done: boolean;
}
export interface Kennzahl {
  name: string;
  ziel: number;
  ist: number;
  einheit: string;
}
export interface KillKriterium {
  text: string;
  status: 'ok' | 'beobachten' | 'ausgelöst';
}
export interface Initiative {
  id: string;
  titel: string;
  option: string;
  status: 'geplant' | 'laufend' | 'abgeschlossen' | 'gestoppt';
  meilensteine: Meilenstein[];
  kennzahlen: Kennzahl[];
  kill: KillKriterium[];
}

export interface JournalEntry {
  id: string;
  datum: string;
  titel: string;
  entscheid: string;
  begruendung: string;
  infolage: string;
  beteiligte: string;
  erwartung: string;
  ergebnis: string | null;
  abweichung: string | null;
  links: string[];
}

export interface Loop {
  id: string;
  typ: 'R' | 'B';
  titel: string;
  kette: string[];
}

export const DEFAULT_MATRIX_KRITERIEN: MatrixKriterium[] = [
  { id: 'passung', label: 'Passung Zielbild', gewicht: 30, invers: false },
  { id: 'optionswert', label: 'Optionswert', gewicht: 25, invers: false },
  { id: 'reversibilitaet', label: 'Reversibilität', gewicht: 25, invers: false },
  { id: 'ressourcen', label: 'Ressourcenbedarf', gewicht: 20, invers: true },
];

export interface Vorhaben {
  meta: Meta;
  akteure: Akteur[];
  faktoren: Faktor[];
  annahmen: Annahme[];
  swot: Swot;
  tows: Tows;
  entscheidungspunkte: Entscheidungspunkt[];
  straenge: Strang[];
  optionen: Option[];
  matrix: Matrix;
  wargame: Wargame;
  initiativen: Initiative[];
  journal: JournalEntry[];
  loops: Loop[];
}

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

/** Fresh "today" marker for the timeline — recomputed on every load, never persisted. */
export function liveMeta(vorhaben: string, horizont: string): Meta {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const heute = now.getFullYear() + (now.getTime() - start.getTime()) / (365 * 24 * 3600 * 1000);
  const heuteLabel = `${now.getDate()}. ${MONATE[now.getMonth()]} ${now.getFullYear()}`;
  return { vorhaben, horizont, heute, heuteLabel };
}

export function emptyVorhaben(titel: string, horizont: string): Vorhaben {
  return {
    meta: liveMeta(titel || 'Neues Vorhaben', horizont || ''),
    akteure: [],
    faktoren: [],
    annahmen: [],
    swot: { S: [], W: [], O: [], T: [] },
    tows: { SO: '', ST: '', WO: '', WT: '' },
    entscheidungspunkte: [],
    straenge: [],
    optionen: [],
    matrix: { kriterien: DEFAULT_MATRIX_KRITERIEN },
    wargame: { runden: [{ nr: 1, zuege: [] }] },
    initiativen: [],
    journal: [],
    loops: [],
  };
}

export const ST_TYP: Record<string, { label: string; view: StrategieViewId }> = {
  ak: { label: 'Akteur', view: 's-analyse' },
  fk: { label: 'Faktor', view: 's-foresight' },
  an: { label: 'Annahme', view: 's-foresight' },
  sz: { label: 'Szenario', view: 's-timeline' },
  op: { label: 'Option', view: 's-optionen' },
  zg: { label: 'Zug', view: 's-optionen' },
  in: { label: 'Initiative', view: 's-execution' },
  jr: { label: 'Entscheidung', view: 's-journal' },
  ep: { label: 'Entscheidungspunkt', view: 's-timeline' },
  sw: { label: 'SWOT', view: 's-analyse' },
  lp: { label: 'Loop', view: 's-foresight' },
};

export function typOf(id: string): { label: string; view: StrategieViewId } {
  return ST_TYP[id.slice(0, 2)] || { label: 'Objekt', view: 's-home' };
}

/** Any object carrying an id + a displayable label field. */
type Linkable = { id: string; titel?: string; name?: string; text?: string };

export function findInVorhaben(d: Vorhaben, id: string): Linkable | null {
  const all: Linkable[] = [
    ...d.akteure,
    ...d.faktoren,
    ...d.annahmen,
    ...d.straenge,
    ...d.optionen,
    ...d.initiativen,
    ...d.journal,
    ...d.entscheidungspunkte,
    ...d.loops,
    ...d.optionen.flatMap((o) => o.zuege),
    ...(['S', 'W', 'O', 'T'] as const).flatMap((k) => d.swot[k]),
  ];
  return all.find((o) => o.id === id) || null;
}

export function titleOf(d: Vorhaben, id: string): string {
  const o = findInVorhaben(d, id);
  return o ? o.titel || o.name || o.text || id : id;
}

export function backlinksOf(d: Vorhaben, id: string): string[] {
  const res: string[] = [];
  const scan = (o: { id: string; links?: string[] }) => {
    if (o.links && o.links.includes(id)) res.push(o.id);
  };
  [...d.akteure, ...d.faktoren, ...d.annahmen, ...d.straenge, ...d.optionen, ...d.initiativen, ...d.journal].forEach(
    scan as (o: { id: string; links?: string[] }) => void,
  );
  return res;
}

let seq = 0;
export function stId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;
}
