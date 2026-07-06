/* Board 04 — Notizen & Synthese (functional tabs: Gliederung / Notizen / Thesen / Zitate) */
const { useState: useS04 } = React;

function Board04({ board, project, onBack }) {
  const [tab, setTab] = useS04('gliederung');
  const [mode, setMode] = useS04('overview');

  if (mode === 'overview') {
    return (
      <BoardLanding
        board={board} project={project}
        lede="Vom Material zum Argument — Gliederung, Notizen, Thesen und Zitate an einem Ort, immer mit den Quellen verknüpft."
        stats={[{ n: '23', l: 'Notizen' }, { n: '8', l: 'Thesen' }, { n: '9', l: 'Zitate' }, { n: '4', l: 'Kapitel' }]}
        entries={[
          { id: 'gliederung', icon: 'list', title: 'Gliederung', desc: 'Kapitelstruktur mit Argumentationslinien und Lücken-Check.', meta: '5 Hauptteile' },
          { id: 'notizen', icon: 'note', title: 'Notizen', desc: 'Editor mit @-Quellenverknüpfung und kontextuellem Assistenten.', meta: '23 Notizen' },
          { id: 'thesen', icon: 'flag', title: 'Thesen', desc: 'Argumente mit Belegen, Gegenargumenten und eigener Position.', meta: '8 Thesen' },
          { id: 'zitate', icon: 'quote', title: 'Zitate', desc: 'Thematisch geclusterte Zitatsammlung mit Verwendungsnachweis.', meta: '9 Zitate' },
        ]}
        onEnter={(e) => { setTab(e.id); setMode('detail'); }}
      />
    );
  }

  return (
    <div className="detail view-in" data-screen-label="03 Board · Notizen" style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} onOverview={() => setMode('overview')} right={
        <>
          <div className="tabs">
            {[
              { id: 'gliederung', l: 'Gliederung' },
              { id: 'notizen',    l: 'Notizen' },
              { id: 'thesen',     l: 'Thesen' },
              { id: 'zitate',     l: 'Zitate' },
            ].map(t => (
              <span key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.l}</span>
            ))}
          </div>
          <button className="btn-primary-dark" style={{ background: board.color, borderColor: board.color }}>
            <Icon name="sparkle" size={13} /> AI-Synthese
          </button>
        </>
      }/>

      {tab === 'gliederung' && <ViewGliederung board={board} />}
      {tab === 'notizen'    && <ViewNotizen board={board} />}
      {tab === 'thesen'     && <ViewThesen board={board} />}
      {tab === 'zitate'     && <ViewZitate board={board} />}
    </div>
  );
}

/* ============================================================
   VIEW · GLIEDERUNG
   ============================================================ */
function ViewGliederung({ board }) {
  const tree = [
    { lvl: 1, k: 'I',   t: 'Einleitung' },
    { lvl: 2, k: '1',   t: 'Problemstellung & Forschungsfrage' },
    { lvl: 2, k: '2',   t: 'Methodik · Aufbau' },
    { lvl: 1, k: 'II',  t: 'Dogmatische Grundlagen', on: true },
    { lvl: 2, k: '1',   t: 'Persönliche Freiheit als Grundrecht', on: true },
    { lvl: 3, k: 'a',   t: 'Historische Entwicklung Art. 10 BV' },
    { lvl: 3, k: 'b',   t: 'Schutzbereich · Rechtsprechung des BGer' },
    { lvl: 2, k: '2',   t: 'Kerngehalt und Kerngehaltstheorie' },
    { lvl: 1, k: 'III', t: 'Aktuelle Rechtsprechung' },
    { lvl: 2, k: '1',   t: 'BGE 137 I 16 — Leiturteil' },
    { lvl: 2, k: '2',   t: 'Folgeurteile 2010–2024' },
    { lvl: 1, k: 'IV',  t: 'Kritische Würdigung' },
    { lvl: 1, k: 'V',   t: 'Fazit' },
  ];

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '320px 1fr 360px' }}>
      <div className="panel">
        <div className="panel-head">
          <span className="title">Kapitelstruktur</span>
        </div>
        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          <div className="tree">
            {tree.map((n, i) => (
              <div key={i} className={`node l${n.lvl} ${n.on ? 'on' : ''}`}>
                <span className="num">{n.k}</span>
                <span>{n.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="divider" style={{ margin: '12px 0' }}></div>
        <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }}>
          <Icon name="plus" size={12} /> Abschnitt hinzufügen
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="title">II.1 — Persönliche Freiheit als Grundrecht</span>
        </div>

        <div className="col scroll" style={{ gap: 14, padding: '4px 4px', overflow: 'auto', flex: 1 }}>
          <div className="col" style={{ gap: 8 }}>
            <div className="t-mono-sm">Argumentationslinie</div>
            <div className="col" style={{ gap: 8 }}>
              {[
                { n: '1', t: 'Geschichtliche Entwicklung Art. 10 BV', src: ['Müller/Schefer S. 138', 'Tschannen § 47'] },
                { n: '2', t: 'Schutzbereich nach bundesgerichtlicher Praxis', src: ['BGE 137 I 16', 'BGE 134 I 209'] },
                { n: '3', t: 'Auffangfunktion: Stärke und dogmatische Achillesferse', src: ['BGE 137 I 16 E. 3.2', 'Kiener AJP 2018'] },
                { n: '4', t: 'Eigene Position: präzisierter Mindestgehalt', src: ['BSK BV-10 N 24'] },
              ].map((r) => (
                <div key={r.n} className="thesis-card" style={{ '--mc': board.color }}>
                  <div className="th-head">
                    <span className="th-num">Argument {r.n}</span>
                    <Icon name="menu-dots" size={13} style={{ color: 'var(--ink-4)' }} />
                  </div>
                  <div className="th-title">{r.t}</div>
                  <div className="th-foot">
                    {r.src.map(s => <span key={s} className="chip" style={{ height: 22, fontSize: 9.5 }}>{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="title">Zugewiesene Quellen</span>
          </div>
          <div className="col" style={{ gap: 6 }}>
            {[
              { ref: 'BGE 137 I 16',  t: 'X. gegen Verwaltungsgericht ZH',  e: 'E. 3.2' },
              { ref: 'BGE 134 I 209', t: 'A./B. gegen Regierungsrat BE',     e: 'E. 2.3' },
              { ref: 'BGE 142 I 195', t: 'P. gegen EJPD',                     e: 'E. 4.1' },
              { ref: 'Müller/Schefer', t: 'Grundrechte, 4. Aufl. 2008',      e: 'S. 138 ff.' },
              { ref: 'Kiener',        t: 'AJP 2018, 1124',                   e: 'S. 1128' },
              { ref: 'BSK BV-10',     t: 'Hertig Randall',                    e: 'N 22 ff.' },
            ].map((r, i) => (
              <div key={i} className="backlink" style={{ '--mc': board.color, padding: '6px 10px' }}>
                <span className="ref" style={{ minWidth: 100 }}>{r.ref}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{r.t}</span>
                <span className="t-mono-sm">{r.e}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            <span className="title">Lücken-Check</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <div className="callout" style={{ '--mc': board.color }}>
              <div className="ch">▸ Argument 3 ohne Quelle</div>
              <span style={{ color: 'var(--ink-2)' }}>„Auffangfunktion als dogmatische Achillesferse" — kann Kiener AJP 2018 hier den Beleg liefern?</span>
            </div>
            <div className="callout" style={{ '--mc': 'var(--accent-amber)' }}>
              <div className="ch">▸ Schwacher Übergang II.1 → II.2</div>
              <span style={{ color: 'var(--ink-2)' }}>Vorschlag: Brücke über Kerngehaltstheorie als Reaktion auf die Auffangfunktion.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW · NOTIZEN (editor + sidebar + AI)
   ============================================================ */
function ViewNotizen({ board }) {
  return (
    <div className="detail-body" style={{ gridTemplateColumns: '260px 1fr 360px' }}>
      <div className="panel">
        <div className="panel-head">
          <span className="title">Notizen</span>
        </div>
        <div className="search" style={{ marginBottom: 10, padding: '8px 12px' }}>
          <Icon name="search" size={13} />
          <input placeholder="Notiz suchen…" />
        </div>
        <div className="sidelist scroll" style={{ overflow: 'auto', flex: 1 }}>
          {[
            { t: 'Kerngehalt vs. Kerngehaltstheorie', m: 'heute · II.2', on: true },
            { t: 'Reaktion auf Kiener-Kritik',         m: 'gestern · II.1' },
            { t: 'Auffangfunktion — Beispiele',       m: 'mo · II.1' },
            { t: 'BGE 137 I 16 — Erwägungen',         m: 'mo · III.1' },
            { t: 'Historische Linie ab 1874',          m: 'so · II.1.a' },
            { t: 'Materialien zur BV-Reform',         m: 'fr · II.1.a' },
            { t: 'Gespräch mit Prof. Hilty',          m: '13. mär · meta' },
            { t: 'Lücke: Notwehr-Rechtsprechung',     m: '11. mär · IV' },
          ].map((n, i) => (
            <div key={i} className={`it ${n.on ? 'on' : ''}`} style={{ '--mc': board.color, padding: '8px 10px' }}>
              <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.t}</span>
                <span className="t-mono-sm">{n.m}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: '8px 0' }}></div>
        <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }}>
          <Icon name="plus" size={12} /> Neue Notiz
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="row-flex" style={{ gap: 12, alignItems: 'baseline' }}>
            <span className="title">Kerngehalt vs. Kerngehaltstheorie</span>
            <span className="chap-chip" style={{ '--mc': board.color }}><span className="d"></span>II.2</span>
          </span>
          <span className="row-flex" style={{ gap: 6 }}>
            <button className="btn-ghost-glass" style={{ height: 28 }}><Icon name="link" size={12} /> @</button>
          </span>
        </div>
        <div className="scroll writer" style={{ background: 'var(--paper)', flex: 1 }}>
          <p>
            Der Begriff <span className="t-italic">Kerngehalt</span> bezeichnet jenen unantastbaren Wesensbestand
            eines Grundrechts, der auch durch Gesetz nicht eingeschränkt werden darf
            (<span className="fn">@BGE 137 I 16 E. 3.2</span>). Die <span className="t-italic">Kerngehaltstheorie</span>
            hingegen ist die dogmatische Konstruktion, die diesem Begriff Konturen verleihen will — und genau hier
            beginnen die Schwierigkeiten.
          </p>
          <p>
            <span className="fn">@Müller/Schefer S. 142</span> formulieren vorsichtig, dass der Kerngehalt
            „begrifflich notwendig, dogmatisch unscharf" sei. <span className="fn">@Kiener AJP 2018</span>
            spricht offener von einem „dogmatischen Mythos". Eine Mittelposition findet sich bei
            <span className="fn">@BSK BV-10 N 28</span>.
          </p>
          <p>
            <span className="t-italic">Eigene Position:</span> Der Kerngehalt sollte deskriptiv (als Beobachtung der
            BGer-Praxis) anerkannt, normativ (als Regel zur Entscheidungsfindung) jedoch entdramatisiert werden.
            Diese Lesart vermeidet sowohl die Konturlosigkeit als auch die scheindogmatische Strenge.
          </p>
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--fill-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
            <div className="t-mono-sm" style={{ marginBottom: 4 }}>▸ Verbindung zu</div>
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              {['These #3', 'These #5', 'Zitatcluster „Auffangfunktion"', 'Lücke IV.2'].map(s => (
                <span key={s} className="chip" style={{ height: 22, fontSize: 9.5 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            <span className="title">Kontextueller Assistent</span>
          </div>
          <div className="chat-list scroll" style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
            <div className="bubble user">Welche Stimmen kritisieren die Kerngehaltstheorie in der Schweizer Lehre?</div>
            <div className="bubble ai">
              Aus deinen 47 Quellen finden sich vier kritische Positionen — am pointiertesten <span style={{ fontVariant: 'small-caps' }}>Kiener</span> (AJP 2018):
              „dogmatischer Mythos". <span style={{ fontVariant: 'small-caps' }}>Müller/Schefer</span> moderater, aber mit Vorbehalten.
              <span style={{ fontVariant: 'small-caps' }}>Tschannen</span> als Gegenstimme. Soll ich diese in deine These #3 einbauen?
              <div className="src">
                <span className="s">Kiener · AJP 2018</span>
                <span className="s">Müller/Schefer, S. 142</span>
                <span className="s">Tschannen, § 47</span>
                <span className="s">BSK BV-10 N 28</span>
              </div>
            </div>
            <div className="bubble user">Formuliere einen Absatz, der diese Spannung in II.1 sichtbar macht.</div>
            <div className="bubble ai">
              <span className="t-italic">„Während die Kerngehaltstheorie in der bundesgerichtlichen Praxis als
              Schutzanker firmiert, sieht die jüngere Lehre in ihr zunehmend einen begrifflichen Restposten…"</span>
              Soll ich diesen Absatz als Notiz unter II.1 anlegen?
              <div className="src" style={{ marginTop: 8 }}>
                <button className="btn-ghost-glass" style={{ height: 26, fontSize: 10.5 }}><Icon name="plus" size={11} /> Als Notiz</button>
                <button className="btn-ghost-glass" style={{ height: 26, fontSize: 10.5 }}>↗ In Editor</button>
              </div>
            </div>
          </div>
          <div className="search" style={{ marginTop: 10 }}>
            <Icon name="sparkle" size={14} />
            <input placeholder="Frag mit Kontext deines Projekts…" />
            <span className="kbd">⌘↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW · THESEN (pro / contra mit Belegen)
   ============================================================ */
function ViewThesen({ board }) {
  const theses = [
    {
      n: '01', t: 'Der Kerngehalt ist begrifflich notwendig, aber dogmatisch unscharf.',
      sum: 'Sammelbegriff für jenen Wesenskern, den selbst der Gesetzgeber nicht antasten darf — operationalisierbar ist er nicht.',
      pro: [
        { t: 'Lehre erkennt die Kategorie nahezu einhellig an.', s: 'Müller/Schefer S. 142' },
        { t: 'BGer wendet sie als Schutzanker konsistent an.',    s: 'BGE 137 I 16 E. 3.2' },
      ],
      con: [
        { t: 'Konkreter Inhalt bleibt rechtsprechungsabhängig.',  s: 'Kiener AJP 2018, 1128' },
        { t: 'Im Verhältnismässigkeitstest oft entbehrlich.',     s: 'Hangartner ZBJV 2014' },
      ],
      pos: 'eigene position: deskriptiv ja — normativ nein',
    },
    {
      n: '02', t: 'Die persönliche Freiheit ist kein allgemeines Auffanggrundrecht.',
      sum: 'Anders als die Doktrin lange annahm, fungiert Art. 10 BV nicht als Sammelbecken aller ungenannten Freiheitsbedürfnisse.',
      pro: [
        { t: 'BGer hat 2010 dieser Lesart explizit widersprochen.', s: 'BGE 137 I 16 E. 3.2 in fine' },
        { t: 'Konturlosigkeit gefährdet Schutzwirkung.', s: 'BSK BV-10 N 22' },
      ],
      con: [
        { t: 'Subsidiarität bei Spezialgrundrechten als Auffangwirkung.', s: 'Tschannen § 47 N 9' },
      ],
      pos: 'eigene position: zustimmend — aber präzisierungsbedürftig',
    },
    {
      n: '03', t: 'Der Schutzbereich wandelt sich mit gesellschaftlichen Praktiken.',
      sum: 'Was als „elementare Persönlichkeitsentfaltung" gilt, ist nicht statisch — siehe Datenschutz, körperliche Autonomie.',
      pro: [
        { t: 'BGE 142 I 195 erweitert auf digitale Persönlichkeit.', s: 'BGE 142 I 195 E. 4.1' },
        { t: 'Lehre folgt zunehmend einem dynamischen Schutzbereich.', s: 'Hertig Randall N 28' },
      ],
      con: [
        { t: 'Gefahr der Beliebigkeit — wo zieht man die Grenze?', s: 'Kiener AJP 2018, 1130' },
      ],
      pos: 'eigene position: dynamisch, aber prozedural diszipliniert',
    },
    {
      n: '04', t: 'Die Verhältnismässigkeitsprüfung leistet, was die Kerngehaltstheorie verspricht.',
      sum: 'Eingriffe werden ohnehin nach Art. 36 BV geprüft — die Kerngehaltskontrolle ist meist redundant.',
      pro: [
        { t: 'Erforderlichkeit + Zumutbarkeit deckt Kernbereich faktisch ab.', s: 'Hangartner ZBJV 2014, 433' },
      ],
      con: [
        { t: 'Verhältnismässigkeit ist abwägbar — Kerngehalt nicht.', s: 'Müller/Schefer S. 144' },
        { t: 'Gefahr der Aushöhlung absoluter Schranken.', s: 'BGE 130 I 369 E. 7.3' },
      ],
      pos: 'eigene position: skeptisch — aber argument verdient diskussion',
    },
  ];

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '1fr', overflow: 'hidden' }}>
      <div className="panel" style={{ overflow: 'auto' }}>
        <div className="panel-head">
          <span className="title">Thesen-Board</span>
          <div className="row-flex" style={{ gap: 8 }}>
            <span className="chip on">Alle</span>
            <span className="chip">Strittig</span>
            <span className="chip">Eigenposition</span>
            <button className="btn-ghost-glass"><Icon name="plus" size={12} /> These</button>
          </div>
        </div>

        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {theses.map(th => (
              <div key={th.n} className="thesis-card" style={{ '--mc': board.color, padding: 16 }}>
                <div className="th-head">
                  <span className="th-num">These {th.n}</span>
                  <span className="t-mono-sm">{th.pos}</span>
                </div>
                <div className="th-title">{th.t}</div>
                <div className="th-body">{th.sum}</div>

                <div className="pro-con">
                  <div className="pc-col">
                    <div className="pc-h pro">▸ Belege</div>
                    {th.pro.map((p, i) => (
                      <div key={i} className="pc-item">{p.t}<span className="src">— {p.s}</span></div>
                    ))}
                  </div>
                  <div className="pc-col">
                    <div className="pc-h con">▸ Gegenargumente</div>
                    {th.con.map((p, i) => (
                      <div key={i} className="pc-item">{p.t}<span className="src">— {p.s}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW · ZITATE (thematisch geclustert)
   ============================================================ */
function ViewZitate({ board }) {
  const clusters = [
    {
      n: '01', t: 'Auffangfunktion und ihre Grenzen', c: 4,
      quotes: [
        { q: 'Sie schützt insbesondere die körperliche und psychische Integrität, die Bewegungsfreiheit sowie alle Freiheiten, die elementare Erscheinungen der Persönlichkeitsentfaltung ausmachen.', src: 'BGE 137 I 16 E. 3.2', tag: 'leitsatz', col: 'var(--accent-blue)' },
        { q: 'Demgegenüber bildet die persönliche Freiheit kein allgemeines Auffanggrundrecht, sondern schützt nur jene elementaren Erscheinungen…', src: 'BGE 137 I 16 E. 3.2 in fine', tag: 'abgrenzung', col: 'var(--accent-blue)' },
        { q: 'Art. 10 Abs. 2 BV operiert als Auffangtatbestand jener Freiheiten, die in der konkreten Lebensgestaltung verankert sind, ohne in spezifischen Grundrechten erfasst zu werden.', src: 'Müller/Schefer, Grundrechte, S. 138', tag: 'lehre', col: 'var(--accent-ink)' },
      ],
    },
    {
      n: '02', t: 'Kritik an der Kerngehaltstheorie', c: 3,
      quotes: [
        { q: 'Die Kerngehaltstheorie ist ein dogmatischer Mythos: sie verspricht Schranken, ohne ihre Konturen je preisgeben zu müssen.', src: 'Kiener, AJP 2018, 1128', tag: 'kritik', col: 'var(--accent-red)' },
        { q: 'Begrifflich notwendig, dogmatisch unscharf — eine Schutzanker, der den Anker nicht zeigt.', src: 'Müller/Schefer, S. 144', tag: 'kritik · moderat', col: 'var(--accent-ink)' },
      ],
    },
    {
      n: '03', t: 'Verhältnismässigkeit als Alternative', c: 2,
      quotes: [
        { q: 'Erforderlichkeit und Zumutbarkeit leisten in der Praxis, was die Kerngehaltsdoktrin verspricht — nur ohne deren absoluten Anspruch.', src: 'Hangartner, ZBJV 2014, 433', tag: 'gegenposition', col: 'var(--accent-green)' },
      ],
    },
  ];

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '260px 1fr' }}>
      <div className="panel">
        <div className="panel-head">
          <span className="title">Themen-Cluster</span>
        </div>
        <div className="sidelist">
          {clusters.map((cl, i) => (
            <div key={cl.n} className={`it ${i === 0 ? 'on' : ''}`} style={{ '--mc': board.color, padding: '8px 10px' }}>
              <span className="c"></span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span>{cl.t}</span>
                <span className="t-mono-sm">cluster {cl.n} · {cl.c} zitate</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: '10px 0' }}></div>
        <div className="t-mono-sm" style={{ marginBottom: 8 }}>Tags</div>
        <div className="row-flex" style={{ gap: 4, flexWrap: 'wrap' }}>
          {['leitsatz', 'kritik', 'abgrenzung', 'gegenposition', 'lehre'].map(t => (
            <span key={t} className="chip" style={{ height: 22, fontSize: 9.5 }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }}>
            <Icon name="plus" size={12} /> Zitat erfassen
          </button>
        </div>
      </div>

      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head">
          <span className="title">Zitatsammlung</span>
          <div className="row-flex" style={{ gap: 6 }}>
            <span className="chip on">Cluster</span>
            <span className="chip">Quelle</span>
            <span className="chip">Datum</span>
            <span className="chip">Verwendung</span>
          </div>
        </div>
        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          {clusters.map(cl => (
            <div key={cl.n}>
              <div className="cluster-h">
                <span className="cl-n">cluster {cl.n}</span>
                <span className="cl-t">{cl.t}</span>
                <span className="cl-c">{cl.c} zitate</span>
              </div>
              <div className="col" style={{ gap: 10, marginBottom: 6 }}>
                {cl.quotes.map((q, i) => (
                  <div key={i} className="quote-card" style={{ '--mc': q.col }}>
                    <div className="q-text">{q.q}</div>
                    <div className="q-foot">
                      <span className="q-src">{q.src}</span>
                      <div className="q-tags">
                        <span className="chip" style={{ height: 22, fontSize: 9.5 }}>{q.tag}</span>
                        <button className="btn-ghost-glass" style={{ height: 24, fontSize: 10 }}><Icon name="plus" size={11} /> in text</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Board04 = Board04;
