/* Fall-Space — dedizierter Raum pro Fall
   Tabs: Übersicht · Akten · Fristen · Chronologie · Korrespondenz · Honorar */
const { useState: usePF } = React;

const FALL_TABS = [
  { id: 'uebersicht',    l: 'Übersicht' },
  { id: 'akten',         l: 'Akten' },
  { id: 'fristen',       l: 'Fristen' },
  { id: 'chronologie',   l: 'Chronologie' },
  { id: 'korrespondenz', l: 'Korrespondenz' },
  { id: 'honorar',       l: 'Honorar' },
];

function FallSpace({ fall, initialTab, onOpenWorkbench }) {
  const [tab, setTab] = usePF(initialTab || 'uebersicht');

  return (
    <div className="detail view-in" data-screen-label={`Fall · ${fall.ref}`}>
      {/* Kopf mit Rubrum-Kern */}
      <div className="fall-head">
        <div className="col" style={{ gap: 3, minWidth: 0 }}>
          <div className="row-flex" style={{ gap: 12 }}>
            <h1 className="fall-title">{fall.title}<span className="ac">.</span></h1>
          </div>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          <span className={`countdown ${fall.nextFrist.tage <= 10 ? 'hot' : fall.nextFrist.tage <= 30 ? 'warm' : ''}`} title={fall.nextFrist.titel}>
            <Icon name="time" size={11} /> {fall.nextFrist.tage} T
          </span>
          <button className="btn-primary-dark" onClick={() => onOpenWorkbench(fall.id, fall.entwuerfe[0].id)}>
            <Icon name="pen" size={13} /> Workbench
          </button>
        </div>
      </div>

      <div className="tabs" style={{ alignSelf: 'flex-start' }}>
        {FALL_TABS.map(t => (
          <span key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.l}</span>
        ))}
      </div>

      {tab === 'uebersicht' && <FallUebersicht fall={fall} onOpenWorkbench={onOpenWorkbench} goTab={setTab} />}
      {tab === 'akten' && <FallAkten fall={fall} />}
      {tab === 'fristen' && <FallFristen fall={fall} />}
      {tab === 'chronologie' && <FallChrono fall={fall} />}
      {tab === 'korrespondenz' && <FallPost fall={fall} />}
      {tab === 'honorar' && <FallHonorar fall={fall} />}
    </div>
  );
}

/* ---------- Übersicht ---------- */
function FallUebersicht({ fall, onOpenWorkbench, goTab }) {
  return (
    <div className="detail-body" style={{ gridTemplateColumns: '300px 1fr 320px' }}>
      {/* Parteien & Rubrum */}
      <div className="panel">
        <div className="panel-head"><span className="title">Parteien</span></div>
        <div className="col" style={{ gap: 14 }}>
          {fall.parteien.map((p, i) => (
            <div key={i} className={`partei ${p.klient ? 'klient' : ''}`}>
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
            <span className="val">{fall.nextFrist.tage} Tage</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="title">Entwürfe</span>
          </div>
          <div className="col" style={{ gap: 4 }}>
            {fall.entwuerfe.map(e => (
              <div key={e.id} className="entwurf-row" onClick={() => onOpenWorkbench(fall.id, e.id)}>
                <span className="ico"><Icon name="pen" size={14} /></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <span className="et">{e.titel}</span>
                  <span className="em">{e.typ} · {e.status}</span>
                </div>
                <span className="em">{e.words.toLocaleString('de-CH')} W. · {e.updated}</span>
                <span className="arrow-go"><Icon name="arrow-right" size={14} /></span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            <span className="title">Chronologie</span>
            <span className="sub link-sub" onClick={() => goTab('chronologie')}>alle anzeigen</span>
          </div>
          <div className="tl scroll" style={{ overflow: 'auto' }}>
            {fall.chrono.slice(-4).reverse().map((c, i) => (
              <div key={i} className="ev"><span className="t">{c.datum.split(' ').slice(0, 2).join(' ')}</span><span className="d">{c.ereignis} <span className="beleg-chip">{c.beleg}</span></span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Rechts — Fristen + Post */}
      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head"><span className="title">Fristen</span><span className="sub link-sub" onClick={() => goTab('fristen')}>alle</span></div>
          <div className="col" style={{ gap: 8 }}>
            {fall.fristen.slice(0, 3).map((f, i) => (
              <div key={i} className="frist-mini">
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
            {fall.korrespondenz.map((k, i) => (
              <div key={i} className="post-row">
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
function FallAkten({ fall }) {
  const [ansicht, setAnsicht] = usePF('verzeichnis');
  const [sel, setSel] = usePF(null);
  const ordner = [...new Set(fall.akten.map(a => a.ordner))];

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, gap: 12 }}>
      <div className="row-flex">
        <div className="tabs">
          <span className={`tab ${ansicht === 'verzeichnis' ? 'on' : ''}`} onClick={() => setAnsicht('verzeichnis')}>Verzeichnis</span>
          <span className={`tab ${ansicht === 'ordner' ? 'on' : ''}`} onClick={() => setAnsicht('ordner')}>Ordner</span>
        </div>
        <div className="spacer"></div>
        <button className="btn-primary-dark"><Icon name="upload" size={13} /> Akte hochladen</button>
      </div>

      {ansicht === 'verzeichnis' ? (
        <div className="panel scroll" style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
          <div className="akt-row akt-head">
            <span>Nr.</span><span>Datum</span><span>Titel</span><span>Absender</span><span>Typ</span><span style={{ textAlign: 'right' }}>Seiten</span>
          </div>
          {fall.akten.map((a, i) => (
            <div key={i} className={`akt-row ${sel === i ? 'on' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
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
          {ordner.map(o => (
            <div key={o} className="panel">
              <div className="panel-head">
                <span className="row-flex" style={{ gap: 8 }}><Icon name="folder" size={15} /><span className="title" style={{ fontSize: 16 }}>{o}</span></span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                {fall.akten.filter(a => a.ordner === o).map((a, i) => (
                  <div key={i} className="ordner-doc">
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
function FallFristen({ fall }) {
  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head"><span className="title">Fristen & Termine</span></div>
      <div className="col" style={{ gap: 0 }}>
        {fall.fristen.map((f, i) => (
          <div key={i} className="frist-row">
            <span className={`countdown big ${f.tage <= 10 ? 'hot' : f.tage <= 30 ? 'warm' : ''}`}>{f.tage} Tage</span>
            <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <span className="fr-t">{f.titel}</span>
              <span className="fr-n">{f.note}</span>
            </div>
            <span className="frist-art">{f.art}</span>
            <span className="fr-d">{f.datum}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Chronologie ---------- */
function FallChrono({ fall }) {
  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head">
        <span className="title">Sachverhalts-Chronologie</span>
        <span className="chip"><Icon name="plus" size={11} /> Aus Akten ergänzen</span>
      </div>
      <div className="chrono">
        {fall.chrono.map((c, i) => (
          <div key={i} className="chrono-ev">
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
function FallPost({ fall }) {
  return (
    <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div className="panel-head"><span className="title">Korrespondenz</span></div>
      <div className="col" style={{ gap: 0 }}>
        {fall.korrespondenz.map((k, i) => (
          <div key={i} className="post-row lg">
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
function FallHonorar({ fall }) {
  const h = fall.honorar;
  const sum = h.entries.reduce((s, e) => s + e.min, 0) / 60;
  const chf = Math.round(h.total * h.rate);
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
        <div className="panel-head"><span className="title">Leistungserfassung</span><span className="chip"><Icon name="plus" size={11} /> Eintrag</span></div>
        <div className="col">
          {h.entries.map((e, i) => (
            <div key={i} className="hon-row">
              <span className="fr-d" style={{ width: 92 }}>{e.datum}</span>
              <span className="hr-t">{e.taetigkeit}</span>
              <span className="hr-min">{(e.min / 60).toFixed(2)} h</span>
              <span className="hr-chf">CHF {Math.round(e.min / 60 * h.rate).toLocaleString('de-CH')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.FallSpace = FallSpace;
