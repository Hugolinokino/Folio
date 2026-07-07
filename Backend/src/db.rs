use rusqlite::Connection;
use std::path::{Path, PathBuf};

/// Ordered, numbered migrations tracked via SQLite's PRAGMA user_version.
/// Each entry is applied at most once per database, in order, so existing
/// installations pick up new tables/columns without losing data.
const MIGRATIONS: &[(i32, &str)] = &[
    (1, include_str!("../../Database/migrations/0001_initial.sql")),
    (2, include_str!("../../Database/migrations/0002_praxis_extensions.sql")),
    (3, include_str!("../../Database/migrations/0003_document_date.sql")),
    (4, include_str!("../../Database/migrations/0004_academia_writing.sql")),
    (5, include_str!("../../Database/migrations/0005_academia_boards.sql")),
    (6, include_str!("../../Database/migrations/0006_source_details.sql")),
];

pub fn db_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("folio.db")
}

/// Opens the database file and keys it with the derived SQLCipher key.
/// Touches sqlite_master immediately so a wrong key surfaces as an error here
/// rather than silently returning garbage on the first real query.
pub fn open_and_key(path: &Path, key_hex: &str) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    conn.pragma_update(None, "key", format!("x'{key_hex}'"))?;
    conn.query_row("SELECT count(*) FROM sqlite_master", [], |row| row.get::<_, i64>(0))?;
    // Per-connection pragma: the `PRAGMA foreign_keys = ON` in migration 0001
    // only covered the connection that ran it. Without this, every later app
    // start silently loses FK enforcement — and with it all ON DELETE CASCADE
    // behaviour the schema relies on.
    conn.pragma_update(None, "foreign_keys", "ON")?;
    Ok(conn)
}

pub fn migrate(conn: &Connection) -> rusqlite::Result<()> {
    let current: i32 = conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    for (version, sql) in MIGRATIONS {
        if *version > current {
            conn.execute_batch(sql)?;
            conn.execute_batch(&format!("PRAGMA user_version = {version}"))?;
        }
    }
    Ok(())
}
