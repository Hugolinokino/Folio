import type { IconName } from '../../components/Icon';

export type StrategieViewId =
  | 's-home'
  | 's-analyse'
  | 's-foresight'
  | 's-timeline'
  | 's-optionen'
  | 's-wargame'
  | 's-execution'
  | 's-journal';

export interface StrategieModuleMeta {
  id: StrategieViewId;
  num: string;
  titel: string;
  icon: IconName;
  desc: string;
}

export const ST_MODULES: StrategieModuleMeta[] = [
  { id: 's-analyse', num: '01', titel: 'Analyse', icon: 'grid', desc: 'SWOT/TOWS, Stakeholder-Matrix, PESTEL — die Diagnose.' },
  { id: 's-foresight', num: '02', titel: 'Foresight', icon: 'sparkle', desc: 'Trend-Radar, Weak Signals, Assumption Log.' },
  { id: 's-timeline', num: '03', titel: 'Zukunftslinien', icon: 'graph', desc: 'Mehrsträngige Szenarien mit Backcasting bis 2031.' },
  { id: 's-optionen', num: '04', titel: 'Optionen & Entscheid', icon: 'columns', desc: 'Optionskarten, gewichtete Matrix, Pre-Mortem.' },
  { id: 's-wargame', num: '05', titel: 'Wargaming', icon: 'flag', desc: 'Reaktionsketten durchspielen, Rotes Team befragen.' },
  { id: 's-execution', num: '06', titel: 'Umsetzung', icon: 'check', desc: 'Initiativen, Kennzahlen, Kill-Kriterien-Register.' },
  { id: 's-journal', num: '07', titel: 'Gedächtnis', icon: 'archive', desc: 'Entscheidungsjournal & Retrospektiven.' },
];

export function strategieMeta(id: string): { label: string; icon: IconName } {
  if (id === 's-home') return { label: 'Startseite', icon: 'home' };
  const m = ST_MODULES.find((x) => x.id === id);
  return m ? { label: m.titel, icon: m.icon } : { label: id, icon: 'doc' };
}
