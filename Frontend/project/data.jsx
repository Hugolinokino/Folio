/* Project + board data for Research Hub */

const PROJECTS = [
  {
    id: 'bge-art10',
    title: 'Art. 10 BV — Persönliche Freiheit',
    type: 'Bachelorarbeit',
    advisor: 'Prof. Dr. R. Hilty',
    due: '15. Aug 2026',
    progress: 0.62,
    color: 'blue',
    sources: 47,
    notes: 23,
    open: true,
  },
  {
    id: 'opencaselaw',
    title: 'KI im Strafverfahren',
    type: 'Seminararbeit',
    advisor: 'Prof. Dr. M. Niggli',
    due: '04. Jul 2026',
    progress: 0.34,
    color: 'red',
    sources: 28,
    notes: 11,
  },
  {
    id: 'forstmoser',
    title: 'Aktienrechtsrevision 2023',
    type: 'Policy-Paper',
    advisor: 'Prof. Dr. P. Forstmoser',
    due: '22. Sep 2026',
    progress: 0.18,
    color: 'green',
    sources: 14,
    notes: 6,
  },
  {
    id: 'fedlex',
    title: 'DSG-Reform & Cloud-Recht',
    type: 'Seminararbeit',
    advisor: 'Prof. Dr. F. Thouvenin',
    due: '11. Dez 2026',
    progress: 0.08,
    color: 'amber',
    sources: 7,
    notes: 2,
  },
  {
    id: 'eheguterrecht',
    title: 'Eheguterrecht im Wandel',
    type: 'Masterarbeit',
    advisor: 'Prof. Dr. A. Büchler',
    due: '03. Mär 2027',
    progress: 0.45,
    color: 'ink',
    sources: 62,
    notes: 38,
  },
  {
    id: 'esg-board',
    title: 'ESG-Pflichten des VR',
    type: 'BA-Thesis',
    advisor: 'Prof. Dr. H.-U. Vogt',
    due: '29. Mai 2026',
    progress: 0.87,
    color: 'blue',
    sources: 81,
    notes: 54,
  },
];

const BOARDS = [
  {
    id: 'projekte',
    num: '01',
    title: 'Projektverwaltung',
    italic: 'Strukturen für lange Arbeiten',
    color: 'var(--accent-ink)',
    bullets: [
      { key: 'A', t: 'Projektordner mit Typ, Datum, Betreuung' },
      { key: 'B', t: 'Dashboard — Fortschritt, Tasks, Verlauf' },
      { key: 'C', t: 'Vorlagen: BA · Seminar · Policy · Memo' },
      { key: 'D', t: 'Deadlines mit Meilensteinen' },
    ],
    stats: [{ n: '6', l: 'projekte aktiv' }, { n: '3', l: 'meilensteine' }, { n: '11d', l: 'nächste deadline' }],
  },
  {
    id: 'quellen',
    num: '02',
    title: 'Quellen & Literatur',
    italic: 'Forstmoser-Zitierung, präzis',
    color: 'var(--accent-blue)',
    bullets: [
      { key: 'A', t: 'Bibliothek: BGE · Lit · Gesetz · Materialien' },
      { key: 'B', t: 'Forstmoser-Zitate automatisch' },
      { key: 'C', t: 'PDF-Upload & Annotation' },
      { key: 'D', t: 'Verzeichnis-Export auf Knopfdruck' },
    ],
    stats: [{ n: '47', l: 'quellen erfasst' }, { n: '14', l: 'bge' }, { n: '23', l: 'literatur' }],
  },
  {
    id: 'recherche',
    num: '03',
    title: 'Recherche-Tools',
    italic: 'Sechs Datenbanken, ein Fenster',
    color: 'var(--accent-green)',
    bullets: [
      { key: 'A', t: 'opencaselaw · bge-search · entscheidsuche' },
      { key: 'B', t: 'fedlex · onlinekommentar · legal-citations' },
      { key: 'C', t: 'Consensus für Paper-Suche' },
      { key: 'D', t: 'Unified Search — Recht + Lit + Web' },
    ],
    stats: [{ n: '6', l: 'datenbanken' }, { n: '142', l: 'treffer heute' }, { n: '12', l: 'gespeichert' }],
  },
  {
    id: 'notizen',
    num: '04',
    title: 'Notizen & Synthese',
    italic: 'Vom Material zum Argument',
    color: 'var(--accent-red)',
    bullets: [
      { key: 'A', t: 'Editor mit @-Quellenverknüpfung' },
      { key: 'B', t: 'AI kennt Quellen, Notizen, Projekttyp' },
      { key: 'C', t: 'Gliederung — Quellen → Kapitel' },
      { key: 'D', t: 'Thesen-Board mit Gegenargumenten' },
    ],
    stats: [{ n: '23', l: 'notizen' }, { n: '8', l: 'thesen' }, { n: '4', l: 'kapitel' }],
  },
  {
    id: 'schreiben',
    num: '05',
    title: 'Schreiben & Export',
    italic: 'Vom Argument zur Abgabe',
    color: 'var(--accent-ink)',
    bullets: [
      { key: 'A', t: 'Formulierungshilfe & Argumentationscheck' },
      { key: 'B', t: 'Fussnoten-Generator (Forstmoser)' },
      { key: 'C', t: 'Verzeichnisse: Lit · Erlass · Materialien' },
      { key: 'D', t: 'Export — Word · PDF · LaTeX' },
    ],
    stats: [{ n: '14.2k', l: 'wörter' }, { n: '38', l: 'fussnoten' }, { n: '4', l: 'kapitel fertig' }],
  },
];

window.PROJECTS = PROJECTS;
window.BOARDS = BOARDS;

/* ---------- Academia: benutzerdefinierte Projekte (Persistenz + Reaktivität) ---------- */
const PJ_KEY = 'rh-academia-projects-custom';
const PJ_COLORS = ['blue', 'red', 'green', 'amber', 'ink'];
let pjCustom = [];
try { const raw = localStorage.getItem(PJ_KEY); if (raw) pjCustom = JSON.parse(raw) || []; } catch (e) {}
const pjSubs = new Set();
function pjSave() { try { localStorage.setItem(PJ_KEY, JSON.stringify(pjCustom)); } catch (e) {} }
function pjNotify() { pjSubs.forEach((f) => f()); }
function pjAll() { return [...PROJECTS, ...pjCustom]; }
function pjCreate({ title, type, advisor }) {
  const id = 'pj-' + Date.now().toString(36);
  const proj = {
    id, title: (title || 'Neues Projekt').trim() || 'Neues Projekt',
    type: (type || 'Projekt').trim() || 'Projekt',
    advisor: (advisor || '').trim(),
    due: '—', progress: 0,
    color: PJ_COLORS[pjAll().length % PJ_COLORS.length],
    sources: 0, notes: 0,
  };
  pjCustom = [...pjCustom, proj];
  pjSave();
  pjNotify();
  return proj;
}
function usePjAll() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { const f = () => force(); pjSubs.add(f); return () => pjSubs.delete(f); }, []);
  return pjAll();
}
window.pjAll = pjAll;
window.pjCreate = pjCreate;
window.usePjAll = usePjAll;

/* Obsidian-style tag palette — name → color */
const TAG_COLORS = {
  leiturteil:    'var(--accent-blue)',
  kerngehalt:    'var(--accent-red)',
  kritik:        'var(--accent-red)',
  lehre:         'var(--accent-ink)',
  abgrenzung:    'var(--accent-amber)',
  methodik:      'var(--accent-green)',
  verhältnismässigkeit: 'var(--accent-green)',
  ungelesen:     'var(--ink-4)',
  todo:          'var(--accent-amber)',
};
const TAG_SUGGEST = ['leiturteil', 'kerngehalt', 'kritik', 'lehre', 'abgrenzung', 'methodik', 'verhältnismässigkeit', 'todo'];
const tagColor = (t) => TAG_COLORS[t.toLowerCase()] || 'var(--accent-blue)';

/* Folders shown in the sidebar (Dateien) */
const FOLDERS = [
  { id: 'processed', name: 'processed' },
  { id: 'swiss-norm', name: 'Swiss Norm Change Quantification' },
];

/* Recently used — Startseite */
const RECENTS = [
  { type: 'quelle', icon: 'scales', title: 'BGE 137 I 16 — Persönliche Freiheit', meta: 'gerade eben' },
  { type: 'notiz',  icon: 'note',   title: 'Kerngehalt vs. Kerngehaltstheorie', meta: 'gerade eben' },
  { type: 'quelle', icon: 'book',   title: 'Müller/Schefer — Grundrechte (4. A.)', meta: 'vor 2 Std.' },
  { type: 'these',  icon: 'flag',   title: 'These #3 — Dynamischer Schutzbereich', meta: 'gestern' },
  { type: 'quelle', icon: 'doc',    title: 'Kiener, AJP 2018 — Dogmatischer Mythos', meta: 'gestern' },
];

window.TAG_COLORS = TAG_COLORS;
window.TAG_SUGGEST = TAG_SUGGEST;
window.tagColor = tagColor;
window.FOLDERS = FOLDERS;
window.RECENTS = RECENTS;
