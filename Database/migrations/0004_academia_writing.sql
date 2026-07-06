-- Academia: fields and tables the real Bibliothek/Notizen/Schreiben UI needs
-- beyond the initial projects/sources/notes/note_links skeleton.

ALTER TABLE notes ADD COLUMN tags TEXT;
ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE sources ADD COLUMN content TEXT;

CREATE TABLE chapters (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Gerüst',
    content TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
