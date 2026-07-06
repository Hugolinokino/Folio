-- Praxis: fields and child tables the real Fallverwaltung/Workbench UI needs
-- beyond the initial cases/deadlines/documents skeleton.

ALTER TABLE cases ADD COLUMN kurz TEXT;
ALTER TABLE cases ADD COLUMN verfahren TEXT;
ALTER TABLE cases ADD COLUMN gericht TEXT;
ALTER TABLE cases ADD COLUMN nr TEXT;
ALTER TABLE cases ADD COLUMN color TEXT DEFAULT 'blue';
ALTER TABLE cases ADD COLUMN rolle_klient TEXT DEFAULT 'Klient*in';

ALTER TABLE documents ADD COLUMN folder TEXT;

-- SQLite has no ALTER ... MODIFY CHECK; rebuild to broaden the allowed deadline types.
CREATE TABLE deadlines_new (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    type TEXT CHECK(type IN ('behördlich', 'gesetzlich', 'erstreckt', 'intern', 'gerichtlich', 'termin')),
    note TEXT,
    completed INTEGER DEFAULT 0
);
INSERT INTO deadlines_new (id, case_id, title, due_date, type, note, completed)
    SELECT id, case_id, title, due_date, type, note, completed FROM deadlines;
DROP TABLE deadlines;
ALTER TABLE deadlines_new RENAME TO deadlines;

CREATE TABLE case_parties (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    rolle TEXT NOT NULL,
    name TEXT NOT NULL,
    detail TEXT,
    vertreter TEXT,
    is_klient INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE chrono_events (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    event_date TEXT NOT NULL,
    ereignis TEXT NOT NULL,
    beleg TEXT
);

CREATE TABLE correspondence (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    corr_date TEXT NOT NULL,
    richtung TEXT CHECK(richtung IN ('ein', 'aus')),
    von TEXT,
    betreff TEXT,
    typ TEXT
);

CREATE TABLE billing_entries (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    entry_date TEXT NOT NULL,
    taetigkeit TEXT NOT NULL,
    minutes INTEGER NOT NULL
);

CREATE TABLE drafts (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
    titel TEXT NOT NULL,
    typ TEXT,
    status TEXT DEFAULT 'Gerüst',
    content TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
