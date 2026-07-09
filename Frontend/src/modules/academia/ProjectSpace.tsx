import { useEffect, useState } from 'react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/Icon';
import { PdfViewer } from '../../components/PdfViewer';
import { countWords, todayIso, formatRelative } from '../../lib/praxis/format';
import { useProjectWorkspace, useProjectBoard } from '../../lib/academia/store';
import type { SourceDto } from '../../lib/academia/api';
import { formatVollzitat, formatKurzzitat, buildBibliography, type KurzzitatOptions } from '../../lib/academia/citation';
import { NoteEditor } from './NoteEditor';
import { ChapterEditor, type InsertRequest } from './ChapterEditor';
import { Recherche } from './Recherche';
import { Gliederung } from './Gliederung';
import { Thesen } from './Thesen';
import { Zitate } from './Zitate';

type Workspace = ReturnType<typeof useProjectWorkspace>;

const PROJECT_TABS = [
  { id: 'uebersicht', l: 'Übersicht' },
  { id: 'bibliothek', l: 'Bibliothek' },
  { id: 'recherche', l: 'Recherche' },
  { id: 'gliederung', l: 'Gliederung' },
  { id: 'notizen', l: 'Notizen' },
  { id: 'thesen', l: 'Thesen' },
  { id: 'zitate', l: 'Zitate' },
  { id: 'schreiben', l: 'Schreiben' },
];

export function ProjectSpace({ projectId, initialTab }: { projectId: string; initialTab?: string }) {
  const ws = useProjectWorkspace(projectId);
  const { project, loading } = ws;
  const [tab, setTab] = useState(initialTab || 'uebersicht');
  const [notesFocusId, setNotesFocusId] = useState<string | null>(null);

  const goToNote = (noteId: string) => {
    setNotesFocusId(noteId);
    setTab('notizen');
  };

  if (loading || !project) {
    return (
      <div className="detail view-in" data-screen-label="Projekt">
        <div className="t-sans-sm" style={{ padding: 40 }}>Projekt wird geladen …</div>
      </div>
    );
  }

  return (
    <div className="detail view-in" data-screen-label={`Projekt · ${project.title}`}>
      <div className="fall-head">
        <div className="col" style={{ gap: 3, minWidth: 0 }}>
          <div className="t-mono-sm crumb-line">
            <span>{project.type}</span>
          </div>
          <div className="row-flex" style={{ gap: 12 }}>
            <h1 className="fall-title">{project.title}<span className="ac">.</span></h1>
          </div>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          <span className="chip">{Math.round(project.progress * 100)}% Fortschritt</span>
        </div>
      </div>

      <div className="tabs" style={{ alignSelf: 'flex-start' }}>
        {PROJECT_TABS.map((t) => (
          <span key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.l}</span>
        ))}
      </div>

      {tab === 'uebersicht' && <ProjectUebersicht ws={ws} goTab={setTab} projectId={projectId} />}
      {tab === 'bibliothek' && <ProjectBibliothek ws={ws} />}
      {tab === 'recherche' && <Recherche addSource={ws.addSource} />}
      {tab === 'gliederung' && <Gliederung projectId={projectId} sources={ws.sources} />}
      {tab === 'notizen' && <ProjectNotizen ws={ws} focusId={notesFocusId} />}
      {tab === 'thesen' && <Thesen projectId={projectId} sources={ws.sources} />}
      {tab === 'zitate' && <Zitate projectId={projectId} sources={ws.sources} />}
      {tab === 'schreiben' && <ProjectSchreiben ws={ws} onOpenNote={goToNote} />}
    </div>
  );
}

/* ---------- Übersicht ---------- */
function ProjectUebersicht({ ws, goTab, projectId }: { ws: Workspace; goTab: (tab: string) => void; projectId: string }) {
  const { project, sources, notes, chapters } = ws;
  const board = useProjectBoard(projectId);
  const [newTask, setNewTask] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(todayIso());

  if (!project) return null;
  const words = chapters.reduce((s, c) => s + countWords(c.content), 0);

  const submitTask = () => {
    if (!newTask.trim()) return;
    board.addTask(newTask.trim(), newTaskDue || null);
    setNewTask('');
    setNewTaskDue('');
  };

  const submitMilestone = () => {
    if (!newMilestone.trim() || !newMilestoneDate) return;
    board.addMilestone(newMilestone.trim(), newMilestoneDate);
    setNewMilestone('');
  };

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '1fr 320px' }}>
      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="grid-3" style={{ minHeight: 'auto' }}>
          <div className="cell-stat"><span className="lbl">Quellen</span><span className="val">{sources.length}</span></div>
          <div className="cell-stat"><span className="lbl">Notizen</span><span className="val">{notes.length}</span></div>
          <div className="cell-stat"><span className="lbl">Wörter</span><span className="val">{words.toLocaleString('de-CH')}</span></div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="title">Aufgaben</span></div>
          <div className="col" style={{ gap: 0 }}>
            {board.tasks.map((t) => (
              <div key={t.id} className={`ckrow ${t.done ? 'done' : ''}`}>
                <span className="ck" onClick={() => !t.done && board.completeTask(t.id)}>{t.done && <Icon name="check" size={11} />}</span>
                <span className="lbl" onClick={() => !t.done && board.completeTask(t.id)} style={{ cursor: 'pointer' }}>{t.title}</span>
                {t.dueDate && <span className="meta">{t.dueDate}</span>}
                <button className="ab danger" title="Aufgabe löschen" onClick={() => board.deleteTask(t.id)}><Icon name="close" size={12} /></button>
              </div>
            ))}
            {board.tasks.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 6px' }}>Noch keine Aufgaben.</div>}
          </div>
          <div className="row-flex" style={{ gap: 6, marginTop: 10 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Neue Aufgabe …" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitTask()} />
            <input className="input" type="date" style={{ flex: '0 0 140px' }} value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitTask()} />
            <button className="btn-ghost-glass" onClick={submitTask}><Icon name="plus" size={12} /></button>
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            <span className="title">Zuletzt bearbeitet</span>
            <span className="sub link-sub" onClick={() => goTab('notizen')}>alle</span>
          </div>
          <div className="col" style={{ gap: 2 }}>
            {notes.slice(0, 6).map((n) => (
              <div key={n.id} className="entwurf-row" onClick={() => goTab('notizen')}>
                <span className="ico"><Icon name="note" size={14} /></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <span className="et">{n.title}</span>
                  {n.tags && <span className="em">{n.tags}</span>}
                </div>
              </div>
            ))}
            {notes.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Notizen.</div>}
          </div>
        </div>
      </div>

      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head"><span className="title">Fortschritt</span></div>
          <div className="progress" style={{ marginTop: 4 }}><span style={{ width: `${Math.min(100, project.progress * 100)}%` }}></span></div>
          {project.advisor && <div className="t-sans-sm" style={{ marginTop: 10 }}>Betreuung: {project.advisor}</div>}
          {project.dueDate && <div className="t-sans-sm" style={{ marginTop: 4 }}>Abgabe: {project.dueDate}</div>}
        </div>

        <div className="panel">
          <div className="panel-head"><span className="title">Meilensteine</span></div>
          <div className="tl">
            {board.milestones.map((m) => (
              <div key={m.id} className="ev" style={{ gridTemplateColumns: '70px 1fr auto', alignItems: 'center' }}>
                <span className="t">{m.targetDate}</span>
                <span className="d">{m.title}</span>
                <button className="ab danger" title="Meilenstein löschen" onClick={() => board.deleteMilestone(m.id)}><Icon name="close" size={11} /></button>
              </div>
            ))}
            {board.milestones.length === 0 && <div className="t-sans-sm" style={{ padding: '4px 0' }}>Noch keine Meilensteine.</div>}
          </div>
          <div className="row-flex" style={{ gap: 6, marginTop: 10 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Meilenstein …" value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitMilestone()} />
            <input className="input" type="date" style={{ flex: '0 0 140px' }} value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitMilestone()} />
            <button className="btn-ghost-glass" onClick={submitMilestone}><Icon name="plus" size={12} /></button>
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head"><span className="title">Aktivität</span></div>
          <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
            <div className="tl">
              {board.activity.map((a) => (
                <div key={a.id} className="ev"><span className="t">{a.createdAt ? formatRelative(a.createdAt) : ''}</span><span className="d">{a.message}</span></div>
              ))}
              {board.activity.length === 0 && <div className="t-sans-sm" style={{ padding: '4px 0' }}>Noch keine Aktivität.</div>}
            </div>
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head"><span className="title">Kapitel</span><span className="sub link-sub" onClick={() => goTab('schreiben')}>alle</span></div>
          <div className="col" style={{ gap: 2 }}>
            {chapters.map((c) => (
              <div key={c.id} className="entwurf-row" onClick={() => goTab('schreiben')}>
                <span className="ico"><Icon name="pen" size={14} /></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <span className="et">{c.title}</span>
                  <span className="em">{c.status}</span>
                </div>
                <span className="em">{countWords(c.content).toLocaleString('de-CH')} W.</span>
              </div>
            ))}
            {chapters.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Kapitel.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bibliothek ---------- */
const SOURCE_TYPES = ['BGE', 'Literatur', 'Gesetz', 'Materialien'];
const SOURCE_ICON: Record<string, 'scales' | 'doc' | 'folder' | 'book'> = {
  BGE: 'scales', Gesetz: 'doc', Materialien: 'folder', Literatur: 'book',
};

function ProjectBibliothek({ ws }: { ws: Workspace }) {
  const { sources, addSource, importSource, deleteSource, renameSource } = ws;
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pdfSource, setPdfSource] = useState<SourceDto | null>(null);
  const [form, setForm] = useState({ type: 'Literatur', citationKey: '', title: '', author: '', year: '', annotation: '', edition: '', place: '' });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!selId && sources[0]) setSelId(sources[0].id);
  }, [sources, selId]);

  const counts: Record<string, number> = {};
  sources.forEach((s) => { counts[s.type] = (counts[s.type] || 0) + 1; });
  const visible = sources.filter(
    (s) => (!typeFilter || s.type === typeFilter) && (!search || (s.title + ' ' + (s.author || '')).toLowerCase().includes(search.toLowerCase())),
  );
  const sel: SourceDto | null = sources.find((s) => s.id === selId) || null;

  const submit = () => {
    if (!form.title.trim()) return;
    addSource(
      form.type,
      form.citationKey.trim() || form.title.trim(),
      form.title.trim(),
      form.author.trim(),
      form.year ? Number(form.year) : null,
      form.annotation.trim(),
      form.edition.trim(),
      form.place.trim(),
    );
    setForm((f) => ({ ...f, citationKey: '', title: '', author: '', year: '', annotation: '', edition: '', place: '' }));
    setAdding(false);
  };

  const handleImport = async () => {
    setImporting(true);
    try { await importSource(form.type); } finally { setImporting(false); }
  };

  const handleDelete = async (e: React.MouseEvent, s: SourceDto) => {
    e.stopPropagation();
    const ok = await confirm(`Quelle "${s.title}" unwiderruflich löschen?`, { title: 'Quelle löschen', kind: 'warning' });
    if (!ok) return;
    if (selId === s.id) setSelId(null);
    await deleteSource(s.id);
  };

  const startRename = (e: React.MouseEvent, s: SourceDto) => {
    e.stopPropagation();
    setRenamingId(s.id);
    setRenameValue(s.title);
  };

  const commitRename = () => {
    if (renamingId) renameSource(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <div className="detail-body lib-body">
      <div className="panel">
        <div className="panel-head"><span className="title">Bibliothek</span></div>
        <div className="filter-group">
          <div className="fh">Typ</div>
          <div className={`filter-row ${!typeFilter ? 'on' : ''}`} onClick={() => setTypeFilter(null)}>
            <span>Alle</span><span className="ix">{sources.length}</span>
          </div>
          {SOURCE_TYPES.map((t) => (
            <div key={t} className={`filter-row ${typeFilter === t ? 'on' : ''}`} onClick={() => setTypeFilter(t)}>
              <span>{t}</span><span className="ix">{counts[t] || 0}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }} onClick={handleImport} disabled={importing}>
            <Icon name="upload" size={12} /> {importing ? 'Wird importiert…' : 'PDF importieren'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="row-flex" style={{ gap: 14 }}>
            <span className="title">Quellen</span>
            <span className="t-mono-sm">{visible.length} von {sources.length}</span>
          </span>
          <button className="btn-ghost-glass" onClick={() => setAdding((a) => !a)}><Icon name="plus" size={12} /> Quelle</button>
        </div>

        <div className="search" style={{ marginBottom: 14 }}>
          <Icon name="search" size={14} />
          <input placeholder="Quellen durchsuchen …" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {adding && (
          <div className="col" style={{ gap: 6, marginBottom: 14, padding: 10, background: 'var(--fill-1)', borderRadius: 10 }}>
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <select className="input" style={{ flex: '0 0 120px' }} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input" style={{ flex: 2 }} placeholder="Titel" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 1 }} placeholder="Autor" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" type="number" style={{ flex: '0 0 90px' }} placeholder="Jahr" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 1 }} placeholder="Zitat-Key" value={form.citationKey} onChange={(e) => setForm((f) => ({ ...f, citationKey: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 1 }} placeholder="Auflage (z.B. 4.)" value={form.edition} onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 1 }} placeholder="Ort" value={form.place} onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 2 }} placeholder="Anmerkung" value={form.annotation} onChange={(e) => setForm((f) => ({ ...f, annotation: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Speichern</button>
            </div>
          </div>
        )}

        <div className="tlist scroll" style={{ overflow: 'auto', flex: 1 }}>
          {visible.map((s) => (
            <div key={s.id} className={`src-row ${selId === s.id ? 'sel' : ''}`} onClick={() => setSelId(s.id)}>
              <span className="si"><Icon name={SOURCE_ICON[s.type] || 'doc'} size={15} /></span>
              <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <div className="row-flex" style={{ gap: 10, minWidth: 0 }}>
                  <span className="sr-kurz">{s.citationKey}</span>
                  {renamingId === s.id ? (
                    <input
                      className="po-add-input"
                      style={{ flex: 1 }}
                      autoFocus
                      value={renameValue}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                    />
                  ) : (
                    <span className="sr-titel">{s.title}</span>
                  )}
                  <span style={{ flex: 1 }}></span>
                  {s.year != null && <span className="t-mono-num" style={{ flexShrink: 0 }}>{s.year}</span>}
                </div>
                {s.author && <span className="t-mono-sm">{s.author}</span>}
              </div>
              <span className="akt-actions">
                {s.filePath && (
                  <button className="ab" title="PDF anzeigen" onClick={(e) => { e.stopPropagation(); setPdfSource(s); }}>
                    <Icon name="eye" size={14} />
                  </button>
                )}
                <button className="ab" title="Umbenennen" onClick={(e) => startRename(e, s)}><Icon name="edit" size={13} /></button>
                <button className="ab danger" title="Quelle löschen" onClick={(e) => handleDelete(e, s)}><Icon name="close" size={13} /></button>
              </span>
            </div>
          ))}
          {visible.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Keine Quellen gefunden.</div>}
        </div>
      </div>

      {pdfSource?.filePath && (
        <PdfViewer filePath={pdfSource.filePath} title={`${pdfSource.citationKey} · ${pdfSource.title}`} onClose={() => setPdfSource(null)} />
      )}

      <div className="col scroll" style={{ gap: 16, minHeight: 0, overflowY: 'auto', paddingRight: 2 }}>
        {sel ? (
          <>
            <div className="panel">
              <div className="panel-head"><span className="title">{sel.citationKey}</span></div>
              <div className="kv">
                <span className="k">Titel</span><span className="v">{sel.title}</span>
                <span className="k">Autor</span><span className="v">{sel.author || '—'}</span>
                <span className="k">Jahr</span><span className="v t-mono-num">{sel.year ?? '—'}</span>
                <span className="k">Typ</span><span className="v">{sel.type}</span>
              </div>
              {sel.annotation && (
                <>
                  <div className="divider" style={{ margin: '12px 0 10px' }}></div>
                  <div className="t-sans-sm">{sel.annotation}</div>
                </>
              )}
            </div>
            {sel.content && (
              <div className="panel">
                <div className="panel-head"><span className="title">PDF · Auszug</span></div>
                <div className="pdf-preview">
                  <p>{sel.content.slice(0, 1200)}{sel.content.length > 1200 ? '…' : ''}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="panel"><span className="t-sans-sm">Keine Quelle ausgewählt.</span></div>
        )}
      </div>
    </div>
  );
}

/* ---------- Notizen ---------- */
function ProjectNotizen({ ws, focusId }: { ws: Workspace; focusId: string | null }) {
  const { notes, addNote, renameNote, deleteNote } = ws;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (focusId) setSelectedId(focusId);
  }, [focusId]);

  useEffect(() => {
    if (!selectedId && notes[0]) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const visible = notes.filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase()));

  const createNote = async (title: string) => {
    const note = await addNote(title);
    if (note) setSelectedId(note.id);
  };

  const submitNew = () => {
    if (!newTitle.trim()) return;
    createNote(newTitle.trim());
    setNewTitle('');
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    const ok = await confirm(`Notiz "${title}" unwiderruflich löschen? Backlinks aus anderen Notizen werden entfernt.`, { title: 'Notiz löschen', kind: 'warning' });
    if (!ok) return;
    if (selectedId === id) setSelectedId(null);
    await deleteNote(id);
  };

  const startRename = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(title);
  };

  const commitRename = () => {
    if (renamingId) renameNote(renamingId, renameValue);
    setRenamingId(null);
  };

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '260px 1fr' }}>
      <div className="panel">
        <div className="panel-head"><span className="title">Notizen</span></div>
        <div className="search" style={{ marginBottom: 10 }}>
          <Icon name="search" size={13} />
          <input placeholder="Notiz suchen…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="sidelist scroll" style={{ overflow: 'auto', flex: 1 }}>
          {visible.map((n) => (
            <div key={n.id} className={`it ${selectedId === n.id ? 'on' : ''}`} onClick={() => setSelectedId(n.id)}>
              <span className="c"></span>
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                {renamingId === n.id ? (
                  <input
                    className="po-add-input"
                    autoFocus
                    value={renameValue}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                  />
                ) : (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                )}
                <span className="t-mono-sm">{n.tags || '—'}</span>
              </div>
              {renamingId !== n.id && (
                <button className="ab" title="Umbenennen" onClick={(e) => startRename(e, n.id, n.title)}><Icon name="edit" size={12} /></button>
              )}
              <button className="ab danger" title="Notiz löschen" onClick={(e) => handleDelete(e, n.id, n.title)}><Icon name="close" size={12} /></button>
            </div>
          ))}
          {visible.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Keine Notizen gefunden.</div>}
        </div>
        <div className="divider" style={{ margin: '8px 0' }}></div>
        <div className="row-flex" style={{ gap: 6 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Neue Notiz …" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNew()} />
          <button className="btn-ghost-glass" onClick={submitNew}><Icon name="plus" size={12} /></button>
        </div>
      </div>

      {selectedId ? (
        <NoteEditor
          key={selectedId}
          noteId={selectedId}
          allNotes={notes}
          onSave={ws.updateNoteContent}
          onOpenNote={setSelectedId}
          onCreateNote={createNote}
        />
      ) : (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="t-sans-sm">Keine Notiz ausgewählt.</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Schreiben ---------- */
function ProjectSchreiben({ ws, onOpenNote }: { ws: Workspace; onOpenNote: (noteId: string) => void }) {
  const { chapters, notes, sources, addChapter, addNote, renameChapter, updateChapterContent, deleteChapter, exportMarkdown, exportLatex, exportDocx, exportPdf } = ws;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [insertRequest, setInsertRequest] = useState<InsertRequest | null>(null);
  const [fnSourceId, setFnSourceId] = useState('');
  const [fnOpts, setFnOpts] = useState<KurzzitatOptions>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const createLinkedNote = async (title: string) => {
    const note = await addNote(title);
    if (note) onOpenNote(note.id);
  };

  useEffect(() => {
    if (!selectedId && chapters[0]) setSelectedId(chapters[0].id);
  }, [chapters, selectedId]);

  const createChapter = async (title: string) => {
    const chapter = await addChapter(title);
    if (chapter) setSelectedId(chapter.id);
  };

  const submitNew = () => {
    if (!newTitle.trim()) return;
    createChapter(newTitle.trim());
    setNewTitle('');
  };

  const handleDeleteChapter = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    const ok = await confirm(`Kapitel "${title}" unwiderruflich löschen?`, { title: 'Kapitel löschen', kind: 'warning' });
    if (!ok) return;
    if (selectedId === id) setSelectedId(null);
    await deleteChapter(id);
  };

  const startRenameChapter = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(title);
  };

  const commitRenameChapter = () => {
    if (renamingId) renameChapter(renamingId, renameValue);
    setRenamingId(null);
  };

  const selected = chapters.find((c) => c.id === selectedId) || null;
  const fnSource = sources.find((s) => s.id === fnSourceId) || null;
  const fnVollzitat = fnSource ? formatVollzitat(fnSource) : '';
  const fnKurzzitat = fnSource ? formatKurzzitat(fnSource, fnOpts) : '';
  const bibliography = buildBibliography(sources);

  const insertFootnote = () => {
    if (!fnKurzzitat) return;
    setInsertRequest({ text: fnKurzzitat, requestId: Date.now() });
  };

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '260px 1fr 300px' }}>
      <div className="panel">
        <div className="panel-head"><span className="title">Kapitel</span></div>
        <div className="sidelist scroll" style={{ overflow: 'auto', flex: 1 }}>
          {chapters.map((c) => (
            <div key={c.id} className={`it ${selectedId === c.id ? 'on' : ''}`} onClick={() => setSelectedId(c.id)}>
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                {renamingId === c.id ? (
                  <input
                    className="po-add-input"
                    autoFocus
                    value={renameValue}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRenameChapter}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRenameChapter(); if (e.key === 'Escape') setRenamingId(null); }}
                  />
                ) : (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                )}
                <span className="t-mono-sm">{c.status} · {countWords(c.content).toLocaleString('de-CH')} W.</span>
              </div>
              {renamingId !== c.id && (
                <button className="ab" title="Umbenennen" onClick={(e) => startRenameChapter(e, c.id, c.title)}><Icon name="edit" size={12} /></button>
              )}
              <button className="ab danger" title="Kapitel löschen" onClick={(e) => handleDeleteChapter(e, c.id, c.title)}><Icon name="close" size={12} /></button>
            </div>
          ))}
          {chapters.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Kapitel.</div>}
        </div>
        <div className="divider" style={{ margin: '8px 0' }}></div>
        <div className="row-flex" style={{ gap: 6 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Neues Kapitel …" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNew()} />
          <button className="btn-ghost-glass" onClick={submitNew}><Icon name="plus" size={12} /></button>
        </div>
      </div>

      {selected ? (
        <ChapterEditor
          key={selected.id}
          chapter={selected}
          allNotes={notes}
          insertRequest={insertRequest}
          onSave={updateChapterContent}
          onOpenNote={onOpenNote}
          onCreateNote={createLinkedNote}
        />
      ) : (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="t-sans-sm">Kein Kapitel ausgewählt.</span>
        </div>
      )}

      <div className="col scroll" style={{ gap: 16, minHeight: 0, overflowY: 'auto', paddingRight: 2 }}>
        <div className="panel" style={{ flexShrink: 0 }}>
          <div className="panel-head">
            <span className="title">Zitatgenerator</span>
            <span className="t-mono-sm">Forstmoser/Ogorek/Schindler, § 18</span>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <select className="input" value={fnSourceId} onChange={(e) => { setFnSourceId(e.target.value); setFnOpts({}); }}>
              <option value="">Quelle wählen …</option>
              {sources.map((s) => <option key={s.id} value={s.id}>{s.citationKey}</option>)}
            </select>

            {fnSource?.type === 'BGE' && (
              <div className="row-flex" style={{ gap: 8 }}>
                <input className="input" style={{ flex: 1 }} placeholder="Erwägung (z.B. 3.5.1)" value={fnOpts.erwaegung || ''} onChange={(e) => setFnOpts((o) => ({ ...o, erwaegung: e.target.value }))} />
                <input className="input" style={{ flex: 1 }} placeholder="Seite (fakultativ)" value={fnOpts.fundstelle || ''} onChange={(e) => setFnOpts((o) => ({ ...o, fundstelle: e.target.value }))} />
              </div>
            )}
            {fnSource?.type === 'Gesetz' && (
              <div className="row-flex" style={{ gap: 8 }}>
                <input className="input" style={{ flex: 1 }} placeholder="Art." value={fnOpts.artikel || ''} onChange={(e) => setFnOpts((o) => ({ ...o, artikel: e.target.value }))} />
                <input className="input" style={{ flex: 1 }} placeholder="Abs." value={fnOpts.absatz || ''} onChange={(e) => setFnOpts((o) => ({ ...o, absatz: e.target.value }))} />
                <input className="input" style={{ flex: 1 }} placeholder="Ziff./Bst." value={fnOpts.ziffer || ''} onChange={(e) => setFnOpts((o) => ({ ...o, ziffer: e.target.value }))} />
              </div>
            )}
            {(fnSource?.type === 'Literatur' || fnSource?.type === 'Materialien') && (
              <input className="input" placeholder="Fundstelle (S. oder Rz.)" value={fnOpts.fundstelle || ''} onChange={(e) => setFnOpts((o) => ({ ...o, fundstelle: e.target.value }))} />
            )}

            <div className="col" style={{ gap: 4 }}>
              <span className="t-mono-sm">Kurzzitat (Fussnote)</span>
              <div className="t-body" style={{ background: 'var(--fill-2)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line-1)', fontSize: 14, minHeight: 20 }}>
                {fnKurzzitat || <span style={{ opacity: 0.5 }}>Quelle wählen, um ein Zitat zu erzeugen.</span>}
              </div>
            </div>
            <div className="row-flex" style={{ gap: 6 }}>
              <button className="btn-ghost-glass" style={{ flex: 1 }} disabled={!fnKurzzitat} onClick={() => navigator.clipboard.writeText(fnKurzzitat)}>
                <Icon name="link" size={12} /> kopieren
              </button>
              <button className="btn-ghost-glass" disabled={!fnKurzzitat || !selected} onClick={insertFootnote}>
                <Icon name="plus" size={12} /> in Kapitel
              </button>
            </div>

            {fnVollzitat && (
              <div className="col" style={{ gap: 4 }}>
                <span className="t-mono-sm">Vollzitat (Verzeichnis)</span>
                <div className="t-sans-sm" style={{ padding: '8px 10px', background: 'var(--fill-1)', borderRadius: 8 }}>{fnVollzitat}</div>
              </div>
            )}
          </div>
        </div>

        <div className="panel" style={{ flexShrink: 0 }}>
          <div className="panel-head"><span className="title">Verzeichnisse</span></div>
          <div className="col" style={{ gap: 6 }}>
            {bibliography.map((section) => (
              <div key={section.label} className="chip" style={{ justifyContent: 'space-between', height: 30, width: '100%' }}>
                <span>{section.label}</span><span style={{ color: 'var(--ink-4)' }}>{section.entries.length}</span>
              </div>
            ))}
            {bibliography.length === 0 && <div className="t-sans-sm">Noch keine Quellen erfasst.</div>}
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head"><span className="title">Export</span></div>
          <div className="col" style={{ gap: 8 }}>
            <div className="db-tile" style={{ minHeight: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={exportMarkdown}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fill-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="doc" size={16} />
              </span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span className="nm" style={{ fontSize: 15 }}>Markdown</span>
                <span className="de" style={{ fontSize: 12.5 }}>Obsidian-kompatibel, mit [[Wikilinks]]</span>
              </div>
              <Icon name="download" size={15} />
            </div>
            <div className="db-tile" style={{ minHeight: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={exportDocx}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fill-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="doc" size={16} />
              </span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span className="nm" style={{ fontSize: 15 }}>Word (.docx)</span>
                <span className="de" style={{ fontSize: 12.5 }}>Kapitel + Quellenverzeichnis</span>
              </div>
              <Icon name="download" size={15} />
            </div>
            <div className="db-tile" style={{ minHeight: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={exportPdf}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fill-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="doc" size={16} />
              </span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span className="nm" style={{ fontSize: 15 }}>PDF</span>
                <span className="de" style={{ fontSize: 12.5 }}>Kapitel + Quellenverzeichnis, satzfertig</span>
              </div>
              <Icon name="download" size={15} />
            </div>
            <div className="db-tile" style={{ minHeight: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={exportLatex}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fill-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="doc" size={16} />
              </span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span className="nm" style={{ fontSize: 15 }}>LaTeX (.tex)</span>
                <span className="de" style={{ fontSize: 12.5 }}>Kapitel + Quellenverzeichnis als Quelltext</span>
              </div>
              <Icon name="download" size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
