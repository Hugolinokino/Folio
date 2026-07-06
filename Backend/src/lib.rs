mod academia;
mod academia_export;
mod auth;
mod commands;
mod db;
mod praxis;
mod strategie;

use std::sync::Mutex;

pub struct AppState {
    pub conn: Mutex<Option<rusqlite::Connection>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .manage(AppState { conn: Mutex::new(None) })
    .invoke_handler(tauri::generate_handler![
      commands::has_workspace,
      commands::create_workspace,
      commands::unlock_workspace,
      commands::get_workspace_info,
      strategie::list_strategy_workspaces,
      strategie::create_strategy_workspace,
      strategie::get_strategy_data,
      strategie::save_strategy_data,
      praxis::list_cases,
      praxis::get_case,
      praxis::create_case,
      praxis::list_case_parties,
      praxis::create_case_party,
      praxis::list_deadlines,
      praxis::list_all_deadlines,
      praxis::create_deadline,
      praxis::complete_deadline,
      praxis::list_documents,
      praxis::read_binary_file,
      praxis::import_document,
      praxis::list_chrono,
      praxis::create_chrono_event,
      praxis::list_correspondence,
      praxis::create_correspondence,
      praxis::list_billing_entries,
      praxis::create_billing_entry,
      praxis::list_drafts,
      praxis::create_draft,
      praxis::update_draft_content,
      academia::list_projects,
      academia::get_project,
      academia::create_project,
      academia::list_sources,
      academia::create_source,
      academia::import_source,
      academia::list_notes,
      academia::get_note,
      academia::create_note,
      academia::update_note,
      academia::list_backlinks,
      academia::list_chapters,
      academia::create_chapter,
      academia::update_chapter_content,
      academia::list_tasks,
      academia::create_task,
      academia::complete_task,
      academia::list_milestones,
      academia::create_milestone,
      academia::list_activity,
      academia::list_outline,
      academia::create_outline_node,
      academia::list_argument_points,
      academia::create_argument_point,
      academia::link_argument_source,
      academia::unlink_argument_source,
      academia::list_theses,
      academia::create_thesis,
      academia::list_thesis_points,
      academia::add_thesis_point,
      academia::list_quotes,
      academia::create_quote,
      academia_export::export_chapters_markdown,
      academia_export::export_chapters_docx,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
