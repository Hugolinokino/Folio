-- Academia: Auflage und Erscheinungsort für Forstmoser-konforme
-- Literatur-Vollzitate ("Titel (3. A. Bern 2023)").

ALTER TABLE sources ADD COLUMN edition TEXT;
ALTER TABLE sources ADD COLUMN place TEXT;
