import { useState, type KeyboardEvent } from 'react';
import { Icon } from '../../components/Icon';
import { useStrategie } from '../../lib/strategie/store';
import type { StrategieViewId } from '../../lib/strategie/modules';
import type { Akteur } from '../../lib/strategie/types';

function wgName(id: string, akteure: Akteur[]): string {
  if (id === 'wir') return 'Wir';
  if (id === 'rot') return 'Rotes Team (KI)';
  const a = akteure.find((x) => x.id === id);
  return a ? a.name : id;
}

export function Wargame({ onOpen: _onOpen }: { onOpen: (view: StrategieViewId) => void }) {
  const { data, update } = useStrategie();
  const [sel, setSel] = useState<string | null>(data.akteure[0] ? data.akteure[0].id : null);
  const [ma, setMa] = useState('wir');
  const [mt, setMt] = useState('');
  const [mf, setMf] = useState('');
  const [err, setErr] = useState('');
  const runden = data.wargame.runden;

  const addMove = (akteur: string, text: string, folge: string, ki?: boolean) =>
    update((d) => {
      const r = d.wargame.runden[d.wargame.runden.length - 1];
      r.zuege.push({ akteur, text, folge: folge || '', ki: !!ki });
    });
  const submit = () => {
    const t = mt.trim();
    if (!t) return;
    addMove(ma, t, mf.trim());
    setMt('');
    setMf('');
  };
  const neueRunde = () => update((d) => d.wargame.runden.push({ nr: d.wargame.runden.length + 1, zuege: [] }));

  const redTeam = () => {
    setErr('');
    setErr('KI-Sparringspartner in dieser Umgebung nicht verfügbar.');
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Wargaming">
      <div className="detail-top">
        <div className="detail-head">
          <h1>Wargaming<span className="ac">.</span></h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost-glass" onClick={neueRunde}><Icon name="plus" size={13} /> Neue Runde</button>
          <button className="btn-primary-dark" onClick={redTeam}><Icon name="sparkle" size={13} /> Rotes Team ziehen lassen</button>
        </div>
      </div>
      {err && <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--accent)' }}>{err}</div>}

      <div className="wg-body">
        <div className="scroll" style={{ overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '2px 2px 0' }}>Akteursprofile</div>
          {data.akteure.length === 0 && <p className="st-empty">Noch keine Akteure — unter Analyse » Stakeholder erfassen.</p>}
          {data.akteure.map((a) => (
            <div key={a.id} className={`wg-actor ${sel === a.id ? 'on' : ''}`} onClick={() => setSel(a.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span className="wa-n">{a.name}</span>
                <span className={`st-pill ${a.rolle === 'Gegenspieler' ? 'warm' : 'dim'}`} style={{ flexShrink: 0 }}>{a.rolle}</span>
              </div>
              {sel === a.id && (
                <>
                  <div className="wa-m"><b style={{ fontWeight: 500 }}>Ziele:</b> {a.ziele.join(' · ')}</div>
                  <div className="wa-m"><b style={{ fontWeight: 500 }}>Ressourcen:</b> {a.ressourcen}</div>
                  <div className="wa-m"><b style={{ fontWeight: 500 }}>Muster:</b> {a.muster}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="panel" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head"><span className="title">Simulationsprotokoll</span></div>
          <div style={{ flex: 1 }}>
            {runden.map((r) => (
              <div key={r.nr} className="wg-round">
                <div className="wr-h">Runde {r.nr}</div>
                {r.zuege.length === 0 && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-5)', padding: '4px 8px' }}>Noch keine Züge — unten erfassen oder das Rote Team ziehen lassen.</div>}
                {r.zuege.map((z, i) => (
                  <div key={i} className={`wg-move ${z.akteur === 'wir' ? 'wir' : ''} ${z.ki ? 'ki' : ''}`}>
                    <span className="wm-a">{wgName(z.akteur, data.akteure)}</span>
                    <div>
                      <div className="wm-t">{z.text}</div>
                      {z.folge && <div className="wm-f">↳ {z.folge}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="st-form" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-2)', flexWrap: 'wrap' }}>
            <select className="st-select" value={ma} onChange={(e) => setMa(e.target.value)}>
              <option value="wir">Wir</option>
              {data.akteure.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input className="st-input" style={{ flex: '2 1 200px' }} placeholder="Zug …" value={mt} onChange={(e) => setMt(e.target.value)} onKeyDown={onEnter} />
            <input className="st-input" style={{ flex: '1 1 160px' }} placeholder="Konsequenz für uns" value={mf} onChange={(e) => setMf(e.target.value)} onKeyDown={onEnter} />
            <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Zug</button>
          </div>
        </div>
      </div>
    </div>
  );
}
