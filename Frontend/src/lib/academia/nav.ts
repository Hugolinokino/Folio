import type { IconName } from '../../components/Icon';
import type { ProjectDto } from './api';

export type AcademiaViewId = string; // 'a-home' | `project:${projectId}`

export function academiaMeta(view: AcademiaViewId, projects: ProjectDto[]): { label: string; icon: IconName } {
  if (view === 'a-home') return { label: 'Startseite', icon: 'home' };
  if (view.startsWith('project:')) {
    const id = view.slice(8);
    const p = projects.find((x) => x.id === id);
    return { label: p ? p.title : 'Projekt', icon: 'book' };
  }
  return { label: view, icon: 'doc' };
}
