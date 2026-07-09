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
}

export const GV_MODULES: GovernanceModuleMeta[] = [
  { id: 'g-normen', num: '01', titel: 'Normenwerk', icon: 'book' },
  { id: 'g-netz', num: '02', titel: 'Verweisnetz', icon: 'graph' },
  { id: 'g-organe', num: '03', titel: 'Organe & Kompetenzen', icon: 'grid' },
  { id: 'g-prozesse', num: '04', titel: 'Prozesse & Kontrolle', icon: 'columns' },
  { id: 'g-compliance', num: '05', titel: 'Compliance', icon: 'time' },
  { id: 'g-scorecard', num: '06', titel: 'Scorecard', icon: 'check' },
  { id: 'g-simulator', num: '07', titel: 'Reform-Simulator', icon: 'sparkle' },
];

export function governanceMeta(id: string): { label: string; icon: IconName } {
  if (id === 'g-home') return { label: 'Startseite', icon: 'home' };
  const m = GV_MODULES.find((x) => x.id === id);
  return m ? { label: m.titel, icon: m.icon } : { label: id, icon: 'doc' };
}
