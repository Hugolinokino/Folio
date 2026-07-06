import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Icon } from '../../components/Icon';
import { StChip } from '../../lib/strategie/StChip';
import { useStrategie } from '../../lib/strategie/store';
import { backlinksOf, stId, type Akteur, type SwotItem } from '../../lib/strategie/types';
import type { StrategieViewId } from '../../lib/strategie/modules';

const SWOT_META: Record<'S' | 'W' | 'O' | 'T', string> = { S: 'Stärken', W: 'Schwächen', O: 'Chancen', T: 'Risiken' };
const TOWS_META: Record<'SO' | 'ST' | 'WO' | 'WT', string> = {
  SO: 'SO — Ausbauen',
  ST: 'ST — Absichern',
  WO: 'WO — Aufholen',
  WT: 'WT — Vermeiden',
};
const PESTEL_META: [string, string][] = [
  ['P', 'Politisch'],
  ['E', 'Ökonomisch'],
  ['S', 'Sozial'],
  ['T', 'Technologisch'],
  ['U', 'Ökologisch'],
  ['L', 'Legal'],
];

type AnalyseTab = 'swot' | 'stake' | 'pestel';
type DragPos = { id: string; x: number; y: number };

function SwotCell({ k, items }: { k: 'S' | 'W' | 'O' | 'T'; items: SwotItem[] }) {
  const { update } = useStrategie();
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (!t) return;
    update((d) => d.swot[k].push({ id: stId('sw'), text: t }));
    setVal('');
  };
  return (
    <div className="swot-cell">
      <div className="sw-h">
        <span className="sw-k">{k}</span>
        <span className="sw-t">{SWOT_META[k]}</span>
      </div>
      {items.map((it) => (
        <div key={it.id} className="sw-item">
          <span className="sw-dot"></span>
          <span style={{ flex: 1 }}>{it.text}</span>
          <span
            className="x"
            onClick={() =>
              update((d) => {
                d.swot[k] = d.swot[k].filter((x) => x.id !== it.id);
              })
            }
          >
            ×
          </span>
        </div>
      ))}
      <div className="sw-add">
        <input
          value={val}
          placeholder="Punkt ergänzen …"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && add()}
        />
      </div>
    </div>
  );
}

function StkMatrix({
  akteure,
  sel,
  onSel,
}: {
  akteure: Akteur[];
  sel: string | null;
  onSel: (id: string) => void;
}) {
  const { update } = useStrategie();
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragPos | null>(null);
  const down = (e: ReactPointerEvent<HTMLDivElement>, a: Akteur) => {
    e.preventDefault();
    onSel(a.id);
    const r = ref.current!.getBoundingClientRect();
    let last: DragPos | null = null;
    const move = (ev: PointerEvent) => {
      const x = Math.min(96, Math.max(4, ((ev.clientX - r.left) / r.width) * 100));
      const y = Math.min(90, Math.max(8, ((ev.clientY - r.top) / r.height) * 100));
      last = { id: a.id, x, y };
      setDrag(last);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (last) {
        const final = last;
        update((d) => {
          const t = d.akteure.find((k) => k.id === a.id);
          if (t) {
            t.interesse = Math.round(final.x);
            t.macht = Math.round(100 - final.y);
          }
        });
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="stk-matrix" ref={ref}>
      <span className="stk-q" style={{ top: 14, left: 18 }}>Zufriedenstellen</span>
      <span className="stk-q" style={{ top: 14, right: 18 }}>Eng führen</span>
      <span className="stk-q" style={{ bottom: 14, left: 18 }}>Beobachten</span>
      <span className="stk-q" style={{ bottom: 14, right: 18 }}>Informieren</span>
      <span className="stk-ax" style={{ bottom: 14, left: '50%', transform: 'translateX(-50%)' }}>Interesse →</span>
      <span
        className="stk-ax"
        style={{ top: '50%', left: 6, transform: 'rotate(-90deg) translateX(50%)', transformOrigin: 'left center' }}
      >
        Macht →
      </span>
      {akteure.map((a) => {
        const p = drag && drag.id === a.id ? drag : { x: a.interesse, y: 100 - a.macht };
        return (
          <div
            key={a.id}
            className={`stk-dot ${sel === a.id ? 'on' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onPointerDown={(e) => down(e, a)}
          >
            <span className="pt"></span>
            <span className="nm">{a.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Analyse({ onOpen }: { onOpen: (view: StrategieViewId) => void }) {
  const { data, update } = useStrategie();
  const [tab, setTab] = useState<AnalyseTab>('swot');
  const [tows, setTows] = useState(false);
  const [sel, setSel] = useState<string | null>(data.akteure[0] ? data.akteure[0].id : null);
  const [nak, setNak] = useState('');
  useEffect(() => {
    if (!sel && data.akteure[0]) setSel(data.akteure[0].id);
  }, [data.akteure.length]);
  const akt = data.akteure.find((a) => a.id === sel) || null;
  const back = akt ? backlinksOf(data, akt.id) : [];
  const addAkteur = () => {
    const name = nak.trim();
    if (!name) return;
    const na: Akteur = {
      id: stId('ak'),
      name,
      rolle: 'Stakeholder',
      macht: 50,
      interesse: 50,
      ziele: [],
      ressourcen: '',
      muster: '',
      tags: [],
    };
    update((d) => d.akteure.push(na));
    setSel(na.id);
    setNak('');
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Analyse">
      <div className="detail-top">
        <div className="detail-head">
          <h1>
            Analyse<span className="ac">.</span>
          </h1>
        </div>
        <div className="tabs">
          {(
            [
              ['swot', 'SWOT / TOWS'],
              ['stake', 'Stakeholder'],
              ['pestel', 'PESTEL'],
            ] as [AnalyseTab, string][]
          ).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              {l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'swot' && (
          <>
            <div className="swot-grid">
              {(['S', 'W', 'O', 'T'] as const).map((k) => (
                <SwotCell key={k} k={k} items={data.swot[k]} />
              ))}
            </div>
            <div className="row-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-4)',
                }}
              >
                TOWS — Strategiestossrichtungen aus der Kombination
              </span>
              <button className="btn-ghost-glass" onClick={() => setTows((t) => !t)}>
                {tows ? 'Ausblenden' : 'Einblenden'}
              </button>
            </div>
            {tows && (
              <div className="swot-grid" style={{ gridAutoRows: 'minmax(90px, auto)' }}>
                {(['SO', 'ST', 'WO', 'WT'] as const).map((k) => (
                  <div key={k} className="swot-cell tows-cell">
                    <div className="sw-h">
                      <span className="sw-t" style={{ color: 'var(--accent)' }}>
                        {TOWS_META[k]}
                      </span>
                    </div>
                    <div
                      className="tw-txt"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e: FocusEvent<HTMLDivElement>) =>
                        update((d) => {
                          d.tows[k] = e.currentTarget.textContent ?? '';
                        })
                      }
                    >
                      {data.tows[k]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'stake' && (
          <div className="stk-wrap">
            <StkMatrix akteure={data.akteure} sel={sel} onSel={setSel} />
            <div className="panel" style={{ overflow: 'auto' }}>
              <div className="panel-head">
                <span className="title">Akteursprofil</span>
              </div>
              {akt ? (
                <div className="ak-detail">
                  <div>
                    <div className="ad-name">{akt.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                      <span className={`st-pill ${akt.rolle === 'Gegenspieler' ? 'warm' : 'ok'}`}>{akt.rolle}</span>
                      <span className="st-pill dim">Macht {akt.macht}</span>
                      <span className="st-pill dim">Interesse {akt.interesse}</span>
                    </div>
                  </div>
                  {akt.ziele.length > 0 && (
                    <div>
                      <div className="ad-sec">Ziele</div>
                      {akt.ziele.map((z, i) => (
                        <div key={i} className="ad-txt">
                          — {z}
                        </div>
                      ))}
                    </div>
                  )}
                  {akt.ressourcen && (
                    <div>
                      <div className="ad-sec">Ressourcen</div>
                      <div className="ad-txt">{akt.ressourcen}</div>
                    </div>
                  )}
                  {akt.muster && (
                    <div>
                      <div className="ad-sec">Reaktionsmuster</div>
                      <div className="ad-txt">{akt.muster}</div>
                    </div>
                  )}
                  {back.length > 0 && (
                    <div>
                      <div className="ad-sec">Verknüpft mit</div>
                      <div className="st-links">
                        {back.map((id) => (
                          <StChip key={id} id={id} onOpen={onOpen} />
                        ))}
                      </div>
                    </div>
                  )}
                  <button className="btn-ghost-glass" style={{ alignSelf: 'flex-start' }} onClick={() => onOpen('s-wargame')}>
                    <Icon name="flag" size={13} /> Im Wargaming durchspielen
                  </button>
                </div>
              ) : (
                <p className="st-empty">Noch keine Akteure erfasst.</p>
              )}
              <div className="st-form" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-2)' }}>
                <input
                  className="st-input"
                  style={{ flex: 1 }}
                  placeholder="Neuer Akteur …"
                  value={nak}
                  onChange={(e) => setNak(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addAkteur()}
                />
                <button className="btn-primary-dark" onClick={addAkteur}>
                  <Icon name="plus" size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'pestel' && (
          <div className="pestel-grid">
            {PESTEL_META.map(([k, label]) => {
              const items = data.faktoren.filter((f) => f.pestel === (k === 'U' ? 'Ö' : k));
              return (
                <div key={k} className="pestel-cell">
                  <div className="sw-h" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="pe-k">{k === 'U' ? 'E' : k}</span>
                    <span className="pe-t">{label}</span>
                  </div>
                  {items.length === 0 && (
                    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-5)' }}>
                      Keine Faktoren erfasst.
                    </span>
                  )}
                  {items.map((f) => (
                    <div key={f.id} className="pe-item" onClick={() => onOpen('s-foresight')}>
                      <span
                        style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {f.titel}
                      </span>
                      <span className="pe-bar">
                        <i style={{ transform: `scaleX(${f.impact / 100})` }}></i>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
