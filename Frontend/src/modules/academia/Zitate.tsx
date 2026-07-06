import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useQuotes } from '../../lib/academia/store';
import type { QuoteDto, SourceDto } from '../../lib/academia/api';

export function Zitate({ projectId, sources }: { projectId: string; sources: SourceDto[] }) {
  const { quotes, loading, addQuote } = useQuotes(projectId);
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const [form, setForm] = useState({ sourceId: '', text: '', cluster: '', tag: '' });

  const clusters = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of quotes) {
      const key = q.cluster || 'Ohne Cluster';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries());
  }, [quotes]);

  const visible = clusterFilter ? quotes.filter((q) => (q.cluster || 'Ohne Cluster') === clusterFilter) : quotes;
  const grouped = useMemo(() => {
    const map = new Map<string, QuoteDto[]>();
    for (const q of visible) {
      const key = q.cluster || 'Ohne Cluster';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    }
    return Array.from(map.entries());
  }, [visible]);

  const submit = () => {
    if (!form.sourceId || !form.text.trim()) return;
    addQuote(form.sourceId, form.text.trim(), form.cluster.trim(), form.tag.trim());
    setForm((f) => ({ ...f, text: '', tag: '' }));
  };

  if (loading) {
    return <div className="panel" style={{ padding: 40 }}><span className="t-sans-sm">Zitate werden geladen …</span></div>;
  }

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '260px 1fr' }}>
      <div className="panel">
        <div className="panel-head"><span className="title">Themen-Cluster</span></div>
        <div className="sidelist">
          <div className={`it ${!clusterFilter ? 'on' : ''}`} onClick={() => setClusterFilter(null)}>
            <div className="col" style={{ flex: 1, gap: 2 }}>
              <span>Alle</span>
              <span className="t-mono-sm">{quotes.length} zitate</span>
            </div>
          </div>
          {clusters.map(([name, count]) => (
            <div key={name} className={`it ${clusterFilter === name ? 'on' : ''}`} onClick={() => setClusterFilter(name)}>
              <span className="c"></span>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span>{name}</span>
                <span className="t-mono-sm">{count} zitate</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: '12px 0' }}></div>
        <div className="t-mono-sm" style={{ marginBottom: 8 }}>Neues Zitat</div>
        <div className="col" style={{ gap: 6 }}>
          <select className="input" value={form.sourceId} onChange={(e) => setForm((f) => ({ ...f, sourceId: e.target.value }))}>
            <option value="">Quelle wählen …</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.citationKey}</option>)}
          </select>
          <input className="input" placeholder="Zitat-Text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <input className="input" placeholder="Cluster (Thema)" value={form.cluster} onChange={(e) => setForm((f) => ({ ...f, cluster: e.target.value }))} />
          <input className="input" placeholder="Tag" value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} />
          <button className="btn-ghost-glass" style={{ justifyContent: 'center' }} onClick={submit}><Icon name="plus" size={12} /> Zitat erfassen</button>
        </div>
      </div>

      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-head"><span className="title">Zitatsammlung</span></div>
        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          {grouped.map(([name, qs]) => (
            <div key={name}>
              <div className="cluster-h">
                <span className="cl-t">{name}</span>
                <span className="cl-c">{qs.length} zitate</span>
              </div>
              <div className="col" style={{ gap: 10, marginBottom: 6 }}>
                {qs.map((q) => {
                  const src = sources.find((s) => s.id === q.sourceId);
                  return (
                    <div key={q.id} className="quote-card">
                      <div className="q-text">{q.text}</div>
                      <div className="q-foot">
                        <span className="q-src">{src?.citationKey || q.sourceId}</span>
                        {q.tag && (
                          <div className="q-tags"><span className="chip" style={{ height: 22, fontSize: 9.5 }}>{q.tag}</span></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {grouped.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Zitate.</div>}
        </div>
      </div>
    </div>
  );
}
