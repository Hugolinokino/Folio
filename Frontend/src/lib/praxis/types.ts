export interface CaseSummary {
  id: string;
  title: string;
  ref: string;
  phase: string;
  gebiet: string | null;
  color: string | null;
}

export interface Partei {
  id: string;
  rolle: string;
  name: string;
  detail: string;
  vertreter: string;
  klient: boolean;
}

export interface Frist {
  id: string;
  titel: string;
  dueDateIso: string;
  datum: string;
  tage: number;
  art: string;
  note: string;
  completed: boolean;
}

export interface Akte {
  id: string;
  nr: string;
  titel: string;
  absender: string;
  typ: string;
  ordner: string;
  seiten: number | null;
  filePath: string;
  content: string | null;
  datum: string;
  clusterId: number | null;
}

export interface ChronoEvent {
  id: string;
  datum: string;
  ereignis: string;
  beleg: string;
}

export interface Korrespondenz {
  id: string;
  datum: string;
  richtung: 'ein' | 'aus';
  von: string;
  betreff: string;
  typ: string;
}

export interface HonorarEntry {
  id: string;
  datum: string;
  taetigkeit: string;
  minuten: number;
}

export interface Entwurf {
  id: string;
  titel: string;
  typ: string;
  status: string;
  content: string;
  updated: string;
  words: number;
}

export interface Fall {
  id: string;
  ref: string;
  title: string;
  phase: string;
  streitwert: string;
  gebiet: string;
  kurz: string;
  verfahren: string;
  gericht: string;
  nr: string;
  color: string;
  rolleKlient: string;
  rate: number;
  budget: number;
  parteien: Partei[];
  fristen: Frist[];
  nextFrist: Frist | null;
  akten: Akte[];
  chrono: ChronoEvent[];
  korrespondenz: Korrespondenz[];
  honorar: { rate: number; budget: number; entries: HonorarEntry[]; total: number };
  entwuerfe: Entwurf[];
}

/** Fristenradar row: a deadline plus enough of its parent case to navigate/display. */
export interface RadarRow extends Frist {
  caseId: string;
  caseTitle: string;
  caseRef: string;
}
