import type { IconName } from '../../components/Icon';

export type GovernanceViewId =
  | 'g-home'
  | 'g-normen'
  | 'g-netz'
  | 'g-organe'
  | 'g-prozesse'
  | 'g-compliance'
  | 'g-scorecard'
  | 'g-simulator';

export interface GovernanceModuleMeta {
  id: GovernanceViewId;
  num: string;
  titel: string;
  icon: IconName;
  desc: string;
}

export const GV_MODULES: GovernanceModuleMeta[] = [
  { id: 'g-normen', num: '01', titel: 'Normenwerk', icon: 'book', desc: 'Normhierarchie-Baum & Erlass-Register mit Ermächtigungsprüfung.' },
  { id: 'g-netz', num: '02', titel: 'Verweisnetz', icon: 'graph', desc: 'Verbindungs-Graph, Konsistenz-Check & Revisions-Impact.' },
  { id: 'g-organe', num: '03', titel: 'Organe & Kompetenzen', icon: 'grid', desc: 'Kompetenzmatrix, RACI, Organigramm, Unterschriftenregister.' },
  { id: 'g-prozesse', num: '04', titel: 'Prozesse & Kontrolle', icon: 'columns', desc: 'Entscheidungsprozess-Mapper & Checks-&-Balances-Analyse.' },
  { id: 'g-compliance', num: '05', titel: 'Compliance', icon: 'time', desc: 'Pflichten-Kalender & Interessenkonflikt-Register.' },
  { id: 'g-scorecard', num: '06', titel: 'Scorecard', icon: 'check', desc: 'Governance-Reifegrad & Benchmark gegen Referenzmodelle.' },
  { id: 'g-simulator', num: '07', titel: 'Reform-Simulator', icon: 'sparkle', desc: '«Was wäre wenn» — Reformen mit Impact auf Graph, Matrix & Score.' },
];

export function governanceMeta(id: string): { label: string; icon: IconName } {
  if (id === 'g-home') return { label: 'Startseite', icon: 'home' };
  const m = GV_MODULES.find((x) => x.id === id);
  return m ? { label: m.titel, icon: m.icon } : { label: id, icon: 'doc' };
}
