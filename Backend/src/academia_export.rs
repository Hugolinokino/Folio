use crate::AppState;
use docx_rs::*;
use serde::Deserialize;

/// Replaces `[[Title]]` / `[[Title|Alias]]` with plain inline text (alias wins
/// if present) — a finished Word export shouldn't carry raw Obsidian syntax.
/// Same UTF-8-safe bracket scan as `academia::extract_wikilink_titles`.
fn strip_wikilinks(content: &str) -> String {
    let bytes = content.as_bytes();
    let mut out = String::with_capacity(content.len());
    let mut i = 0;
    let mut last_copied = 0;
    while i + 1 < bytes.len() {
        if bytes[i] == b'[' && bytes[i + 1] == b'[' {
            if let Some(end) = content[i + 2..].find("]]") {
                let inner = &content[i + 2..i + 2 + end];
                let mut parts = inner.splitn(2, '|');
                let title = parts.next().unwrap_or("").trim();
                let label = parts.next().map(|a| a.trim()).filter(|a| !a.is_empty()).unwrap_or(title);
                out.push_str(&content[last_copied..i]);
                out.push_str(label);
                i += 2 + end + 2;
                last_copied = i;
                continue;
            }
        }
        i += 1;
    }
    out.push_str(&content[last_copied..]);
    out
}

fn fetch_chapters(conn: &rusqlite::Connection, project_id: &str) -> rusqlite::Result<Vec<(String, String)>> {
    let mut stmt = conn.prepare(
        "SELECT title, content FROM chapters WHERE project_id = ?1 ORDER BY sort_order ASC, rowid ASC",
    )?;
    let rows = stmt.query_map(rusqlite::params![project_id], |row| Ok((row.get(0)?, row.get(1)?)))?;
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

    let mut out = format!("# {title}\n\n");
    for (chapter_title, content) in chapters {
        out.push_str(&format!("## {chapter_title}\n\n{content}\n\n"));
    }
    Ok(out)
}

#[derive(Deserialize)]
pub struct BibliographySection {
    label: String,
    entries: Vec<String>,
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
        let title = fetch_project_title(conn, &project_id).map_err(|e| e.to_string())?;
        let chapters = fetch_chapters(conn, &project_id).map_err(|e| e.to_string())?;
        (title, chapters)
    };

    let mut docx = Docx::new().add_paragraph(
        Paragraph::new().add_run(Run::new().add_text(title).bold().size(36)),
    );

    for (chapter_title, content) in chapters {
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(chapter_title).bold().size(28)));
        for block in content.split("\n\n") {
            let text = strip_wikilinks(block.trim());
            if text.is_empty() {
                continue;
            }
            docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(text)));
        }
    }

    if !bibliography.is_empty() {
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text("Quellenverzeichnis").bold().size(28)));
        for section in bibliography {
            docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(section.label).bold().size(22)));
            for entry in section.entries {
                docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(entry)));
            }
        }
    }

    let file = std::fs::File::create(std::path::Path::new(&path)).map_err(|e| e.to_string())?;
    docx.build().pack(file).map_err(|e| format!("{e:?}"))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_wikilinks_prefers_alias() {
        assert_eq!(strip_wikilinks("See [[BGE 137 I 16]] here."), "See BGE 137 I 16 here.");
        assert_eq!(strip_wikilinks("See [[BGE 137 I 16|the leading case]] here."), "See the leading case here.");
        assert_eq!(strip_wikilinks("Unclosed [[nope"), "Unclosed [[nope");
    }
}
