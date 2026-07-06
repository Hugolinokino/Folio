import { invoke } from '@tauri-apps/api/core';

export interface StrategyWorkspaceSummary {
  id: string;
  title: string;
  horizon: string;
}

/** Raw JSON string per column — opaque to Rust, assembled/split only here. */
export interface StrategyDataDto {
  swotPestelStakeholders: string | null;
  foresightRadar: string | null;
  timelinesScenarios: string | null;
  optionsMatrix: string | null;
  wargamingSimulation: string | null;
  executionKpis: string | null;
  journalRetro: string | null;
}

export const strategieApi = {
  listWorkspaces: () => invoke<StrategyWorkspaceSummary[]>('list_strategy_workspaces'),
  createWorkspace: (title: string, horizon: string) =>
    invoke<StrategyWorkspaceSummary>('create_strategy_workspace', { title, horizon }),
  getData: (workspaceId: string) => invoke<StrategyDataDto>('get_strategy_data', { workspaceId }),
  saveData: (workspaceId: string, data: StrategyDataDto) =>
    invoke<void>('save_strategy_data', { workspaceId, data }),
};
