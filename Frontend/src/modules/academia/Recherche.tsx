import { useState } from 'react';
import { Icon } from '../../components/Icon';
import type { useProjectWorkspace } from '../../lib/academia/store';

type Workspace = ReturnType<typeof useProjectWorkspace>;

const DATABASES = [
  { id: 'opencaselaw', nm: 'opencaselaw', sl: 'rechtsprechung CH-weit', de: 'BGer, Kantonsgerichte, Volltextsuche' },
  { id: 'bge-search', nm: 'bge-search', sl: 'amtliche sammlung', de: 'Bundesgerichtsentscheide systematisch' },
  { id: 'entscheidsuche', nm: 'entscheidsuche', sl: 'kantonale entscheide', de: 'Föderierte Suche über alle Kantone' },
  { id: 'fedlex', nm: 'fedlex', sl: 'erlasssammlung des bundes', de: 'BV, OR, ZGB, StGB — konsolidiert' },
  { id: 'onlinekommentar', nm: 'onlinekommentar', sl: 'doktrin · kommentare', de: 'Open-Access-Kommentare zum CH-Recht' },
  { id: 'legal-citations', nm: 'legal-citations', sl: 'zitationsnetzwerk', de: 'Welche Entscheide werden wie oft zitiert?' },
];

const SOURCE_TYPES = ['BGE', 'Literatur', 'Gesetz', 'Materialien'];

/** Board 03 — UI shell only. The compiled app has no path to live external
 * legal databases (no API credentials, no MCP access at runtime), so this
 * stays honestly disabled rather than faking search results. The one real
 * feature: manually captured hits become real Bibliothek sources. */
export function Recherche({ addSource }: { addSource: Workspace['addSource'] }) {
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ type: 'BGE', citationKey: '', title: '', author: '', year: '', annotation: '' });

  const submit = () => {
    if (!form.title.trim()) return;
    addSource(
      form.type,
      form.citationKey.trim() || form.title.trim(),
      form.title.trim(),
      form.author.trim(),
      form.year ? Number(form.year) : null,
      form.annotation.trim(),
    );
    setForm((f) => ({ ...f, citationKey: '', title: '', author: '', year: '', annotation: '' }));
  };

  return (
    <div className="detail-body" style={{ gridTemplateRows: 'auto 1fr', gridTemplateColumns: '1fr' }}>
      <div className="panel" style={{ padding: '16px 18px' }}>
        <div className="row-flex" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="title t-h3">Unified Search</span>
          <span className="t-mono-sm">noch nicht angebunden</span>
        </div>
        <div className="search" style={{ padding: '14px 18px', opacity: 0.6 }}>
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchbegriff …" disabled />
        </div>
      </div>

      <div className="grid-l-r" style={{ minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head"><span className="title">Datenbanken</span></div>
          <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
            <div className="col" style={{ gap: 10 }}>
              {DATABASES.map((d) => (
                <div key={d.id} className="db-tile" style={{ opacity: 0.55, cursor: 'default' }}>
                  <div className="row-flex" style={{ justifyContent: 'space-between' }}>
                    <div className="col" style={{ gap: 2 }}>
                      <span className="nm">{d.nm}</span>
                      <span className="sl">{d.sl}</span>
                    </div>
                    <span className="pill">noch nicht angebunden</span>
                  </div>
                  <div className="de">{d.de}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="title">Treffer manuell erfassen</span></div>
          <p className="t-sans-sm" style={{ marginBottom: 14 }}>
            Solange keine Datenbank angebunden ist, lässt sich ein Treffer direkt als echte Quelle in der Bibliothek erfassen.
          </p>
          <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            <select className="input" style={{ flex: '0 0 130px' }} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input" style={{ flex: 2 }} placeholder="Titel" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Autor" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            <input className="input" type="number" style={{ flex: '0 0 90px' }} placeholder="Jahr" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
            <input className="input" style={{ flex: 1 }} placeholder="Zitat-Key" value={form.citationKey} onChange={(e) => setForm((f) => ({ ...f, citationKey: e.target.value }))} />
            <input className="input" style={{ flex: 2 }} placeholder="Anmerkung" value={form.annotation} onChange={(e) => setForm((f) => ({ ...f, annotation: e.target.value }))} />
            <button className="btn-primary-dark" onClick={submit}><Icon name="plus" size={13} /> Als Quelle speichern</button>
          </div>
        </div>
      </div>
    </div>
  );
}
