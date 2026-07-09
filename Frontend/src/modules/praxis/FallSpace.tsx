import { useState } from 'react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/Icon';
import { PdfViewer } from '../../components/PdfViewer';
import { todayIso } from '../../lib/praxis/format';
import { useCaseWorkspace } from '../../lib/praxis/store';
import { semanticSearch, type SearchHit } from '../../lib/praxis/semantic';
import type { Akte, Fall } from '../../lib/praxis/types';

type Workspace = ReturnType<typeof useCaseWorkspace>;

const FALL_TABS = [
  { id: 'uebersicht', l: 'Übersicht' },
  { id: 'akten', l: 'Akten' },
  { id: 'fristen', l: 'Fristen' },
  { id: 'chronologie', l: 'Chronologie' },
  { id: 'korrespondenz', l: 'Korrespondenz' },
  { id: 'honorar', l: 'Honorar' },
];

export function FallSpace({
  fallId,
  initialTab,
  onOpenWorkbench,
}: {
  fallId: string;
  initialTab?: string;
  onOpenWorkbench: (fallId: string, entwurfId: string) => void;
}) {
  const ws = useCaseWorkspace(fallId);
  const { fall, loading } = ws;
  // 'akten.befragen' targets the Befragen sub-view inside the Akten tab.
  const [initialMain, initialSub] = (initialTab || '').split('.');
  const [tab, setTab] = useState(initialMain || 'uebersicht');

  if (loading || !fall) {
    return (
      <div className="detail view-in" data-screen-label="Fall">
        <div className="t-sans-sm" style={{ padding: 40 }}>Fall wird geladen …</div>
      </div>
    );
  }

  return (
    <div className="detail view-in" data-screen-label={`Fall · ${fall.ref}`}>
      <div className="fall-head">
        <div className="col" style={{ gap: 3, minWidth: 0 }}>
          <div className="row-flex" style={{ gap: 12 }}>
            <h1 className="fall-title">{fall.title}<span className="ac">.</span></h1>
          </div>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          {fall.nextFrist && (
            <span className={`countdown ${fall.nextFrist.tage <= 10 ? 'hot' : fall.nextFrist.tage <= 30 ? 'warm' : ''}`} title={fall.nextFrist.titel}>
              <Icon name="time" size={11} /> {fall.nextFrist.tage} T
            </span>
          )}
          {fall.entwuerfe[0] && (
            <button className="btn-primary-dark" onClick={() => onOpenWorkbench(fall.id, fall.entwuerfe[0].id)}>
              <Icon name="pen" size={13} /> Workbench
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ alignSelf: 'flex-start' }}>
        {FALL_TABS.map((t) => (
          <span key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.l}</span>
        ))}
      </div>

      {tab === 'uebersicht' && <FallUebersicht fall={fall} onOpenWorkbench={onOpenWorkbench} goTab={setTab} addDraft={ws.addDraft} deleteParty={ws.deleteParty} />}
      {tab === 'akten' && <FallAkten fall={fall} uploadDocument={ws.uploadDocument} deleteDocument={ws.deleteDocument} clusterDocuments={ws.clusterDocuments} initialAnsicht={initialSub} />}
      {tab === 'fristen' && <FallFristen fall={fall} addFrist={ws.addFrist} completeFrist={ws.completeFrist} deleteFrist={ws.deleteFrist} />}
      {tab === 'chronologie' && <FallChrono fall={fall} addChronoEvent={ws.addChronoEvent} />}
      {tab === 'korrespondenz' && <FallPost fall={fall} addCorrespondence={ws.addCorrespondence} deleteCorrespondence={ws.deleteCorrespondence} />}
      {tab === 'honorar' && <FallHonorar fall={fall} addBillingEntry={ws.addBillingEntry} deleteBillingEntry={ws.deleteBillingEntry} />}
    </div>
  );
}

/* ---------- Übersicht ---------- */
function FallUebersicht({
  fall,
  onOpenWorkbench,
  goTab,
  addDraft,
  deleteParty,
}: {
  fall: Fall;
  onOpenWorkbench: (fallId: string, entwurfId: string) => void;
  goTab: (tab: string) => void;
  addDraft: Workspace['addDraft'];
  deleteParty: Workspace['deleteParty'];
}) {
  const handleFirstDraft = async () => {
    const draft = await addDraft('Erster Entwurf', 'Rechtsschrift');
    if (draft) onOpenWorkbench(fall.id, draft.id);
  };

  const handleDeleteParty = async (id: string, name: string) => {
    const ok = await confirm(`Partei "${name}" unwiderruflich löschen?`, { title: 'Partei löschen', kind: 'warning' });
    if (ok) await deleteParty(id);
  };

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '300px 1fr 320px' }}>
      {/* Parteien & Rubrum */}
      <div className="panel">
        <div className="panel-head"><span className="title">Parteien</span></div>
        <div className="col" style={{ gap: 14 }}>
          {fall.parteien.map((p) => (
            <div key={p.id} className={`partei ${p.klient ? 'klient' : ''}`} style={{ position: 'relative' }}>
              <div className="pa-rolle">{p.rolle}{p.klient && <span className="pa-badge">Klient</span>}</div>
              <div className="pa-name">{p.name}</div>
              <div className="pa-det">{p.detail}</div>
              <div className="pa-vert">{p.vertreter}</div>
              <button className="ab danger" style={{ position: 'absolute', top: 0, right: 0 }} title="Partei löschen" onClick={() => handleDeleteParty(p.id, p.name)}>
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: '14px 0' }}></div>
        <div className="t-mono-sm" style={{ marginBottom: 6 }}>Streitwert</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{fall.streitwert}</div>
      </div>

      {/* Mitte — Status + Entwürfe + Chronologie-Auszug */}
      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="grid-3" style={{ minHeight: 'auto' }}>
          <div className="cell-stat">
            <span className="lbl">Verfahrensstand</span>
            <span className="val" style={{ fontSize: 17, lineHeight: 1.3 }}>{fall.phase}</span>
          </div>
          <div className="cell-stat">
            <span className="lbl">Akten</span>
            <span className="val">{fall.akten.length}</span>
          </div>
          <div className="cell-stat">
            <span className="lbl">Nächste Frist</span>
            <span className="val">{fall.nextFrist ? `${fall.nextFrist.tage} Tage` : '—'}</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="title">Entwürfe</span>
          </div>
          <div className="col" style={{ gap: 4 }}>
            {fall.entwuerfe.length === 0 ? (
              <span className="chip" style={{ alignSelf: 'flex-start' }} onClick={handleFirstDraft}>
                <Icon name="plus" size={11} /> Ersten Entwurf anlegen
              </span>
            ) : (
              fall.entwuerfe.map((e) => (
                <div key={e.id} className="entwurf-row" onClick={() => onOpenWorkbench(fall.id, e.id)}>
                  <span className="ico"><Icon name="pen" size={14} /></span>
                  <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <span className="et">{e.titel}</span>
                    <span className="em">{e.typ} · {e.status}</span>
                  </div>
                  <span className="em">{e.words.toLocaleString('de-CH')} W. · {e.updated}</span>
                  <span className="arrow-go"><Icon name="arrow-right" size={14} /></span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            <span className="title">Chronologie</span>
            <span className="sub link-sub" onClick={() => goTab('chronologie')}>alle anzeigen</span>
          </div>
          <div className="tl scroll" style={{ overflow: 'auto' }}>
            {fall.chrono.slice(-4).reverse().map((c) => (
              <div key={c.id} className="ev"><span className="t">{c.datum.split(' ').slice(0, 2).join(' ')}</span><span className="d">{c.ereignis} <span className="beleg-chip">{c.beleg}</span></span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Rechts — Fristen + Post */}
      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head"><span className="title">Fristen</span><span className="sub link-sub" onClick={() => goTab('fristen')}>alle</span></div>
          <div className="col" style={{ gap: 8 }}>
            {fall.fristen.slice(0, 3).map((f) => (
              <div key={f.id} className="frist-mini">
                <span className={`countdown ${f.tage <= 10 ? 'hot' : f.tage <= 30 ? 'warm' : ''}`}>{f.tage} T</span>
                <div className="col" style={{ gap: 1, minWidth: 0 }}>
                  <span className="fm-t">{f.titel}</span>
                  <span className="fm-m">{f.datum} · {f.art}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head"><span className="title">Korrespondenz</span><span className="sub link-sub" onClick={() => goTab('korrespondenz')}>alle</span></div>
          <div className="col scroll" style={{ gap: 4, overflow: 'auto' }}>
            {fall.korrespondenz.map((k) => (
              <div key={k.id} className="post-row">
                <span className={`dir ${k.richtung}`}><Icon name={k.richtung === 'ein' ? 'download' : 'export'} size={12} /></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <span className="pr-t">{k.betreff}</span>
                  <span className="pr-m">{k.richtung === 'ein' ? 'von' : ''} {k.von} · {k.datum}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Akten: Verzeichnis + Ordner + Befragen ---------- */
const CLUSTER_COLORS = ['var(--accent-blue)', 'var(--accent-red)', 'var(--accent-green)', 'var(--accent-amber)', 'var(--ink)'];
const clusterColor = (c: number) => CLUSTER_COLORS[c % CLUSTER_COLORS.length];

function FallAkten({
  fall,
  uploadDocument,
  deleteDocument,
  clusterDocuments,
  initialAnsicht,
}: {
  fall: Fall;
  uploadDocument: Workspace['uploadDocument'];
  deleteDocument: Workspace['deleteDocument'];
  clusterDocuments: Workspace['clusterDocuments'];
  initialAnsicht?: string;
}) {
  const [ansicht, setAnsicht] = useState(initialAnsicht || 'verzeichnis');
  const [sel, setSel] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [clustering, setClustering] = useState(false);
  const [clusterFilter, setClusterFilter] = useState<number | null>(null);
  const [progress, setProgress] = useState('');
  const [pdfAkte, setPdfAkte] = useState<Akte | null>(null);
  const ordner = [...new Set(fall.akten.map((a) => a.ordner))];

  const handleDelete = async (a: Akte) => {
    const ok = await confirm(`Akte "${a.titel}" (${a.nr}) unwiderruflich löschen?`, { title: 'Akte löschen', kind: 'warning' });
    if (ok) await deleteDocument(a.id);
  };

  const clusterIds = [...new Set(fall.akten.filter((a) => a.clusterId != null).map((a) => a.clusterId as number))].sort((x, y) => x - y);
  const visibleAkten = clusterFilter === null ? fall.akten : fall.akten.filter((a) => a.clusterId === clusterFilter);

  const handleUpload = async () => {
    setImporting(true);
    try {
      await uploadDocument('Hochgeladen');
    } finally {
      setImporting(false);
    }
  };

  const handleCluster = async () => {
    setClustering(true);
    setProgress('Modell wird geladen …');
    try {
      const k = await clusterDocuments(setProgress);
      setProgress(k === null ? 'Zu wenige Akten mit Text für ein Clustering (mind. 2).' : '');
      setClusterFilter(null);
    } catch (err) {
      setProgress(`Clustering fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setClustering(false);
    }
  };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, gap: 12 }}>
      <div className="row-flex">
        <div className="tabs">
          <span className={`tab ${ansicht === 'verzeichnis' ? 'on' : ''}`} onClick={() => setAnsicht('verzeichnis')}>Verzeichnis</span>
          <span className={`tab ${ansicht === 'ordner' ? 'on' : ''}`} onClick={() => setAnsicht('ordner')}>Ordner</span>
          <span className={`tab ${ansicht === 'befragen' ? 'on' : ''}`} onClick={() => setAnsicht('befragen')}>Befragen</span>
        </div>
        <div className="spacer"></div>
        {progress && <span className="t-mono-sm" style={{ marginRight: 10 }}>{progress}</span>}
        <button className="btn-ghost-glass" onClick={handleCluster} disabled={clustering || fall.akten.length < 2} style={{ marginRight: 8 }}>
          <Icon name="graph" size={13} /> {clustering ? 'Wird berechnet…' : 'Cluster berechnen'}
        </button>
        <button className="btn-primary-dark" onClick={handleUpload} disabled={importing}>
          <Icon name="upload" size={13} /> {importing ? 'Wird importiert…' : 'Akte hochladen'}
        </button>
      </div>

      {ansicht === 'verzeichnis' && clusterIds.length > 0 && (
        <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="t-mono-sm" style={{ marginRight: 4 }}>Cluster:</span>
          {clusterIds.map((c) => {
            const count = fall.akten.filter((a) => a.clusterId === c).length;
            return (
              <span
                key={c}
                className={`chip ${clusterFilter === c ? 'on' : ''}`}
                onClick={() => setClusterFilter(clusterFilter === c ? null : c)}
              >
                <span className="cluster-dot" style={{ background: clusterColor(c) }}></span>
                Cluster {c + 1} ({count})
              </span>
            );
          })}
        </div>
      )}

      {ansicht === 'verzeichnis' && (
        <div className="panel scroll" style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
          <div className="akt-row akt-head">
            <span>Nr.</span><span>Datum</span><span>Titel</span><span>Absender</span><span>Typ</span><span style={{ textAlign: 'right' }}>Seiten</span><span></span>
          </div>
          {visibleAkten.map((a, i) => (
            <div key={a.id} className={`akt-row ${sel === i ? 'on' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
              <span className="akt-nr">{a.nr}</span>
              <span className="akt-dat">{a.datum}</span>
              <span className="akt-titel">
                {a.clusterId != null && (
                  <span className="cluster-dot" title={`Cluster ${a.clusterId + 1}`} style={{ background: clusterColor(a.clusterId) }}></span>
                )}
                {a.titel}
              </span>
              <span className="akt-abs">{a.absender}</span>
              <span><span className="akt-typ">{a.typ}</span></span>
              <span className="akt-seiten">{a.seiten}</span>
              <span className="akt-actions">
                {a.filePath && (
                  <button className="ab" title="PDF anzeigen" onClick={(e) => { e.stopPropagation(); setPdfAkte(a); }}>
                    <Icon name="eye" size={14} />
                  </button>
                )}
                <button className="ab danger" title="Akte löschen" onClick={(e) => { e.stopPropagation(); handleDelete(a); }}>
                  <Icon name="close" size={13} />
                </button>
              </span>
            </div>
          ))}
          {visibleAkten.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Keine Akten vorhanden.</div>}
        </div>
      )}

      {pdfAkte && pdfAkte.filePath && (
        <PdfViewer filePath={pdfAkte.filePath} title={`${pdfAkte.nr} · ${pdfAkte.titel}`} onClose={() => setPdfAkte(null)} />
      )}

      {ansicht === 'ordner' && (
        <div className="ordner-grid scroll" style={{ flex: 1, overflow: 'auto' }}>
          {ordner.map((o) => (
            <div key={o} className="panel">
              <div className="panel-head">
                <span className="row-flex" style={{ gap: 8 }}><Icon name="folder" size={15} /><span className="title" style={{ fontSize: 16 }}>{o}</span></span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                {fall.akten.filter((a) => a.ordner === o).map((a) => (
                  <div key={a.id} className="ordner-doc">
                    <span className="ico"><Icon name="doc" size={13} /></span>
                    <span className="od-nr">{a.nr}</span>
                    <span className="od-t">{a.titel}</span>
                    <span className="od-s">{a.seiten} S.</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {ansicht === 'befragen' && <FallBefragen fall={fall} />}
    </div>
  );
}

/* ---------- Akten befragen: semantische Suche über die Fall-Akten ---------- */
function FallBefragen({ fall }: { fall: Fall }) {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  const embeddable = fall.akten.filter((a) => a.content && a.content.trim().length > 0);

  const runSearch = async () => {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setStatus('Modell wird geladen …');
    try {
      const results = await semanticSearch(fall.id, fall.akten, q, setStatus);
      setHits(results);
      setStatus('');
    } catch (err) {
      setStatus(`Suche fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
      setHits(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head">
        <span className="title">Akten befragen</span>
        <span className="t-mono-sm">semantische Suche · lokal, ohne Cloud</span>
      </div>

      <div className="search" style={{ marginBottom: 8, padding: '12px 16px' }}>
        <Icon name="search" size={15} />
        <input
          placeholder="Frage oder Suchbegriff — z.B. Wann wurde die Kündigung zugestellt?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          disabled={busy}
        />
        <button className="btn-ghost-glass" style={{ height: 30 }} onClick={runSearch} disabled={busy || !query.trim()}>
          {busy ? 'Läuft…' : 'Suchen'}
        </button>
      </div>
      <p className="t-sans-sm" style={{ marginBottom: 16 }}>
        Die Frage wird lokal in einen Vektor übersetzt und gegen die Akten-Embeddings verglichen —
        die passendsten Aktenstellen erscheinen gereiht, ohne generierte Antwort.
      </p>

      {status && <div className="t-mono-sm" style={{ marginBottom: 12 }}>{status}</div>}

      {embeddable.length === 0 && (
        <div className="t-sans-sm">Keine Akten mit extrahiertem Text vorhanden — zuerst eine PDF-Akte hochladen.</div>
      )}

      {hits && (
        <div className="col" style={{ gap: 10 }}>
          {hits.slice(0, 6).map((h) => {
            const akte = fall.akten.find((a) => a.id === h.id);
            if (!akte) return null;
            const pct = Math.max(0, Math.round(h.score * 100));
            return (
              <div key={h.id} className="panel" style={{ padding: '12px 14px' }}>
                <div className="row-flex" style={{ gap: 10, marginBottom: 6 }}>
                  <span className="akt-nr">{akte.nr}</span>
                  <span className="od-t" style={{ fontWeight: 500 }}>{akte.titel}</span>
                  <span className="spacer"></span>
                  <span className="t-mono-num" style={{ fontSize: 12 }}>{pct}%</span>
                  <span style={{ width: 56, height: 3, background: 'var(--line-1)', borderRadius: 2, overflow: 'hidden', alignSelf: 'center' }}>
                    <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: 'var(--accent)' }}></span>
                  </span>
                </div>
                {akte.content && (
                  <p className="t-sans-sm" style={{ margin: 0, lineHeight: 1.5 }}>
                    {akte.content.trim().slice(0, 260)}{akte.content.trim().length > 260 ? '…' : ''}
                  </p>
                )}
              </div>
            );
          })}
          {hits.length === 0 && <div className="t-sans-sm">Keine Treffer.</div>}
        </div>
      )}
    </div>
  );
}

/* ---------- Fristen ---------- */
function FallFristen({
  fall,
  addFrist,
  completeFrist,
  deleteFrist,
}: {
  fall: Fall;
  addFrist: Workspace['addFrist'];
  completeFrist: Workspace['completeFrist'];
  deleteFrist: Workspace['deleteFrist'];
}) {
  const [titel, setTitel] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [art, setArt] = useState('behördlich');
  const [note, setNote] = useState('');

  const offene = fall.fristen.filter((f) => !f.completed);

  const submit = () => {
    if (!titel.trim() || !dueDate) return;
    addFrist(titel.trim(), dueDate, art, note.trim());
    setTitel('');
    setDueDate('');
    setNote('');
  };

  const handleDelete = async (f: (typeof offene)[number]) => {
    const ok = await confirm(`Frist "${f.titel}" unwiderruflich löschen?`, { title: 'Frist löschen', kind: 'warning' });
    if (ok) await deleteFrist(f.id);
  };

  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head"><span className="title">Fristen & Termine</span></div>
      <div className="col" style={{ gap: 0 }}>
        {offene.map((f) => (
          <div key={f.id} className="frist-row">
            <span className={`countdown big ${f.tage <= 10 ? 'hot' : f.tage <= 30 ? 'warm' : ''}`}>{f.tage} Tage</span>
            <span className="ico" style={{ cursor: 'pointer', flexShrink: 0 }} title="Als erledigt markieren" onClick={() => completeFrist(f.id)}>
              <Icon name="check" size={13} />
            </span>
            <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <span className="fr-t">{f.titel}</span>
              <span className="fr-n">{f.note}</span>
            </div>
            <span className="frist-art">{f.art}</span>
            <span className="fr-d">{f.datum}</span>
            <button className="ab danger" title="Frist löschen" onClick={() => handleDelete(f)}>
              <Icon name="close" size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap', padding: '14px 6px 4px', borderTop: '1px solid var(--line-1)', marginTop: 8 }}>
        <input className="input" style={{ flex: 2 }} placeholder="Titel" value={titel} onChange={(e) => setTitel(e.target.value)} />
        <input className="input" type="date" style={{ flex: '0 0 150px' }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <select className="input" style={{ flex: '0 0 130px' }} value={art} onChange={(e) => setArt(e.target.value)}>
          <option value="behördlich">behördlich</option>
          <option value="gesetzlich">gesetzlich</option>
          <option value="erstreckt">erstreckt</option>
          <option value="intern">intern</option>
          <option value="gerichtlich">gerichtlich</option>
          <option value="termin">termin</option>
        </select>
        <input className="input" style={{ flex: 2 }} placeholder="Notiz" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Frist</button>
      </div>
    </div>
  );
}

/* ---------- Chronologie ---------- */
function FallChrono({ fall, addChronoEvent }: { fall: Fall; addChronoEvent: Workspace['addChronoEvent'] }) {
  const [datum, setDatum] = useState(todayIso());
  const [ereignis, setEreignis] = useState('');
  const [beleg, setBeleg] = useState('');

  const submit = () => {
    if (!ereignis.trim()) return;
    addChronoEvent(ereignis.trim(), beleg.trim(), datum);
    setEreignis('');
    setBeleg('');
  };

  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head">
        <span className="title">Sachverhalts-Chronologie</span>
      </div>
      <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input className="input" type="date" style={{ flex: '0 0 150px' }} value={datum} onChange={(e) => setDatum(e.target.value)} />
        <input className="input" style={{ flex: 2 }} placeholder="Ereignis" value={ereignis} onChange={(e) => setEreignis(e.target.value)} />
        <input className="input" style={{ flex: 1 }} placeholder="Beleg" value={beleg} onChange={(e) => setBeleg(e.target.value)} />
        <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Ergänzen</button>
      </div>
      <div className="chrono">
        {fall.chrono.map((c) => (
          <div key={c.id} className="chrono-ev">
            <span className="cd">{c.datum}</span>
            <span className="cline"><span className="cdot"></span></span>
            <div className="col" style={{ gap: 3, paddingBottom: 18 }}>
              <span className="ce">{c.ereignis}</span>
              <span className="beleg-chip" style={{ alignSelf: 'flex-start' }}>{c.beleg}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Korrespondenz ---------- */
function FallPost({
  fall,
  addCorrespondence,
  deleteCorrespondence,
}: {
  fall: Fall;
  addCorrespondence: Workspace['addCorrespondence'];
  deleteCorrespondence: Workspace['deleteCorrespondence'];
}) {
  const [richtung, setRichtung] = useState<'ein' | 'aus'>('ein');
  const [von, setVon] = useState('');
  const [betreff, setBetreff] = useState('');
  const [typ, setTyp] = useState('');
  const [datum, setDatum] = useState(todayIso());

  const submit = () => {
    if (!betreff.trim()) return;
    addCorrespondence(richtung, von.trim(), betreff.trim(), typ.trim(), datum);
    setVon('');
    setBetreff('');
    setTyp('');
  };

  const handleDelete = async (id: string, betreff: string) => {
    const ok = await confirm(`Eintrag "${betreff}" unwiderruflich löschen?`, { title: 'Korrespondenz löschen', kind: 'warning' });
    if (ok) await deleteCorrespondence(id);
  };

  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head"><span className="title">Korrespondenz</span></div>
      <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select className="input" style={{ flex: '0 0 90px' }} value={richtung} onChange={(e) => setRichtung(e.target.value as 'ein' | 'aus')}>
          <option value="ein">ein</option>
          <option value="aus">aus</option>
        </select>
        <input className="input" style={{ flex: 1 }} placeholder="Von / An" value={von} onChange={(e) => setVon(e.target.value)} />
        <input className="input" style={{ flex: 2 }} placeholder="Betreff" value={betreff} onChange={(e) => setBetreff(e.target.value)} />
        <input className="input" style={{ flex: 1 }} placeholder="Typ" value={typ} onChange={(e) => setTyp(e.target.value)} />
        <input className="input" type="date" style={{ flex: '0 0 150px' }} value={datum} onChange={(e) => setDatum(e.target.value)} />
        <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Eintrag</button>
      </div>
      <div className="col" style={{ gap: 0 }}>
        {fall.korrespondenz.map((k) => (
          <div key={k.id} className="post-row lg">
            <span className={`dir ${k.richtung}`}><Icon name={k.richtung === 'ein' ? 'download' : 'export'} size={13} /></span>
            <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <span className="pr-t">{k.betreff}</span>
              <span className="pr-m">{k.richtung === 'ein' ? 'Eingang von' : 'Ausgang'} {k.von}</span>
            </div>
            <span className="chip" style={{ height: 20, fontSize: 10 }}>{k.typ}</span>
            <span className="fr-d">{k.datum}</span>
            <button className="ab danger" title="Eintrag löschen" onClick={() => handleDelete(k.id, k.betreff)}>
              <Icon name="close" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Honorar ---------- */
function FallHonorar({
  fall,
  addBillingEntry,
  deleteBillingEntry,
}: {
  fall: Fall;
  addBillingEntry: Workspace['addBillingEntry'];
  deleteBillingEntry: Workspace['deleteBillingEntry'];
}) {
  const h = fall.honorar;
  const chf = Math.round(h.total * h.rate);
  const [datum, setDatum] = useState(todayIso());
  const [taetigkeit, setTaetigkeit] = useState('');
  const [minuten, setMinuten] = useState('');

  const submit = () => {
    const min = Number(minuten);
    if (!taetigkeit.trim() || !min) return;
    addBillingEntry(taetigkeit.trim(), min, datum);
    setTaetigkeit('');
    setMinuten('');
  };

  const handleDelete = async (id: string, taetigkeit: string) => {
    const ok = await confirm(`Eintrag "${taetigkeit}" unwiderruflich löschen?`, { title: 'Eintrag löschen', kind: 'warning' });
    if (ok) await deleteBillingEntry(id);
  };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, gap: 16 }}>
      <div className="grid-3" style={{ minHeight: 'auto' }}>
        <div className="cell-stat"><span className="lbl">Aufgelaufen</span><span className="val">{h.total.toFixed(1)} Std.</span></div>
        <div className="cell-stat"><span className="lbl">Honorar offen</span><span className="val">CHF {chf.toLocaleString('de-CH')}</span></div>
        <div className="cell-stat">
          <span className="lbl">Kostendach</span><span className="val">{Math.round(chf / h.budget * 100)}%</span>
          <div className="progress" style={{ marginTop: 4 }}><span style={{ width: `${Math.min(100, chf / h.budget * 100)}%` }}></span></div>
        </div>
      </div>
      <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
        <div className="panel-head"><span className="title">Leistungserfassung</span></div>
        <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input className="input" type="date" style={{ flex: '0 0 150px' }} value={datum} onChange={(e) => setDatum(e.target.value)} />
          <input className="input" style={{ flex: 2 }} placeholder="Tätigkeit" value={taetigkeit} onChange={(e) => setTaetigkeit(e.target.value)} />
          <input className="input" type="number" style={{ flex: '0 0 110px' }} placeholder="Minuten" value={minuten} onChange={(e) => setMinuten(e.target.value)} />
          <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Eintrag</button>
        </div>
        <div className="col">
          {h.entries.map((e) => (
            <div key={e.id} className="hon-row">
              <span className="fr-d" style={{ width: 92 }}>{e.datum}</span>
              <span className="hr-t">{e.taetigkeit}</span>
              <span className="hr-min">{(e.minuten / 60).toFixed(2)} h</span>
              <span className="hr-chf">CHF {Math.round(e.minuten / 60 * h.rate).toLocaleString('de-CH')}</span>
              <button className="ab danger" title="Eintrag löschen" onClick={() => handleDelete(e.id, e.taetigkeit)}>
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
