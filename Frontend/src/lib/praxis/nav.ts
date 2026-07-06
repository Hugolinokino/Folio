import type { IconName } from '../../components/Icon';
import type { CaseSummaryDto } from './api';

export type PraxisViewId = string; // 'p-home' | `fall:${caseId}` | `wb:${caseId}:${draftId}`

export function praxisMeta(view: PraxisViewId, cases: CaseSummaryDto[]): { label: string; icon: IconName } {
  if (view === 'p-home') return { label: 'Startseite', icon: 'home' };
  if (view.startsWith('fall:')) {
    const id = view.slice(5);
    const f = cases.find((c) => c.id === id);
    return { label: f ? f.title : 'Fall', icon: 'scales' };
  }
  if (view.startsWith('wb:')) return { label: 'Workbench', icon: 'pen' };
  return { label: view, icon: 'doc' };
}
