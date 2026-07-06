use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct StrategyWorkspaceSummary {
    id: String,
    title: String,
    horizon: String,
}

#[tauri::command]
pub fn list_strategy_workspaces(
    state: tauri::State<AppState>,
) -> Result<Vec<StrategyWorkspaceSummary>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, title, horizon FROM strategy_workspaces ORDER BY created_at ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(StrategyWorkspaceSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                horizon: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

#[tauri::command]
pub fn create_strategy_workspace(
    state: tauri::State<AppState>,
    title: String,
    horizon: String,
) -> Result<StrategyWorkspaceSummary, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("strategy-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO strategy_workspaces (id, title, horizon) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, title, horizon],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO strategy_data (workspace_id) VALUES (?1)",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(StrategyWorkspaceSummary { id, title, horizon })
}

/// Rust never interprets these blobs — each column is an opaque JSON string
/// slice of the frontend's unified per-workspace state. The split across
/// seven columns follows the spec's schema; only the frontend store knows
/// how to assemble/disassemble them into one coherent object.
#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StrategyDataDto {
    pub swot_pestel_stakeholders: Option<String>,
    pub foresight_radar: Option<String>,
    pub timelines_scenarios: Option<String>,
    pub options_matrix: Option<String>,
    pub wargaming_simulation: Option<String>,
    pub execution_kpis: Option<String>,
    pub journal_retro: Option<String>,
}

#[tauri::command]
pub fn get_strategy_data(
    state: tauri::State<AppState>,
    workspace_id: String,
) -> Result<StrategyDataDto, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.query_row(
        "SELECT swot_pestel_stakeholders, foresight_radar, timelines_scenarios, \
                options_matrix, wargaming_simulation, execution_kpis, journal_retro \
         FROM strategy_data WHERE workspace_id = ?1",
        rusqlite::params![workspace_id],
        |row| {
            Ok(StrategyDataDto {
                swot_pestel_stakeholders: row.get(0)?,
                foresight_radar: row.get(1)?,
                timelines_scenarios: row.get(2)?,
                options_matrix: row.get(3)?,
                wargaming_simulation: row.get(4)?,
                execution_kpis: row.get(5)?,
                journal_retro: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_strategy_data(
    state: tauri::State<AppState>,
    workspace_id: String,
    data: StrategyDataDto,
) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "UPDATE strategy_data SET swot_pestel_stakeholders = ?2, foresight_radar = ?3, \
         timelines_scenarios = ?4, options_matrix = ?5, wargaming_simulation = ?6, \
         execution_kpis = ?7, journal_retro = ?8 WHERE workspace_id = ?1",
        rusqlite::params![
            workspace_id,
            data.swot_pestel_stakeholders,
            data.foresight_radar,
            data.timelines_scenarios,
            data.options_matrix,
            data.wargaming_simulation,
            data.execution_kpis,
            data.journal_retro,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
