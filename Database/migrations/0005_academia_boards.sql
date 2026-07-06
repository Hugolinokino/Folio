-- Academia: Projektverwaltung (Aufgaben/Meilensteine/Aktivität), Gliederung,
-- Thesen and Zitate — the remaining "Boards" from the Research Hub prototype.

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date TEXT NOT NULL
);

CREATE TABLE activity_log (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outline_nodes (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES outline_nodes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE argument_points (
    id TEXT PRIMARY KEY,
    node_id TEXT REFERENCES outline_nodes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE argument_sources (
    argument_id TEXT REFERENCES argument_points(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES sources(id) ON DELETE CASCADE,
    PRIMARY KEY (argument_id, source_id)
);

CREATE TABLE theses (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    summary TEXT,
    position TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE thesis_points (
    id TEXT PRIMARY KEY,
    thesis_id TEXT REFERENCES theses(id) ON DELETE CASCADE,
    side TEXT CHECK(side IN ('pro', 'con')),
    text TEXT NOT NULL,
    source_id TEXT REFERENCES sources(id),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES sources(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    cluster TEXT,
    tag TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
