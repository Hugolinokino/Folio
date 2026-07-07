import { useMemo, useState } from 'react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/Icon';
import { useOutline } from '../../lib/academia/store';
import type { OutlineNodeDto, SourceDto } from '../../lib/academia/api';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

function numberFor(depth: number, index: number): string {
  if (depth === 0) return ROMAN[index] || String(index + 1);
  if (depth === 1) return String(index + 1);
  return ALPHA[index] || String(index + 1);
}

interface TreeRow {
  id: string;
  title: string;
  depth: number;
  number: string;
}

/** Numbering (I/II · 1/2 · a/b) is computed from tree depth + sibling index — never
 * stored — so it always stays correct after nodes are added, with no renumbering step. */
function buildTree(nodes: OutlineNodeDto[]): TreeRow[] {
  const byParent = new Map<string | null, OutlineNodeDto[]>();
  for (const n of nodes) {
    const key = n.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(n);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);

  const rows: TreeRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    const children = byParent.get(parentId) || [];
    children.forEach((n, i) => {
      rows.push({ id: n.id, title: n.title, depth, number: numberFor(depth, i) });
      walk(n.id, depth + 1);
    });
  };
  walk(null, 0);
  return rows;
}

export function Gliederung({ projectId, sources }: { projectId: string; sources: SourceDto[] }) {
  const { nodes, points, loading, addNode, addArgument, linkSource, unlinkSource, deleteNode } = useOutline(projectId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newArgText, setNewArgText] = useState('');

  const rows = useMemo(() => buildTree(nodes), [nodes]);
  const selected = rows.find((r) => r.id === selectedId) || rows[0] || null;
  const selectedArgs = points.filter((p) => p.nodeId === selected?.id);
  const gaps = points.filter((p) => p.sourceIds.length === 0);

  const handleDeleteNode = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    const ok = await confirm(`Gliederungspunkt "${title}" inkl. Unterpunkte und Argumente unwiderruflich löschen?`, { title: 'Gliederungspunkt löschen', kind: 'warning' });
    if (!ok) return;
    if (selectedId === id) setSelectedId(null);
    await deleteNode(id);
  };

  const submitNode = () => {
    if (!newNodeTitle.trim()) return;
    addNode(selected?.id ?? null, newNodeTitle.trim());
    setNewNodeTitle('');
  };

  const submitArgument = () => {
    if (!selected || !newArgText.trim()) return;
    addArgument(selected.id, newArgText.trim());
    setNewArgText('');
  };

  if (loading) {
    return <div className="panel" style={{ padding: 40 }}><span className="t-sans-sm">Gliederung wird geladen …</span></div>;
  }

  return (
    <div className="detail-body" style={{ gridTemplateColumns: '320px 1fr 320px' }}>
      <div className="panel">
        <div className="panel-head"><span className="title">Kapitelstruktur</span></div>
        <div className="scroll" style={{ overflow: 'auto', flex: 1 }}>
          <div className="tree">
            {rows.map((r) => (
              <div
                key={r.id}
                className={`node l${Math.min(r.depth + 1, 3)} ${selected?.id === r.id ? 'on' : ''}`}
                onClick={() => setSelectedId(r.id)}
              >
                <span className="num">{r.number}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                <button className="ab danger" title="Löschen" onClick={(e) => handleDeleteNode(e, r.id, r.title)}><Icon name="close" size={11} /></button>
              </div>
            ))}
            {rows.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Noch keine Gliederungspunkte.</div>}
          </div>
        </div>
        <div className="divider" style={{ margin: '12px 0' }}></div>
        <div className="row-flex" style={{ gap: 6 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder={selected ? `Unterpunkt von ${selected.number} …` : 'Neuer Hauptpunkt …'}
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNode()}
          />
          <button className="btn-ghost-glass" onClick={submitNode}><Icon name="plus" size={12} /></button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="title">{selected ? `${selected.number} — ${selected.title}` : 'Kein Punkt ausgewählt'}</span>
        </div>
        {selected ? (
          <div className="col scroll" style={{ gap: 14, padding: '4px 4px', overflow: 'auto', flex: 1 }}>
            <div className="t-mono-sm">Argumentationslinie</div>
            <div className="col" style={{ gap: 8 }}>
              {selectedArgs.map((a, i) => (
                <div key={a.id} className="thesis-card">
                  <div className="th-head">
                    <span className="th-num">Argument {i + 1}</span>
                  </div>
                  <div className="th-title">{a.text}</div>
                  <div className="th-foot">
                    {a.sourceIds.length === 0 && (
                      <span className="chip" style={{ height: 22, fontSize: 9.5, color: 'var(--accent-red)' }}>ohne Quelle</span>
                    )}
                    {a.sourceIds.map((sid) => {
                      const src = sources.find((s) => s.id === sid);
                      return (
                        <span
                          key={sid}
                          className="chip"
                          style={{ height: 22, fontSize: 9.5, cursor: 'pointer' }}
                          title="Klicken zum Entfernen"
                          onClick={() => unlinkSource(a.id, sid)}
                        >
                          {src?.citationKey || sid} ✕
                        </span>
                      );
                    })}
                    <select
                      className="input"
                      style={{ height: 22, fontSize: 9.5, width: 150 }}
                      value=""
                      onChange={(e) => { if (e.target.value) linkSource(a.id, e.target.value); }}
                    >
                      <option value="">+ Quelle verknüpfen</option>
                      {sources.filter((s) => !a.sourceIds.includes(s.id)).map((s) => (
                        <option key={s.id} value={s.id}>{s.citationKey}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {selectedArgs.length === 0 && <div className="t-sans-sm">Noch keine Argumente.</div>}
            </div>
            <div className="row-flex" style={{ gap: 6 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Neues Argument …"
                value={newArgText}
                onChange={(e) => setNewArgText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitArgument()}
              />
              <button className="btn-ghost-glass" onClick={submitArgument}><Icon name="plus" size={12} /></button>
            </div>
          </div>
        ) : (
          <div className="t-sans-sm" style={{ padding: 16 }}>Links einen Gliederungspunkt anlegen.</div>
        )}
      </div>

      <div className="col" style={{ gap: 16, minHeight: 0 }}>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head"><span className="title">Lücken-Check</span></div>
          <div className="col scroll" style={{ gap: 8, overflow: 'auto', flex: 1 }}>
            {gaps.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Kein Argument ohne Quelle.</div>}
            {gaps.map((g) => {
              const node = nodes.find((n) => n.id === g.nodeId);
              return (
                <div key={g.id} className="callout">
                  <div className="ch">▸ {node?.title || 'Argument'} ohne Quelle</div>
                  <span style={{ color: 'var(--ink-2)' }}>{g.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
