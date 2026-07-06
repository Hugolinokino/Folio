-- Akten need a document date (Verzeichnis view shows it), separate from
-- when the row was imported into Folio.
ALTER TABLE documents ADD COLUMN doc_date TEXT;
