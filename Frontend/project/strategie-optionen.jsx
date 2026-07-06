/* Strategy Hub — Modul 04: Optionen & Entscheidung
   Optionskarten · gewichtete Entscheidungsmatrix · Pre-Mortem · taktische Züge */
const { useState: useOp } = React;

const OP_PILL = { pilot: 'warm', laufend: 'ok', 'geprüft': '', 'zurückgestellt': 'dim' };
const ZUG_NEXT = { offen: 'laufend', laufend: 'erledigt', erledigt: 'offen' };

function Dots5({ v, ac }) {
  return <span className={`dots5 ${ac ? 'ac' : ''}`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= v ? 'on' : ''}></i>)}</span>;
}

function opScore(o, kriterien) {
  let sum = 0, wsum = 0;
  kriterien.forEach((k) => {
    const raw = o[k.id] || 3;
    sum += (k.invers ? 6 - raw : raw) * k.gewicht;
    wsum += k.gewicht;
  });
  return wsum ? Math.round((sum / wsum) * 20) : 0;
}

function StOptionen({ onOpen }) {
  const db = useStDb();
  const [sel, setSel] = useOp(db.optionen[0] ? db.optionen[0].id : null);
  const [pg, setPg] = useOp(''); const [pc, setPc] = useOp('');
  const [nop, setNop] = useOp(''); const [nthese, setNthese] = useOp('');
  React.useEffect(() => { if (!sel && db.optionen[0]) setSel(db.optionen[0].id); }, [db.optionen.length]);
  const o = db.optionen.find((x) => x.id === sel) || null;
  const krit = db.matrix.kriterien;
  const ranked = [...db.optionen].map((x) => ({ o: x, score: opScore(x, krit) })).sort((a, b) => b.score - a.score);

  const addPm = () => {
    if (!o) return;
    const g = pg.trim(); if (!g) return;
    stUpdate((d) => d.optionen.find((x) => x.id === o.id).premortem.push({ id: stId('pm'), grund: g, gegen: pc.trim() || '— Gegenmassnahme offen —' }));
    setPg(''); setPc('');
  };
  const addOption = () => {
    const titel = nop.trim(); if (!titel) return;
    const id = stId('op');
    stUpdate((d) => d.optionen.push({
      id, titel, these: nthese.trim(),
      reversibilitaet: 3, ressourcen: 3, optionswert: 3, passung: 3, horizont: '', status: 'geprüft',
      zuege: [], premortem: [], links: [],
    }));
    setSel(id);
    setNop(''); setNthese('');
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Optionen">
      <div className="detail-top">
        <div className="detail-head">
          <h1>Optionen &amp; Entscheid<span className="ac">.</span></h1>
        </div>
        <button className="btn-ghost-glass" onClick={() => onOpen && onOpen('s-journal')}><Icon name="archive" size={13} /> Entscheid protokollieren</button>
      </div>

      <div className="op-body">
        {/* Optionskarten */}
        <div className="scroll" style={{ overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="st-form">
            <input className="st-input" style={{ flex: 1 }} placeholder="Neue Option …" value={nop} onChange={(e) => setNop(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} />
            <input className="st-input" style={{ flex: 2 }} placeholder="These (kurz) …" value={nthese} onChange={(e) => setNthese(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} />
            <button className="btn-primary-dark" onClick={addOption}><Icon name="plus" size={13} /></button>
          </div>
          {db.optionen.length === 0 && <p className="st-empty">Noch keine Optionen erfasst.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {db.optionen.map((op) => (
            <div key={op.id} className={`op-card ${sel === op.id ? 'on' : ''}`} onClick={() => setSel(op.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span className="oc-t">{op.titel}</span>
                <span className={`st-pill ${OP_PILL[op.status] || ''}`}>{op.status}</span>
              </div>
              <div className="oc-these">{op.these}</div>
              <div className="op-scores">
                <div className="op-score"><span className="sl">Passung</span><Dots5 v={op.passung} ac /></div>
                <div className="op-score"><span className="sl">Optionswert</span><Dots5 v={op.optionswert} ac /></div>
                <div className="op-score"><span className="sl">Reversibilität</span><Dots5 v={op.reversibilitaet} /></div>
                <div className="op-score"><span className="sl">Ressourcen</span><Dots5 v={op.ressourcen} /></div>
              </div>
              <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 3 }}>Taktische Züge · Horizont {op.horizont}</div>
                {op.zuege.map((z) => (
                  <div key={z.id} className="zug-row">
                    <span className={`zug-dot ${z.status}`} title="Status wechseln"
                      onClick={(e) => { e.stopPropagation(); stUpdate((d) => { const t = d.optionen.find((x) => x.id === op.id).zuege.find((y) => y.id === z.id); t.status = ZUG_NEXT[t.status]; }); }}>
                      {z.status === 'erledigt' && <Icon name="check" size={9} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>{z.titel}</span>
                    <span className="zs">{z.status}</span>
                  </div>
                ))}
              </div>
              {op.links.length > 0 && <div className="st-links">{op.links.slice(0, 3).map((id) => <StChip key={id} id={id} onOpen={onOpen} />)}</div>}
            </div>
          ))}
          </div>
        </div>

        {/* Matrix + Pre-Mortem */}
        <div className="col" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'auto' }}>
          <div className="panel" style={{ flexShrink: 0 }}>
            <div className="panel-head"><span className="title">Entscheidungsmatrix</span></div>
            {krit.map((k) => (
              <div key={k.id} className="mx-row">
                <div>
                  <div className="ml">{k.label}{k.invers && <span style={{ color: 'var(--ink-5)' }}> (invers)</span>}</div>
                  <input type="range" min="0" max="50" value={k.gewicht}
                    onChange={(e) => stUpdate((d) => { d.matrix.kriterien.find((x) => x.id === k.id).gewicht = Number(e.target.value); })} />
                </div>
                <span className="mv">{k.gewicht} %</span>
              </div>
            ))}
            <div style={{ marginTop: 12, borderTop: '1px dashed var(--line-2)', paddingTop: 6 }}>
              {ranked.map((r, i) => (
                <div key={r.o.id} className={`mx-res ${i === 0 ? 'top' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSel(r.o.id)}>
                  <span className="rk">{i + 1}.</span>
                  <span className="rt">{r.o.titel}</span>
                  <span className="rb"><i style={{ transform: `scaleX(${r.score / 100})` }}></i></span>
                  <span className="rv">{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ flexShrink: 0 }}>
            <div className="panel-head"><span className="title">Pre-Mortem</span></div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-3)', margin: '0 0 10px', lineHeight: 1.45 }}>
              «Es ist 2029, und diese Strategie ist gescheitert. Warum?»
            </p>
            {o ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {o.premortem.map((p) => (
                    <div key={p.id} className="pm-row">
                      <span className="pm-g">{p.grund}</span>
                      <span className="pm-c"><b>Gegenzug</b>{p.gegen}</span>
                    </div>
                  ))}
                </div>
                <div className="st-form" style={{ marginTop: 12, flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                  <input className="st-input" placeholder="Scheiterungsgrund …" value={pg} onChange={(e) => setPg(e.target.value)} />
                  <div className="st-form">
                    <input className="st-input" style={{ flex: 1 }} placeholder="Gegenmassnahme" value={pc} onChange={(e) => setPc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPm()} />
                    <button className="btn-primary-dark" onClick={addPm}><Icon name="plus" size={13} /></button>
                  </div>
                </div>
              </>
            ) : (
              <p className="st-empty">Zuerst links eine Option erfassen.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.StOptionen = StOptionen;
