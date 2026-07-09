-- Governance: mandate registry + one JSON slice per Board, mirroring the
-- strategy_workspaces / strategy_data split (opaque blobs, frontend owns the shape).

CREATE TABLE IF NOT EXISTS governance_workspaces (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    rechtsform TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS governance_data (
    workspace_id TEXT PRIMARY KEY REFERENCES governance_workspaces(id) ON DELETE CASCADE,
    normenwerk TEXT,
    verweisnetz TEXT,
    organe_kompetenzen TEXT,
    prozesse_kontrolle TEXT,
    compliance TEXT,
    scorecard TEXT,
    reform_simulator TEXT
);
