use crate::commands::app_data_dir;
use crate::AppState;
use serde::Serialize;

const AC_COLORS: [&str; 5] = ["blue", "red", "green", "amber", "ink"];

/// Extracts unique `[[Title]]` / `[[Title|Alias]]` tokens from note content,
/// preserving first-seen order. Deliberately hand-rolled instead of pulling in
/// the `regex` crate for one small scan — bracket positions are always ASCII,
/// so byte-index slicing here never lands mid-character.
fn extract_wikilink_titles(content: &str) -> Vec<String> {
    let bytes = content.as_bytes();
    let mut titles: Vec<String> = Vec::new();
    let mut i = 0;
    while i + 1 < bytes.len() {
        if bytes[i] == b'[' && bytes[i + 1] == b'[' {
            if let Some(end) = content[i + 2..].find("]]") {
                let inner = &content[i + 2..i + 2 + end];
                let title = inner.split('|').next().unwrap_or(inner).trim().to_string();
                if !title.is_empty() && !titles.iter().any(|t| t.eq_ignore_ascii_case(&title)) {
                    titles.push(title);
                }
                i += 2 + end + 2;
                continue;
            }
        }
        i += 1;
    }
    titles
}

/// Records one line in a project's Aktivität feed. Called only from
/// creation/completion commands — never from autosave — so the feed stays a
/// meaningful log instead of a firehose of keystroke ticks.
fn log_activity(conn: &rusqlite::Connection, project_id: &str, message: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO activity_log (id, project_id, message) VALUES (?1, ?2, ?3)",
        rusqlite::params![format!("act-{}", uuid::Uuid::new_v4()), project_id, message],
    )?;
    Ok(())
}

// ============================================================
// Projects
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    id: String,
    title: String,
    r#type: String,
    advisor: Option<String>,
    due_date: Option<String>,
    progress: f64,
    color: String,
}

const PROJECT_COLS: &str = "id, title, type, advisor, due_date, progress, color";

fn row_to_project(row: &rusqlite::Row) -> rusqlite::Result<Project> {
    Ok(Project {
        id: row.get(0)?,
        title: row.get(1)?,
        r#type: row.get(2)?,
        advisor: row.get(3)?,
        due_date: row.get(4)?,
        progress: row.get(5)?,
        color: row.get(6)?,
    })
}

#[tauri::command]
pub fn list_projects(state: tauri::State<AppState>) -> Result<Vec<Project>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare(&format!("SELECT {PROJECT_COLS} FROM projects ORDER BY rowid DESC"))
        .map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], row_to_project).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project(state: tauri::State<AppState>, project_id: String) -> Result<Project, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.query_row(
        &format!("SELECT {PROJECT_COLS} FROM projects WHERE id = ?1"),
        rusqlite::params![project_id],
        row_to_project,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_project(
    state: tauri::State<AppState>,
    title: String,
    r#type: String,
    advisor: String,
) -> Result<Project, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;

    let count: i64 = conn
        .query_row("SELECT count(*) FROM projects", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    let color = AC_COLORS[(count as usize) % AC_COLORS.len()];
    let id = format!("proj-{}", uuid::Uuid::new_v4());
    let title = if title.trim().is_empty() { "Neues Projekt".to_string() } else { title.trim().to_string() };
    let r#type = if r#type.trim().is_empty() { "Projekt".to_string() } else { r#type.trim().to_string() };
    let advisor = advisor.trim().to_string();

    conn.execute(
        "INSERT INTO projects (id, title, type, advisor, progress, color) VALUES (?1, ?2, ?3, ?4, 0.0, ?5)",
        rusqlite::params![id, title, r#type, advisor, color],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        &format!("SELECT {PROJECT_COLS} FROM projects WHERE id = ?1"),
        rusqlite::params![id],
        row_to_project,
    )
    .map_err(|e| e.to_string())
}

// ============================================================
// Sources (Bibliothek)
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Source {
    id: String,
    project_id: String,
    r#type: String,
    citation_key: String,
    title: String,
    author: Option<String>,
    year: Option<i64>,
    annotation: Option<String>,
    file_path: Option<String>,
    content: Option<String>,
}

const SOURCE_COLS: &str = "id, project_id, type, citation_key, title, author, year, annotation, file_path, content";

fn row_to_source(row: &rusqlite::Row) -> rusqlite::Result<Source> {
    Ok(Source {
        id: row.get(0)?,
        project_id: row.get(1)?,
        r#type: row.get(2)?,
        citation_key: row.get(3)?,
        title: row.get(4)?,
        author: row.get(5)?,
        year: row.get(6)?,
        annotation: row.get(7)?,
        file_path: row.get(8)?,
        content: row.get(9)?,
    })
}

#[tauri::command]
pub fn list_sources(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Source>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare(&format!("SELECT {SOURCE_COLS} FROM sources WHERE project_id = ?1 ORDER BY rowid ASC"))
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], row_to_source)
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub fn create_source(
    state: tauri::State<AppState>,
    project_id: String,
    r#type: String,
    citation_key: String,
    title: String,
    author: String,
    year: Option<i64>,
    annotation: String,
) -> Result<Source, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("src-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO sources (id, project_id, type, citation_key, title, author, year, annotation) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![id, project_id, r#type, citation_key, title, author, year, annotation],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Quelle \"{title}\" hinzugefügt")).map_err(|e| e.to_string())?;
    Ok(Source {
        id,
        project_id,
        r#type,
        citation_key,
        title,
        author: Some(author),
        year,
        annotation: Some(annotation),
        file_path: None,
        content: None,
    })
}

#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub fn import_source(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    project_id: String,
    source_path: String,
    r#type: String,
    citation_key: String,
    title: String,
    author: String,
    year: Option<i64>,
    annotation: String,
    content: String,
) -> Result<Source, String> {
    let dir = app_data_dir(&app)?;
    let ext = std::path::Path::new(&source_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("pdf")
        .to_string();
    let source_id = format!("src-{}", uuid::Uuid::new_v4());
    let dest_dir = dir.join("academia_sources").join(&project_id);
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    let dest_path = dest_dir.join(format!("{source_id}.{ext}"));
    std::fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;
    let dest_path_str = dest_path.to_string_lossy().to_string();

    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "INSERT INTO sources (id, project_id, type, citation_key, title, author, year, annotation, file_path, content) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![source_id, project_id, r#type, citation_key, title, author, year, annotation, dest_path_str, content],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Quelle \"{title}\" importiert")).map_err(|e| e.to_string())?;

    Ok(Source {
        id: source_id,
        project_id,
        r#type,
        citation_key,
        title,
        author: Some(author),
        year,
        annotation: Some(annotation),
        file_path: Some(dest_path_str),
        content: Some(content),
    })
}

// ============================================================
// Notes (Notizen) + backlinks
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteSummary {
    id: String,
    project_id: String,
    title: String,
    tags: Option<String>,
    updated_at: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteDetail {
    id: String,
    project_id: String,
    title: String,
    content: String,
    tags: Option<String>,
    updated_at: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteRef {
    id: String,
    title: String,
}

#[tauri::command]
pub fn list_notes(state: tauri::State<AppState>, project_id: String) -> Result<Vec<NoteSummary>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, title, tags, updated_at FROM notes WHERE project_id = ?1 ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(NoteSummary {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                tags: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

fn row_to_note_detail(row: &rusqlite::Row) -> rusqlite::Result<NoteDetail> {
    Ok(NoteDetail {
        id: row.get(0)?,
        project_id: row.get(1)?,
        title: row.get(2)?,
        content: row.get(3)?,
        tags: row.get(4)?,
        updated_at: row.get(5)?,
    })
}

const NOTE_DETAIL_COLS: &str = "id, project_id, title, content, tags, updated_at";

#[tauri::command]
pub fn get_note(state: tauri::State<AppState>, note_id: String) -> Result<NoteDetail, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.query_row(
        &format!("SELECT {NOTE_DETAIL_COLS} FROM notes WHERE id = ?1"),
        rusqlite::params![note_id],
        row_to_note_detail,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_note(state: tauri::State<AppState>, project_id: String, title: String) -> Result<NoteDetail, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("note-{}", uuid::Uuid::new_v4());
    let title = if title.trim().is_empty() { "Neue Notiz".to_string() } else { title.trim().to_string() };
    conn.execute(
        "INSERT INTO notes (id, project_id, title, content) VALUES (?1, ?2, ?3, '')",
        rusqlite::params![id, project_id, title],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Notiz \"{title}\" erstellt")).map_err(|e| e.to_string())?;
    conn.query_row(
        &format!("SELECT {NOTE_DETAIL_COLS} FROM notes WHERE id = ?1"),
        rusqlite::params![id],
        row_to_note_detail,
    )
    .map_err(|e| e.to_string())
}

/// Re-syncs the outgoing `[[Wikilink]]` edges in `note_links` for one note —
/// the single source of truth for what a note links to, parsed fresh from the
/// raw content on every save rather than trusted from the client. Takes a
/// plain `&Connection` (no `tauri::State`) so it's unit-testable in isolation.
fn sync_note_links(conn: &rusqlite::Connection, note_id: &str, project_id: &str, content: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM note_links WHERE source_note_id = ?1", rusqlite::params![note_id])?;

    for title in extract_wikilink_titles(content) {
        let target_id: Option<String> = conn
            .query_row(
                "SELECT id FROM notes WHERE project_id = ?1 AND title = ?2 COLLATE NOCASE AND id != ?3",
                rusqlite::params![project_id, title, note_id],
                |r| r.get(0),
            )
            .ok();
        if let Some(target_id) = target_id {
            conn.execute(
                "INSERT OR IGNORE INTO note_links (source_note_id, target_note_id) VALUES (?1, ?2)",
                rusqlite::params![note_id, target_id],
            )?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn update_note(
    state: tauri::State<AppState>,
    note_id: String,
    content: String,
    tags: String,
) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;

    conn.execute(
        "UPDATE notes SET content = ?2, tags = ?3, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
        rusqlite::params![note_id, content, tags],
    )
    .map_err(|e| e.to_string())?;

    let project_id: String = conn
        .query_row("SELECT project_id FROM notes WHERE id = ?1", rusqlite::params![note_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    sync_note_links(conn, &note_id, &project_id, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_backlinks(state: tauri::State<AppState>, note_id: String) -> Result<Vec<NoteRef>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.title FROM note_links l JOIN notes n ON n.id = l.source_note_id \
             WHERE l.target_note_id = ?1 ORDER BY n.title ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![note_id], |row| Ok(NoteRef { id: row.get(0)?, title: row.get(1)? }))
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

// ============================================================
// Chapters (Schreiben)
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    id: String,
    project_id: String,
    title: String,
    status: Option<String>,
    content: String,
    updated_at: Option<String>,
}

#[tauri::command]
pub fn list_chapters(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Chapter>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, title, status, content, updated_at FROM chapters WHERE project_id = ?1 ORDER BY sort_order ASC, rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(Chapter {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                status: row.get(3)?,
                content: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_chapter(state: tauri::State<AppState>, project_id: String, title: String) -> Result<Chapter, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("chapter-{}", uuid::Uuid::new_v4());
    let title = if title.trim().is_empty() { "Neues Kapitel".to_string() } else { title.trim().to_string() };
    let sort_order: i64 = conn
        .query_row("SELECT count(*) FROM chapters WHERE project_id = ?1", rusqlite::params![project_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO chapters (id, project_id, title, status, content, sort_order) VALUES (?1, ?2, ?3, 'Gerüst', '', ?4)",
        rusqlite::params![id, project_id, title, sort_order],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Kapitel \"{title}\" angelegt")).map_err(|e| e.to_string())?;
    Ok(Chapter { id, project_id, title, status: Some("Gerüst".into()), content: String::new(), updated_at: None })
}

#[tauri::command]
pub fn update_chapter_content(state: tauri::State<AppState>, chapter_id: String, content: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "UPDATE chapters SET content = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
        rusqlite::params![chapter_id, content],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================
// Tasks, Milestones & Activity (Projektverwaltung)
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: String,
    project_id: String,
    title: String,
    done: bool,
    due_date: Option<String>,
}

#[tauri::command]
pub fn list_tasks(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Task>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, title, done, due_date FROM tasks WHERE project_id = ?1 ORDER BY done ASC, due_date ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                done: row.get::<_, i64>(3)? != 0,
                due_date: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_task(state: tauri::State<AppState>, project_id: String, title: String, due_date: Option<String>) -> Result<Task, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("task-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO tasks (id, project_id, title, due_date) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, project_id, title, due_date],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Aufgabe \"{title}\" erstellt")).map_err(|e| e.to_string())?;
    Ok(Task { id, project_id, title, done: false, due_date })
}

#[tauri::command]
pub fn complete_task(state: tauri::State<AppState>, task_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let (project_id, title): (String, String) = conn
        .query_row("SELECT project_id, title FROM tasks WHERE id = ?1", rusqlite::params![task_id], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(|e| e.to_string())?;
    conn.execute("UPDATE tasks SET done = 1 WHERE id = ?1", rusqlite::params![task_id])
        .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Aufgabe \"{title}\" erledigt")).map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Milestone {
    id: String,
    project_id: String,
    title: String,
    target_date: String,
}

#[tauri::command]
pub fn list_milestones(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Milestone>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, title, target_date FROM milestones WHERE project_id = ?1 ORDER BY target_date ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(Milestone { id: row.get(0)?, project_id: row.get(1)?, title: row.get(2)?, target_date: row.get(3)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_milestone(state: tauri::State<AppState>, project_id: String, title: String, target_date: String) -> Result<Milestone, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("milestone-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO milestones (id, project_id, title, target_date) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, project_id, title, target_date],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Meilenstein \"{title}\" gesetzt")).map_err(|e| e.to_string())?;
    Ok(Milestone { id, project_id, title, target_date })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEntry {
    id: String,
    project_id: String,
    message: String,
    created_at: Option<String>,
}

#[tauri::command]
pub fn list_activity(state: tauri::State<AppState>, project_id: String) -> Result<Vec<ActivityEntry>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, message, created_at FROM activity_log WHERE project_id = ?1 ORDER BY created_at DESC, rowid DESC LIMIT 30")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(ActivityEntry { id: row.get(0)?, project_id: row.get(1)?, message: row.get(2)?, created_at: row.get(3)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

// ============================================================
// Gliederung — outline nodes, Argumentationslinie & Lücken-Check
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OutlineNode {
    id: String,
    project_id: String,
    parent_id: Option<String>,
    title: String,
    sort_order: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArgumentPoint {
    id: String,
    node_id: String,
    text: String,
    sort_order: i64,
    source_ids: Vec<String>,
}

#[tauri::command]
pub fn list_outline(state: tauri::State<AppState>, project_id: String) -> Result<Vec<OutlineNode>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, parent_id, title, sort_order FROM outline_nodes WHERE project_id = ?1 ORDER BY sort_order ASC, rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(OutlineNode { id: row.get(0)?, project_id: row.get(1)?, parent_id: row.get(2)?, title: row.get(3)?, sort_order: row.get(4)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_outline_node(state: tauri::State<AppState>, project_id: String, parent_id: Option<String>, title: String) -> Result<OutlineNode, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("node-{}", uuid::Uuid::new_v4());
    let sort_order: i64 = conn
        .query_row(
            "SELECT count(*) FROM outline_nodes WHERE project_id = ?1 AND parent_id IS ?2",
            rusqlite::params![project_id, parent_id],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO outline_nodes (id, project_id, parent_id, title, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, project_id, parent_id, title, sort_order],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("Gliederungspunkt \"{title}\" erstellt")).map_err(|e| e.to_string())?;
    Ok(OutlineNode { id, project_id, parent_id, title, sort_order })
}

#[tauri::command]
pub fn list_argument_points(state: tauri::State<AppState>, project_id: String) -> Result<Vec<ArgumentPoint>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;

    let mut link_stmt = conn
        .prepare(
            "SELECT s.argument_id, s.source_id FROM argument_sources s \
             JOIN argument_points a ON a.id = s.argument_id \
             JOIN outline_nodes n ON n.id = a.node_id WHERE n.project_id = ?1",
        )
        .map_err(|e| e.to_string())?;
    let link_rows: Vec<(String, String)> = link_stmt
        .query_map(rusqlite::params![project_id], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(|e| e.to_string())?
        .collect::<Result<_, _>>()
        .map_err(|e| e.to_string())?;
    let mut source_map: std::collections::HashMap<String, Vec<String>> = std::collections::HashMap::new();
    for (arg_id, src_id) in link_rows {
        source_map.entry(arg_id).or_default().push(src_id);
    }

    let mut stmt = conn
        .prepare(
            "SELECT a.id, a.node_id, a.text, a.sort_order FROM argument_points a \
             JOIN outline_nodes n ON n.id = a.node_id WHERE n.project_id = ?1 ORDER BY a.sort_order ASC, a.rowid ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows: Vec<(String, String, String, i64)> = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, node_id, text, sort_order)| {
            let source_ids = source_map.get(&id).cloned().unwrap_or_default();
            ArgumentPoint { id, node_id, text, sort_order, source_ids }
        })
        .collect())
}

#[tauri::command]
pub fn create_argument_point(state: tauri::State<AppState>, node_id: String, text: String) -> Result<ArgumentPoint, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("arg-{}", uuid::Uuid::new_v4());
    let sort_order: i64 = conn
        .query_row("SELECT count(*) FROM argument_points WHERE node_id = ?1", rusqlite::params![node_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO argument_points (id, node_id, text, sort_order) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, node_id, text, sort_order],
    )
    .map_err(|e| e.to_string())?;
    Ok(ArgumentPoint { id, node_id, text, sort_order, source_ids: Vec::new() })
}

#[tauri::command]
pub fn link_argument_source(state: tauri::State<AppState>, argument_id: String, source_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "INSERT OR IGNORE INTO argument_sources (argument_id, source_id) VALUES (?1, ?2)",
        rusqlite::params![argument_id, source_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn unlink_argument_source(state: tauri::State<AppState>, argument_id: String, source_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "DELETE FROM argument_sources WHERE argument_id = ?1 AND source_id = ?2",
        rusqlite::params![argument_id, source_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================
// Thesen — claim + pro/con points
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Thesis {
    id: String,
    project_id: String,
    claim: String,
    summary: Option<String>,
    position: Option<String>,
    sort_order: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThesisPoint {
    id: String,
    thesis_id: String,
    side: String,
    text: String,
    source_id: Option<String>,
    sort_order: i64,
}

fn none_if_blank(s: String) -> Option<String> {
    let trimmed = s.trim();
    if trimmed.is_empty() { None } else { Some(trimmed.to_string()) }
}

#[tauri::command]
pub fn list_theses(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Thesis>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, claim, summary, position, sort_order FROM theses WHERE project_id = ?1 ORDER BY sort_order ASC, rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(Thesis {
                id: row.get(0)?,
                project_id: row.get(1)?,
                claim: row.get(2)?,
                summary: row.get(3)?,
                position: row.get(4)?,
                sort_order: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_thesis(
    state: tauri::State<AppState>,
    project_id: String,
    claim: String,
    summary: String,
    position: String,
) -> Result<Thesis, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("thesis-{}", uuid::Uuid::new_v4());
    let sort_order: i64 = conn
        .query_row("SELECT count(*) FROM theses WHERE project_id = ?1", rusqlite::params![project_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    let summary = none_if_blank(summary);
    let position = none_if_blank(position);
    conn.execute(
        "INSERT INTO theses (id, project_id, claim, summary, position, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, project_id, claim, summary, position, sort_order],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, &format!("These \"{claim}\" erstellt")).map_err(|e| e.to_string())?;
    Ok(Thesis { id, project_id, claim, summary, position, sort_order })
}

#[tauri::command]
pub fn list_thesis_points(state: tauri::State<AppState>, project_id: String) -> Result<Vec<ThesisPoint>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.thesis_id, p.side, p.text, p.source_id, p.sort_order FROM thesis_points p \
             JOIN theses t ON t.id = p.thesis_id WHERE t.project_id = ?1 ORDER BY p.sort_order ASC, p.rowid ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(ThesisPoint {
                id: row.get(0)?,
                thesis_id: row.get(1)?,
                side: row.get(2)?,
                text: row.get(3)?,
                source_id: row.get(4)?,
                sort_order: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_thesis_point(
    state: tauri::State<AppState>,
    thesis_id: String,
    side: String,
    text: String,
    source_id: Option<String>,
) -> Result<ThesisPoint, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("point-{}", uuid::Uuid::new_v4());
    let sort_order: i64 = conn
        .query_row(
            "SELECT count(*) FROM thesis_points WHERE thesis_id = ?1 AND side = ?2",
            rusqlite::params![thesis_id, side],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO thesis_points (id, thesis_id, side, text, source_id, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, thesis_id, side, text, source_id, sort_order],
    )
    .map_err(|e| e.to_string())?;
    Ok(ThesisPoint { id, thesis_id, side, text, source_id, sort_order })
}

// ============================================================
// Zitate — quote clusters tied to sources
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    id: String,
    project_id: String,
    source_id: String,
    text: String,
    cluster: Option<String>,
    tag: Option<String>,
}

#[tauri::command]
pub fn list_quotes(state: tauri::State<AppState>, project_id: String) -> Result<Vec<Quote>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, project_id, source_id, text, cluster, tag FROM quotes WHERE project_id = ?1 ORDER BY cluster ASC, rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![project_id], |row| {
            Ok(Quote {
                id: row.get(0)?,
                project_id: row.get(1)?,
                source_id: row.get(2)?,
                text: row.get(3)?,
                cluster: row.get(4)?,
                tag: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_quote(
    state: tauri::State<AppState>,
    project_id: String,
    source_id: String,
    text: String,
    cluster: String,
    tag: String,
) -> Result<Quote, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("quote-{}", uuid::Uuid::new_v4());
    let cluster = none_if_blank(cluster);
    let tag = none_if_blank(tag);
    conn.execute(
        "INSERT INTO quotes (id, project_id, source_id, text, cluster, tag) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, project_id, source_id, text, cluster, tag],
    )
    .map_err(|e| e.to_string())?;
    log_activity(conn, &project_id, "Zitat erfasst").map_err(|e| e.to_string())?;
    Ok(Quote { id, project_id, source_id, text, cluster, tag })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extract_wikilink_titles_dedupes_and_handles_aliases() {
        let content = "See [[Foo Bar]] and [[foo bar]] again, plus [[Baz|an alias]]. Unclosed [[nope";
        let titles = extract_wikilink_titles(content);
        assert_eq!(titles, vec!["Foo Bar".to_string(), "Baz".to_string()]);
    }

    #[test]
    fn extract_wikilink_titles_is_utf8_safe() {
        let content = "Über [[Gründung der Körperschaft]] und Ähnliches.";
        let titles = extract_wikilink_titles(content);
        assert_eq!(titles, vec!["Gründung der Körperschaft".to_string()]);
    }

    fn open_test_db() -> (rusqlite::Connection, std::path::PathBuf) {
        let path = std::env::temp_dir().join(format!("folio-academia-test-{}.db", uuid::Uuid::new_v4()));
        let _ = std::fs::remove_file(&path);
        let conn = crate::db::open_and_key(&path, "00112233445566778899aabbccddeeff").expect("open db");
        crate::db::migrate(&conn).expect("migrate");
        (conn, path)
    }

    #[test]
    fn sync_note_links_creates_and_removes_backlinks() {
        let (conn, path) = open_test_db();

        conn.execute(
            "INSERT INTO projects (id, title, type, color) VALUES ('proj-1', 'Test', 'Projekt', 'blue')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO notes (id, project_id, title, content) VALUES ('note-a', 'proj-1', 'Note A', '')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO notes (id, project_id, title, content) VALUES ('note-b', 'proj-1', 'Note B', '')",
            [],
        )
        .unwrap();

        // Note A links to Note B (case-insensitive title match) and to an unresolved title.
        sync_note_links(&conn, "note-a", "proj-1", "See [[note b]] and [[Nonexistent]].").unwrap();

        let backlinks_of_b: Vec<String> = {
            let mut stmt = conn
                .prepare("SELECT n.title FROM note_links l JOIN notes n ON n.id = l.source_note_id WHERE l.target_note_id = 'note-b'")
                .unwrap();
            stmt.query_map([], |r| r.get(0)).unwrap().collect::<Result<_, _>>().unwrap()
        };
        assert_eq!(backlinks_of_b, vec!["Note A".to_string()]);

        let link_count: i64 = conn.query_row("SELECT count(*) FROM note_links", [], |r| r.get(0)).unwrap();
        assert_eq!(link_count, 1, "the unresolved title must not create a row");

        // Re-syncing with no links removes the previous edge.
        sync_note_links(&conn, "note-a", "proj-1", "No links anymore.").unwrap();
        let link_count_after: i64 = conn.query_row("SELECT count(*) FROM note_links", [], |r| r.get(0)).unwrap();
        assert_eq!(link_count_after, 0);

        drop(conn);
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn log_activity_orders_newest_first() {
        let (conn, path) = open_test_db();
        conn.execute(
            "INSERT INTO projects (id, title, type, color) VALUES ('proj-1', 'Test', 'Projekt', 'blue')",
            [],
        )
        .unwrap();

        log_activity(&conn, "proj-1", "erstes Ereignis").unwrap();
        log_activity(&conn, "proj-1", "zweites Ereignis").unwrap();

        let messages: Vec<String> = {
            let mut stmt = conn
                .prepare("SELECT message FROM activity_log WHERE project_id = 'proj-1' ORDER BY created_at DESC, rowid DESC")
                .unwrap();
            stmt.query_map([], |r| r.get(0)).unwrap().collect::<Result<_, _>>().unwrap()
        };
        assert_eq!(messages, vec!["zweites Ereignis".to_string(), "erstes Ereignis".to_string()]);

        drop(conn);
        let _ = std::fs::remove_file(&path);
    }
}
