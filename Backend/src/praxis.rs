use crate::commands::app_data_dir;
use crate::AppState;
use serde::Serialize;

const PX_COLORS: [&str; 5] = ["blue", "red", "green", "amber", "ink"];

// ============================================================
// Cases
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaseSummary {
    id: String,
    title: String,
    r#ref: String,
    phase: String,
    gebiet: Option<String>,
    color: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaseDetail {
    id: String,
    title: String,
    r#ref: String,
    phase: String,
    streitwert: Option<String>,
    gebiet: Option<String>,
    rate: f64,
    budget: Option<f64>,
    kurz: Option<String>,
    verfahren: Option<String>,
    gericht: Option<String>,
    nr: Option<String>,
    color: Option<String>,
    rolle_klient: Option<String>,
}

const CASE_DETAIL_COLS: &str =
    "id, title, ref, phase, streitwert, gebiet, rate, budget, kurz, verfahren, gericht, nr, color, rolle_klient";

fn row_to_case_detail(row: &rusqlite::Row) -> rusqlite::Result<CaseDetail> {
    Ok(CaseDetail {
        id: row.get(0)?,
        title: row.get(1)?,
        r#ref: row.get(2)?,
        phase: row.get(3)?,
        streitwert: row.get(4)?,
        gebiet: row.get(5)?,
        rate: row.get(6)?,
        budget: row.get(7)?,
        kurz: row.get(8)?,
        verfahren: row.get(9)?,
        gericht: row.get(10)?,
        nr: row.get(11)?,
        color: row.get(12)?,
        rolle_klient: row.get(13)?,
    })
}

#[tauri::command]
pub fn list_cases(state: tauri::State<AppState>) -> Result<Vec<CaseSummary>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, title, ref, phase, gebiet, color FROM cases ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(CaseSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                r#ref: row.get(2)?,
                phase: row.get(3)?,
                gebiet: row.get(4)?,
                color: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_case(state: tauri::State<AppState>, case_id: String) -> Result<CaseDetail, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.query_row(
        &format!("SELECT {CASE_DETAIL_COLS} FROM cases WHERE id = ?1"),
        rusqlite::params![case_id],
        row_to_case_detail,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_case(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    title: String,
    gebiet: String,
) -> Result<CaseDetail, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;

    let count: i64 = conn
        .query_row("SELECT count(*) FROM cases", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    let year = 2026; // fractional-year seeding matches the rest of the app's fixed demo epoch
    let case_ref = format!("M-{year}-{:03}", count + 1);
    let color = PX_COLORS[(count as usize) % PX_COLORS.len()];
    let id = format!("case-{}", uuid::Uuid::new_v4());
    let title = if title.trim().is_empty() { "Neuer Fall".to_string() } else { title.trim().to_string() };
    let gebiet = if gebiet.trim().is_empty() { "Zivilrecht".to_string() } else { gebiet.trim().to_string() };

    let display_name = {
        let dir = app_data_dir(&app)?;
        let cfg_str = std::fs::read_to_string(crate::auth::config_path(&dir)).unwrap_or_default();
        serde_json::from_str::<crate::auth::AuthConfig>(&cfg_str)
            .map(|c| c.display_name)
            .unwrap_or_default()
    };

    conn.execute(
        "INSERT INTO cases (id, title, ref, phase, gebiet, color, rate, budget, rolle_klient) \
         VALUES (?1, ?2, ?3, 'Neu eröffnet', ?4, ?5, 280.0, 1.0, 'Klient*in')",
        rusqlite::params![id, title, case_ref, gebiet, color],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO case_parties (id, case_id, rolle, name, detail, vertreter, is_klient, sort_order) \
         VALUES (?1, ?2, 'Klient*in', ?3, '', ?4, 1, 0)",
        rusqlite::params![format!("party-{}", uuid::Uuid::new_v4()), id, title, display_name],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO drafts (id, case_id, titel, typ, status, content) \
         VALUES (?1, ?2, 'Erster Entwurf', 'Rechtsschrift', 'Gerüst', '')",
        rusqlite::params![format!("draft-{}", uuid::Uuid::new_v4()), id],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        &format!("SELECT {CASE_DETAIL_COLS} FROM cases WHERE id = ?1"),
        rusqlite::params![id],
        row_to_case_detail,
    )
    .map_err(|e| e.to_string())
}

// ============================================================
// Parties
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Partei {
    id: String,
    rolle: String,
    name: String,
    detail: Option<String>,
    vertreter: Option<String>,
    is_klient: bool,
}

#[tauri::command]
pub fn list_case_parties(state: tauri::State<AppState>, case_id: String) -> Result<Vec<Partei>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, rolle, name, detail, vertreter, is_klient FROM case_parties WHERE case_id = ?1 ORDER BY sort_order, rowid")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(Partei {
                id: row.get(0)?,
                rolle: row.get(1)?,
                name: row.get(2)?,
                detail: row.get(3)?,
                vertreter: row.get(4)?,
                is_klient: row.get::<_, i64>(5)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_case_party(
    state: tauri::State<AppState>,
    case_id: String,
    rolle: String,
    name: String,
    detail: String,
    vertreter: String,
    is_klient: bool,
) -> Result<Partei, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("party-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO case_parties (id, case_id, rolle, name, detail, vertreter, is_klient) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![id, case_id, rolle, name, detail, vertreter, is_klient as i64],
    )
    .map_err(|e| e.to_string())?;
    Ok(Partei { id, rolle, name, detail: Some(detail), vertreter: Some(vertreter), is_klient })
}

// ============================================================
// Deadlines
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Deadline {
    id: String,
    case_id: String,
    title: String,
    due_date: String,
    r#type: Option<String>,
    note: Option<String>,
    completed: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeadlineWithCase {
    id: String,
    case_id: String,
    case_title: String,
    case_ref: String,
    title: String,
    due_date: String,
    r#type: Option<String>,
    note: Option<String>,
    completed: bool,
}

#[tauri::command]
pub fn list_deadlines(state: tauri::State<AppState>, case_id: String) -> Result<Vec<Deadline>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, title, due_date, type, note, completed FROM deadlines WHERE case_id = ?1 ORDER BY due_date ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(Deadline {
                id: row.get(0)?,
                case_id: row.get(1)?,
                title: row.get(2)?,
                due_date: row.get(3)?,
                r#type: row.get(4)?,
                note: row.get(5)?,
                completed: row.get::<_, i64>(6)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_all_deadlines(state: tauri::State<AppState>) -> Result<Vec<DeadlineWithCase>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare(
            "SELECT d.id, d.case_id, c.title, c.ref, d.title, d.due_date, d.type, d.note, d.completed \
             FROM deadlines d JOIN cases c ON c.id = d.case_id \
             WHERE d.completed = 0 ORDER BY d.due_date ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(DeadlineWithCase {
                id: row.get(0)?,
                case_id: row.get(1)?,
                case_title: row.get(2)?,
                case_ref: row.get(3)?,
                title: row.get(4)?,
                due_date: row.get(5)?,
                r#type: row.get(6)?,
                note: row.get(7)?,
                completed: row.get::<_, i64>(8)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_deadline(
    state: tauri::State<AppState>,
    case_id: String,
    title: String,
    due_date: String,
    r#type: String,
    note: String,
) -> Result<Deadline, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("deadline-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO deadlines (id, case_id, title, due_date, type, note) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, case_id, title, due_date, r#type, note],
    )
    .map_err(|e| e.to_string())?;
    Ok(Deadline { id, case_id, title, due_date, r#type: Some(r#type), note: Some(note), completed: false })
}

#[tauri::command]
pub fn complete_deadline(state: tauri::State<AppState>, deadline_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("UPDATE deadlines SET completed = 1 WHERE id = ?1", rusqlite::params![deadline_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================
// Documents (Akten)
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentRow {
    id: String,
    case_id: String,
    nr: String,
    title: String,
    sender: Option<String>,
    doc_type: Option<String>,
    pages: Option<i64>,
    file_path: String,
    content: Option<String>,
    folder: Option<String>,
    doc_date: Option<String>,
    cluster_id: Option<i64>,
}

#[tauri::command]
pub fn list_documents(state: tauri::State<AppState>, case_id: String) -> Result<Vec<DocumentRow>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, nr, title, sender, doc_type, pages, file_path, content, folder, doc_date, cluster_id FROM documents WHERE case_id = ?1 ORDER BY rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(DocumentRow {
                id: row.get(0)?,
                case_id: row.get(1)?,
                nr: row.get(2)?,
                title: row.get(3)?,
                sender: row.get(4)?,
                doc_type: row.get(5)?,
                pages: row.get(6)?,
                file_path: row.get(7)?,
                content: row.get(8)?,
                folder: row.get(9)?,
                doc_date: row.get(10)?,
                cluster_id: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Reads an arbitrary local file's bytes — used right after the dialog picker
/// returns a path, so the frontend can run PDF text extraction before the
/// document is ever copied into app storage.
#[tauri::command]
pub fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub fn import_document(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    case_id: String,
    source_path: String,
    nr: String,
    title: String,
    sender: String,
    doc_type: String,
    folder: String,
    content: String,
    pages: Option<i64>,
    doc_date: String,
) -> Result<DocumentRow, String> {
    let dir = app_data_dir(&app)?;
    let ext = std::path::Path::new(&source_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("pdf")
        .to_string();
    let doc_id = format!("doc-{}", uuid::Uuid::new_v4());
    let dest_dir = dir.join("documents").join(&case_id);
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    let dest_path = dest_dir.join(format!("{doc_id}.{ext}"));
    std::fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;
    let dest_path_str = dest_path.to_string_lossy().to_string();

    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "INSERT INTO documents (id, case_id, nr, title, sender, doc_type, pages, file_path, content, folder, doc_date) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![doc_id, case_id, nr, title, sender, doc_type, pages, dest_path_str, content, folder, doc_date],
    )
    .map_err(|e| e.to_string())?;

    Ok(DocumentRow {
        id: doc_id,
        case_id,
        nr,
        title,
        sender: Some(sender),
        doc_type: Some(doc_type),
        pages,
        file_path: dest_path_str,
        content: Some(content),
        folder: Some(folder),
        doc_date: Some(doc_date),
        cluster_id: None,
    })
}

#[tauri::command]
pub fn rename_case(state: tauri::State<AppState>, case_id: String, title: String) -> Result<(), String> {
    let title = title.trim();
    if title.is_empty() {
        return Err("Titel darf nicht leer sein.".to_string());
    }
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("UPDATE cases SET title = ?2 WHERE id = ?1", rusqlite::params![case_id, title])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Deletes a case; deadlines/documents/parties/chrono/correspondence/billing/drafts
/// all cascade via FK. The per-case documents directory is removed best-effort.
#[tauri::command]
pub fn delete_case(app: tauri::AppHandle, state: tauri::State<AppState>, case_id: String) -> Result<(), String> {
    {
        let guard = state.conn.lock().unwrap();
        let conn = guard.as_ref().ok_or("Workspace is locked.")?;
        conn.execute("DELETE FROM cases WHERE id = ?1", rusqlite::params![case_id])
            .map_err(|e| e.to_string())?;
    }
    if let Ok(dir) = app_data_dir(&app) {
        let _ = std::fs::remove_dir_all(dir.join("documents").join(&case_id));
    }
    Ok(())
}

#[tauri::command]
pub fn delete_document(state: tauri::State<AppState>, document_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let file_path: Option<String> = conn
        .query_row("SELECT file_path FROM documents WHERE id = ?1", rusqlite::params![document_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM documents WHERE id = ?1", rusqlite::params![document_id])
        .map_err(|e| e.to_string())?;
    // Best effort: the row is the source of truth, a stale file only wastes disk.
    if let Some(path) = file_path {
        let _ = std::fs::remove_file(path);
    }
    Ok(())
}

// ============================================================
// Offline-KI: embeddings & clustering (Akten)
// ============================================================
//
// The 384-dim MiniLM vectors are computed entirely in the frontend's Web
// Worker; Rust only stores and returns the raw little-endian f32 bytes.
// Distance math (cosine similarity, k-means) also lives in the frontend so
// the backend stays a dumb, testable byte store.

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentEmbedding {
    id: String,
    embedding: Option<Vec<u8>>,
}

fn set_document_embedding(conn: &rusqlite::Connection, document_id: &str, embedding: &[u8]) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE documents SET embedding = ?2 WHERE id = ?1",
        rusqlite::params![document_id, embedding],
    )
}

fn set_document_clusters(conn: &rusqlite::Connection, assignments: &[(String, i64)]) -> rusqlite::Result<()> {
    for (document_id, cluster_id) in assignments {
        conn.execute(
            "UPDATE documents SET cluster_id = ?2 WHERE id = ?1",
            rusqlite::params![document_id, cluster_id],
        )?;
    }
    Ok(())
}

#[tauri::command]
pub fn update_document_embedding(state: tauri::State<AppState>, document_id: String, embedding: Vec<u8>) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    set_document_embedding(conn, &document_id, &embedding).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_document_embeddings(state: tauri::State<AppState>, case_id: String) -> Result<Vec<DocumentEmbedding>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, embedding FROM documents WHERE case_id = ?1 ORDER BY rowid ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(DocumentEmbedding { id: row.get(0)?, embedding: row.get(1)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClusterAssignment {
    document_id: String,
    cluster_id: i64,
}

#[tauri::command]
pub fn assign_document_clusters(state: tauri::State<AppState>, assignments: Vec<ClusterAssignment>) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let pairs: Vec<(String, i64)> = assignments.into_iter().map(|a| (a.document_id, a.cluster_id)).collect();
    set_document_clusters(conn, &pairs).map_err(|e| e.to_string())
}

// ============================================================
// Chronologie
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChronoEvent {
    id: String,
    case_id: String,
    event_date: String,
    ereignis: String,
    beleg: Option<String>,
}

#[tauri::command]
pub fn list_chrono(state: tauri::State<AppState>, case_id: String) -> Result<Vec<ChronoEvent>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, event_date, ereignis, beleg FROM chrono_events WHERE case_id = ?1 ORDER BY event_date ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(ChronoEvent { id: row.get(0)?, case_id: row.get(1)?, event_date: row.get(2)?, ereignis: row.get(3)?, beleg: row.get(4)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_chrono_event(
    state: tauri::State<AppState>,
    case_id: String,
    event_date: String,
    ereignis: String,
    beleg: String,
) -> Result<ChronoEvent, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("chrono-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO chrono_events (id, case_id, event_date, ereignis, beleg) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, case_id, event_date, ereignis, beleg],
    )
    .map_err(|e| e.to_string())?;
    Ok(ChronoEvent { id, case_id, event_date, ereignis, beleg: Some(beleg) })
}

// ============================================================
// Korrespondenz
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CorrespondenceRow {
    id: String,
    case_id: String,
    corr_date: String,
    richtung: String,
    von: Option<String>,
    betreff: Option<String>,
    typ: Option<String>,
}

#[tauri::command]
pub fn list_correspondence(state: tauri::State<AppState>, case_id: String) -> Result<Vec<CorrespondenceRow>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, corr_date, richtung, von, betreff, typ FROM correspondence WHERE case_id = ?1 ORDER BY corr_date DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(CorrespondenceRow {
                id: row.get(0)?,
                case_id: row.get(1)?,
                corr_date: row.get(2)?,
                richtung: row.get(3)?,
                von: row.get(4)?,
                betreff: row.get(5)?,
                typ: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_correspondence(
    state: tauri::State<AppState>,
    case_id: String,
    corr_date: String,
    richtung: String,
    von: String,
    betreff: String,
    typ: String,
) -> Result<CorrespondenceRow, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("corr-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO correspondence (id, case_id, corr_date, richtung, von, betreff, typ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![id, case_id, corr_date, richtung, von, betreff, typ],
    )
    .map_err(|e| e.to_string())?;
    Ok(CorrespondenceRow { id, case_id, corr_date, richtung, von: Some(von), betreff: Some(betreff), typ: Some(typ) })
}

// ============================================================
// Honorar
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BillingEntryRow {
    id: String,
    case_id: String,
    entry_date: String,
    taetigkeit: String,
    minutes: i64,
}

#[tauri::command]
pub fn list_billing_entries(state: tauri::State<AppState>, case_id: String) -> Result<Vec<BillingEntryRow>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, entry_date, taetigkeit, minutes FROM billing_entries WHERE case_id = ?1 ORDER BY entry_date DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(BillingEntryRow { id: row.get(0)?, case_id: row.get(1)?, entry_date: row.get(2)?, taetigkeit: row.get(3)?, minutes: row.get(4)? })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_billing_entry(
    state: tauri::State<AppState>,
    case_id: String,
    entry_date: String,
    taetigkeit: String,
    minutes: i64,
) -> Result<BillingEntryRow, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("bill-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO billing_entries (id, case_id, entry_date, taetigkeit, minutes) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, case_id, entry_date, taetigkeit, minutes],
    )
    .map_err(|e| e.to_string())?;
    Ok(BillingEntryRow { id, case_id, entry_date, taetigkeit, minutes })
}

// ============================================================
// Entwürfe (Workbench drafts)
// ============================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftRow {
    id: String,
    case_id: String,
    titel: String,
    typ: Option<String>,
    status: Option<String>,
    content: String,
    updated_at: Option<String>,
}

#[tauri::command]
pub fn list_drafts(state: tauri::State<AppState>, case_id: String) -> Result<Vec<DraftRow>, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let mut stmt = conn
        .prepare("SELECT id, case_id, titel, typ, status, content, updated_at FROM drafts WHERE case_id = ?1 ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![case_id], |row| {
            Ok(DraftRow {
                id: row.get(0)?,
                case_id: row.get(1)?,
                titel: row.get(2)?,
                typ: row.get(3)?,
                status: row.get(4)?,
                content: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_draft(state: tauri::State<AppState>, case_id: String, titel: String, typ: String) -> Result<DraftRow, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let id = format!("draft-{}", uuid::Uuid::new_v4());
    conn.execute(
        "INSERT INTO drafts (id, case_id, titel, typ, status, content) VALUES (?1, ?2, ?3, ?4, 'Gerüst', '')",
        rusqlite::params![id, case_id, titel, typ],
    )
    .map_err(|e| e.to_string())?;
    Ok(DraftRow { id, case_id, titel, typ: Some(typ), status: Some("Gerüst".into()), content: String::new(), updated_at: None })
}

#[tauri::command]
pub fn update_draft_content(state: tauri::State<AppState>, draft_id: String, content: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute(
        "UPDATE drafts SET content = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
        rusqlite::params![draft_id, content],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

fn fetch_draft_for_export(conn: &rusqlite::Connection, draft_id: &str) -> rusqlite::Result<(String, crate::documents::DocSection)> {
    let (case_title, case_ref, draft_titel, content): (String, String, String, String) = conn.query_row(
        "SELECT c.title, c.ref, d.titel, d.content FROM drafts d JOIN cases c ON c.id = d.case_id WHERE d.id = ?1",
        rusqlite::params![draft_id],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
    )?;
    Ok((format!("{case_ref} — {case_title}"), crate::documents::DocSection { heading: draft_titel, body: content }))
}

#[tauri::command]
pub fn export_draft_markdown(state: tauri::State<AppState>, draft_id: String) -> Result<String, String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    let (doc_title, section) = fetch_draft_for_export(conn, &draft_id).map_err(|e| e.to_string())?;
    Ok(crate::documents::build_markdown(&doc_title, std::slice::from_ref(&section)))
}

#[tauri::command]
pub fn export_draft_docx(state: tauri::State<AppState>, draft_id: String, path: String) -> Result<(), String> {
    let (doc_title, section) = {
        let guard = state.conn.lock().unwrap();
        let conn = guard.as_ref().ok_or("Workspace is locked.")?;
        fetch_draft_for_export(conn, &draft_id).map_err(|e| e.to_string())?
    };
    crate::documents::write_docx(&doc_title, std::slice::from_ref(&section), &[], std::path::Path::new(&path))
}

#[tauri::command]
pub fn export_draft_pdf(state: tauri::State<AppState>, draft_id: String, path: String) -> Result<(), String> {
    let (doc_title, section) = {
        let guard = state.conn.lock().unwrap();
        let conn = guard.as_ref().ok_or("Workspace is locked.")?;
        fetch_draft_for_export(conn, &draft_id).map_err(|e| e.to_string())?
    };
    crate::documents::write_pdf(&doc_title, std::slice::from_ref(&section), &[], std::path::Path::new(&path))
}

// ============================================================
// Deletes: deadlines, parties, correspondence, billing entries
// ============================================================

#[tauri::command]
pub fn delete_deadline(state: tauri::State<AppState>, deadline_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("DELETE FROM deadlines WHERE id = ?1", rusqlite::params![deadline_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_case_party(state: tauri::State<AppState>, party_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("DELETE FROM case_parties WHERE id = ?1", rusqlite::params![party_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_correspondence(state: tauri::State<AppState>, correspondence_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("DELETE FROM correspondence WHERE id = ?1", rusqlite::params![correspondence_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_billing_entry(state: tauri::State<AppState>, billing_id: String) -> Result<(), String> {
    let guard = state.conn.lock().unwrap();
    let conn = guard.as_ref().ok_or("Workspace is locked.")?;
    conn.execute("DELETE FROM billing_entries WHERE id = ?1", rusqlite::params![billing_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn open_test_db() -> (rusqlite::Connection, std::path::PathBuf) {
        let path = std::env::temp_dir().join(format!("folio-praxis-test-{}.db", uuid::Uuid::new_v4()));
        let _ = std::fs::remove_file(&path);
        let conn = crate::db::open_and_key(&path, "00112233445566778899aabbccddeeff").expect("open db");
        crate::db::migrate(&conn).expect("migrate");
        conn.execute(
            "INSERT INTO cases (id, title, ref, phase) VALUES ('case-1', 'Test', 'M-2026-001', 'Neu')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO documents (id, case_id, nr, title, file_path) VALUES ('doc-1', 'case-1', 'act. 1', 'Akte', '/tmp/a.pdf')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO documents (id, case_id, nr, title, file_path) VALUES ('doc-2', 'case-1', 'act. 2', 'Akte 2', '/tmp/b.pdf')",
            [],
        )
        .unwrap();
        (conn, path)
    }

    #[test]
    fn embedding_blob_round_trips_byte_exact() {
        let (conn, path) = open_test_db();

        // 384-dim f32 vector as little-endian bytes — exactly what the frontend sends.
        let floats: Vec<f32> = (0..384).map(|i| (i as f32) * 0.25 - 3.0).collect();
        let bytes: Vec<u8> = floats.iter().flat_map(|f| f.to_le_bytes()).collect();
        assert_eq!(set_document_embedding(&conn, "doc-1", &bytes).unwrap(), 1);

        let stored: Vec<u8> = conn
            .query_row("SELECT embedding FROM documents WHERE id = 'doc-1'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(stored, bytes);

        let missing: Option<Vec<u8>> = conn
            .query_row("SELECT embedding FROM documents WHERE id = 'doc-2'", [], |r| r.get(0))
            .unwrap();
        assert!(missing.is_none(), "untouched documents keep a NULL embedding");

        drop(conn);
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn cluster_assignments_update_all_given_documents() {
        let (conn, path) = open_test_db();

        set_document_clusters(&conn, &[("doc-1".into(), 0), ("doc-2".into(), 2)]).unwrap();

        let c1: i64 = conn.query_row("SELECT cluster_id FROM documents WHERE id = 'doc-1'", [], |r| r.get(0)).unwrap();
        let c2: i64 = conn.query_row("SELECT cluster_id FROM documents WHERE id = 'doc-2'", [], |r| r.get(0)).unwrap();
        assert_eq!((c1, c2), (0, 2));

        // Re-clustering overwrites previous assignments.
        set_document_clusters(&conn, &[("doc-2".into(), 1)]).unwrap();
        let c2b: i64 = conn.query_row("SELECT cluster_id FROM documents WHERE id = 'doc-2'", [], |r| r.get(0)).unwrap();
        assert_eq!(c2b, 1);

        drop(conn);
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn deleting_a_case_cascades_its_documents_and_deadlines() {
        let (conn, path) = open_test_db();
        conn.execute(
            "INSERT INTO deadlines (id, case_id, title, due_date) VALUES ('dl-1', 'case-1', 'Frist', '2026-01-01')",
            [],
        )
        .unwrap();

        conn.execute("DELETE FROM cases WHERE id = 'case-1'", []).unwrap();

        let docs: i64 = conn.query_row("SELECT count(*) FROM documents WHERE case_id = 'case-1'", [], |r| r.get(0)).unwrap();
        let deadlines: i64 = conn.query_row("SELECT count(*) FROM deadlines WHERE case_id = 'case-1'", [], |r| r.get(0)).unwrap();
        assert_eq!(docs, 0, "documents must cascade with their case");
        assert_eq!(deadlines, 0, "deadlines must cascade with their case");

        drop(conn);
        let _ = std::fs::remove_file(&path);
    }
}
