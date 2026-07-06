/* Board 05 — Schreiben & Export */
const { useState: useS05 } = React;

function Board05({ board, project, onBack }) {
  const [chapter, setChapter] = useS05('II.1');
  const [mode, setMode] = useS05('overview');

  const chapters = [
    { id: 'I',    n: 'I',    t: 'Einleitung',                w: 1240, ok: true },
    { id: 'II',   n: 'II',   t: 'Dogmatische Grundlagen',    w: 3820, ok: true },
    { id: 'II.1', n: 'II.1', t: 'Persönliche Freiheit',      w: 1480, current: true },
    { id: 'II.2', n: 'II.2', t: 'Kerngehalt',                w: 2340 },
    { id: 'III',  n: 'III',  t: 'Aktuelle Rechtsprechung',   w: 4210 },
    { id: 'IV',   n: 'IV',   t: 'Kritische Würdigung',       w: 2890 },
    { id: 'V',    n: 'V',    t: 'Fazit',                     w: 1040 },
  ];

  if (mode === 'overview') {
    return (
      <BoardLanding
        board={board} project={project}
        lede="Vom Argument zur Abgabe — schreiben, belegen und exportieren in juristischer Formatierung."
        stats={[{ n: '14.2k', l: 'Wörter' }, { n: '38', l: 'Fussnoten' }, { n: '4 / 7', l: 'Kapitel fertig' }]}
        entries={[
          { id: 'schreiben', icon: 'pen', title: 'Schreiben', desc: 'Kapitel-Editor mit Fussnoten und laufendem Argumentationscheck.', meta: '7 Abschnitte' },
          { id: 'fussnoten', icon: 'quote', title: 'Fussnoten', desc: 'Forstmoser-konforme Belege auf Knopfdruck generieren.', meta: '38 Fussnoten' },
          { id: 'verzeichnisse', icon: 'book', title: 'Verzeichnisse', desc: 'Literatur, Erlasse, Materialien und Abkürzungen.', meta: '4 Listen' },
          { id: 'export', icon: 'download', title: 'Export', desc: 'Word, PDF, LaTeX oder Markdown — juristisch formatiert.', meta: '4 Formate' },
        ]}
        onEnter={() => setMode('detail')}
      />
    );
  }

  return (
    <div className="detail view-in" data-screen-label="03 Board · Schreiben" style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} onOverview={() => setMode('overview')} right={
        <>
          <span className="t-mono-sm">14 200 / 12 000 wörter</span>
          <button className="btn-ghost-glass"><Icon name="check" size={13} /> Argumentationscheck</button>
          <button className="btn-primary-dark"><Icon name="export" size={13} /> Exportieren</button>
        </>
      }/>

      <div className="detail-body" style={{ gridTemplateColumns: '240px 1fr 340px' }}>
        {/* Chapters */}
        <div className="panel">
          <div className="panel-head">
            <span className="title">Kapitel</span>
          </div>
          <div className="sidelist">
            {chapters.map(c => (
              <div key={c.id} className={`it ${c.current ? 'on' : ''}`} style={{ '--mc': board.color }} onClick={() => setChapter(c.id)}>
                <span className="t-mono-num" style={{ minWidth: 32, color: c.current ? board.color : 'var(--ink-4)' }}>{c.n}</span>
                <div className="col" style={{ flex: 1, gap: 2 }}>
                  <span>{c.t}</span>
                  <span className="t-mono-sm">{c.w.toLocaleString('de-CH')} wörter {c.ok ? '· geprüft' : ''}</span>
                </div>
                {c.ok && <Icon name="check" size={13} stroke={2} style={{ color: 'var(--accent-green)' }} />}
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: '14px 0' }}></div>
          <div className="t-mono-sm" style={{ marginBottom: 8 }}>Verzeichnis-Builder</div>
          <div className="col" style={{ gap: 6 }}>
            <div className="chip" style={{ justifyContent: 'space-between', height: 30, width: '100%' }}>
              <span>Literaturverzeichnis</span><span style={{ color: 'var(--ink-4)' }}>23</span>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between', height: 30, width: '100%' }}>
              <span>Erlassverzeichnis</span><span style={{ color: 'var(--ink-4)' }}>6</span>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between', height: 30, width: '100%' }}>
              <span>Materialien</span><span style={{ color: 'var(--ink-4)' }}>3</span>
            </div>
            <div className="chip" style={{ justifyContent: 'space-between', height: 30, width: '100%' }}>
              <span>Abkürzungen</span><span style={{ color: 'var(--ink-4)' }}>14</span>
            </div>
          </div>
        </div>

        {/* Writing pane */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '14px 18px 0', marginBottom: 0 }}>
            <div className="tabs" style={{ padding: 3 }}>
              <span className="tab on">Schreiben</span>
              <span className="tab">Argumente</span>
              <span className="tab">Vorschau</span>
            </div>
          </div>
          <div className="writer scroll" style={{ flex: 1, margin: '12px 16px 16px', overflow: 'auto' }}>
            <div className="t-mono-sm" style={{ marginBottom: 14, textAlign: 'center' }}>
              — II.1 — Persönliche Freiheit als Grundrecht —
            </div>
            <p>
              Die persönliche Freiheit ist nicht nur ein klassisches Grundrecht, sondern fungiert in der bundesgerichtlichen
              Praxis als ein <span className="t-italic">stellvertretendes Sammelbecken</span> für jene Schutzbedürfnisse, die
              sich keinem spezielleren Recht zuordnen lassen<span className="fn">12</span>. Diese Auffangfunktion verleiht ihr
              eine eigentümliche Doppelnatur: dogmatisch konturlos, aber praktisch unverzichtbar.
            </p>
            <p>
              Bereits <span style={{ fontVariant: 'small-caps' }}>Müller</span> hat in der zweiten Auflage seines Lehrbuchs
              darauf hingewiesen, dass eine Grundrechtsnorm, die alles Mögliche schützen soll, in Gefahr läuft, am Ende nichts
              Spezifisches zu schützen<span className="fn">13</span>. Diese Kritik hat <span style={{ fontVariant: 'small-caps' }}>Kiener</span>
              in jüngerer Zeit verschärft und von einem <span className="t-italic">„konturlosen Restbestand"</span> gesprochen<span className="fn">14</span>.
            </p>
            <p>
              Die hier vertretene Auffassung schlägt einen mittleren Weg vor: <span className="t-italic">Art. 10 BV</span> soll
              nicht als Auffangtatbestand verstanden werden, sondern als Konkretisierung jener Mindestgarantien, die in einer
              freiheitlich-demokratischen Ordnung schlechterdings unverzichtbar sind. Diese Lesart hat den Vorteil, dass sie
              den begrifflichen Spielraum eingrenzt, ohne den Schutzgehalt zu schmälern.
            </p>

            <div style={{ marginTop: 18, padding: '10px 12px', background: `${board.color}0d`, border: `1px solid ${board.color}33`, borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 11, color: board.color, letterSpacing: '0.04em' }}>
              ▸ Argumentationscheck — Absatz 3 verweist auf „freiheitlich-demokratische Ordnung", ohne eine Quelle. Quelle hinzufügen?
            </div>

            <div className="footnotes">
              <div className="ln"><span className="n">12</span><span>BGE 137 I 16 E. 3.2 <span className="t-italic">in fine</span>; bestätigend BGE 142 I 195 E. 4.1; vgl. dazu <span style={{ fontVariant: 'small-caps' }}>Müller/Schefer</span>, Grundrechte, S. 142.</span></div>
              <div className="ln"><span className="n">13</span><span><span style={{ fontVariant: 'small-caps' }}>Müller</span>, Grundrechte (2. Aufl. 1999), § 12 N 4.</span></div>
              <div className="ln"><span className="n">14</span><span><span style={{ fontVariant: 'small-caps' }}>Kiener</span>, AJP 2018, S. 1124, 1128.</span></div>
            </div>
          </div>
        </div>

        {/* Right — footnote generator + export */}
        <div className="col" style={{ gap: 16, minHeight: 0 }}>
          <div className="panel">
            <div className="panel-head">
              <span className="title">Fussnoten-Generator</span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              <div className="search" style={{ padding: '8px 12px' }}>
                <Icon name="search" size={13} />
                <input placeholder="BGE oder Autor…" defaultValue="BGE 137 I 16" />
              </div>
              <div className="row-flex" style={{ gap: 8 }}>
                <div className="col" style={{ flex: 1 }}>
                  <span className="t-mono-sm" style={{ marginBottom: 4 }}>Erwägung</span>
                  <input className="input" defaultValue="E. 3.2" style={{ fontSize: 14, padding: '6px 10px' }} />
                </div>
                <div className="col" style={{ flex: 1 }}>
                  <span className="t-mono-sm" style={{ marginBottom: 4 }}>Zusatz</span>
                  <input className="input" defaultValue="in fine" style={{ fontSize: 14, padding: '6px 10px' }} />
                </div>
              </div>
              <div className="t-body" style={{ background: 'var(--fill-2)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line-1)', fontSize: 14 }}>
                <sup style={{ marginRight: 4, fontFamily: 'var(--mono)', fontSize: 9 }}>15</sup>
                BGE 137 I 16 E. 3.2 <span className="t-italic">in fine</span>.
              </div>
              <div className="row-flex" style={{ gap: 6 }}>
                <button className="btn-ghost-glass" style={{ flex: 1 }}><Icon name="plus" size={12} /> In Text einfügen</button>
                <button className="btn-ghost-glass"><Icon name="link" size={12} /></button>
              </div>
            </div>
          </div>

          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              <span className="title">Export</span>
            </div>

            <div className="col" style={{ gap: 8 }}>
              {[
                { f: 'Word (.docx)', d: 'mit Forstmoser-Fussnoten, Inhaltsverzeichnis, Verzeichnissen', primary: true },
                { f: 'PDF', d: 'A4, Justizfont, Seitenzahlen oben aussen' },
                { f: 'LaTeX', d: 'biblatex-swissyear, jur-thesis Klasse' },
                { f: 'Markdown', d: 'für Versionierung in git' },
              ].map((r, i) => (
                <div key={i} className="db-tile" style={{
                  minHeight: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderColor: r.primary ? `${board.color}40` : 'var(--line-1)',
                  background: r.primary ? 'var(--fill-3)' : 'var(--fill-1)',
                }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: r.primary ? `${board.color}18` : 'var(--fill-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.primary ? board.color : 'var(--ink-2)' }}>
                    <Icon name="doc" size={16} />
                  </span>
                  <div className="col" style={{ flex: 1, gap: 2 }}>
                    <span className="nm" style={{ fontSize: 15 }}>{r.f}</span>
                    <span className="de" style={{ fontSize: 12.5 }}>{r.d}</span>
                  </div>
                  <Icon name="download" size={15} />
                </div>
              ))}
            </div>

            <div className="divider" style={{ margin: '12px 0' }}></div>
            <div className="row-flex" style={{ justifyContent: 'space-between' }}>
              <span className="t-mono-sm">Letzter Export</span>
              <span className="t-mono-num">gestern 18:47</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Board05 = Board05;
