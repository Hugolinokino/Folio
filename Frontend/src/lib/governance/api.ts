import { invoke } from '@tauri-apps/api/core';

export interface GovernanceWorkspaceSummary {
  id: string;
  title: string;
  rechtsform: string;
}

/** Raw JSON string per Board — opaque to Rust, assembled/split only here. */
export interface GovernanceDataDto {
  normenwerk: string | null;
  verweisnetz: string | null;
  organeKompetenzen: string | null;
  prozesseKontrolle: string | null;
  compliance: string | null;
  scorecard: string | null;
  reformSimulator: string | null;
}

export const governanceApi = {
  listWorkspaces: () => invoke<GovernanceWorkspaceSummary[]>('list_governance_workspaces'),
  createWorkspace: (title: string, rechtsform: string) =>
    invoke<GovernanceWorkspaceSummary>('create_governance_workspace', { title, rechtsform }),
  renameWorkspace: (workspaceId: string, title: string) => invoke<void>('rename_governance_workspace', { workspaceId, title }),
  deleteWorkspace: (workspaceId: string) => invoke<void>('delete_governance_workspace', { workspaceId }),
  getData: (workspaceId: string) => invoke<GovernanceDataDto>('get_governance_data', { workspaceId }),
  saveData: (workspaceId: string, data: GovernanceDataDto) =>
    invoke<void>('save_governance_data', { workspaceId, data }),
};
