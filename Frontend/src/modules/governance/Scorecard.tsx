import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { gvId } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const SC_FORM = { label: '', score: '', vorjahr: '', note: '' };

export function GvScorecard({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [bm, setBm] = useState<string | null>(db.benchmarks[0]?.id ?? null);
  const [addingDim, setAddingDim] = useState(false);
  const [dimForm, setDimForm] = useState(SC_FORM);
  const [addingBm, setAddingBm] = useState(false);
  const [bmName, setBmName] = useState('');
  const [bmValueDim, setBmValueDim] = useState('');
  const [bmValue, setBmValue] = useState('');

  const bench = db.benchmarks.find((b) => b.id === bm) || null;
  const total = db.scorecard.length ? Math.round(db.scorecard.reduce((s, x) => s + x.score, 0) / db.scorecard.length) : 0;
  const vorjahrTotal = db.scorecard.length ? Math.round(db.scorecard.reduce((s, x) => s + x.vorjahr, 0) / db.scorecard.length) : 0;

  const submitDim = () => {
    if (!dimForm.label.trim()) return;
    update((d) => {
      d.scorecard.push({
        id: gvId('sc'),
        label: dimForm.label.trim(),
        score: Math.max(0, Math.min(100, Number(dimForm.score) || 0)),
        vorjahr: Math.max(0, Math.min(100, Number(dimForm.vorjahr) || 0)),
        note: dimForm.note.trim(),
      });
    });
    setDimForm(SC_FORM);
    setAddingDim(false);
  };

  const submitBenchmark = () => {
    if (!bmName.trim()) return;
    const id = gvId('bm');
    update((d) => { d.benchmarks.push({ id, name: bmName.trim(), werte: {} }); });
    setBmName('');
    setAddingBm(false);
    setBm(id);
  };

  const submitBenchmarkValue = () => {
    if (!bench || !bmValueDim || !bmValue) return;
    update((d) => {
      const target = d.benchmarks.find((b) => b.id === bench.id);
      if (target) target.werte[bmValueDim] = Number(bmValue);
    });
    setBmValueDim('');
    setBmValue('');
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Scorecard">
      <div className="detail-top">
        <div className="detail-head"><h1>Scorecard<span className="ac">.</span></h1></div>
        <div className="tabs">
          {db.benchmarks.map((b) => (
            <span key={b.id} className={`tab ${bm === b.id ? 'on' : ''}`} onClick={() => setBm(b.id)}>{b.name}</span>
          ))}
        </div>
        <div className="spacer"></div>
        <button className="btn-ghost-glass" style={{ marginRight: 8 }} onClick={() => setAddingBm((a) => !a)}><Icon name="plus" size={13} /> Vergleichsgruppe</button>
        <button className="btn-primary-dark" onClick={() => setAddingDim((a) => !a)}><Icon name="plus" size={13} /> Dimension</button>
      </div>

      {addingDim && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Dimension (z.B. Transparenz)" value={dimForm.label} onChange={(ev) => setDimForm((f) => ({ ...f, label: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitDim()} />
            <input className="input" type="number" min={0} max={100} style={{ flex: '0 0 100px' }} placeholder="Score" value={dimForm.score} onChange={(ev) => setDimForm((f) => ({ ...f, score: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitDim()} />
            <input className="input" type="number" min={0} max={100} style={{ flex: '0 0 100px' }} placeholder="Vorjahr" value={dimForm.vorjahr} onChange={(ev) => setDimForm((f) => ({ ...f, vorjahr: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitDim()} />
            <input className="input" style={{ flex: 2 }} placeholder="Begründung" value={dimForm.note} onChange={(ev) => setDimForm((f) => ({ ...f, note: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitDim()} />
            <button className="btn-primary-dark" onClick={submitDim}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingBm && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Name der Vergleichsgruppe (z.B. Vergleichsverbände)" value={bmName} onChange={(ev) => setBmName(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && submitBenchmark()} />
            <button className="btn-primary-dark" onClick={submitBenchmark}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {db.scorecard.length === 0 ? (
          <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Scorecard-Dimensionen erfasst.</div>
        ) : (
          <>
            <div className="gv-sc-total panel">
              <span className="sct-v">{total}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span className="sct-l">Reifegrad gesamt / 100</span>
                <span className="sct-s">Ø über {db.scorecard.length} Dimensionen · Vorjahr {vorjahrTotal}</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
                <span className="gv-lg"><span className="sw me"></span> {db.meta.mandat || 'Mandat'}</span>
                {bench && <span className="gv-lg"><span className="sw bm"></span> {bench.name}</span>}
                <span className="gv-lg"><span className="sw vj"></span> Vorjahr</span>
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 20px' }}>
              {db.scorecard.map((s) => {
                const bw = bench ? bench.werte[s.id] : null;
                return (
                  <div key={s.id} className="gv-sc-row">
                    <div className="scr-head">
                      <span className="scr-l">{s.label}</span>
                      <span className="scr-v">
                        {s.score}<i>/100</i>
                        {s.score > s.vorjahr ? <b className="up">▲ {s.score - s.vorjahr}</b> : s.score < s.vorjahr ? <b className="dn">▼ {s.vorjahr - s.score}</b> : null}
                      </span>
                      <button className="ab danger" onClick={() => update((d) => { d.scorecard = d.scorecard.filter((x) => x.id !== s.id); })}><Icon name="close" size={11} /></button>
                    </div>
                    <div className="scr-bar">
                      <i className="me" style={{ width: `${s.score}%` }}></i>
                      <span className="tick vj" style={{ left: `${s.vorjahr}%` }} title={`Vorjahr ${s.vorjahr}`}></span>
                      {bw != null && <span className="tick bm" style={{ left: `${bw}%` }} title={`${bench?.name}: ${bw}`}></span>}
                    </div>
                    <span className="scr-n">{s.note}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bench && db.scorecard.length > 0 && (
          <div className="panel">
            <div className="panel-head"><span className="title">Vergleichswerte für „{bench.name}" eintragen</span></div>
            <div className="row-flex" style={{ gap: 6 }}>
              <select className="input" style={{ flex: 1 }} value={bmValueDim} onChange={(ev) => setBmValueDim(ev.target.value)}>
                <option value="">Dimension …</option>
                {db.scorecard.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <input className="input" type="number" min={0} max={100} style={{ flex: '0 0 100px' }} placeholder="Wert" value={bmValue} onChange={(ev) => setBmValue(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && submitBenchmarkValue()} />
              <button className="btn-ghost-glass" onClick={submitBenchmarkValue}><Icon name="plus" size={13} /> Eintragen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
