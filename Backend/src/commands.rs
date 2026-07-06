use crate::{auth, db, AppState};
use serde::Serialize;
use tauri::Manager;

pub fn app_data_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_workspace(app: tauri::AppHandle) -> Result<bool, String> {
    let dir = app_data_dir(&app)?;
    Ok(db::db_path(&dir).exists())
}

#[tauri::command]
pub fn create_workspace(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    passphrase: String,
    display_name: String,
) -> Result<(), String> {
    if passphrase.trim().chars().count() < 8 {
        return Err("Passphrase must be at least 8 characters.".into());
    }
    let dir = app_data_dir(&app)?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let db_path = db::db_path(&dir);
    if db_path.exists() {
        return Err("A workspace already exists on this machine.".into());
    }

    let salt = auth::generate_salt();
    let key_hex = auth::derive_key(&passphrase, &salt)?;
    let cfg = auth::AuthConfig {
        salt_hex: hex::encode(salt),
        display_name: display_name.trim().to_string(),
    };
    let cfg_json = serde_json::to_string_pretty(&cfg).map_err(|e| e.to_string())?;
    std::fs::write(auth::config_path(&dir), cfg_json).map_err(|e| e.to_string())?;

    let conn = db::open_and_key(&db_path, &key_hex).map_err(|e| e.to_string())?;
    db::migrate(&conn).map_err(|e| e.to_string())?;
    *state.conn.lock().unwrap() = Some(conn);
    Ok(())
}

#[derive(Serialize)]
pub struct WorkspaceInfo {
    display_name: String,
}

#[tauri::command]
pub fn get_workspace_info(app: tauri::AppHandle) -> Result<WorkspaceInfo, String> {
    let dir = app_data_dir(&app)?;
    let cfg_str = std::fs::read_to_string(auth::config_path(&dir)).map_err(|e| e.to_string())?;
    let cfg: auth::AuthConfig = serde_json::from_str(&cfg_str).map_err(|e| e.to_string())?;
    Ok(WorkspaceInfo { display_name: cfg.display_name })
}

#[tauri::command]
pub fn unlock_workspace(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    passphrase: String,
) -> Result<(), String> {
    let dir = app_data_dir(&app)?;
    let db_path = db::db_path(&dir);
    if !db_path.exists() {
        return Err("No workspace found yet \u{2014} create one first.".into());
    }

    let cfg_str = std::fs::read_to_string(auth::config_path(&dir)).map_err(|e| e.to_string())?;
    let cfg: auth::AuthConfig = serde_json::from_str(&cfg_str).map_err(|e| e.to_string())?;
    let salt = hex::decode(&cfg.salt_hex).map_err(|e| e.to_string())?;
    let key_hex = auth::derive_key(&passphrase, &salt)?;

    let conn = db::open_and_key(&db_path, &key_hex).map_err(|_| "Incorrect passphrase.".to_string())?;
    db::migrate(&conn).map_err(|e| e.to_string())?;
    *state.conn.lock().unwrap() = Some(conn);
    Ok(())
}

