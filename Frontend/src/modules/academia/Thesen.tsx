import { useState } from 'react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/Icon';
import { useTheses } from '../../lib/academia/store';
import type { SourceDto } from '../../lib/academia/api';

interface PointDraft {
  side: 'pro' | 'con';
  text: string;
  sourceId: string;
}

export function Thesen({ projectId, sources }: { projectId: string; sources: SourceDto[] }) {
  const { theses, points, loading, addThesis, addPoint, deleteThesis } = useTheses(projectId);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ claim: '', summary: '', position: '' });
  const [pointDrafts, setPointDrafts] = useState<Record<string, PointDraft>>({});

  const submitThesis = () => {
    if (!form.claim.trim()) return;
    addThesis(form.claim.trim(), form.summary.trim(), form.position.trim());
    setForm({ claim: '', summary: '', position: '' });
    setAdding(false);
  };

  const handleDelete = async (thesisId: string, claim: string) => {
    const ok = await confirm(`These "${claim}" unwiderruflich löschen?`, { title: 'These löschen', kind: 'warning' });
    if (ok) await deleteThesis(thesisId);
  };

  const draftFor = (thesisId: string): PointDraft => pointDrafts[thesisId] || { side: 'pro', text: '', sourceId: '' };
  const setDraft = (thesisId: string, patch: Partial<PointDraft>) => {
    setPointDrafts((d) => ({ ...d, [thesisId]: { ...draftFor(thesisId), ...patch } }));
  };
  const submitPoint = (thesisId: string) => {
    const d = draftFor(thesisId);
    if (!d.text.trim()) return;
    addPoint(thesisId, d.side, d.text.trim(), d.sourceId || null);
    setDraft(thesisId, { text: '', sourceId: '' });
  };

  if (loading) {
    return <div className="panel" style={{ padding: 40 }}><span className="t-sans-sm">Thesen werden geladen …</span></div>;
  }

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '1fr', overflow: 'hidden' }}>
      <div className="panel" style={{ overflow: 'auto' }}>
        <div className="panel-head">
          <span className="title">Thesen-Board</span>
          <button className="btn-ghost-glass" onClick={() => setAdding((a) => !a)}><Icon name="plus" size={12} /> These</button>
        </div>

        {adding && (
          <div className="col" style={{ gap: 6, marginBottom: 16, padding: 10, background: 'var(--fill-1)', borderRadius: 10 }}>
            <input className="input" placeholder="Behauptung / These" value={form.claim} onChange={(e) => setForm((f) => ({ ...f, claim: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submitThesis()} />
            <input className="input" placeholder="Kurzzusammenfassung" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submitThesis()} />
            <input className="input" placeholder="Eigene Position" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submitThesis()} />
            <button className="btn-primary-dark" style={{ alignSelf: 'flex-start' }} onClick={submitThesis}><Icon name="plus" size={13} /> These speichern</button>
          </div>
        )}

        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {theses.map((th, i) => {
              const pro = points.filter((p) => p.thesisId === th.id && p.side === 'pro');
              const con = points.filter((p) => p.thesisId === th.id && p.side === 'con');
              const draft = draftFor(th.id);
              return (
                <div key={th.id} className="thesis-card" style={{ padding: 16 }}>
                  <div className="th-head">
                    <span className="th-num">These {String(i + 1).padStart(2, '0')}</span>
                    <span className="row-flex" style={{ gap: 6 }}>
                      {th.position && <span className="t-mono-sm">{th.position}</span>}
                      <button className="ab danger" title="These löschen" onClick={() => handleDelete(th.id, th.claim)}><Icon name="close" size={12} /></button>
                    </span>
                  </div>
                  <div className="th-title">{th.claim}</div>
                  {th.summary && <div className="th-body">{th.summary}</div>}

                  <div className="pro-con">
                    <div className="pc-col">
                      <div className="pc-h pro">▸ Pro</div>
                      {pro.map((p) => (
                        <div key={p.id} className="pc-item">
                          {p.text}
                          {p.sourceId && <span className="src">— {sources.find((s) => s.id === p.sourceId)?.citationKey || p.sourceId}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="pc-col">
                      <div className="pc-h con">▸ Contra</div>
                      {con.map((p) => (
                        <div key={p.id} className="pc-item">
                          {p.text}
                          {p.sourceId && <span className="src">— {sources.find((s) => s.id === p.sourceId)?.citationKey || p.sourceId}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row-flex" style={{ gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                    <select className="input" style={{ height: 24, fontSize: 10, width: 70 }} value={draft.side} onChange={(e) => setDraft(th.id, { side: e.target.value as 'pro' | 'con' })}>
                      <option value="pro">Pro</option>
                      <option value="con">Contra</option>
                    </select>
                    <input
                      className="input"
                      style={{ height: 24, fontSize: 11, flex: 1, minWidth: 100 }}
                      placeholder="Argument …"
                      value={draft.text}
                      onChange={(e) => setDraft(th.id, { text: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && submitPoint(th.id)}
                    />
                    <select className="input" style={{ height: 24, fontSize: 10, width: 90 }} value={draft.sourceId} onChange={(e) => setDraft(th.id, { sourceId: e.target.value })}>
                      <option value="">Quelle</option>
                      {sources.map((s) => <option key={s.id} value={s.id}>{s.citationKey}</option>)}
                    </select>
                    <button className="btn-ghost-glass" style={{ height: 24 }} onClick={() => submitPoint(th.id)}><Icon name="plus" size={11} /></button>
                  </div>
                </div>
              );
            })}
            {theses.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Thesen.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
