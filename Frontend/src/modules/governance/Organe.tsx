import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { gvId, type Organ, type RaciValue } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const RACI_CYCLE: RaciValue[] = ['—', 'R', 'A', 'C', 'I'];

/** Groups organe into BFS levels by their `bericht` (reports-to) chain, for a simple generated org chart. Unreachable/cyclic entries land in a trailing level rather than being silently dropped. */
function orgLevels(organe: Organ[]): Organ[][] {
  const byParent = new Map<string | null, Organ[]>();
  organe.forEach((o) => {
    const key = o.bericht;
    const list = byParent.get(key) || [];
    list.push(o);
    byParent.set(key, list);
  });
  const levels: Organ[][] = [];
  const seen = new Set<string>();
  let current = byParent.get(null) || [];
  while (current.length) {
    levels.push(current);
    current.forEach((o) => seen.add(o.id));
    const next: Organ[] = [];
    current.forEach((o) => { (byParent.get(o.id) || []).forEach((c) => next.push(c)); });
    current = next;
  }
  const orphans = organe.filter((o) => !seen.has(o.id));
  if (orphans.length) levels.push(orphans);
  return levels;
}

const OG_FORM = { name: '', kurz: '', art: '', quelle: '', mitglieder: '', bericht: '' };
const KP_FORM = { befugnis: '', organ: '', quelle: '', quorum: '', luecke: false };
const US_FORM = { wer: '', art: '', bereich: '', limite: '', quelle: '' };

export function GvOrgane({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [tab, setTab] = useState<'matrix' | 'raci' | 'organigramm' | 'unterschriften'>('matrix');
  const [addingOg, setAddingOg] = useState(false);
  const [ogForm, setOgForm] = useState(OG_FORM);
  const [addingKp, setAddingKp] = useState(false);
  const [kpForm, setKpForm] = useState(KP_FORM);
  const [addingProz, setAddingProz] = useState(false);
  const [prozName, setProzName] = useState('');
  const [addingUs, setAddingUs] = useState(false);
  const [usForm, setUsForm] = useState(US_FORM);

  const submitOrgan = () => {
    if (!ogForm.name.trim() || !ogForm.kurz.trim()) return;
    update((d) => { d.organe.push({ id: gvId('og'), name: ogForm.name.trim(), kurz: ogForm.kurz.trim(), art: ogForm.art.trim(), quelle: ogForm.quelle.trim(), mitglieder: ogForm.mitglieder.trim(), bericht: ogForm.bericht || null }); });
    setOgForm(OG_FORM);
    setAddingOg(false);
  };

  const deleteOrgan = (id: string) => update((d) => {
    d.organe = d.organe.filter((o) => o.id !== id);
    d.organe.forEach((o) => { if (o.bericht === id) o.bericht = null; });
    d.kompetenzen = d.kompetenzen.filter((k) => k.organ !== id);
    d.raci.forEach((r) => { delete r.zellen[id]; });
  });

  const submitKompetenz = () => {
    if (!kpForm.befugnis.trim() || !kpForm.organ) return;
    update((d) => { d.kompetenzen.push({ id: gvId('kp'), befugnis: kpForm.befugnis.trim(), organ: kpForm.organ, quelle: kpForm.quelle.trim(), quorum: kpForm.quorum.trim(), luecke: kpForm.luecke }); });
    setKpForm(KP_FORM);
    setAddingKp(false);
  };

  const submitProzessRow = () => {
    if (!prozName.trim()) return;
    update((d) => { d.raci.push({ id: gvId('rc'), prozess: prozName.trim(), zellen: {}, luecke: null }); });
    setProzName('');
    setAddingProz(false);
  };

  const cycleCell = (rowId: string, organId: string) => update((d) => {
    const row = d.raci.find((r) => r.id === rowId);
    if (!row) return;
    const cur = row.zellen[organId] || '—';
    const idx = RACI_CYCLE.indexOf(cur);
    row.zellen[organId] = RACI_CYCLE[(idx + 1) % RACI_CYCLE.length];
  });

  const submitUnterschrift = () => {
    if (!usForm.wer.trim()) return;
    update((d) => { d.unterschriften.push({ id: gvId('us'), wer: usForm.wer.trim(), art: usForm.art.trim(), bereich: usForm.bereich.trim(), limite: usForm.limite.trim(), quelle: usForm.quelle.trim() }); });
    setUsForm(US_FORM);
    setAddingUs(false);
  };

  const levels = orgLevels(db.organe);

  return (
    <div className="detail view-in" data-screen-label="Governance · Organe & Kompetenzen">
      <div className="detail-top">
        <div className="detail-head"><h1>Organe & Kompetenzen<span className="ac">.</span></h1></div>
        <div className="tabs">
          {([['matrix', 'Kompetenzmatrix'], ['raci', 'RACI'], ['organigramm', 'Organigramm'], ['unterschriften', 'Unterschriften']] as const).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
        <div className="spacer"></div>
        {tab === 'matrix' && <button className="btn-primary-dark" onClick={() => setAddingKp((a) => !a)}><Icon name="plus" size={13} /> Kompetenz</button>}
        {tab === 'raci' && <button className="btn-primary-dark" onClick={() => setAddingProz((a) => !a)}><Icon name="plus" size={13} /> Prozess</button>}
        {(tab === 'organigramm' || tab === 'unterschriften') && (
          <button className="btn-primary-dark" onClick={() => (tab === 'organigramm' ? setAddingOg((a) => !a) : setAddingUs((a) => !a))}>
            <Icon name="plus" size={13} /> {tab === 'organigramm' ? 'Organ' : 'Unterschrift'}
          </button>
        )}
      </div>

      {addingKp && tab === 'matrix' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 2 }} placeholder="Befugnis" value={kpForm.befugnis} onChange={(ev) => setKpForm((f) => ({ ...f, befugnis: ev.target.value }))} />
            <select className="input" style={{ flex: 1 }} value={kpForm.organ} onChange={(ev) => setKpForm((f) => ({ ...f, organ: ev.target.value }))}>
              <option value="">Organ …</option>
              {db.organe.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input className="input" style={{ flex: 1 }} placeholder="Gestützt auf" value={kpForm.quelle} onChange={(ev) => setKpForm((f) => ({ ...f, quelle: ev.target.value }))} />
            <input className="input" style={{ flex: '0 0 120px' }} placeholder="Quorum" value={kpForm.quorum} onChange={(ev) => setKpForm((f) => ({ ...f, quorum: ev.target.value }))} />
            <label className="row-flex" style={{ gap: 5, fontFamily: 'var(--sans)', fontSize: 12.5 }}>
              <input type="checkbox" checked={kpForm.luecke} onChange={(ev) => setKpForm((f) => ({ ...f, luecke: ev.target.checked }))} /> Lücke
            </label>
            <button className="btn-primary-dark" onClick={submitKompetenz}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingProz && tab === 'raci' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Prozess (z.B. Budgetprozess)" value={prozName} onChange={(ev) => setProzName(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && submitProzessRow()} />
            <button className="btn-primary-dark" onClick={submitProzessRow}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingOg && tab === 'organigramm' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Kürzel" value={ogForm.kurz} onChange={(ev) => setOgForm((f) => ({ ...f, kurz: ev.target.value }))} />
            <input className="input" style={{ flex: 2 }} placeholder="Name" value={ogForm.name} onChange={(ev) => setOgForm((f) => ({ ...f, name: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Art (z.B. Aufsicht)" value={ogForm.art} onChange={(ev) => setOgForm((f) => ({ ...f, art: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Quelle" value={ogForm.quelle} onChange={(ev) => setOgForm((f) => ({ ...f, quelle: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Mitglieder" value={ogForm.mitglieder} onChange={(ev) => setOgForm((f) => ({ ...f, mitglieder: ev.target.value }))} />
            <select className="input" style={{ flex: 1 }} value={ogForm.bericht} onChange={(ev) => setOgForm((f) => ({ ...f, bericht: ev.target.value }))}>
              <option value="">— oberstes Organ —</option>
              {db.organe.map((o) => <option key={o.id} value={o.id}>berichtet an {o.name}</option>)}
            </select>
            <button className="btn-primary-dark" onClick={submitOrgan}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingUs && tab === 'unterschriften' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Zeichnungsberechtigt" value={usForm.wer} onChange={(ev) => setUsForm((f) => ({ ...f, wer: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Art (z.B. Kollektiv zu zweien)" value={usForm.art} onChange={(ev) => setUsForm((f) => ({ ...f, art: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Bereich" value={usForm.bereich} onChange={(ev) => setUsForm((f) => ({ ...f, bereich: ev.target.value }))} />
            <input className="input" style={{ flex: '0 0 130px' }} placeholder="Limite" value={usForm.limite} onChange={(ev) => setUsForm((f) => ({ ...f, limite: ev.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Quelle" value={usForm.quelle} onChange={(ev) => setUsForm((f) => ({ ...f, quelle: ev.target.value }))} />
            <button className="btn-primary-dark" onClick={submitUnterschrift}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'matrix' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="gv-kp-row gv-kp-head">
              <span>Befugnis</span><span>Zuständiges Organ</span><span>Gestützt auf</span><span>Quorum</span><span></span>
            </div>
            {db.kompetenzen.map((k) => {
              const o = db.organe.find((x) => x.id === k.organ);
              return (
                <div key={k.id} className={`gv-kp-row ${k.luecke ? 'bad' : ''}`}>
                  <span className="kp-b">{k.befugnis}{k.luecke && <span className="kp-flag">Lücke</span>}</span>
                  <span className="kp-o">{o ? o.name : '—'}</span>
                  <span className={`kp-q ${k.luecke ? 'warn' : ''}`}>{k.quelle}</span>
                  <span className="kp-m">{k.quorum}</span>
                  <button className="ab danger" onClick={() => update((d) => { d.kompetenzen = d.kompetenzen.filter((x) => x.id !== k.id); })}><Icon name="close" size={12} /></button>
                </div>
              );
            })}
            {db.kompetenzen.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Kompetenzen erfasst.</div>}
          </div>
        )}

        {tab === 'raci' && (
          <>
            {db.organe.length === 0 ? (
              <div className="t-sans-sm" style={{ padding: 12 }}>Zuerst Organe im Organigramm anlegen, um die RACI-Matrix zu füllen.</div>
            ) : (
              <div className="panel" style={{ padding: 0, overflow: 'auto' }}>
                <div className="gv-raci" style={{ '--cols': db.organe.length } as React.CSSProperties}>
                  <div className="rc-cell rc-head" style={{ justifyContent: 'flex-start' }}>Prozess</div>
                  {db.organe.map((o) => <div key={o.id} className="rc-cell rc-head" title={o.name}>{o.kurz}</div>)}
                  {db.raci.map((r) => (
                    <div key={r.id} style={{ display: 'contents' }}>
                      <div className={`rc-cell rc-p ${r.luecke ? 'bad' : ''}`}>{r.prozess}{r.luecke && <span className="kp-flag">Lücke</span>}</div>
                      {db.organe.map((o) => {
                        const v = r.zellen[o.id] || '—';
                        return (
                          <div key={o.id} className={`rc-cell rc-v ${v === 'A' ? 'a' : v === 'R' ? 'r' : ''}`} style={{ cursor: 'pointer' }} onClick={() => cycleCell(r.id, o.id)}>
                            {v}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="row-flex" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="gv-lg"><b className="r">R</b> Responsible</span>
              <span className="gv-lg"><b className="a">A</b> Accountable</span>
              <span className="gv-lg"><b>C</b> Consulted</span>
              <span className="gv-lg"><b>I</b> Informed</span>
            </div>
          </>
        )}

        {tab === 'organigramm' && (
          <div className="gv-org">
            {levels.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Organe erfasst.</div>}
            {levels.map((row, i) => (
              <div key={i}>
                {i > 0 && <div className="gv-org-line"></div>}
                <div className="gv-org-row">
                  {row.map((o) => (
                    <div key={o.id} className={`gv-org-box ${i === 0 ? 'top' : ''}`} style={{ position: 'relative' }}>
                      <span className="ob-n">{o.name}</span>
                      <span className="ob-a">{o.art}{o.quelle ? ` · ${o.quelle}` : ''}</span>
                      <span className="ob-m">{o.mitglieder}</span>
                      <button className="ab danger" style={{ position: 'absolute', top: 6, right: 6 }} title="Organ löschen" onClick={() => deleteOrgan(o.id)}><Icon name="close" size={11} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {db.organe.length > 0 && (
              <p className="st-empty">Jedes Kästchen nennt die konstituierende Norm — Organe ohne Norm existieren governance-rechtlich nicht.</p>
            )}
          </div>
        )}

        {tab === 'unterschriften' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="gv-kp-row gv-kp-head">
              <span>Zeichnungsberechtigt</span><span>Art</span><span>Bereich · Limite</span><span>Quelle</span><span></span>
            </div>
            {db.unterschriften.map((u) => (
              <div key={u.id} className="gv-kp-row">
                <span className="kp-b">{u.wer}</span>
                <span className="kp-o">{u.art}</span>
                <span className="kp-m">{u.bereich} · {u.limite}</span>
                <span className="kp-q">{u.quelle}</span>
                <button className="ab danger" onClick={() => update((d) => { d.unterschriften = d.unterschriften.filter((x) => x.id !== u.id); })}><Icon name="close" size={12} /></button>
              </div>
            ))}
            {db.unterschriften.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Unterschriften erfasst.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
