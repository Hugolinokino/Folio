import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { todayIso } from '../../lib/praxis/format';
import { useCaseWorkspace } from '../../lib/praxis/store';
import type { Fall } from '../../lib/praxis/types';

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
  const [tab, setTab] = useState(initialTab || 'uebersicht');

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

      {tab === 'uebersicht' && <FallUebersicht fall={fall} onOpenWorkbench={onOpenWorkbench} goTab={setTab} addDraft={ws.addDraft} />}
      {tab === 'akten' && <FallAkten fall={fall} uploadDocument={ws.uploadDocument} />}
      {tab === 'fristen' && <FallFristen fall={fall} addFrist={ws.addFrist} completeFrist={ws.completeFrist} />}
      {tab === 'chronologie' && <FallChrono fall={fall} addChronoEvent={ws.addChronoEvent} />}
      {tab === 'korrespondenz' && <FallPost fall={fall} addCorrespondence={ws.addCorrespondence} />}
      {tab === 'honorar' && <FallHonorar fall={fall} addBillingEntry={ws.addBillingEntry} />}
    </div>
  );
}

/* ---------- Übersicht ---------- */
function FallUebersicht({
  fall,
  onOpenWorkbench,
  goTab,
  addDraft,
}: {
  fall: Fall;
  onOpenWorkbench: (fallId: string, entwurfId: string) => void;
  goTab: (tab: string) => void;
  addDraft: Workspace['addDraft'];
}) {
  const handleFirstDraft = async () => {
    const draft = await addDraft('Erster Entwurf', 'Rechtsschrift');
    if (draft) onOpenWorkbench(fall.id, draft.id);
  };

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '300px 1fr 320px' }}>
      {/* Parteien & Rubrum */}
      <div className="panel">
        <div className="panel-head"><span className="title">Parteien</span></div>
        <div className="col" style={{ gap: 14 }}>
          {fall.parteien.map((p) => (
            <div key={p.id} className={`partei ${p.klient ? 'klient' : ''}`}>
              <div className="pa-rolle">{p.rolle}{p.klient && <span className="pa-badge">Klient</span>}</div>
              <div className="pa-name">{p.name}</div>
              <div className="pa-det">{p.detail}</div>
              <div className="pa-vert">{p.vertreter}</div>
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

/* ---------- Akten: Verzeichnis + Ordner ---------- */
function FallAkten({ fall, uploadDocument }: { fall: Fall; uploadDocument: Workspace['uploadDocument'] }) {
  const [ansicht, setAnsicht] = useState('verzeichnis');
  const [sel, setSel] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const ordner = [...new Set(fall.akten.map((a) => a.ordner))];

  const handleUpload = async () => {
    setImporting(true);
    try {
      await uploadDocument('Hochgeladen');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, gap: 12 }}>
      <div className="row-flex">
        <div className="tabs">
          <span className={`tab ${ansicht === 'verzeichnis' ? 'on' : ''}`} onClick={() => setAnsicht('verzeichnis')}>Verzeichnis</span>
          <span className={`tab ${ansicht === 'ordner' ? 'on' : ''}`} onClick={() => setAnsicht('ordner')}>Ordner</span>
        </div>
        <div className="spacer"></div>
        <button className="btn-primary-dark" onClick={handleUpload} disabled={importing}>
          <Icon name="upload" size={13} /> {importing ? 'Wird importiert…' : 'Akte hochladen'}
        </button>
      </div>

      {ansicht === 'verzeichnis' ? (
        <div className="panel scroll" style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
          <div className="akt-row akt-head">
            <span>Nr.</span><span>Datum</span><span>Titel</span><span>Absender</span><span>Typ</span><span style={{ textAlign: 'right' }}>Seiten</span>
          </div>
          {fall.akten.map((a, i) => (
            <div key={a.id} className={`akt-row ${sel === i ? 'on' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
              <span className="akt-nr">{a.nr}</span>
              <span className="akt-dat">{a.datum}</span>
              <span className="akt-titel">{a.titel}</span>
              <span className="akt-abs">{a.absender}</span>
              <span><span className="akt-typ">{a.typ}</span></span>
              <span className="akt-seiten">{a.seiten}</span>
            </div>
          ))}
        </div>
      ) : (
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
    </div>
  );
}

/* ---------- Fristen ---------- */
function FallFristen({
  fall,
  addFrist,
  completeFrist,
}: {
  fall: Fall;
  addFrist: Workspace['addFrist'];
  completeFrist: Workspace['completeFrist'];
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
function FallPost({ fall, addCorrespondence }: { fall: Fall; addCorrespondence: Workspace['addCorrespondence'] }) {
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
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Honorar ---------- */
function FallHonorar({ fall, addBillingEntry }: { fall: Fall; addBillingEntry: Workspace['addBillingEntry'] }) {
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
