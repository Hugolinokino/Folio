import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { StChip } from '../../lib/strategie/StChip';
import { exportJson, exportMarkdown } from '../../lib/strategie/export';
import { useStrategie } from '../../lib/strategie/store';
import type { StrategieViewId } from '../../lib/strategie/modules';
import { stId } from '../../lib/strategie/types';

export function Journal({ onOpen }: { onOpen: (view: StrategieViewId) => void }) {
  const { data, update } = useStrategie();
  const [t, setT] = useState('');
  const [e, setE] = useState('');
  const [b, setB] = useState('');
  const [open, setOpen] = useState(false);

  const add = () => {
    const titel = t.trim();
    if (!titel) return;
    update((d) =>
      d.journal.unshift({
        id: stId('jr'),
        datum: d.meta.heuteLabel,
        titel,
        entscheid: e.trim() || '—',
        begruendung: b.trim() || '—',
        infolage: '— zum Zeitpunkt der Erfassung ergänzen —',
        beteiligte: 'JB',
        erwartung: '—',
        ergebnis: null,
        abweichung: null,
        links: [],
      }),
    );
    setT('');
    setE('');
    setB('');
    setOpen(false);
  };

  return (
    <div className="detail view-in" data-screen-label="Strategie · Gedächtnis">
      <div className="detail-top">
        <div className="detail-head">
          <h1>
            Gedächtnis<span className="ac">.</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost-glass" onClick={() => exportMarkdown(data)}>
            <Icon name="export" size={13} /> Markdown
          </button>
          <button className="btn-ghost-glass" onClick={() => exportJson(data)}>
            <Icon name="export" size={13} /> JSON
          </button>
          <button className="btn-primary-dark" onClick={() => setOpen((o) => !o)}>
            <Icon name="plus" size={13} /> Entscheid protokollieren
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ maxWidth: 860 }}>
          {open && (
            <div className="panel" style={{ marginBottom: 18 }}>
              <div className="panel-head">
                <span className="title">Neuer Journaleintrag</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="st-input"
                  placeholder="Titel des Entscheids …"
                  value={t}
                  onChange={(ev) => setT(ev.target.value)}
                />
                <input
                  className="st-input"
                  placeholder="Was wurde entschieden?"
                  value={e}
                  onChange={(ev) => setE(ev.target.value)}
                />
                <input
                  className="st-input"
                  placeholder="Begründung — warum so?"
                  value={b}
                  onChange={(ev) => setB(ev.target.value)}
                  onKeyDown={(ev) => ev.key === 'Enter' && add()}
                />
                <button className="btn-primary-dark" style={{ alignSelf: 'flex-start' }} onClick={add}>
                  <Icon name="check" size={13} /> Speichern
                </button>
              </div>
            </div>
          )}

          {data.journal.map((j) => (
            <div key={j.id} className="jr-entry">
              <span className="jd">{j.datum}</span>
              <span className="jline">
                <span className="jdot"></span>
              </span>
              <div className="jr-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <span className="jt">{j.titel}</span>
                  {j.ergebnis ? <span className="st-pill ok">Retro vorhanden</span> : <span className="st-pill dim">offen</span>}
                </div>
                <div className="je">{j.entscheid}</div>
                <div className="jf">
                  <b>Begründung</b>
                  <span>{j.begruendung}</span>
                  <b>Infolage</b>
                  <span>{j.infolage}</span>
                  <b>Beteiligte</b>
                  <span>{j.beteiligte}</span>
                </div>
                <div className="retro">
                  <div>
                    <div className="rt-h">Erwartet</div>
                    <div className="rt-x">{j.erwartung}</div>
                  </div>
                  <div>
                    <div className="rt-h">
                      Tatsächlich {j.abweichung && <span style={{ color: 'var(--accent)' }}>· Abweichung {j.abweichung}</span>}
                    </div>
                    <div className="rt-x" style={!j.ergebnis ? { color: 'var(--ink-5)' } : undefined}>
                      {j.ergebnis || 'Noch offen — Retrospektive ausstehend.'}
                    </div>
                  </div>
                </div>
                {j.links.length > 0 && (
                  <div className="st-links">
                    {j.links.map((id) => (
                      <StChip key={id} id={id} onOpen={onOpen} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
