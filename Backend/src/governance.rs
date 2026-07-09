use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct GovernanceWorkspaceSummary {
    id: String,
    title: String,
    rechtsform: String,
}

#[tauri::command]
pub fn list_governance_workspaces(
    state: tauri::State<AppState>,
) -> Result<Vec<GovernanceWorkspaceSummary>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, title, rechtsform FROM governance_workspaces ORDER BY created_at ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(GovernanceWorkspaceSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                rechtsform: row.get(2)?,
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
pub fn create_governance_workspace(
    state: tauri::State<AppState>,
    title: String,
    rechtsform: String,
) -> Result<GovernanceWorkspaceSummary, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("gov-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO governance_workspaces (id, title, rechtsform) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, title, rechtsform],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO governance_data (workspace_id) VALUES (?1)",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(GovernanceWorkspaceSummary { id, title, rechtsform })
}

#[tauri::command]
pub fn rename_governance_workspace(state: tauri::State<AppState>, workspace_id: String, title: String) -> Result<(), String> {
    let title = title.trim();
    if title.is_empty() {
        return Err("Titel darf nicht leer sein.".to_string());
    }
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("UPDATE governance_workspaces SET title = ?2 WHERE id = ?1", rusqlite::params![workspace_id, title])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Deletes a Mandat; its `governance_data` row cascades via FK.
#[tauri::command]
pub fn delete_governance_workspace(state: tauri::State<AppState>, workspace_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("DELETE FROM governance_workspaces WHERE id = ?1", rusqlite::params![workspace_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Rust never interprets these blobs — each column is an opaque JSON string
/// slice of the frontend's unified per-Mandat state, one per Board. Only the
/// frontend store knows how to assemble/disassemble them into one object.
#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GovernanceDataDto {
    pub normenwerk: Option<String>,
    pub verweisnetz: Option<String>,
    pub organe_kompetenzen: Option<String>,
    pub prozesse_kontrolle: Option<String>,
    pub compliance: Option<String>,
    pub scorecard: Option<String>,
    pub reform_simulator: Option<String>,
}

#[tauri::command]
pub fn get_governance_data(
    state: tauri::State<AppState>,
    workspace_id: String,
) -> Result<GovernanceDataDto, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.query_row(
        "SELECT normenwerk, verweisnetz, organe_kompetenzen, prozesse_kontrolle, \
                compliance, scorecard, reform_simulator \
         FROM governance_data WHERE workspace_id = ?1",
        rusqlite::params![workspace_id],
        |row| {
            Ok(GovernanceDataDto {
                normenwerk: row.get(0)?,
                verweisnetz: row.get(1)?,
                organe_kompetenzen: row.get(2)?,
                prozesse_kontrolle: row.get(3)?,
                compliance: row.get(4)?,
                scorecard: row.get(5)?,
                reform_simulator: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_governance_data(
    state: tauri::State<AppState>,
    workspace_id: String,
    data: GovernanceDataDto,
) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "UPDATE governance_data SET normenwerk = ?2, verweisnetz = ?3, organe_kompetenzen = ?4, \
         prozesse_kontrolle = ?5, compliance = ?6, scorecard = ?7, reform_simulator = ?8 WHERE workspace_id = ?1",
        rusqlite::params![
            workspace_id,
            data.normenwerk,
            data.verweisnetz,
            data.organe_kompetenzen,
            data.prozesse_kontrolle,
            data.compliance,
            data.scorecard,
            data.reform_simulator,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
