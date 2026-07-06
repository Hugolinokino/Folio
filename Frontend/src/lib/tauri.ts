import { invoke } from '@tauri-apps/api/core';

export interface CaseSummary {
  id: string;
  title: string;
  ref: string;
  phase: string;
}

export interface WorkspaceInfo {
  displayName: string;
}

export const api = {
  hasWorkspace: () => invoke<boolean>('has_workspace'),
  createWorkspace: (passphrase: string, displayName: string) =>
    invoke<void>('create_workspace', { passphrase, displayName }),
  unlockWorkspace: (passphrase: string) => invoke<void>('unlock_workspace', { passphrase }),
  getWorkspaceInfo: () => invoke<WorkspaceInfo>('get_workspace_info'),
  listCases: () => invoke<CaseSummary[]>('list_cases'),
  createCase: (title: string, caseRef: string, phase: string) =>
    invoke<CaseSummary>('create_case', { title, caseRef, phase }),
};
