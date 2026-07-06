/* Strategy Hub — Modul 06: Execution-Brücke
   Kaskade Option → Initiative → Meilensteine · Kennzahlen · Kill-Kriterien-Register */
const { useState: useEx } = React;

const INI_NEXT = { geplant: 'laufend', laufend: 'abgeschlossen', abgeschlossen: 'gestoppt', gestoppt: 'geplant' };
const INI_PILL = { geplant: 'dim', laufend: 'ok', abgeschlossen: '', gestoppt: 'hot' };
const KILL_NEXT = { ok: 'beobachten', beobachten: 'ausgelöst', 'ausgelöst': 'ok' };
const KILL_PILL = { ok: 'dim', beobachten: 'warm', 'ausgelöst': 'hot' };

function StExecution({ onOpen }) {
  const db = useStDb();
  const kills = db.initiativen.flatMap((i) => i.kill.map((k, idx) => ({ ...k, ini: i, idx })));

  const cycleKill = (iniId, idx) => stUpdate((d) => {
    const ini = d.initiativen.find((x) => x.id === iniId);
    const k = ini.kill[idx];
    k.status = KILL_NEXT[k.status];
    if (k.status === 'ausgelöst') ini.status = 'gestoppt';
  });

  return (
    <div className="detail view-in" data-screen-label="Strategie · Umsetzung">
      <div className="detail-top">
        <div className="detail-head">
          <h1>Umsetzung<span className="ac">.</span></h1>
        </div>
        <button className="btn-ghost-glass" onClick={() => onOpen && onOpen('s-optionen')}><Icon name="columns" size={13} /> Zu den Optionen</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {db.initiativen.map((ini) => (
            <div key={ini.id} className="ini-card" style={ini.status === 'gestoppt' ? { opacity: 0.72 } : undefined}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span className="ic-t">{ini.titel}</span>
                <span className={`st-pill click ${INI_PILL[ini.status]}`} title="Status wechseln"
                  onClick={() => stUpdate((d) => { const t = d.initiativen.find((x) => x.id === ini.id); t.status = INI_NEXT[t.status]; })}>{ini.status}</span>
              </div>
              <div className="st-links"><StChip id={ini.option} onOpen={onOpen} /></div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 3 }}>Meilensteine</div>
                {ini.meilensteine.map((m, i) => (
                  <div key={i} className={`ms-row ${m.done ? 'done' : ''}`} style={{ cursor: 'pointer' }}
                    onClick={() => stUpdate((d) => { const t = d.initiativen.find((x) => x.id === ini.id); t.meilensteine[i].done = !t.meilensteine[i].done; })}>
                    <span className={`zug-dot ${m.done ? 'erledigt' : ''}`}>{m.done && <Icon name="check" size={9} />}</span>
                    <span style={{ flex: 1 }}>{m.titel}</span>
                    <span className="md2">{m.datum}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ini.kennzahlen.map((k, i) => {
                  const ratio = Math.min(1, k.ist / k.ziel);
                  return (
                    <div key={i} className="kpi">
                      <div className="kp-h"><span>{k.name}</span><b>{k.ist}{k.einheit} <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>/ Ziel {k.ziel}{k.einheit}</span></b></div>
                      <div className="kp-bar"><i style={{ transform: `scaleX(${ratio})`, background: ratio >= 1 ? 'var(--ink-2)' : 'var(--accent)' }}></i></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ flexShrink: 0 }}>
          <div className="panel-head">
            <span className="title">Kill-Kriterien-Register</span>
          </div>
          {kills.map((k, i) => (
            <div key={i} className="kill-row">
              <span className={`st-pill click ${KILL_PILL[k.status]}`} onClick={() => cycleKill(k.ini.id, k.idx)}>{k.status}</span>
              <span className="kl-t">{k.text}</span>
              <span className="kl-i">{k.ini.titel}</span>
            </div>
          ))}
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-4)', margin: '12px 0 0', lineHeight: 1.5 }}>
            Ein ausgelöstes Kill-Kriterium stoppt die Initiative automatisch — die Begründung gehört ins Entscheidungsjournal.
          </p>
        </div>
      </div>
    </div>
  );
}

window.StExecution = StExecution;
