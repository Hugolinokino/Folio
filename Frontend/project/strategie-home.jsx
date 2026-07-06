/* Strategy Hub — Startseite: Lagebild · Werkbank · Schnellaktionen */

const ST_MODULE = [
  { id: 's-analyse', num: '01', titel: 'Analyse', icon: 'grid', desc: 'SWOT/TOWS, Stakeholder-Matrix, PESTEL — die Diagnose.', count: (d) => `${d.akteure.length} Akteure · ${['S','W','O','T'].reduce((s, k) => s + d.swot[k].length, 0)} SWOT-Punkte` },
  { id: 's-foresight', num: '02', titel: 'Foresight', icon: 'sparkle', desc: 'Trend-Radar, Weak Signals, Assumption Log.', count: (d) => `${d.faktoren.length} Faktoren · ${d.annahmen.length} Annahmen` },
  { id: 's-timeline', num: '03', titel: 'Zukunftslinien', icon: 'graph', desc: 'Mehrsträngige Szenarien mit Backcasting bis 2031.', count: (d) => `${d.straenge.length} Stränge · ${d.entscheidungspunkte.length} Entscheidungspunkte` },
  { id: 's-optionen', num: '04', titel: 'Optionen & Entscheid', icon: 'columns', desc: 'Optionskarten, gewichtete Matrix, Pre-Mortem.', count: (d) => `${d.optionen.length} Optionen · ${d.optionen.reduce((s, o) => s + o.zuege.length, 0)} Züge` },
  { id: 's-wargame', num: '05', titel: 'Wargaming', icon: 'flag', desc: 'Reaktionsketten durchspielen, Rotes Team befragen.', count: (d) => `${d.wargame.runden.length} Runden simuliert` },
  { id: 's-execution', num: '06', titel: 'Umsetzung', icon: 'check', desc: 'Initiativen, Kennzahlen, Kill-Kriterien-Register.', count: (d) => `${d.initiativen.filter((i) => i.status === 'laufend').length} laufend · ${d.initiativen.filter((i) => i.status === 'gestoppt').length} gestoppt` },
  { id: 's-journal', num: '07', titel: 'Gedächtnis', icon: 'archive', desc: 'Entscheidungsjournal & Retrospektiven.', count: (d) => `${d.journal.length} Entscheide protokolliert` },
];

function StrategieHome({ onOpen }) {
  const db = useStDb();
  const ep = [...db.entscheidungspunkte].sort((a, b) => a.tage - b.tage)[0];
  const an = [...db.annahmen].filter((a) => a.tage != null && a.status !== 'falsifiziert').sort((a, b) => a.tage - b.tage)[0];
  const killWatch = db.initiativen.flatMap((i) => i.kill.filter((k) => k.status === 'beobachten').map((k) => ({ ...k, ini: i })))[0];
  const kritisch = db.annahmen.filter((a) => a.status === 'kritisch');

  const lage = [
    ep && { tage: ep.tage, titel: ep.titel, meta: `Entscheidungspunkt ${ep.kurz} · Zukunftslinien`, art: 'exogen', datum: ep.datum, go: 's-timeline' },
    an && { tage: an.tage, titel: `Annahmenprüfung: ${an.text.length > 62 ? an.text.slice(0, 61) + '…' : an.text}`, meta: `Status ${an.status} · Assumption Log`, art: an.status === 'kritisch' ? 'kritisch' : 'prüfung', datum: an.pruefdatum, go: 's-foresight' },
    killWatch && { tage: 88, titel: `Kill-Kriterium unter Beobachtung: ${killWatch.text}`, meta: `${killWatch.ini.titel} · Umsetzung`, art: 'kill', datum: '30. Sep 2026', go: 's-execution' },
  ].filter(Boolean).sort((a, b) => a.tage - b.tage);

  const quick = [
    { icon: 'sparkle', t: 'Signal erfassen', go: () => onOpen('s-foresight') },
    { icon: 'flag', t: 'Zug simulieren', go: () => onOpen('s-wargame') },
    { icon: 'archive', t: 'Entscheid protokollieren', go: () => onOpen('s-journal') },
    { icon: 'export', t: 'Export für Obsidian (MD + JSON)', go: () => { stExportMd(); stExportJson(); } },
  ];

  return (
    <div className="home view-in" data-screen-label="Strategie · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Strategie.</h1>
        </div>

        {/* Lagebild */}
        <div className="home-sec">
          <div className="sh"><span className="st">Lagebild</span></div>
          <div className="radar">
            {lage.map((r, i) => (
              <div key={i} className="radar-row" onClick={() => onOpen(r.go)}>
                <span className={`countdown ${r.tage <= 100 ? 'warm' : ''} ${r.art === 'kritisch' ? 'hot' : ''}`}>{r.tage} T</span>
                <div className="col" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="rr-t">{r.titel}</span>
                </div>
                <span className="frist-art">{r.art}</span>
                <span className="rr-d">{r.datum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Werkbank */}
        <div className="home-sec">
          <div className="sh"><span className="st">Werkbank</span></div>
          <div className="st-mod-grid">
            {ST_MODULE.map((m) => (
              <div key={m.id} className="st-mod" onClick={() => onOpen(m.id)}>
                <span className="sm-t">{m.titel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schnellaktionen */}
        <div className="home-sec" style={{ marginBottom: 8 }}>
          <div className="sh"><span className="st">Schnellaktionen</span></div>
          <div className="qa-grid">
            {quick.map((q, i) => (
              <div key={i} className="qa-card" onClick={q.go}>
                <span className="ico"><Icon name={q.icon} size={16} /></span>
                <span className="qt">{q.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.StrategieHome = StrategieHome;
window.ST_MODULE = ST_MODULE;
