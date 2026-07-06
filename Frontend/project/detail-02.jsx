/* Board 02 — Quellen & Literatur (deep: filters · library · inspector) */
const { useState: useS02, useRef: useRef02, useEffect: useEff02 } = React;

/* ---- Reusable Obsidian-style tag editor ---- */
function TagRow({ tags, onChange, compact }) {
  const [adding, setAdding] = useS02(false);
  const [val, setVal] = useS02('');
  const wrapRef = useRef02(null);
  const suggest = window.TAG_SUGGEST.filter(t => !tags.includes(t) && t.includes(val.toLowerCase()));

  useEff02(() => {
    if (!adding) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setAdding(false); setVal(''); } };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [adding]);

  const add = (t) => {
    const clean = t.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) onChange([...tags, clean]);
    setVal(''); setAdding(false);
  };
  const remove = (e, t) => { e.stopPropagation(); onChange(tags.filter(x => x !== t)); };

  return (
    <div className="row-flex" style={{ gap: 5, flexWrap: 'wrap', alignItems: 'center', position: 'relative' }} ref={wrapRef}>
      {tags.map(t => (
        <span key={t} className="tag" style={{ '--tc': window.tagColor(t) }} onClick={e => e.stopPropagation()}>
          <span className="hsh">#</span>{t}
          <span className="rm" onClick={(e) => remove(e, t)}><Icon name="close" size={10} /></span>
        </span>
      ))}
      {adding ? (
        <>
          <input
            className="tag-input" autoFocus value={val}
            onClick={e => e.stopPropagation()}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(val); if (e.key === 'Escape') { setAdding(false); setVal(''); } }}
            placeholder="tag…"
          />
          {(suggest.length > 0 || val) && (
            <div className="tag-pop" style={{ top: 26, left: 0 }} onClick={e => e.stopPropagation()}>
              {suggest.slice(0, 6).map(s => (
                <div key={s} className="to" onClick={() => add(s)}>
                  <span className="sw" style={{ background: window.tagColor(s) }}></span>#{s}
                </div>
              ))}
              {val && !window.TAG_SUGGEST.includes(val.toLowerCase()) && (
                <div className="to new" onClick={() => add(val)}>＋ „{val}" erstellen</div>
              )}
            </div>
          )}
        </>
      ) : (
        <span className="tag-add" onClick={(e) => { e.stopPropagation(); setAdding(true); }}>
          <Icon name="tag" size={11} /> {compact ? '' : 'Tag'}
        </span>
      )}
    </div>
  );
}

function Board02({ board, project, onBack }) {
  const tabs = [
    { id: 'bge',   l: 'BGE',         n: 14, icon: 'scales' },
    { id: 'lit',   l: 'Literatur',   n: 23, icon: 'book' },
    { id: 'ges',   l: 'Gesetz',      n: 6,  icon: 'doc' },
    { id: 'mat',   l: 'Materialien', n: 3,  icon: 'folder' },
    { id: 'web',   l: 'Online',      n: 1,  icon: 'globe' },
  ];

  const bge0 = [
    { id: 'b1', kurz: 'BGE 137 I 16',   titel: 'X. gegen Verwaltungsgericht Zürich',     jahr: '2010', topic: 'Persönliche Freiheit · Kerngehalt',     erw: 'E. 3.2', star: true,  used: ['II.1', 'II.2', 'III.1'], tags: ['leiturteil', 'kerngehalt'] },
    { id: 'b2', kurz: 'BGE 134 I 209',  titel: 'A. und B. gegen Regierungsrat Bern',     jahr: '2008', topic: 'Eingriffsschwere · Verhältnismässigkeit', erw: 'E. 2.3.4', used: ['III.1'], tags: ['verhältnismässigkeit'] },
    { id: 'b3', kurz: 'BGE 130 I 369',  titel: 'Y. gegen Kantonspolizei',                jahr: '2004', topic: 'Körperliche Integrität',                erw: 'E. 7.3', star: true, used: ['II.1'], tags: ['kerngehalt'] },
    { id: 'b4', kurz: 'BGE 127 I 6',    titel: 'M. gegen Erziehungsdirektion',           jahr: '2001', topic: 'Selbstbestimmungsrecht',                erw: 'E. 5b', tags: [] },
    { id: 'b5', kurz: 'BGE 124 I 80',   titel: 'F. gegen Stadt Zürich',                  jahr: '1998', topic: 'Persönlichkeitsschutz',                 erw: 'E. 2c', tags: ['abgrenzung'] },
    { id: 'b6', kurz: 'BGE 119 IV 25',  titel: 'Z.',                                     jahr: '1993', topic: 'Notwehr',                                erw: 'E. 1a', tags: ['ungelesen'] },
    { id: 'b7', kurz: 'BGE 114 Ia 286', titel: 'X. gegen Strafgericht Basel-Stadt',      jahr: '1988', topic: 'Verfahrensgarantien',                   erw: 'E. 3', tags: [] },
    { id: 'b8', kurz: 'BGE 142 I 195',  titel: 'P. gegen Departement EJPD',              jahr: '2016', topic: 'Eingriffe in Persönlichkeitsrechte',    erw: 'E. 4.1', used: ['II.1', 'III.2'], tags: ['leiturteil', 'abgrenzung'] },
  ];

  const [tab, setTab] = useS02('bge');
  const [selId, setSelId] = useS02('b1');
  const [citeTab, setCiteTab] = useS02('fn');
  const [entries, setEntries] = useS02(bge0);
  const [tagFilter, setTagFilter] = useS02(null);
  const bge = entries;
  const setTags = (id, tags) => setEntries(es => es.map(e => e.id === id ? { ...e, tags } : e));
  const visible = tagFilter ? bge.filter(e => (e.tags || []).includes(tagFilter)) : bge;
  const sel = bge.find(b => b.id === selId) || bge[0];

  /* live tag counts for the filter rail */
  const tagCounts = {};
  bge.forEach(e => (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const allTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  return (
    <div className="detail view-in" data-screen-label="03 Board · Quellen" style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} onBack={onBack} right={
        <>
          <button className="btn-ghost-glass"><Icon name="filter" size={13} /> Stil: Forstmoser</button>
          <button className="btn-ghost-glass"><Icon name="download" size={13} /> Verzeichnisse</button>
          <button className="btn-primary-dark" style={{ background: board.color, borderColor: board.color }}>
            <Icon name="plus" size={14} /> Quelle erfassen
          </button>
        </>
      }/>

      <div className="detail-body lib-body">
        {/* === FILTERS === */}
        <div className="panel">
          <div className="panel-head">
            <span className="title">Bibliothek</span>
          </div>

          <div className="filter-group">
            <div className="fh">Typ</div>
            {tabs.map(t => (
              <div key={t.id} className={`filter-row ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                <span className="ti"><Icon name={t.icon} size={14} /></span>
                <span>{t.l}</span>
                <span className="ix">{t.n}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: '10px 0' }}></div>

          <div className="filter-group">
            <div className="fh">Verwendung</div>
            {[
              { l: 'Im Text zitiert', n: 31, on: true },
              { l: 'In Notizen',      n: 22 },
              { l: 'Ungelesen',       n: 8 },
              { l: 'Mit Annotation',  n: 14 },
            ].map((r, i) => (
              <div key={i} className={`filter-row ${r.on ? 'on' : ''}`}>
                <span style={{ width: 8 }}></span>
                <span>{r.l}</span>
                <span className="ix">{r.n}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: '10px 0' }}></div>

          <div className="filter-group">
            <div className="fh">Tags</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '4px 6px' }}>
              {allTags.length === 0 && <span className="t-mono-sm" style={{ opacity: 0.6 }}>noch keine Tags</span>}
              {allTags.map((t) => (
                <span
                  key={t}
                  className="tag"
                  style={{ '--tc': window.tagColor(t), opacity: tagFilter && tagFilter !== t ? 0.4 : 1, outline: tagFilter === t ? '1.5px solid currentColor' : 'none' }}
                  onClick={() => setTagFilter(tagFilter === t ? null : t)}
                >
                  <span className="hsh">#</span>{t} <span style={{ opacity: 0.5, marginLeft: 2 }}>{tagCounts[t]}</span>
                </span>
              ))}
            </div>
            {tagFilter && (
              <div className="t-mono-sm" style={{ padding: '4px 6px', cursor: 'pointer', color: board.color }} onClick={() => setTagFilter(null)}>
                ✕ Filter „#{tagFilter}" zurücksetzen
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 12 }}>
            <div className="callout" style={{ '--mc': 'var(--accent-amber)' }}>
              <div className="ch">⊕ Duplikat erkannt</div>
              <span style={{ color: 'var(--ink-2)' }}>
                <span className="t-italic">BGE 137 I 16</span> wurde auch unter <span className="t-italic">PB 2010-37</span> erfasst — zusammenführen?
              </span>
            </div>
          </div>
        </div>

        {/* === LIBRARY LIST === */}
        <div className="panel">
          <div className="panel-head">
            <span className="row-flex" style={{ gap: 14 }}>
              <span className="title">{tabs.find(t => t.id === tab)?.l}</span>
              <span className="t-mono-sm">{visible.length} von {bge.length}{tagFilter ? ` · #${tagFilter}` : ''}</span>
            </span>
            <span className="chip"><Icon name="sort" size={11} /> Datum</span>
          </div>

          <div className="search" style={{ marginBottom: 14 }}>
            <Icon name="search" size={14} />
            <input placeholder="Quellen durchsuchen …" />
            <span className="kbd">⌘K</span>
          </div>

          <div className="tlist scroll" style={{ overflow: 'auto', flex: 1 }}>
            {visible.map((r) => {
              const links = (r.used || []).length;
              return (
              <div
                key={r.id}
                className={`src-row ${selId === r.id ? 'sel' : ''}`}
                style={{ '--mc': board.color }}
                onClick={() => setSelId(r.id)}
              >
                <span className="si"><Icon name={tabs.find(t => t.id === tab)?.icon || 'doc'} size={15} /></span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <div className="row-flex" style={{ gap: 10, minWidth: 0 }}>
                    <span className="sr-kurz">{r.kurz}</span>
                    <span className="sr-titel">{r.titel}</span>
                    <span style={{ flex: 1 }}></span>
                    <span className="t-mono-num" style={{ flexShrink: 0 }}>{r.jahr}</span>
                    <span style={{ color: r.star ? board.color : 'var(--ink-5)', flexShrink: 0, display: 'flex' }}>
                      <Icon name="star" size={13} stroke={r.star ? 2 : 1.4} />
                    </span>
                  </div>
                  <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span className="t-mono-sm">{r.topic} · {r.erw}</span>
                    {links > 0 && (
                      <span className="backlink-pill" title={`${links} Backlinks`}>
                        <Icon name="link" size={10} /> {links}
                      </span>
                    )}
                    <TagRow tags={r.tags || []} onChange={(t) => setTags(r.id, t)} compact />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* === INSPECTOR === */}
        <div className="col scroll" style={{ gap: 16, minHeight: 0, overflowY: 'auto', paddingRight: 2 }}>
          <div className="panel">
            <div className="panel-head">
              <span className="title">{sel.kurz}</span>
            </div>
            <div className="kv">
              <span className="k">Parteien</span><span className="v">{sel.titel}</span>
              <span className="k">Jahr</span><span className="v t-mono-num">{sel.jahr}</span>
              <span className="k">Erwägung</span><span className="v t-mono-num">{sel.erw}</span>
              <span className="k">Thema</span><span className="v">{sel.topic}</span>
              <span className="k">Eingelesen</span><span className="v t-mono-num">12. Mär 2026</span>
            </div>
            <div className="divider" style={{ margin: '12px 0 10px' }}></div>
            <div className="row-flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="t-mono-sm">Tags</span>
            </div>
            <TagRow tags={sel.tags || []} onChange={(t) => setTags(sel.id, t)} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="title">PDF · Auszug</span>
              <span className="row-flex" style={{ gap: 6 }}>
                <button className="btn-ghost-glass" style={{ height: 26 }}><Icon name="arrow-up-right" size={11} /></button>
              </span>
            </div>
            <div className="pdf-preview">
              <div className="pdf-head">
                <span>Bundesgericht · I. öffentlich-rechtl. Abt.</span>
                <span>1C_257/2009</span>
              </div>
              <div className="pdf-title">Urteil vom 22. März 2010</div>
              <div className="pdf-erw">3.2  Persönliche Freiheit (Art. 10 Abs. 2 BV)</div>
              <p>
                Die persönliche Freiheit gemäss <i>Art. 10 Abs. 2 BV</i> umfasst alle Freiheiten, die elementare
                Erscheinungen der Persönlichkeitsentfaltung darstellen.
                <mark className="an">Sie schützt insbesondere die körperliche und psychische Integrität, die
                Bewegungsfreiheit sowie alle Freiheiten, die elementare Erscheinungen der Persönlichkeitsentfaltung
                ausmachen</mark> (BGE 134 I 209 E. 2.3.1; 133 I 110 E. 5.2).
              </p>
              <p>
                <mark className="an b">Demgegenüber bildet die persönliche Freiheit kein allgemeines
                Auffanggrundrecht</mark>, sondern schützt nur jene elementaren Erscheinungen der
                Persönlichkeitsentfaltung, die nicht durch besondere Grundrechte garantiert sind…
              </p>
            </div>
          </div>

          <div className="panel" style={{ flexShrink: 0 }}>
            <div className="panel-head">
              <span className="title">Forstmoser-Zitat</span>
              <div className="cite-tabs">
                {[
                  { id: 'fn',  l: 'Fussnote' },
                  { id: 'kz',  l: 'Kurzzitat' },
                  { id: 'lit', l: 'Verzeichnis' },
                ].map(t => (
                  <span key={t.id} className={`chip ${citeTab === t.id ? 'on' : ''}`}
                        style={{ height: 22, fontSize: 10 }}
                        onClick={() => setCiteTab(t.id)}>{t.l}</span>
                ))}
              </div>
            </div>

            <div className="t-body" style={{ background: 'var(--fill-2)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line-1)', fontSize: 14.5, lineHeight: 1.5 }}>
              {citeTab === 'fn' && (
                <>
                  <sup style={{ marginRight: 4, fontFamily: 'var(--mono)', fontSize: 10 }}>12</sup>
                  {sel.kurz} {sel.erw} <span className="t-italic">in fine</span>; zur Auffangfunktion vgl. <span style={{ fontVariant: 'small-caps' }}>Müller/Schefer</span>, Grundrechte in der Schweiz, 4. Aufl., Bern 2008, S. 138 ff., insb. S. 142.
                </>
              )}
              {citeTab === 'kz' && (
                <>{sel.kurz} {sel.erw}.</>
              )}
              {citeTab === 'lit' && (
                <>
                  {sel.kurz}, Urteil des Bundesgerichts vom 22. März 2010 ({sel.titel}), {sel.erw}.
                </>
              )}
            </div>

            <div className="row-flex" style={{ marginTop: 10, justifyContent: 'space-between' }}>
              <span className="t-mono-sm">Forstmoser/Ogorek/Vogt · 12. Aufl.</span>
              <div className="row-flex" style={{ gap: 6 }}>
                <button className="btn-ghost-glass" style={{ height: 28 }}><Icon name="link" size={11} /> kopieren</button>
                <button className="btn-ghost-glass" style={{ height: 28, background: `${board.color}18`, borderColor: `${board.color}40`, color: board.color }}>
                  <Icon name="plus" size={11} /> in Text einfügen
                </button>
              </div>
            </div>
          </div>

          <div className="panel" style={{ flexShrink: 0 }}>
            <div className="panel-head">
              <span className="title">Annotationen & Backlinks</span>
            </div>
            <div className="col" style={{ gap: 8 }}>
                <div className="annot" style={{ '--mc': 'var(--accent)' }}>
                  <div className="a-meta">
                    <span>S. 18 · E. 3.2 · markiert 18. Mär</span>
                    <span>↗ kerngehalt</span>
                  </div>
                  <span className="a-quote">„Schutz aller Freiheiten, die elementare Erscheinungen der Persönlichkeitsentfaltung ausmachen."</span>
                </div>
                <div className="annot" style={{ '--mc': 'var(--accent-blue)' }}>
                  <div className="a-meta">
                    <span>S. 19 · E. 3.2 · markiert 18. Mär</span>
                    <span>↗ auffanggrundrecht</span>
                  </div>
                  <span className="a-quote">„Demgegenüber bildet die persönliche Freiheit <i>kein allgemeines Auffanggrundrecht</i>…"</span>
                  <div className="t-mono-sm" style={{ marginTop: 6, color: 'var(--ink-3)' }}>
                    notiz · <i>„Wichtige Abgrenzung. In II.1 zitieren — Gegenpol zu Müller/Schefer."</i>
                  </div>
                </div>

                <div className="t-mono-sm" style={{ marginTop: 10 }}>Verwendet in</div>
                <div className="col" style={{ gap: 4 }}>
                  {(sel.used || ['II.1']).map(u => (
                    <div key={u} className="backlink" style={{ '--mc': board.color }}>
                      <span className="ref">{u}</span>
                      <span>
                        {u === 'II.1' && 'Persönliche Freiheit als Grundrecht'}
                        {u === 'II.2' && 'Kerngehalt und Kerngehaltstheorie'}
                        {u === 'III.1' && 'BGE 137 I 16 — Leiturteil'}
                        {u === 'III.2' && 'Aktuelle Rechtsprechung'}
                      </span>
                      <Icon name="arrow-up-right" size={12} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
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

window.Board02 = Board02;
