import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { daysUntil, formatDateDe, todayIso } from '../../lib/praxis/format';
import { gvId, type KonfliktStatus } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const IK_STATUS: Record<KonfliktStatus, string> = { aktiv: 'warm', 'prüfen': 'hot', unbedenklich: 'ok' };

const KA_FORM = { titel: '', dueDate: '', organ: '', quelle: '', rhythmus: 'einmalig' };
const IK_FORM = { rolle: '', konflikt: '', regel: '', offenlegung: '', status: 'prüfen' as KonfliktStatus };

export function GvCompliance({ onOpen: _onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [tab, setTab] = useState<'kalender' | 'konflikte'>('kalender');
  const [addingKa, setAddingKa] = useState(false);
  const [kaForm, setKaForm] = useState({ ...KA_FORM, dueDate: todayIso() });
  const [addingIk, setAddingIk] = useState(false);
  const [ikForm, setIkForm] = useState(IK_FORM);

  const kal = db.kalender
    .map((k) => ({ ...k, tage: daysUntil(k.dueDateIso), datum: formatDateDe(k.dueDateIso) }))
    .sort((a, b) => a.tage - b.tage);

  const submitKalender = () => {
    if (!kaForm.titel.trim() || !kaForm.dueDate) return;
    update((d) => { d.kalender.push({ id: gvId('ka'), titel: kaForm.titel.trim(), dueDateIso: kaForm.dueDate, organ: kaForm.organ, quelle: kaForm.quelle.trim(), rhythmus: kaForm.rhythmus.trim() || 'einmalig' }); });
    setKaForm({ ...KA_FORM, dueDate: todayIso() });
    setAddingKa(false);
  };

  const submitKonflikt = () => {
    if (!ikForm.rolle.trim() || !ikForm.konflikt.trim()) return;
    update((d) => { d.konflikte.push({ id: gvId('ik'), rolle: ikForm.rolle.trim(), konflikt: ikForm.konflikt.trim(), regel: ikForm.regel.trim(), offenlegung: ikForm.offenlegung.trim(), status: ikForm.status }); });
    setIkForm(IK_FORM);
    setAddingIk(false);
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Compliance">
      <div className="detail-top">
        <div className="detail-head"><h1>Compliance<span className="ac">.</span></h1></div>
        <div className="tabs">
          {([['kalender', 'Pflichten-Kalender'], ['konflikte', 'Interessenkonflikte']] as const).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
        <div className="spacer"></div>
        {tab === 'kalender'
          ? <button className="btn-primary-dark" onClick={() => setAddingKa((a) => !a)}><Icon name="plus" size={13} /> Termin</button>
          : <button className="btn-primary-dark" onClick={() => setAddingIk((a) => !a)}><Icon name="plus" size={13} /> Eintrag</button>}
      </div>

      {addingKa && tab === 'kalender' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 2 }} placeholder="Titel" value={kaForm.titel} onChange={(ev) => setKaForm((f) => ({ ...f, titel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKalender()} />
            <input className="input" type="date" style={{ flex: '0 0 150px' }} value={kaForm.dueDate} onChange={(ev) => setKaForm((f) => ({ ...f, dueDate: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKalender()} />
            <select className="input" style={{ flex: 1 }} value={kaForm.organ} onChange={(ev) => setKaForm((f) => ({ ...f, organ: ev.target.value }))}>
              <option value="">Organ …</option>
              {db.organe.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input className="input" style={{ flex: 1 }} placeholder="Quelle" value={kaForm.quelle} onChange={(ev) => setKaForm((f) => ({ ...f, quelle: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKalender()} />
            <input className="input" style={{ flex: '0 0 130px' }} placeholder="Rhythmus" value={kaForm.rhythmus} onChange={(ev) => setKaForm((f) => ({ ...f, rhythmus: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKalender()} />
            <button className="btn-primary-dark" onClick={submitKalender}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      {addingIk && tab === 'konflikte' && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Rolle / Person" value={ikForm.rolle} onChange={(ev) => setIkForm((f) => ({ ...f, rolle: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKonflikt()} />
            <input className="input" style={{ flex: 2 }} placeholder="Konflikt" value={ikForm.konflikt} onChange={(ev) => setIkForm((f) => ({ ...f, konflikt: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKonflikt()} />
            <input className="input" style={{ flex: 1 }} placeholder="Regel" value={ikForm.regel} onChange={(ev) => setIkForm((f) => ({ ...f, regel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKonflikt()} />
            <input className="input" style={{ flex: 1 }} placeholder="Offenlegung" value={ikForm.offenlegung} onChange={(ev) => setIkForm((f) => ({ ...f, offenlegung: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submitKonflikt()} />
            <select className="input" style={{ flex: '0 0 130px' }} value={ikForm.status} onChange={(ev) => setIkForm((f) => ({ ...f, status: ev.target.value as KonfliktStatus }))}>
              <option value="aktiv">aktiv</option>
              <option value="prüfen">prüfen</option>
              <option value="unbedenklich">unbedenklich</option>
            </select>
            <button className="btn-primary-dark" onClick={submitKonflikt}><Icon name="plus" size={13} /> Speichern</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'kalender' && (
          <div className="radar">
            {kal.map((k) => {
              const o = db.organe.find((x) => x.id === k.organ);
              return (
                <div key={k.id} className="radar-row" style={{ cursor: 'default' }}>
                  <span className={`countdown ${k.tage < 0 ? 'hot' : k.tage <= 30 ? 'warm' : ''}`}>{k.tage < 0 ? 'fällig' : `${k.tage} T`}</span>
                  <div className="col" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="rr-t">{k.titel}</span>
                    <span className="rr-m">{o ? o.name : '—'} · {k.quelle}</span>
                  </div>
                  <span className="frist-art">{k.rhythmus}</span>
                  <span className="rr-d">{k.datum}</span>
                  <button className="ab danger" onClick={() => update((d) => { d.kalender = d.kalender.filter((x) => x.id !== k.id); })}><Icon name="close" size={12} /></button>
                </div>
              );
            })}
            {kal.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Pflichttermine erfasst.</div>}
          </div>
        )}

        {tab === 'konflikte' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            {db.konflikte.map((k) => (
              <div key={k.id} className="gv-bf-row">
                <span className={`st-pill ${IK_STATUS[k.status]}`}>{k.status}</span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="bf-t"><b>{k.rolle}</b></span>
                  <span className="bf-x">{k.konflikt}</span>
                  <span className="bf-x" style={{ color: 'var(--ink-4)' }}>Regel: {k.regel || '—'} · Offenlegung: {k.offenlegung || '—'}</span>
                </div>
                <button className="ab danger" onClick={() => update((d) => { d.konflikte = d.konflikte.filter((x) => x.id !== k.id); })}><Icon name="close" size={12} /></button>
              </div>
            ))}
            {db.konflikte.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Interessenkonflikte erfasst.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
