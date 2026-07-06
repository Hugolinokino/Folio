/* Level 3 — Board Detail Views (5 unique feature hubs)
   Exposes Board01..Board05 globally + a Detail router. */
const { useState: useS3 } = React;

/* DetailHead is defined in detail-shared.jsx and attached to window */
const DetailHead = window.DetailHead;

/* ============================================================
   Board 01 — Projektverwaltung
   ============================================================ */
function Board01({ board, project, onBack }) {
  const [tab, setTab] = useS3('aktiv');
  const [mode, setMode] = useS3('overview');

  if (mode === 'overview') {
    return (
      <BoardLanding
        board={board} project={project}
        lede="Struktur für lange Arbeiten — Fortschritt, Aufgaben und Fristen aller Projekte im Blick."
        stats={[{ n: '62%', l: 'Fortschritt' }, { n: '6', l: 'Projekte aktiv' }, { n: '11 Tage', l: 'bis Deadline' }]}
        entries={[
          { id: 'dashboard', icon: 'grid', title: 'Dashboard', desc: 'Fortschritt, Quellen und Wortzahl auf einen Blick.', meta: 'Live' },
          { id: 'aufgaben', icon: 'check', title: 'Aufgaben', desc: 'To-dos nach Heute, Woche und Gesamt.', meta: '6 offen' },
          { id: 'meilensteine', icon: 'flag', title: 'Meilensteine', desc: 'Termine von der ersten Recherche bis zur Abgabe.', meta: '5 Termine' },
          { id: 'aktivitaet', icon: 'time', title: 'Aktivität', desc: 'Verlauf der letzten Änderungen im Projekt.', meta: 'Letzte 24 h' },
        ]}
        onEnter={() => setMode('detail')}
      />
    );
  }

  return (
    <div className="detail view-in" data-screen-label="03 Board · Projekte" style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} onOverview={() => setMode('overview')} right={
        <>
          <div className="tabs">
            {['aktiv', 'archiv', 'vorlagen'].map(t => (
              <span key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</span>
            ))}
          </div>
          <button className="btn-primary-dark"><Icon name="plus" size={14} /> Neues Projekt</button>
        </>
      }/>

      <div className="detail-body" style={{ gridTemplateColumns: '280px 1fr 320px' }}>
        {/* Left — sidebar */}
        <div className="panel">
          <div className="panel-head">
            <span className="title">Projekte</span>
          </div>
          <div className="sidelist">
            {window.PROJECTS.map((p, i) => (
              <div key={p.id} className={`it ${p.id === project.id ? 'on' : ''}`} style={{ '--mc': `var(--accent-${p.color})` }}>
                <span className="c"></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                  <span className="t-mono-sm">{p.type} · {p.due.split(' ').slice(0, 2).join(' ')}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: '14px 0' }}></div>
          <div className="t-mono-sm" style={{ marginBottom: 10 }}>Vorlagen</div>
          <div className="col" style={{ gap: 6 }}>
            {['BA-Thesis', 'Seminararbeit', 'Policy-Paper', 'Memo'].map(t => (
              <div key={t} className="chip" style={{ alignSelf: 'flex-start' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Center — dashboard */}
        <div className="col" style={{ gap: 16, minHeight: 0 }}>
          <div className="grid-3" style={{ minHeight: 'auto' }}>
            <div className="cell-stat">
              <span className="lbl">Fortschritt</span>
              <span className="val">62%</span>
              <div className="progress" style={{ marginTop: 4 }}><span style={{ width: '62%', background: board.color }}></span></div>
            </div>
            <div className="cell-stat">
              <span className="lbl">Quellen</span>
              <span className="val">47</span>
            </div>
            <div className="cell-stat">
              <span className="lbl">Wörter geschrieben</span>
              <span className="val">8 940</span>
            </div>
          </div>

          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-head">
              <span className="title">Aufgaben</span>
              <span className="row-flex" style={{ gap: 6 }}>
                <span className="chip on">Heute</span>
                <span className="chip">Woche</span>
                <span className="chip">Alle</span>
              </span>
            </div>
            <div className="scroll" style={{ overflow: 'auto', flex: 1, paddingRight: 4 }}>
              {[
                { done: true,  l: 'Gliederung Kapitel 2 entwerfen', m: 'gestern' },
                { done: true,  l: 'BGE 137 I 16 lesen & exzerpieren', m: 'di' },
                { done: false, l: 'Forstmoser-Zitat zu Schweizer Lehre prüfen', m: 'heute' },
                { done: false, l: 'AI-Synthese Kap. 3.2 verifizieren', m: 'heute' },
                { done: false, l: 'Treffen mit Prof. Hilty vorbereiten', m: 'fr 14:00' },
                { done: false, l: 'Erlassverzeichnis erstmalig exportieren', m: 'di' },
              ].map((r, i) => (
                <div key={i} className={`ckrow ${r.done ? 'done' : ''}`}>
                  <span className="ck">{r.done && <Icon name="check" size={11} />}</span>
                  <span className="lbl">{r.l}</span>
                  <span className="meta">{r.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — deadlines + activity */}
        <div className="col" style={{ gap: 16, minHeight: 0 }}>
          <div className="panel">
            <div className="panel-head">
              <span className="title">Meilensteine</span>
            </div>
            <div className="tl">
              {[
                { t: '03 jun', d: 'Quellenrecherche abgeschlossen' },
                { t: '24 jun', d: 'Rohfassung Kap. 1–2' },
                { t: '15 jul', d: 'Erster Vollentwurf' },
                { t: '01 aug', d: 'Korrektorat extern' },
                { t: '15 aug', d: 'Abgabe an Dekanat' },
              ].map((e, i) => <div key={i} className="ev"><span className="t">{e.t}</span><span className="d">{e.d}</span></div>)}
            </div>
          </div>

          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              <span className="title">Aktivität</span>
            </div>
            <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
              <div className="tl">
                {[
                  { t: '14:22', d: 'PDF angehängt — BSK BV Art. 10 N 12' },
                  { t: '11:08', d: 'Notiz „Kerngehalt vs. Kerngehaltstheorie"' },
                  { t: '09:51', d: 'Forstmoser-Zitat generiert (BGE 134 I 209)' },
                  { t: 'gestern', d: 'Kapitel 2 umstrukturiert (Drag-and-drop)' },
                  { t: 'gestern', d: 'Synthese mit AI — 4 Quellen zusammengeführt' },
                  { t: 'mo', d: 'Treffen mit Betreuung dokumentiert' },
                ].map((e, i) => <div key={i} className="ev"><span className="t">{e.t}</span><span className="d">{e.d}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Board01 = Board01;
