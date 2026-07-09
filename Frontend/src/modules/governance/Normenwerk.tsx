import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { formatDateDe } from '../../lib/praxis/format';
import { gvId, type Erlass, type ErlassStatus, type Mandat } from '../../lib/governance/types';
import type { GovernanceViewId } from '../../lib/governance/modules';

const GV_STATUS_META: Record<ErlassStatus, { label: string; cls: string }> = {
  'in-kraft': { label: 'in Kraft', cls: 'ok' },
  revision: { label: 'Revision überfällig', cls: 'warm' },
  problem: { label: 'Ermächtigung fehlt', cls: 'hot' },
};

/** Deletes an Erlass and clears any dangling references (child basisRef, Verweise, Befunde) so the tree/graph never points at a ghost id. */
function removeErlass(d: Mandat, id: string) {
  d.erlasse = d.erlasse.filter((e) => e.id !== id);
  d.erlasse.forEach((e) => { if (e.basisRef === id) e.basisRef = null; });
  d.verweise = d.verweise.filter((v) => v.von !== id && v.nach !== id);
  d.befunde = d.befunde.filter((b) => b.erlass !== id);
}

function NwNode({ e, sel, onSel, onDelete, db }: { e: Erlass; sel: string | null; onSel: (id: string) => void; onDelete: (e: Erlass) => void; db: Mandat }) {
  const kinder = db.erlasse.filter((k) => k.basisRef === e.id);
  return (
    <div className="nw-branch">
      <div className={`nw-node ${sel === e.id ? 'on' : ''} ${e.status === 'problem' ? 'bad' : ''}`} onClick={() => onSel(e.id)}>
        <span className="nn-k">{e.kurz}</span>
        <span className="nn-t">{e.titel}</span>
        <span className="nn-b">{e.basis ? `← ${e.basis}` : '⚠ keine Ermächtigungsgrundlage'}</span>
        <button className="ab danger" title="Erlass löschen" onClick={(ev) => { ev.stopPropagation(); onDelete(e); }}><Icon name="close" size={11} /></button>
      </div>
      {kinder.length > 0 && (
        <div className="nw-children">
          {kinder.map((k) => <NwNode key={k.id} e={k} sel={sel} onSel={onSel} onDelete={onDelete} db={db} />)}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { kurz: '', titel: '', typ: 'Reglement', stufe: '2', organ: '', basis: '', basisRef: '', status: 'in-kraft' as ErlassStatus, artikel: '', erlassDate: '', revisionDate: '' };

export function GvNormen({ onOpen }: { onOpen: (v: GovernanceViewId) => void }) {
  const { data: db, update } = useGovernance();
  const [tab, setTab] = useState<'baum' | 'register'>('baum');
  const [sel, setSel] = useState<string | null>(db.erlasse[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const e = db.erlasse.find((x) => x.id === sel) || null;
  const wurzeln = db.erlasse.filter((x) => x.stufe === 1);
  const waisen = db.erlasse.filter((x) => x.stufe > 1 && !x.basisRef);

  const submit = () => {
    if (!form.titel.trim() || !form.kurz.trim()) return;
    const id = gvId('gov');
    update((d) => {
      d.erlasse.push({
        id,
        kurz: form.kurz.trim(),
        titel: form.titel.trim(),
        typ: form.typ.trim() || 'Reglement',
        stufe: Number(form.stufe) || 2,
        organ: form.organ.trim(),
        basis: form.basis.trim(),
        basisRef: form.basisRef || null,
        status: form.status,
        artikel: form.artikel ? Number(form.artikel) : 0,
        erlass: form.erlassDate,
        revision: form.revisionDate || form.erlassDate,
        versionen: form.erlassDate ? [{ datum: formatDateDe(form.erlassDate), hinweis: 'Erlass erfasst' }] : [],
      });
    });
    setForm(EMPTY_FORM);
    setAdding(false);
    setSel(id);
  };

  const handleDelete = (target: Erlass) => {
    update((d) => removeErlass(d, target.id));
    if (sel === target.id) setSel(null);
  };

  return (
    <div className="detail view-in" data-screen-label="Governance · Normenwerk">
      <div className="detail-top">
        <div className="detail-head"><h1>Normenwerk<span className="ac">.</span></h1></div>
        <div className="tabs">
          {([['baum', 'Normhierarchie'], ['register', 'Erlass-Register']] as const).map(([id, l]) => (
            <span key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</span>
          ))}
        </div>
        <div className="spacer"></div>
        <button className="btn-primary-dark" onClick={() => setAdding((a) => !a)}><Icon name="plus" size={13} /> Erlass</button>
      </div>

      {adding && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="col" style={{ gap: 6 }}>
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: '0 0 90px' }} placeholder="Kürzel" value={form.kurz} onChange={(ev) => setForm((f) => ({ ...f, kurz: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 2 }} placeholder="Titel" value={form.titel} onChange={(ev) => setForm((f) => ({ ...f, titel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 1 }} placeholder="Typ (z.B. Reglement)" value={form.typ} onChange={(ev) => setForm((f) => ({ ...f, typ: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <select className="input" style={{ flex: '0 0 130px' }} value={form.stufe} onChange={(ev) => setForm((f) => ({ ...f, stufe: ev.target.value }))}>
                <option value="1">Stufe 1 · Grundlage</option>
                <option value="2">Stufe 2 · Reglement</option>
                <option value="3">Stufe 3 · Subdelegation</option>
              </select>
              <select className="input" style={{ flex: '0 0 130px' }} value={form.status} onChange={(ev) => setForm((f) => ({ ...f, status: ev.target.value as ErlassStatus }))}>
                <option value="in-kraft">in Kraft</option>
                <option value="revision">Revision überfällig</option>
                <option value="problem">Ermächtigung fehlt</option>
              </select>
            </div>
            <div className="row-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 1 }} placeholder="Erlassorgan" value={form.organ} onChange={(ev) => setForm((f) => ({ ...f, organ: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <input className="input" style={{ flex: 2 }} placeholder="Ermächtigungsgrundlage (z.B. Art. 21 ST)" value={form.basis} onChange={(ev) => setForm((f) => ({ ...f, basis: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <select className="input" style={{ flex: 1 }} value={form.basisRef} onChange={(ev) => setForm((f) => ({ ...f, basisRef: ev.target.value }))}>
                <option value="">— kein übergeordneter Erlass —</option>
                {db.erlasse.map((x) => <option key={x.id} value={x.id}>{x.kurz} — {x.titel}</option>)}
              </select>
              <input className="input" type="number" style={{ flex: '0 0 100px' }} placeholder="Artikel" value={form.artikel} onChange={(ev) => setForm((f) => ({ ...f, artikel: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <input className="input" type="date" style={{ flex: '0 0 150px' }} value={form.erlassDate} onChange={(ev) => setForm((f) => ({ ...f, erlassDate: ev.target.value }))} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Speichern</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'baum' && (
          <div className="nw-wrap">
            <div className="nw-tree">
              {wurzeln.length === 0 && waisen.length === 0 && (
                <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Erlasse erfasst.</div>
              )}
              <div className="nw-children">
                {wurzeln.map((w) => <NwNode key={w.id} e={w} sel={sel} onSel={setSel} onDelete={handleDelete} db={db} />)}
                {waisen.map((w) => <NwNode key={w.id} e={w} sel={sel} onSel={setSel} onDelete={handleDelete} db={db} />)}
              </div>
            </div>
            <div className="panel" style={{ overflow: 'auto' }}>
              <div className="panel-head"><span className="title">Erlassprofil</span></div>
              {e && (
                <div className="ak-detail">
                  <div>
                    <div className="ad-name">{e.titel}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                      <span className={`st-pill ${GV_STATUS_META[e.status].cls}`}>{GV_STATUS_META[e.status].label}</span>
                      <span className="st-pill dim">{e.typ}</span>
                      <span className="st-pill dim">Stufe {e.stufe}</span>
                    </div>
                  </div>
                  <div><div className="ad-sec">Ermächtigungsgrundlage</div><div className="ad-txt">{e.basis || 'Keine'}</div></div>
                  <div><div className="ad-sec">Erlassorgan</div><div className="ad-txt">{e.organ || '—'}</div></div>
                  <div><div className="ad-sec">Revisionsstand</div><div className="ad-txt">{e.revision ? formatDateDe(e.revision) : '—'} · {e.artikel} Artikel</div></div>
                  {e.versionen.length > 0 && (
                    <div>
                      <div className="ad-sec">Versionen</div>
                      {e.versionen.map((v, i) => (
                        <div key={i} className="nw-ver"><span className="nv-d">{v.datum}</span><span className="nv-h">{v.hinweis}</span></div>
                      ))}
                    </div>
                  )}
                  <button className="btn-ghost-glass" style={{ alignSelf: 'flex-start' }} onClick={() => onOpen('g-netz')}>
                    <Icon name="graph" size={13} /> Im Verweisnetz zeigen
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'register' && (
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="gv-reg-row gv-reg-head">
              <span>Kürzel</span><span>Erlass</span><span>Typ</span><span>Erlassorgan</span><span>Rechtsgrundlage</span><span>Revision</span><span>Status</span><span></span>
            </div>
            {db.erlasse.map((x) => (
              <div key={x.id} className={`gv-reg-row ${sel === x.id ? 'on' : ''}`} onClick={() => { setSel(x.id); setTab('baum'); }}>
                <span className="rg-k">{x.kurz}</span>
                <span className="rg-t">{x.titel}</span>
                <span className="rg-m">{x.typ}</span>
                <span className="rg-m">{x.organ || '—'}</span>
                <span className="rg-m">{x.basis || '⚠ keine'}</span>
                <span className="rg-m">{x.revision ? formatDateDe(x.revision) : '—'}</span>
                <span><span className={`st-pill ${GV_STATUS_META[x.status].cls}`}>{GV_STATUS_META[x.status].label}</span></span>
                <button className="ab danger" title="Erlass löschen" onClick={(ev) => { ev.stopPropagation(); handleDelete(x); }}><Icon name="close" size={12} /></button>
              </div>
            ))}
            {db.erlasse.length === 0 && <div className="t-sans-sm" style={{ padding: 12 }}>Noch keine Erlasse erfasst.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
