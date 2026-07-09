import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { gvId, type Mandat, type ReformAufwand } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

function findBefund(d: Mandat, id: string) {
  return d.befunde.find((b) => b.id === id) || d.checks.find((c) => c.id === id) || null;
}

function selectedOptions(el: HTMLSelectElement): string[] {
  return Array.from(el.selectedOptions).map((o) => o.value);
}

const RF_FORM = { titel: '', aufwand: 'mittel' as ReformAufwand, wirkung: 'mittel' as ReformAufwand, these: '', risiken: '' };
const STEP_FORM = { organ: '', schritt: '' };

export function GvSimulator({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [sel, setSel] = useState<string | null>(db.reformen[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(RF_FORM);
  const [erlasseSel, setErlasseSel] = useState<string[]>([]);
  const [prozesseSel, setProzesseSel] = useState<string[]>([]);
  const [addingStep, setAddingStep] = useState(false);
  const [stepForm, setStepForm] = useState(STEP_FORM);
  const [deltaDim, setDeltaDim] = useState('');
  const [deltaVal, setDeltaVal] = useState('');

  const rf = db.reformen.find((r) => r.id === sel) || null;

  const submit = () => {
    if (!form.titel.trim() || !form.these.trim()) return;
    const id = gvId('rf');
    update((d) => {
      d.reformen.push({
        id,
        titel: form.titel.trim(),
        aufwand: form.aufwand,
        wirkung: form.wirkung,
        these: form.these.trim(),
        beschlussweg: [],
        erlasse: erlasseSel,
        behebt: [],
        prozesse: prozesseSel,
        kompetenzen: [],
        risiken: form.risiken.split(',').map((r) => r.trim()).filter(Boolean),
        delta: {},
      });
    });
    setForm(RF_FORM);
    setErlasseSel([]);
    setProzesseSel([]);
    setAdding(false);
    setSel(id);
  };

  const deleteReform = (id: string) => {
    update((d) => { d.reformen = d.reformen.filter((r) => r.id !== id); });
    if (sel === id) setSel(null);
  };

  const submitStep = () => {
    if (!rf || !stepForm.organ || !stepForm.schritt.trim()) return;
    update((d) => {
      const target = d.reformen.find((r) => r.id === rf.id);
      if (target) target.beschlussweg.push({ organ: stepForm.organ, schritt: stepForm.schritt.trim() });
    });
    setStepForm(STEP_FORM);
    setAddingStep(false);
  };

  const submitDelta = () => {
    if (!rf || !deltaDim || !deltaVal) return;
    update((d) => {
      const target = d.reformen.find((r) => r.id === rf.id);
      if (target) target.delta[deltaDim] = Number(deltaVal);
    });
    setDeltaDim('');
    setDeltaVal('');
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Reform-Simulator">
      <div className="detail-top">
        <div className="detail-head"><h1>Reform-Simulator<span className="ac">.</span></h1></div>
        <div className="spacer"></div>
        <button className="btn-primary-dark" onClick={() => setAdding((a) => !a)}><Icon name="plus" size={13} /> Reform</button>
      </div>

      {adding && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="col" style={{ gap: 6 }}>
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 2 }} placeholder="Titel" value={form.titel} onChange={(ev) => setForm((f) => ({ ...f, titel: ev.target.value }))} />
              <select className="input" style={{ flex: '0 0 130px' }} value={form.aufwand} onChange={(ev) => setForm((f) => ({ ...f, aufwand: ev.target.value as ReformAufwand }))}>
                <option value="tief">Aufwand tief</option>
                <option value="mittel">Aufwand mittel</option>
                <option value="hoch">Aufwand hoch</option>
              </select>
              <select className="input" style={{ flex: '0 0 130px' }} value={form.wirkung} onChange={(ev) => setForm((f) => ({ ...f, wirkung: ev.target.value as ReformAufwand }))}>
                <option value="tief">Wirkung tief</option>
                <option value="mittel">Wirkung mittel</option>
                <option value="hoch">Wirkung hoch</option>
              </select>
            </div>
            <input className="input" placeholder="These / Vorschlag" value={form.these} onChange={(ev) => setForm((f) => ({ ...f, these: ev.target.value }))} />
            <input className="input" placeholder="Risiken (kommagetrennt)" value={form.risiken} onChange={(ev) => setForm((f) => ({ ...f, risiken: ev.target.value }))} />
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <select className="input" multiple style={{ flex: 1, minHeight: 70 }} value={erlasseSel} onChange={(ev) => setErlasseSel(selectedOptions(ev.target))}>
                {db.erlasse.map((e) => <option key={e.id} value={e.id}>{e.kurz} — {e.titel}</option>)}
              </select>
              <select className="input" multiple style={{ flex: 1, minHeight: 70 }} value={prozesseSel} onChange={(ev) => setProzesseSel(selectedOptions(ev.target))}>
                {db.prozesse.map((p) => <option key={p.id} value={p.id}>{p.titel}</option>)}
              </select>
            </div>
            <button className="btn-primary-dark" style={{ alignSelf: 'flex-start' }} onClick={submit}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div className="wg-body" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflow: 'auto' }}>
          {db.reformen.map((r) => (
            <div key={r.id} className={`wg-actor ${sel === r.id ? 'on' : ''}`} style={{ position: 'relative' }} onClick={() => setSel(r.id)}>
              <span className="wa-n">{r.titel}</span>
              <span className="wa-m">Aufwand {r.aufwand} · Wirkung {r.wirkung}</span>
              <button className="ab danger" style={{ position: 'absolute', top: 8, right: 8 }} onClick={(ev) => { ev.stopPropagation(); deleteReform(r.id); }}><Icon name="close" size={11} /></button>
            </div>
          ))}
          {db.reformen.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Reformoptionen erfasst.</div>}
        </div>

        <div className="panel" style={{ overflow: 'auto' }}>
          {rf && (
            <div className="ak-detail">
              <div>
                <div className="ad-name">{rf.titel}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                  <span className="st-pill dim">Aufwand {rf.aufwand}</span>
                  <span className="st-pill warm">Wirkung {rf.wirkung}</span>
                </div>
              </div>
              <div><div className="ad-sec">These</div><div className="ad-txt">{rf.these}</div></div>

              <div>
                <div className="row-flex" style={{ justifyContent: 'space-between' }}>
                  <div className="ad-sec">Beschlussweg</div>
                  <button className="ab" title="Schritt hinzufügen" onClick={() => setAddingStep((a) => !a)}><Icon name="plus" size={12} /></button>
                </div>
                {addingStep && (
                  <div className="row-flex" style={{ gap: 6, marginBottom: 8 }}>
                    <select className="input" style={{ flex: 1 }} value={stepForm.organ} onChange={(ev) => setStepForm((f) => ({ ...f, organ: ev.target.value }))}>
                      <option value="">Organ …</option>
                      {db.organe.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <input className="input" style={{ flex: 2 }} placeholder="Schritt" value={stepForm.schritt} onChange={(ev) => setStepForm((f) => ({ ...f, schritt: ev.target.value }))} />
                    <button className="btn-ghost-glass" onClick={submitStep}><Icon name="plus" size={12} /></button>
                  </div>
                )}
                {rf.beschlussweg.map((b, i) => {
                  const o = db.organe.find((x) => x.id === b.organ);
                  return (
                    <div key={i} className="gv-step" style={{ paddingBottom: 2 }}>
                      <div className="gs-rail">
                        <span className="gs-num">{i + 1}</span>
                        {i < rf.beschlussweg.length - 1 && <span className="gs-line"></span>}
                      </div>
                      <div className="gs-body" style={{ paddingBottom: 8 }}>
                        <span className="gs-org">{o ? o.name : b.organ}</span>
                        <span className="gs-a" style={{ fontSize: 13.5 }}>{b.schritt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rf.erlasse.length > 0 && (
                <div>
                  <div className="ad-sec">Betroffene Erlasse</div>
                  <div className="st-links">
                    {rf.erlasse.map((id) => {
                      const e = db.erlasse.find((x) => x.id === id);
                      return <span key={id} className="st-chip" onClick={() => _onOpen('g-netz')}><span className="tc">{e ? e.kurz : id}</span>{e ? e.titel : id}</span>;
                    })}
                  </div>
                </div>
              )}

              {rf.behebt.length > 0 && (
                <div>
                  <div className="ad-sec">Behebt</div>
                  {rf.behebt.map((id) => {
                    const b = findBefund(db, id);
                    return <div key={id} className="ad-txt" style={{ display: 'flex', gap: 7 }}><span style={{ color: 'var(--accent)' }}>✓</span>{b ? ('fund' in b ? `${b.typ} — ${b.fund}` : `${b.bereich}: ${b.luecke || b.mechanismus}`) : id}</div>;
                  })}
                </div>
              )}

              <div>
                <div className="row-flex" style={{ justifyContent: 'space-between' }}>
                  <div className="ad-sec">Score-Effekt (simuliert)</div>
                </div>
                {db.scorecard.length > 0 && (
                  <div className="row-flex" style={{ gap: 6, marginBottom: 8 }}>
                    <select className="input" style={{ flex: 1 }} value={deltaDim} onChange={(ev) => setDeltaDim(ev.target.value)}>
                      <option value="">Dimension …</option>
                      {db.scorecard.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <input className="input" type="number" style={{ flex: '0 0 90px' }} placeholder="Δ" value={deltaVal} onChange={(ev) => setDeltaVal(ev.target.value)} />
                    <button className="btn-ghost-glass" onClick={submitDelta}><Icon name="plus" size={12} /></button>
                  </div>
                )}
                {Object.entries(rf.delta).map(([dim, dv]) => {
                  const s = db.scorecard.find((x) => x.id === dim);
                  if (!s) return null;
                  const neu = Math.min(100, s.score + dv);
                  return (
                    <div key={dim} className="gv-delta">
                      <span className="gd-l">{s.label}</span>
                      <span className="scr-bar" style={{ flex: 1 }}>
                        <i className="me" style={{ width: `${s.score}%` }}></i>
                        <i className="plus" style={{ left: `${s.score}%`, width: `${neu - s.score}%` }}></i>
                      </span>
                      <span className="gd-v">{s.score} → <b>{neu}</b></span>
                    </div>
                  );
                })}
              </div>

              {rf.risiken.length > 0 && (
                <div>
                  <div className="ad-sec">Risiken</div>
                  {rf.risiken.map((r2, i) => <div key={i} className="ad-txt">— {r2}</div>)}
                </div>
              )}
            </div>
          )}
          {!rf && <p className="st-empty">Reform aus der Liste wählen oder eine neue erfassen.</p>}
        </div>
      </div>
    </div>
  );
}
