import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { gvId, type CheckStatus, type Mandat } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const CB_STATUS: Record<CheckStatus, string> = { vorhanden: 'ok', teilweise: 'warm', fehlt: 'hot' };

const PZ_FORM = { titel: '', rechtsmittel: '' };
const STEP_FORM = { organ: '', aktion: '', frist: '', quorum: '', quelle: '' };
const CB_FORM = { bereich: '', mechanismus: '', status: 'vorhanden' as CheckStatus, quelle: '', luecke: '' };

export function GvProzesse({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [tab, setTab] = useState<'mapper' | 'checks'>('mapper');
  const [sel, setSel] = useState<string | null>(db.prozesse[0]?.id ?? null);
  const [addingPz, setAddingPz] = useState(false);
  const [pzForm, setPzForm] = useState(PZ_FORM);
  const [addingStep, setAddingStep] = useState(false);
  const [stepForm, setStepForm] = useState(STEP_FORM);
  const [addingCb, setAddingCb] = useState(false);
  const [cbForm, setCbForm] = useState(CB_FORM);

  const pz = db.prozesse.find((p) => p.id === sel) || null;

  const submitProzess = () => {
    if (!pzForm.titel.trim()) return;
    const id = gvId('pz');
    update((d: Mandat) => { d.prozesse.push({ id, titel: pzForm.titel.trim(), rechtsmittel: pzForm.rechtsmittel.trim() || null, schritte: [] }); });
    setPzForm(PZ_FORM);
    setAddingPz(false);
    setSel(id);
  };

  const deleteProzess = (id: string) => {
    update((d) => { d.prozesse = d.prozesse.filter((p) => p.id !== id); });
    if (sel === id) setSel(null);
  };

  const submitStep = () => {
    if (!pz || !stepForm.organ || !stepForm.aktion.trim()) return;
    update((d) => {
      const target = d.prozesse.find((p) => p.id === pz.id);
      if (target) target.schritte.push({ organ: stepForm.organ, aktion: stepForm.aktion.trim(), frist: stepForm.frist.trim() || null, quorum: stepForm.quorum.trim() || null, quelle: stepForm.quelle.trim() });
    });
    setStepForm(STEP_FORM);
    setAddingStep(false);
  };

  const deleteStep = (idx: number) => {
    if (!pz) return;
    update((d) => {
      const target = d.prozesse.find((p) => p.id === pz.id);
      if (target) target.schritte.splice(idx, 1);
    });
  };

  const submitCheck = () => {
    if (!cbForm.bereich.trim() || !cbForm.mechanismus.trim()) return;
    update((d) => { d.checks.push({ id: gvId('cb'), bereich: cbForm.bereich.trim(), mechanismus: cbForm.mechanismus.trim(), status: cbForm.status, quelle: cbForm.quelle.trim() || null, luecke: cbForm.luecke.trim() || null }); });
    setCbForm(CB_FORM);
    setAddingCb(false);
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Prozesse & Kontrolle">
      <div className="detail-top">
        <div className="detail-head"><h1>Prozesse & Kontrolle<span className="ac">.</span></h1></div>
        <div className="tabs">
          {([['mapper', 'Prozess-Mapper'], ['checks', 'Checks & Balances']] as const).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
        <div className="spacer"></div>
        {tab === 'mapper' && !pz && <button className="btn-primary-dark" onClick={() => setAddingPz((a) => !a)}><Icon name="plus" size={13} /> Prozess</button>}
        {tab === 'mapper' && pz && <button className="btn-primary-dark" onClick={() => setAddingStep((a) => !a)}><Icon name="plus" size={13} /> Schritt</button>}
        {tab === 'checks' && <button className="btn-primary-dark" onClick={() => setAddingCb((a) => !a)}><Icon name="plus" size={13} /> Check</button>}
      </div>

      {addingPz && tab === 'mapper' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Prozess-Titel" value={pzForm.titel} onChange={(ev) => setPzForm((f) => ({ ...f, titel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitProzess()} />
            <input className="input" style={{ flex: 1 }} placeholder="Rechtsmittel (optional)" value={pzForm.rechtsmittel} onChange={(ev) => setPzForm((f) => ({ ...f, rechtsmittel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitProzess()} />
            <button className="btn-primary-dark" onClick={submitProzess}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingStep && tab === 'mapper' && pz && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <select className="input" style={{ flex: 1 }} value={stepForm.organ} onChange={(ev) => setStepForm((f) => ({ ...f, organ: ev.target.value }))}>
              <option value="">Organ …</option>
              {db.organe.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input className="input" style={{ flex: 2 }} placeholder="Aktion" value={stepForm.aktion} onChange={(ev) => setStepForm((f) => ({ ...f, aktion: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitStep()} />
            <input className="input" style={{ flex: 1 }} placeholder="Frist" value={stepForm.frist} onChange={(ev) => setStepForm((f) => ({ ...f, frist: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitStep()} />
            <input className="input" style={{ flex: 1 }} placeholder="Quorum" value={stepForm.quorum} onChange={(ev) => setStepForm((f) => ({ ...f, quorum: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitStep()} />
            <input className="input" style={{ flex: 1 }} placeholder="Quelle" value={stepForm.quelle} onChange={(ev) => setStepForm((f) => ({ ...f, quelle: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitStep()} />
            <button className="btn-primary-dark" onClick={submitStep}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingCb && tab === 'checks' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Bereich" value={cbForm.bereich} onChange={(ev) => setCbForm((f) => ({ ...f, bereich: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitCheck()} />
            <input className="input" style={{ flex: 2 }} placeholder="Mechanismus" value={cbForm.mechanismus} onChange={(ev) => setCbForm((f) => ({ ...f, mechanismus: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitCheck()} />
            <select className="input" style={{ flex: '0 0 130px' }} value={cbForm.status} onChange={(ev) => setCbForm((f) => ({ ...f, status: ev.target.value as CheckStatus }))}>
              <option value="vorhanden">vorhanden</option>
              <option value="teilweise">teilweise</option>
              <option value="fehlt">fehlt</option>
            </select>
            <input className="input" style={{ flex: 1 }} placeholder="Quelle" value={cbForm.quelle} onChange={(ev) => setCbForm((f) => ({ ...f, quelle: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitCheck()} />
            <input className="input" style={{ flex: 1 }} placeholder="Lücke (falls vorhanden)" value={cbForm.luecke} onChange={(ev) => setCbForm((f) => ({ ...f, luecke: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitCheck()} />
            <button className="btn-primary-dark" onClick={submitCheck}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'mapper' && (
          <div className="wg-body" style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflow: 'auto' }}>
              {db.prozesse.map((p) => (
                <div key={p.id} className={`wg-actor ${sel === p.id ? 'on' : ''}`} style={{ position: 'relative' }} onClick={() => setSel(p.id)}>
                  <span className="wa-n">{p.titel}</span>
                  <span className="wa-m">{p.schritte.length} Schritte{p.rechtsmittel ? ' · Rechtsmittel definiert' : ''}</span>
                  <button className="ab danger" style={{ position: 'absolute', top: 8, right: 8 }} onClick={(ev) => { ev.stopPropagation(); deleteProzess(p.id); }}><Icon name="close" size={11} /></button>
                </div>
              ))}
              {db.prozesse.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Prozesse erfasst.</div>}
            </div>
            <div className="panel" style={{ overflow: 'auto' }}>
              <div className="panel-head"><span className="title">{pz ? pz.titel : '—'}</span></div>
              {pz && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {pz.schritte.map((s, i) => {
                    const o = db.organe.find((x) => x.id === s.organ);
                    return (
                      <div key={i} className="gv-step">
                        <div className="gs-rail">
                          <span className="gs-num">{i + 1}</span>
                          {i < pz.schritte.length - 1 && <span className="gs-line"></span>}
                        </div>
                        <div className="gs-body">
                          <div className="gs-head">
                            <span className="gs-org">{o ? o.name : s.organ}</span>
                            {s.quorum && <span className="st-pill dim">{s.quorum}</span>}
                            <button className="ab danger" onClick={() => deleteStep(i)}><Icon name="close" size={11} /></button>
                          </div>
                          <span className="gs-a">{s.aktion}</span>
                          <span className="gs-m">{s.frist ? `Frist: ${s.frist} · ` : ''}{s.quelle}</span>
                        </div>
                      </div>
                    );
                  })}
                  {pz.schritte.length === 0 && <p className="st-empty">Noch keine Schritte erfasst.</p>}
                  {pz.rechtsmittel && (
                    <div className="gv-rechtsmittel">
                      <b>Rechtsmittel</b> {pz.rechtsmittel}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'checks' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {db.checks.map((c) => (
              <div key={c.id} className="gv-bf-row">
                <span className={`st-pill ${CB_STATUS[c.status]}`}>{c.status}</span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="bf-t"><b>{c.bereich}</b> — {c.mechanismus}</span>
                  {c.luecke && <span className="bf-x">⚠ {c.luecke}</span>}
                </div>
                <span className="kp-q" style={{ whiteSpace: 'nowrap' }}>{c.quelle || '—'}</span>
                <button className="ab danger" onClick={() => update((d) => { d.checks = d.checks.filter((x) => x.id !== c.id); })}><Icon name="close" size={12} /></button>
              </div>
            ))}
            {db.checks.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Checks erfasst.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
