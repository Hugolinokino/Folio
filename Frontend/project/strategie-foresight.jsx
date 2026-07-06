/* Strategy Hub — Modul 02: Foresight
   Trend-Radar (Unsicherheit × Impact) · Weak Signals · Annahmen-Log · Wirkungslogik */
const { useState: useFs } = React;

const AN_STATI = ['offen', 'bestätigt', 'kritisch', 'falsifiziert'];
const anPill = (s) => s === 'kritisch' ? 'hot' : s === 'falsifiziert' ? 'warm' : s === 'bestätigt' ? 'ok' : '';

function FsRadar({ faktoren, sel, onSel }) {
  const W = 640, H = 470, m = { l: 46, r: 20, t: 26, b: 40 };
  const x = (u) => m.l + (u / 100) * (W - m.l - m.r);
  const y = (i) => H - m.b - (i / 100) * (H - m.t - m.b);
  const lbl = { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', fill: 'var(--ink-5)' };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
      <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} rx="12" style={{ fill: 'var(--fill-1)', stroke: 'var(--line-1)' }} />
      <line x1={x(50)} y1={m.t + 8} x2={x(50)} y2={H - m.b - 8} style={{ stroke: 'var(--line-2)' }} strokeDasharray="3 5" />
      <line x1={m.l + 8} y1={y(50)} x2={W - m.r - 8} y2={y(50)} style={{ stroke: 'var(--line-2)' }} strokeDasharray="3 5" />
      <text x={x(25)} y={m.t + 18} textAnchor="middle" style={lbl}>Handeln</text>
      <text x={x(75)} y={m.t + 18} textAnchor="middle" style={lbl}>Vorbereiten</text>
      <text x={x(25)} y={H - m.b - 10} textAnchor="middle" style={lbl}>Einplanen</text>
      <text x={x(75)} y={H - m.b - 10} textAnchor="middle" style={lbl}>Beobachten</text>
      <text x={(m.l + W - m.r) / 2} y={H - 10} textAnchor="middle" style={{ ...lbl, fill: 'var(--ink-4)' }}>Unsicherheit →</text>
      <text x={14} y={(m.t + H - m.b) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(m.t + H - m.b) / 2})`} style={{ ...lbl, fill: 'var(--ink-4)' }}>Impact →</text>
      {faktoren.map((f) => {
        const on = sel === f.id;
        const r = 5 + f.relevanz * 2 + (on ? 2 : 0);
        return (
          <g key={f.id} className="fs-dot" onClick={() => onSel(f.id)}>
            <circle cx={x(f.unsicherheit)} cy={y(f.impact)} r={r}
              style={f.art === 'Signal'
                ? { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 1.5 }
                : f.art === 'Trend'
                ? { fill: 'var(--accent)', stroke: on ? 'var(--ink)' : 'transparent', strokeWidth: 1.5 }
                : { fill: 'var(--ink-3)', stroke: on ? 'var(--ink)' : 'transparent', strokeWidth: 1.5 }} />
            <text x={x(f.unsicherheit)} y={y(f.impact) - r - 6} textAnchor="middle"
              style={{ fontFamily: 'var(--sans)', fontSize: 10.5, fill: on ? 'var(--ink)' : 'var(--ink-3)', fontWeight: on ? 600 : 400 }}>
              {f.titel.length > 34 ? f.titel.slice(0, 33) + '…' : f.titel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StForesight({ onOpen }) {
  const db = useStDb();
  const [tab, setTab] = useFs('radar');
  const [sel, setSel] = useFs(db.faktoren[0] ? db.faktoren[0].id : null);
  React.useEffect(() => { if (!sel && db.faktoren[0]) setSel(db.faktoren[0].id); }, [db.faktoren.length]);
  const [nt, setNt] = useFs(''); const [nq, setNq] = useFs(''); const [nr, setNr] = useFs(2);
  const [at, setAt] = useFs(''); const [af, setAf] = useFs(''); const [ad, setAd] = useFs('');
  const f = db.faktoren.find((x) => x.id === sel) || null;
  const back = f ? stBacklinks(f.id) : [];

  const addSignal = () => {
    const t = nt.trim(); if (!t) return;
    stUpdate((d) => d.faktoren.push({ id: stId('fk'), titel: t, art: 'Signal', pestel: 'T', unsicherheit: 70, impact: 50, horizont: 'unklar', quelle: nq.trim() || '—', datum: db.meta.heuteLabel, relevanz: Number(nr), note: '', links: [] }));
    setNt(''); setNq('');
  };
  const addAnnahme = () => {
    const t = at.trim(); if (!t) return;
    stUpdate((d) => d.annahmen.push({ id: stId('an'), text: t, falsifikation: af.trim() || '— noch zu definieren —', pruefdatum: ad.trim() || 'offen', tage: null, status: 'offen', links: [] }));
    setAt(''); setAf(''); setAd('');
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Foresight">
      <div className="detail-top">
        <div className="detail-head">
          <h1>Foresight<span className="ac">.</span></h1>
        </div>
        <div className="tabs">
          {[['radar', 'Trend-Radar'], ['signale', 'Weak Signals'], ['annahmen', 'Annahmen'], ['system', 'Wirkungslogik']].map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'radar' && (
          <div className="fs-wrap">
            <div className="panel fs-radar" style={{ padding: 10 }}>
              <FsRadar faktoren={db.faktoren} sel={sel} onSel={setSel} />
            </div>
            <div className="panel" style={{ overflow: 'auto' }}>
              <div className="panel-head"><span className="title">Faktor</span></div>
              {f ? (
                <div className="ak-detail">
                  <div className="ad-name">{f.titel}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="st-pill warm">{f.art}</span>
                    <span className="st-pill dim">PESTEL {f.pestel}</span>
                    <span className="st-pill dim">Horizont {f.horizont}</span>
                  </div>
                  <div><div className="ad-sec">Bewertung</div><div className="ad-txt">Unsicherheit {f.unsicherheit} / 100 · Impact {f.impact} / 100 · Relevanz {'●'.repeat(f.relevanz)}{'○'.repeat(3 - f.relevanz)}</div></div>
                  <div><div className="ad-sec">Quelle</div><div className="ad-txt">{f.quelle} · erfasst {f.datum}</div></div>
                  {f.note && <div><div className="ad-sec">Einschätzung</div><div className="ad-txt">{f.note}</div></div>}
                  {(f.links.length > 0 || back.length > 0) && (
                    <div><div className="ad-sec">Verknüpft mit</div>
                      <div className="st-links">{[...new Set([...f.links, ...back])].map((id) => <StChip key={id} id={id} onOpen={onOpen} />)}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="st-empty">Noch keine Faktoren erfasst — unter «Weak Signals» eintragen.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'signale' && (
          <div className="panel" style={{ overflow: 'auto' }}>
            <div className="panel-head"><span className="title">Weak-Signal-Sammlung</span></div>
            {db.faktoren.filter((x) => x.art === 'Signal').map((s) => (
              <div key={s.id} className="sig-row">
                <span className="sg-d">{s.datum}</span>
                <span className="sg-t">{s.titel}</span>
                <span className="sg-q">{s.quelle}</span>
                <span className="dots5 ac">{[1, 2, 3].map((i) => <i key={i} className={i <= s.relevanz ? 'on' : ''}></i>)}</span>
                <span className="st-pill dim click" onClick={() => { setSel(s.id); setTab('radar'); }}>Radar</span>
              </div>
            ))}
            <div className="st-form" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-2)' }}>
              <input className="st-input" style={{ flex: 2 }} placeholder="Beobachtung …" value={nt} onChange={(e) => setNt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSignal()} />
              <input className="st-input" style={{ flex: 1 }} placeholder="Quelle" value={nq} onChange={(e) => setNq(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSignal()} />
              <select className="st-select" value={nr} onChange={(e) => setNr(e.target.value)}>
                <option value="1">Relevanz ●</option><option value="2">Relevanz ●●</option><option value="3">Relevanz ●●●</option>
              </select>
              <button className="btn-primary-dark" onClick={addSignal}><Icon name="plus" size={13} /> Erfassen</button>
            </div>
          </div>
        )}

        {tab === 'annahmen' && (
          <div className="panel" style={{ overflow: 'auto' }}>
            <div className="panel-head"><span className="title">Assumption Log</span></div>
            {db.annahmen.map((a) => (
              <div key={a.id} className="an-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="an-t" style={{ flex: 1 }}>{a.text}</span>
                  {a.tage != null && <span className={`countdown ${a.tage <= 100 ? 'warm' : ''}`}>{a.tage} T</span>}
                  <span className={`st-pill click ${anPill(a.status)}`} title="Status wechseln"
                    onClick={() => stUpdate((d) => { const t = d.annahmen.find((x) => x.id === a.id); t.status = AN_STATI[(AN_STATI.indexOf(t.status) + 1) % AN_STATI.length]; })}>{a.status}</span>
                </div>
                <div className="an-f"><b>Falsifikation</b>{a.falsifikation} <span style={{ color: 'var(--ink-5)' }}>· Prüfung {a.pruefdatum}</span></div>
                {a.links.length > 0 && <div className="st-links">{a.links.map((id) => <StChip key={id} id={id} onOpen={onOpen} />)}</div>}
              </div>
            ))}
            <div className="st-form" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-2)', flexWrap: 'wrap' }}>
              <input className="st-input" style={{ flex: '2 1 240px' }} placeholder="Annahme …" value={at} onChange={(e) => setAt(e.target.value)} />
              <input className="st-input" style={{ flex: '2 1 220px' }} placeholder="Woran würden wir merken, dass sie falsch ist?" value={af} onChange={(e) => setAf(e.target.value)} />
              <input className="st-input" style={{ flex: '0 1 120px' }} placeholder="Prüfdatum" value={ad} onChange={(e) => setAd(e.target.value)} />
              <button className="btn-primary-dark" onClick={addAnnahme}><Icon name="plus" size={13} /> Loggen</button>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="panel" style={{ maxWidth: 720 }}>
            <div className="panel-head"><span className="title">Wirkungslogik</span></div>
            {db.loops.map((l) => (
              <div key={l.id} className="loop-row">
                <div className="lo-h">
                  <span className={`lo-typ ${l.typ === 'R' ? 'r' : ''}`}>{l.typ}</span>
                  <span className="lo-t">{l.titel}</span>
                </div>
                <div className="lo-k" style={{ paddingLeft: 28 }}>
                  {l.kette.map((k, i) => <span key={i}>{k}{i < l.kette.length - 1 && <span className="ar">→</span>}</span>)}
                </div>
              </div>
            ))}
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-4)', marginTop: 14, lineHeight: 1.5 }}>
              Das Schwungrad (R) trägt nur, solange die Bremse (B) nicht zuerst greift — Fixpreise dürfen die Marge nicht unter die Investitionsschwelle drücken.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

window.StForesight = StForesight;
