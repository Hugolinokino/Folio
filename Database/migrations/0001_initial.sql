-- Folio local-first schema. Applied once via the Rust migration runner (Backend/src/db.rs)
-- against the SQLCipher-encrypted SQLite database in the app data directory.

PRAGMA foreign_keys = ON;

-- ============================================================
-- Praxis: Case / Firm Management
-- ============================================================

CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    ref TEXT UNIQUE NOT NULL,
    phase TEXT NOT NULL,
    streitwert TEXT,
    gebiet TEXT,
    rate REAL DEFAULT 250.0,
    budget REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deadlines (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    type TEXT CHECK(type IN ('behördlich', 'gesetzlich', 'erstreckt', 'intern')),
    note TEXT,
    completed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    nr TEXT NOT NULL,
    title TEXT NOT NULL,
    sender TEXT,
    doc_type TEXT,
    pages INTEGER,
    file_path TEXT NOT NULL,
    content TEXT,
    embedding BLOB,
    cluster_id INTEGER
);

-- ============================================================
-- Academia: Research Workspace
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    advisor TEXT,
    due_date TEXT,
    progress REAL DEFAULT 0.0,
    color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT CHECK(type IN ('BGE', 'Literatur', 'Gesetz', 'Materialien')),
    citation_key TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    year INTEGER,
    annotation TEXT,
    file_path TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    pro_con_structure TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS note_links (
    source_note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
    target_note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
    PRIMARY KEY (source_note_id, target_note_id)
);

-- ============================================================
-- Strategie: Scenario Planning
-- ============================================================

CREATE TABLE IF NOT EXISTS strategy_workspaces (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    horizon TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS strategy_data (
    workspace_id TEXT PRIMARY KEY REFERENCES strategy_workspaces(id) ON DELETE CASCADE,
    swot_pestel_stakeholders TEXT,
    foresight_radar TEXT,
    timelines_scenarios TEXT,
    options_matrix TEXT,
    wargaming_simulation TEXT,
    execution_kpis TEXT,
    journal_retro TEXT
);
