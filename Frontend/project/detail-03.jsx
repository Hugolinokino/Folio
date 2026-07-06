/* Board 03 — Recherche-Tools (The Hub) */
const { useState: useS03 } = React;

function Board03({ board, project, onBack }) {
  const [q, setQ] = useS03('persönliche Freiheit Kerngehalt');
  const [active, setActive] = useS03(['opencaselaw', 'bge-search', 'fedlex']);
  const [mode, setMode] = useS03('overview');

  const dbs = [
    { id: 'opencaselaw',     nm: 'opencaselaw',     sl: 'rechtsprechung CH-weit',    de: 'BGer, Kantonsgerichte, Volltextsuche',         hits: 34 },
    { id: 'bge-search',      nm: 'bge-search',      sl: 'amtliche sammlung',         de: 'Bundesgerichtsentscheide systematisch',       hits: 19 },
    { id: 'entscheidsuche',  nm: 'entscheidsuche',  sl: 'kantonale entscheide',      de: 'Föderierte Suche über alle Kantone',          hits: 12 },
    { id: 'fedlex',          nm: 'fedlex',          sl: 'erlasssammlung des bundes', de: 'BV, OR, ZGB, StGB — konsolidiert',            hits: 8 },
    { id: 'onlinekommentar', nm: 'onlinekommentar', sl: 'doktrin · kommentare',      de: 'Open-Access-Kommentare zum CH-Recht',         hits: 14 },
    { id: 'legal-citations', nm: 'legal-citations', sl: 'zitationsnetzwerk',         de: 'Welche Entscheide werden wie oft zitiert?',   hits: 6 },
    { id: 'consensus',       nm: 'Consensus',       sl: 'wissenschaftliche paper',   de: 'AI-Recherche über peer-reviewed Quellen',     hits: 22 },
    { id: 'web',             nm: 'Web-Suche',       sl: 'allgemeines web',           de: 'Mit automatischer Quellenübernahme',          hits: 47 },
  ];

  const results = [
    { db: 'bge-search', ref: 'BGE 137 I 16', topic: 'Persönliche Freiheit · Kerngehalt der Bewegungsfreiheit', erw: 'E. 3.2', score: 0.94, jahr: '2010' },
    { db: 'opencaselaw', ref: 'BGE 142 I 195', topic: 'Verhältnismässigkeit polizeilicher Eingriffe', erw: 'E. 4.1', score: 0.88, jahr: '2016' },
    { db: 'consensus',  ref: 'Kiener (2018)', topic: '„Der absolut geschützte Kerngehalt — ein dogmatischer Mythos?"', erw: 'AJP', score: 0.83, jahr: '2018' },
    { db: 'onlinekommentar', ref: 'OK BV — Art. 10', topic: 'Kommentar zum allgemeinen Persönlichkeitsschutz, Rz. 22–28', erw: 'Rz. 24', score: 0.79, jahr: '2022' },
    { db: 'fedlex',      ref: 'BV Art. 10 / 36',  topic: 'Gesetzliche Grundlage / Einschränkungen von Grundrechten', erw: 'Abs. 4', score: 0.74, jahr: 'aktuell' },
    { db: 'entscheidsuche', ref: 'VGE ZH 2019.5', topic: 'Zwangsmedikation in der Psychiatrie · Kerngehalt', erw: 'E. 5b', score: 0.66, jahr: '2019' },
  ];

  const toggle = (id) => setActive(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  if (mode === 'overview') {
    return (
      <BoardLanding
        board={board} project={project}
        lede="Sechs Rechts- und Literaturdatenbanken in einem Fenster — Rechtsprechung, Lehre und Web gleichzeitig."
        stats={[{ n: '6', l: 'Datenbanken' }, { n: '142', l: 'Treffer heute' }, { n: '12', l: 'gespeichert' }]}
        entries={[
          { id: 'search', icon: 'search', title: 'Unified Search', desc: 'Recht, Lehre und Web in einer Abfrage durchsuchen.', meta: 'Im Projekt' },
          { id: 'datenbanken', icon: 'grid', title: 'Datenbanken', desc: 'opencaselaw, fedlex, Consensus und fünf weitere Quellen.', meta: '8 Quellen' },
          { id: 'treffer', icon: 'list', title: 'Treffer', desc: 'Relevanz-sortierte Ergebnisse direkt als Quelle übernehmen.', meta: '142 heute' },
        ]}
        onEnter={() => setMode('detail')}
      />
    );
  }

  return (
    <div className="detail view-in" data-screen-label="03 Board · Recherche" style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} onOverview={() => setMode('overview')} right={
        <>
          <button className="btn-ghost-glass"><Icon name="time" size={13} /> Suchverlauf</button>
          <button className="btn-primary-dark" style={{ background: board.color, borderColor: board.color }}>
            <Icon name="pin" size={13} /> Im Projekt speichern
          </button>
        </>
      }/>

      <div className="detail-body" style={{ gridTemplateRows: 'auto 1fr', gridTemplateColumns: '1fr' }}>
        {/* Unified search bar */}
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div className="row-flex" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="title t-h3">Unified Search</span>
            <span className="t-mono-sm">Recht · Lehre · Web gleichzeitig</span>
          </div>
          <div className="search" style={{ padding: '14px 18px' }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} style={{ fontSize: 18 }} />
            <span className="chip accent" style={{ '--mc': board.color }}>im Projekt: {project.title.split(' ').slice(0, 3).join(' ')}…</span>
            <span className="kbd">↵</span>
          </div>
          <div className="row-flex" style={{ marginTop: 12, gap: 6, flexWrap: 'wrap' }}>
            <span className="t-mono-sm" style={{ marginRight: 4 }}>Aktiv:</span>
            {dbs.map(d => (
              <span key={d.id} className={`chip ${active.includes(d.id) ? 'on' : ''}`} onClick={() => toggle(d.id)}>
                {d.nm}
              </span>
            ))}
          </div>
        </div>

        {/* Body — DB tiles + results */}
        <div className="grid-l-r" style={{ gridTemplateColumns: '380px 1fr', minHeight: 0 }}>
          <div className="panel">
            <div className="panel-head">
              <span className="title">Datenbanken</span>
            </div>
            <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
              <div className="col" style={{ gap: 10 }}>
                {dbs.map(d => (
                  <div key={d.id} className="db-tile" style={{
                    borderColor: active.includes(d.id) ? `${board.color}40` : 'var(--line-1)',
                    background: active.includes(d.id) ? 'var(--fill-3)' : 'var(--fill-1)',
                  }} onClick={() => toggle(d.id)}>
                    <div className="row-flex" style={{ justifyContent: 'space-between' }}>
                      <div className="col" style={{ gap: 2 }}>
                        <span className="nm">{d.nm}</span>
                        <span className="sl">{d.sl}</span>
                      </div>
                      <span className="pill" style={{
                        background: active.includes(d.id) ? `${board.color}18` : 'var(--fill-1)',
                        color: active.includes(d.id) ? board.color : 'var(--ink-4)',
                        border: 'none'
                      }}>
                        {d.hits} treffer
                      </span>
                    </div>
                    <div className="de">{d.de}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="title">Treffer</span>
              <div className="row-flex" style={{ gap: 8 }}>
                <span className="chip on">Relevanz</span>
                <span className="chip">Datum</span>
                <span className="chip">Datenbank</span>
              </div>
            </div>
            <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
              <div className="col" style={{ gap: 10 }}>
                {results.map((r, i) => (
                  <div key={i} className="db-tile lev" style={{ minHeight: 'auto' }}>
                    <div className="row-flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="col" style={{ gap: 4, flex: 1 }}>
                        <div className="row-flex" style={{ gap: 8 }}>
                          <span className="t-mono-sm" style={{ color: board.color }}>● {r.db}</span>
                          <span className="t-mono-num" style={{ fontWeight: 500 }}>{r.ref}</span>
                          <span className="t-mono-sm">{r.erw} · {r.jahr}</span>
                        </div>
                        <div className="t-h3" style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{r.topic}</div>
                      </div>
                      <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
                        <span className="t-mono-num" style={{ fontSize: 13, fontWeight: 500 }}>
                          {(r.score * 100).toFixed(0)}<span style={{ fontSize: 10, color: 'var(--ink-4)' }}>%</span>
                        </span>
                        <div style={{ width: 56, height: 3, background: 'var(--line-1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${r.score * 100}%`, height: '100%', background: board.color }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="row-flex" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                      <div className="row-flex" style={{ gap: 6 }}>
                        <span className="chip" style={{ height: 22, fontSize: 9.5 }}><Icon name="quote" size={11} /> als Quelle</span>
                        <span className="chip" style={{ height: 22, fontSize: 9.5 }}><Icon name="note" size={11} /> notiz</span>
                        <span className="chip" style={{ height: 22, fontSize: 9.5 }}><Icon name="pin" size={11} /> pin</span>
                      </div>
                      <span className="t-mono-sm">→ öffnen</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Board03 = Board03;
