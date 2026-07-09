use crate::documents::{self, BibliographySection, DocSection};
use crate::AppState;

fn fetch_chapters(conn: &rusqlite::Connection, project_id: &str) -> rusqlite::Result<Vec<DocSection>> {
    let mut stmt = conn.prepare(
        "SELECT title, content FROM chapters WHERE project_id = ?1 ORDER BY sort_order ASC, rowid ASC",
    )?;
    let rows = stmt.query_map(rusqlite::params![project_id], |row| {
        Ok(DocSection { heading: row.get(0)?, body: row.get(1)? })
    })?;
    rows.collect()
}

fn fetch_project_title(conn: &rusqlite::Connection, project_id: &str) -> rusqlite::Result<String> {
    conn.query_row("SELECT title FROM projects WHERE id = ?1", rusqlite::params![project_id], |r| r.get(0))
}

#[tauri::command]
pub fn export_chapters_markdown(state: tauri::State<AppState>, project_id: String) -> Result<String, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let title = fetch_project_title(conn, &project_id).map_err(|e| e.to_string())?;
    let chapters = fetch_chapters(conn, &project_id).map_err(|e| e.to_string())?;
    Ok(documents::build_markdown(&title, &chapters))
}

#[tauri::command]
pub fn export_chapters_latex(state: tauri::State<AppState>, project_id: String, bibliography: Vec<BibliographySection>) -> Result<String, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let title = fetch_project_title(conn, &project_id).map_err(|e| e.to_string())?;
    let chapters = fetch_chapters(conn, &project_id).map_err(|e| e.to_string())?;
    Ok(documents::build_latex(&title, &chapters, &bibliography))
}

#[tauri::command]
pub fn export_chapters_docx(
    state: tauri::State<AppState>,
    project_id: String,
    path: String,
    bibliography: Vec<BibliographySection>,
) -> Result<(), String> {
    let (title, chapters) = {
        let guard = state.conn.lock().unwrap();
        let conn = guard.as_ref().ok_or("Workspace is locked.")?;
        (fetch_project_title(conn, &project_id).map_err(|e| e.to_string())?, fetch_chapters(conn, &project_id).map_err(|e| e.to_string())?)
    };
    documents::write_docx(&title, &chapters, &bibliography, std::path::Path::new(&path))
}

#[tauri::command]
pub fn export_chapters_pdf(
    state: tauri::State<AppState>,
    project_id: String,
    path: String,
    bibliography: Vec<BibliographySection>,
) -> Result<(), String> {
    let (title, chapters) = {
        let guard = state.conn.lock().unwrap();
        let conn = guard.as_ref().ok_or("Workspace is locked.")?;
        (fetch_project_title(conn, &project_id).map_err(|e| e.to_string())?, fetch_chapters(conn, &project_id).map_err(|e| e.to_string())?)
    };
    documents::write_pdf(&title, &chapters, &bibliography, std::path::Path::new(&path))
}
