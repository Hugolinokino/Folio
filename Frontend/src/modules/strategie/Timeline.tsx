import { useEffect, useState } from 'react';
import { Icon } from '../../components/Icon';
import { StChip } from '../../lib/strategie/StChip';
import { useStrategie } from '../../lib/strategie/store';
import { stId, type Strang, type Vorhaben } from '../../lib/strategie/types';
import type { StrategieViewId } from '../../lib/strategie/modules';

interface TlStyleEntry {
  stroke: string;
  width: number;
  dash: string | null;
}

const TL_STYLE: Record<Strang['art'], TlStyleEntry> = {
  ziel: { stroke: 'var(--accent)', width: 3, dash: null },
  basis: { stroke: 'var(--ink-3)', width: 2.25, dash: null },
  stress: { stroke: 'var(--ink-2)', width: 1.75, dash: '7 5' },
  wild: { stroke: 'var(--ink-4)', width: 1.5, dash: '3 5' },
};
const TL_ART: Record<Strang['art'], string> = { ziel: 'Zielstrang', basis: 'Basisstrang', stress: 'Stresstest', wild: 'Wildcard' };

function tlY(id: string, year: number, straenge: Strang[], trunkY: number): number {
  if (id === 'trunk') return trunkY;
  const s = straenge.find((x) => x.id === id);
  if (!s) return trunkY;
  if (year <= s.branch) return tlY(s.parent, year, straenge, trunkY);
  const t = Math.min(1, (year - s.branch) / 1.15);
  const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
  const start = tlY(s.parent, s.branch, straenge, trunkY);
  return start + (s.laneY - start) * ease;
}

function TlStage({ db, visible, sel, onSel }: { db: Vorhaben; visible: Record<string, boolean>; sel: string | null; onSel: (id: string) => void }) {
  const W = 980, H = 430, ml = 26, mr = 168, mt = 30, mb = 34;
  const Y0 = 2026, Y1 = 2031, trunkY = 205;
  const x = (yr: number) => ml + ((yr - Y0) / (Y1 - Y0)) * (W - ml - mr);
  const strands = db.straenge;
  const firstBranch = strands.length ? Math.min(...strands.map((s) => s.branch)) : Y1;
  const path = (s: Strang) => {
    const pts: string[] = [];
    for (let yr = s.branch; yr <= Y1 + 0.001; yr += 0.05) pts.push(`${x(yr).toFixed(1)},${tlY(s.id, yr, strands, trunkY).toFixed(1)}`);
    return 'M' + pts.join(' L');
  };
  const mono = { fontFamily: 'var(--mono)', letterSpacing: '0.08em' };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
      {[2026, 2027, 2028, 2029, 2030, 2031].map((yr) => (
        <g key={yr}>
          <line x1={x(yr)} y1={mt} x2={x(yr)} y2={H - mb} style={{ stroke: 'var(--line-1)' }} />
          <text x={x(yr)} y={H - 12} textAnchor="middle" style={{ ...mono, fontSize: 10.5, fill: 'var(--ink-4)' }}>{yr}</text>
        </g>
      ))}
      {db.entscheidungspunkte.map((ep) => (
        <g key={ep.id}>
          <line x1={x(ep.jahr)} y1={mt} x2={x(ep.jahr)} y2={H - mb} style={{ stroke: 'var(--accent)', opacity: 0.45 }} strokeDasharray="2 5" />
          <text x={x(ep.jahr)} y={mt - 8} textAnchor="middle" style={{ ...mono, fontSize: 9, fill: 'var(--accent)', textTransform: 'uppercase' }}>{ep.kurz} · {ep.titel.length > 30 ? ep.titel.slice(0, 29) + '…' : ep.titel}</text>
        </g>
      ))}
      <line x1={x(Y0)} y1={trunkY} x2={x(firstBranch)} y2={trunkY} style={{ stroke: 'var(--ink-2)' }} strokeWidth="3.5" strokeLinecap="round" />
      {strands.map((s) => {
        if (!visible[s.id]) return null;
        const st = TL_STYLE[s.art];
        const dim = Boolean(sel) && sel !== s.id;
        const endY = tlY(s.id, Y1, strands, trunkY);
        return (
          <g key={s.id} style={{ opacity: dim ? 0.3 : 1, transition: 'opacity 250ms', cursor: 'pointer' }} onClick={() => onSel(s.id)}>
            <path d={path(s)} fill="none" style={{ stroke: st.stroke }} strokeWidth={sel === s.id ? st.width + 0.75 : st.width} strokeDasharray={st.dash || undefined} strokeLinecap="round" />
            <rect
              x={x(s.branch) - 4.5}
              y={tlY(s.parent, s.branch, strands, trunkY) - 4.5}
              width="9"
              height="9"
              transform={`rotate(45 ${x(s.branch)} ${tlY(s.parent, s.branch, strands, trunkY)})`}
              style={{ fill: 'var(--paper)', stroke: 'var(--ink-2)', strokeWidth: 1.5 }}
            />
            {s.events.map((e, i) => {
              const ex = x(e.jahr), ey = tlY(s.id, e.jahr, strands, trunkY);
              const above = s.laneY < trunkY;
              return (
                <g key={i}>
                  {e.art === 'ziel' ? (
                    <>
                      <circle cx={ex} cy={ey} r="7.5" style={{ fill: 'transparent', stroke: st.stroke, strokeWidth: 1.5 }} />
                      <circle cx={ex} cy={ey} r="3.5" style={{ fill: st.stroke }} />
                    </>
                  ) : (
                    <circle cx={ex} cy={ey} r="4.5" style={{ fill: st.stroke, stroke: 'var(--paper)', strokeWidth: 1.5 }} />
                  )}
                  <text x={ex} y={above ? ey - 13 : ey + 21} textAnchor="middle" style={{ fontFamily: 'var(--sans)', fontSize: 10, fill: dim ? 'var(--ink-5)' : 'var(--ink-3)' }}>
                    {e.titel.length > 36 ? e.titel.slice(0, 35) + '…' : e.titel}
                  </text>
                </g>
              );
            })}
            <text x={x(Y1) + 10} y={endY - 2} style={{ fontFamily: 'var(--serif)', fontSize: 13.5, fill: sel === s.id ? 'var(--ink)' : 'var(--ink-2)', fontWeight: 500 }}>{s.titel}</text>
            <text x={x(Y1) + 10} y={endY + 12} style={{ ...mono, fontSize: 9.5, fill: 'var(--ink-4)' }}>{s.prob} % · {TL_ART[s.art]}</text>
          </g>
        );
      })}
      <line x1={x(db.meta.heute)} y1={mt} x2={x(db.meta.heute)} y2={H - mb} style={{ stroke: 'var(--ink)' }} strokeWidth="1" />
      <circle cx={x(db.meta.heute)} cy={trunkY} r="5" style={{ fill: 'var(--ink)', stroke: 'var(--paper)', strokeWidth: 2 }} />
      <text x={x(db.meta.heute)} y={H - mb + 14} textAnchor="middle" style={{ ...mono, fontSize: 9, fill: 'var(--ink)', textTransform: 'uppercase' }}>Heute</text>
    </svg>
  );
}

export function Timeline({ onOpen }: { onOpen: (view: StrategieViewId) => void }) {
  const { data, update } = useStrategie();
  const [sel, setSel] = useState<string | null>(data.straenge[0] ? data.straenge[0].id : null);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => Object.fromEntries(data.straenge.map((s) => [s.id, true])));
  const [mj, setMj] = useState('2028');
  const [mt2, setMt2] = useState('');
  const [nst, setNst] = useState('');
  const [nprob, setNprob] = useState<number | string>(30);
  const [nart, setNart] = useState<Strang['art']>('basis');

  useEffect(() => {
    if (!sel && data.straenge[0]) setSel(data.straenge[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.straenge.length]);

  const s = data.straenge.find((x) => x.id === sel) || null;

  const addMs = () => {
    if (!s) return;
    const t = mt2.trim();
    const jahr = parseFloat(mj);
    if (!t || isNaN(jahr)) return;
    update((d) => {
      const st = d.straenge.find((x) => x.id === s.id);
      if (!st) return;
      st.events.push({ jahr: Math.min(2030.9, Math.max(st.branch + 0.15, jahr)), titel: t, art: 'ms' });
      st.events.sort((a, b) => a.jahr - b.jahr);
    });
    setMt2('');
  };

  const addStrang = () => {
    const titel = nst.trim();
    if (!titel) return;
    const idx = data.straenge.length;
    const branch = Math.min(2030.6, Math.max(2026.4, (data.meta.heute || 2026.5) + 0.4));
    const laneY = 90 + (idx % 4) * 90;
    const id = stId('sz');
    update((d) => {
      d.straenge.push({
        id,
        titel,
        art: nart,
        prob: Math.max(0, Math.min(100, Number(nprob) || 0)),
        parent: 'trunk',
        branch,
        laneY,
        kurz: '',
        zielbild: '',
        events: [],
        backcast: [],
        links: [],
      });
    });
    setVisible((v) => ({ ...v, [id]: true }));
    setSel(id);
    setNst('');
    setNprob(30);
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Zukunftslinien">
      <div className="detail-top">
        <div className="detail-head">
          <h1>Zukunftslinien<span className="ac">.</span></h1>
        </div>
        <div className="tl-legend">
          {data.straenge.map((st) => (
            <span
              key={st.id}
              className={`tl-lg ${sel === st.id ? 'on' : ''} ${visible[st.id] ? '' : 'off'}`}
              onClick={() => {
                if (sel === st.id) setVisible((v) => ({ ...v, [st.id]: !v[st.id] }));
                else {
                  setSel(st.id);
                  setVisible((v) => ({ ...v, [st.id]: true }));
                }
              }}
            >
              <span className="sw" style={{ background: TL_STYLE[st.art].stroke }}></span>
              {st.titel}<span className="pb">{st.prob} %</span>
            </span>
          ))}
        </div>
      </div>

      <div className="tl-body">
        <div className="panel tl-stage" style={{ padding: 12 }}>
          <TlStage db={data} visible={visible} sel={sel} onSel={setSel} />
        </div>

        <div className="panel" style={{ overflow: 'auto' }}>
          <div className="panel-head"><span className="title">{s ? s.titel : 'Zukunftslinien'}</span></div>
          {s ? (
            <div className="ak-detail">
              {s.kurz && <div className="ad-txt" style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic' }}>{s.kurz}</div>}
              {s.zielbild && (
                <div>
                  <div className="ad-sec">Zielbild</div>
                  <div className="ad-txt">{s.zielbild}</div>
                </div>
              )}
              {s.backcast.length > 0 && (
                <div>
                  <div className="ad-sec">Backcasting — vom Zielbild zurück</div>
                  <div style={{ marginTop: 4 }}>
                    {s.backcast.map((b, i) => (
                      <div key={i} className="bc-step">
                        <span className="bl"><span className="bd"></span></span>
                        <span className="bt">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {s.links.length > 0 && (
                <div>
                  <div className="ad-sec">Verknüpft mit</div>
                  <div className="st-links">{s.links.map((id) => <StChip key={id} id={id} onOpen={onOpen} />)}</div>
                </div>
              )}
              <div>
                <div className="ad-sec">Meilenstein ergänzen</div>
                <div className="st-form" style={{ marginTop: 5 }}>
                  <input className="st-input" style={{ width: 68 }} value={mj} onChange={(e) => setMj(e.target.value)} title="Jahr (z. B. 2028.5)" />
                  <input className="st-input" style={{ flex: 1 }} placeholder="Ereignis …" value={mt2} onChange={(e) => setMt2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addMs()} />
                  <button className="btn-ghost-glass" onClick={addMs}><Icon name="plus" size={13} /></button>
                </div>
              </div>
            </div>
          ) : (
            <p className="st-empty">Noch keine Zukunftslinien angelegt.</p>
          )}
          <div className="st-form" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-2)', flexWrap: 'wrap' }}>
            <input className="st-input" style={{ flex: '2 1 160px' }} placeholder="Neuer Strang …" value={nst} onChange={(e) => setNst(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStrang()} />
            <select className="st-select" value={nart} onChange={(e) => setNart(e.target.value as Strang['art'])}>
              <option value="ziel">Zielstrang</option>
              <option value="basis">Basisstrang</option>
              <option value="stress">Stresstest</option>
              <option value="wild">Wildcard</option>
            </select>
            <input className="st-input" type="number" min="0" max="100" style={{ width: 62 }} value={nprob} onChange={(e) => setNprob(e.target.value)} title="Wahrscheinlichkeit %" />
            <button className="btn-primary-dark" onClick={addStrang}><Icon name="plus" size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
