import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { gvId, gvImpact, type BefundSchwere, type Mandat, type VerweisArt } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const VN_ART: Record<VerweisArt, { farbe: string; dash: string }> = {
  Delegation: { farbe: 'var(--accent)', dash: 'none' },
  Verweis: { farbe: 'var(--ink-4)', dash: '5 4' },
  Konkretisierung: { farbe: 'var(--ink-3)', dash: '2 3' },
  Kollision: { farbe: '#c0392b', dash: 'none' },
};
const VN_SCHWERE: Record<BefundSchwere, string> = { hoch: 'hot', mittel: 'warm', tief: 'ok' };

/** Node x-positions are derived, not stored — erlasse are spread evenly among siblings at the same Stufe. */
function layoutPositions(db: Mandat): Record<string, { x: number; y: number }> {
  const W = 900;
  const byStufe = new Map<number, string[]>();
  db.erlasse.forEach((e) => {
    const list = byStufe.get(e.stufe) || [];
    list.push(e.id);
    byStufe.set(e.stufe, list);
  });
  const pos: Record<string, { x: number; y: number }> = {};
  byStufe.forEach((ids, stufe) => {
    ids.forEach((id, i) => {
      pos[id] = { x: ((i + 0.5) / ids.length) * W, y: 70 + (stufe - 1) * 165 };
    });
  });
  return pos;
}

function VnGraph({ db, sel, onSel, filter, impactSet }: { db: Mandat; sel: string | null; onSel: (id: string | null) => void; filter: VerweisArt | null; impactSet: Set<string> | null }) {
  const W = 900, H = 480;
  const pos = layoutPositions(db);
  const edges = db.verweise.filter((v) => !filter || v.art === filter);
  const stufen = [...new Set(db.erlasse.map((e) => e.stufe))].sort();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', minHeight: 420 }}>
      {stufen.map((s) => (
        <g key={s}>
          <line x1="16" x2={W - 16} y1={70 + (s - 1) * 165 + 52} y2={70 + (s - 1) * 165 + 52} stroke="var(--line-1)" strokeDasharray="2 6" />
          <text x="18" y={70 + (s - 1) * 165 - 34} fontSize="9.5" fill="var(--ink-5)" fontFamily="var(--mono)" letterSpacing="1.4">
            STUFE {s}
          </text>
        </g>
      ))}
      {edges.map((v) => {
        const a = pos[v.von], b = pos[v.nach];
        if (!a || !b) return null;
        const meta = VN_ART[v.art];
        const dim = sel && v.von !== sel && v.nach !== sel;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 26;
        return (
          <g key={v.id} opacity={dim ? 0.18 : 1}>
            <path d={`M ${a.x} ${a.y - 16} Q ${mx} ${my} ${b.x} ${b.y + 18}`} fill="none"
              stroke={meta.farbe} strokeWidth={v.art === 'Kollision' ? 2.2 : 1.4} strokeDasharray={meta.dash} />
            <circle cx={b.x} cy={b.y + 18} r="2.6" fill={meta.farbe} />
          </g>
        );
      })}
      {db.erlasse.map((e) => {
        const p = pos[e.id];
        if (!p) return null;
        const on = sel === e.id;
        const imp = impactSet && impactSet.has(e.id);
        return (
          <g key={e.id} transform={`translate(${p.x}, ${p.y})`} style={{ cursor: 'pointer' }} onClick={() => onSel(on ? null : e.id)}>
            <rect x="-52" y="-16" width="104" height="34" rx="9"
              fill={on ? 'var(--accent)' : imp ? 'var(--accent-soft)' : 'var(--glass-bg-2)'}
              stroke={e.status === 'problem' ? '#c0392b' : on ? 'var(--accent)' : 'var(--line-2)'}
              strokeWidth={e.status === 'problem' ? 1.8 : 1} />
            <text textAnchor="middle" y="-1" fontSize="12" fontFamily="var(--mono)" fill={on ? 'var(--on-accent)' : 'var(--ink)'} fontWeight="500">{e.kurz}</text>
            <text textAnchor="middle" y="12" fontSize="8" fontFamily="var(--mono)" letterSpacing="0.6" fill={on ? 'var(--on-accent)' : 'var(--ink-4)'}>
              {e.titel.length > 24 ? `${e.titel.slice(0, 23)}…` : e.titel.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const VW_FORM = { von: '', nach: '', art: 'Verweis' as VerweisArt, label: '' };
const BF_FORM = { typ: '', schwere: 'mittel' as BefundSchwere, fund: '', erlass: '', text: '' };

export function GvNetz({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [tab, setTab] = useState<'graph' | 'check' | 'impact'>('graph');
  const [sel, setSel] = useState<string | null>(null);
  const [filter, setFilter] = useState<VerweisArt | null>(null);
  const [impactId, setImpactId] = useState<string | null>(db.erlasse[0]?.id ?? null);
  const [addingVw, setAddingVw] = useState(false);
  const [vwForm, setVwForm] = useState(VW_FORM);
  const [addingBf, setAddingBf] = useState(false);
  const [bfForm, setBfForm] = useState(BF_FORM);

  const e = sel ? db.erlasse.find((x) => x.id === sel) : null;
  const rein = e ? db.verweise.filter((v) => v.nach === e.id) : [];
  const raus = e ? db.verweise.filter((v) => v.von === e.id) : [];
  const impact = impactId ? gvImpact(db, impactId) : [];
  const impactSet = new Set(impact.map((t) => t.erlass));
  const impactErlass = db.erlasse.find((x) => x.id === impactId);

  const submitVerweis = () => {
    if (!vwForm.von || !vwForm.nach || !vwForm.label.trim()) return;
    update((d) => { d.verweise.push({ id: gvId('vw'), von: vwForm.von, nach: vwForm.nach, art: vwForm.art, label: vwForm.label.trim() }); });
    setVwForm(VW_FORM);
    setAddingVw(false);
  };

  const deleteVerweis = (id: string) => update((d) => { d.verweise = d.verweise.filter((v) => v.id !== id); });

  const submitBefund = () => {
    if (!bfForm.typ.trim() || !bfForm.fund.trim() || !bfForm.erlass) return;
    update((d) => { d.befunde.push({ id: gvId('bf'), typ: bfForm.typ.trim(), schwere: bfForm.schwere, fund: bfForm.fund.trim(), erlass: bfForm.erlass, text: bfForm.text.trim(), status: 'offen' }); });
    setBfForm(BF_FORM);
    setAddingBf(false);
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Verweisnetz">
      <div className="detail-top">
        <div className="detail-head"><h1>Verweisnetz<span className="ac">.</span></h1></div>
        <div className="tabs">
          {([['graph', 'Graph'], ['check', 'Konsistenz-Check'], ['impact', 'Revisions-Impact']] as const).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
        <div className="spacer"></div>
        {tab === 'graph' && <button className="btn-primary-dark" onClick={() => setAddingVw((a) => !a)}><Icon name="plus" size={13} /> Verweis</button>}
        {tab === 'check' && <button className="btn-primary-dark" onClick={() => setAddingBf((a) => !a)}><Icon name="plus" size={13} /> Befund</button>}
      </div>

      {addingVw && tab === 'graph' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <select className="input" style={{ flex: 1 }} value={vwForm.von} onChange={(ev) => setVwForm((f) => ({ ...f, von: ev.target.value }))}>
              <option value="">Von Erlass …</option>
              {db.erlasse.map((x) => <option key={x.id} value={x.id}>{x.kurz}</option>)}
            </select>
            <select className="input" style={{ flex: '0 0 150px' }} value={vwForm.art} onChange={(ev) => setVwForm((f) => ({ ...f, art: ev.target.value as VerweisArt }))}>
              <option value="Delegation">Delegation</option>
              <option value="Verweis">Verweis</option>
              <option value="Konkretisierung">Konkretisierung</option>
              <option value="Kollision">Kollision</option>
            </select>
            <select className="input" style={{ flex: 1 }} value={vwForm.nach} onChange={(ev) => setVwForm((f) => ({ ...f, nach: ev.target.value }))}>
              <option value="">Nach Erlass …</option>
              {db.erlasse.map((x) => <option key={x.id} value={x.id}>{x.kurz}</option>)}
            </select>
            <input className="input" style={{ flex: 2 }} placeholder="Fundstelle (z.B. Art. 4 GsR → Art. 7 FiR)" value={vwForm.label} onChange={(ev) => setVwForm((f) => ({ ...f, label: ev.target.value }))} />
            <button className="btn-primary-dark" onClick={submitVerweis}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingBf && tab === 'check' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Typ (z.B. Normkollision)" value={bfForm.typ} onChange={(ev) => setBfForm((f) => ({ ...f, typ: ev.target.value }))} />
            <select className="input" style={{ flex: '0 0 110px' }} value={bfForm.schwere} onChange={(ev) => setBfForm((f) => ({ ...f, schwere: ev.target.value as BefundSchwere }))}>
              <option value="hoch">hoch</option>
              <option value="mittel">mittel</option>
              <option value="tief">tief</option>
            </select>
            <select className="input" style={{ flex: 1 }} value={bfForm.erlass} onChange={(ev) => setBfForm((f) => ({ ...f, erlass: ev.target.value }))}>
              <option value="">Betrifft Erlass …</option>
              {db.erlasse.map((x) => <option key={x.id} value={x.id}>{x.kurz}</option>)}
            </select>
            <input className="input" style={{ flex: 1 }} placeholder="Fundstelle" value={bfForm.fund} onChange={(ev) => setBfForm((f) => ({ ...f, fund: ev.target.value }))} />
            <input className="input" style={{ flex: 2 }} placeholder="Beschreibung" value={bfForm.text} onChange={(ev) => setBfForm((f) => ({ ...f, text: ev.target.value }))} />
            <button className="btn-primary-dark" onClick={submitBefund}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'graph' && (
          <>
            <div className="tl-legend">
              {(Object.entries(VN_ART) as [VerweisArt, typeof VN_ART[VerweisArt]][]).map(([art, m]) => (
                <span key={art} className={`tl-lg ${filter === art ? 'on' : filter ? 'off' : ''}`} onClick={() => setFilter(filter === art ? null : art)}>
                  <span className="sw" style={{ background: m.farbe, height: 3, borderRadius: 2 }}></span>{art}
                  <span className="pb">{db.verweise.filter((v) => v.art === art).length}</span>
                </span>
              ))}
            </div>
            <div className="stk-wrap" style={{ flex: 1 }}>
              <div className="tl-stage panel" style={{ padding: 6 }}>
                {db.erlasse.length === 0
                  ? <div className="t-sans-sm" style={{ padding: 16 }}>Noch keine Erlasse im Normenwerk erfasst.</div>
                  : <VnGraph db={db} sel={sel} onSel={setSel} filter={filter} impactSet={null} />}
              </div>
              <div className="panel" style={{ overflow: 'auto' }}>
                <div className="panel-head"><span className="title">{e ? `${e.kurz} — Verbindungen` : 'Verweise'}</span></div>
                {!e && <p className="st-empty">Erlass im Graphen anklicken, um ein- und ausgehende Verweise mit Fundstellen zu sehen.</p>}
                {e && (
                  <div className="ak-detail">
                    <div className="ad-name" style={{ fontSize: 16 }}>{e.titel}</div>
                    {raus.length > 0 && <div><div className="ad-sec">Ausgehend ({raus.length})</div>{raus.map((v) => (
                      <div key={v.id} className="vn-edge" onClick={() => setSel(v.nach)}>
                        <span className={`vn-art ${v.art === 'Kollision' ? 'bad' : ''}`}>{v.art}</span>
                        <span className="vn-l">{v.label}</span>
                        <button className="ab danger" onClick={(ev) => { ev.stopPropagation(); deleteVerweis(v.id); }}><Icon name="close" size={11} /></button>
                      </div>
                    ))}</div>}
                    {rein.length > 0 && <div><div className="ad-sec">Eingehend ({rein.length})</div>{rein.map((v) => (
                      <div key={v.id} className="vn-edge" onClick={() => setSel(v.von)}>
                        <span className={`vn-art ${v.art === 'Kollision' ? 'bad' : ''}`}>{v.art}</span>
                        <span className="vn-l">{v.label}</span>
                        <button className="ab danger" onClick={(ev) => { ev.stopPropagation(); deleteVerweis(v.id); }}><Icon name="close" size={11} /></button>
                      </div>
                    ))}</div>}
                    {raus.length === 0 && rein.length === 0 && <p className="st-empty">Noch keine Verweise für diesen Erlass.</p>}
                    <button className="btn-ghost-glass" style={{ alignSelf: 'flex-start' }} onClick={() => { setImpactId(e.id); setTab('impact'); }}>
                      <Icon name="graph" size={13} /> Was hängt an {e.kurz}?
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'check' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {db.befunde.map((b) => {
              const be = db.erlasse.find((x) => x.id === b.erlass);
              return (
                <div key={b.id} className="gv-bf-row">
                  <span className={`st-pill ${VN_SCHWERE[b.schwere]}`}>{b.schwere}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="bf-t"><b>{b.typ}</b> — {b.fund}{be ? ` (${be.kurz})` : ''}</span>
                    {b.text && <span className="bf-x">{b.text}</span>}
                  </div>
                  <span className={`st-pill ${b.status === 'offen' ? 'warm' : 'dim'} click`}
                    onClick={() => update((d) => { const x = d.befunde.find((y) => y.id === b.id); if (x) x.status = x.status === 'offen' ? 'behoben' : 'offen'; })}>
                    {b.status}
                  </span>
                  <button className="ab danger" onClick={() => update((d) => { d.befunde = d.befunde.filter((y) => y.id !== b.id); })}><Icon name="close" size={12} /></button>
                </div>
              );
            })}
            {db.befunde.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Befunde erfasst.</div>}
          </div>
        )}

        {tab === 'impact' && (
          <div className="stk-wrap" style={{ flex: 1 }}>
            <div className="tl-stage panel" style={{ padding: 6 }}>
              {db.erlasse.length === 0
                ? <div className="t-sans-sm" style={{ padding: 16 }}>Noch keine Erlasse im Normenwerk erfasst.</div>
                : <VnGraph db={db} sel={impactId} onSel={(id) => id && setImpactId(id)} filter={null} impactSet={impactSet} />}
            </div>
            <div className="panel" style={{ overflow: 'auto' }}>
              <div className="panel-head"><span className="title">Rückwärtstraversierung</span></div>
              {db.erlasse.length > 0 && (
                <div className="st-form" style={{ marginBottom: 12 }}>
                  <select className="st-select" style={{ flex: 1 }} value={impactId ?? ''} onChange={(ev) => setImpactId(ev.target.value)}>
                    {db.erlasse.map((x) => <option key={x.id} value={x.id}>{x.kurz} — {x.titel}</option>)}
                  </select>
                </div>
              )}
              {impactErlass && (
                <p className="st-empty" style={{ marginTop: 0 }}>
                  Vor einer Revision von <b>{impactErlass.kurz}</b>: {impact.length === 0 ? 'kein Erlass hängt daran.' : `${impact.length} Erlass${impact.length > 1 ? 'e' : ''} betroffen.`}
                </p>
              )}
              {impact.map((t) => {
                const te = db.erlasse.find((x) => x.id === t.erlass);
                return (
                  <div key={t.erlass} className="vn-edge" onClick={() => setImpactId(t.erlass)}>
                    <span className="vn-art">{t.via.art}</span>
                    <span className="vn-l"><b>{te ? te.kurz : t.erlass}</b> · {t.via.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
