/* Praxis-Startseite — Fristenradar · Fälle · Schnellaktionen */

function PraxisHome({ onOpenFall, onOpenWorkbench }) {
  const faelle = window.FAELLE;
  const radar = window.fristenRadar().slice(0, 6);
  const totalAkten = faelle.reduce((s, f) => s + f.akten.length, 0);
  const totalStunden = faelle.reduce((s, f) => s + f.honorar.total, 0);

  const quick = [
    { icon: 'pen',    t: 'Eingabe entwerfen', go: () => onOpenWorkbench(faelle[0].id, faelle[0].entwuerfe[0].id) },
    { icon: 'upload', t: 'Akte erfassen', go: () => onOpenFall(faelle[0].id, 'akten') },
    { icon: 'time',   t: 'Frist erfassen', go: () => onOpenFall(faelle[0].id, 'fristen') },
    { icon: 'chat',   t: 'Akten befragen', go: () => onOpenFall(faelle[0].id, 'akten') },
  ];

  return (
    <div className="home view-in" data-screen-label="Praxis · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Guten Morgen, Julian.</h1>
        </div>

        {/* Fristenradar */}
        <div className="home-sec">
          <div className="sh"><span className="st">Fristenradar</span></div>
          <div className="radar">
            {radar.map((r, i) => (
              <div key={i} className={`radar-row ${r.tage <= 10 ? 'hot' : ''}`} onClick={() => onOpenFall(r.fall.id, 'fristen')}>
                <span className={`countdown ${r.tage <= 10 ? 'hot' : r.tage <= 30 ? 'warm' : ''}`}>{r.tage} T</span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <span className="rr-t">{r.titel}</span>
                </div>
                <span className="frist-art">{r.art}</span>
                <span className="rr-d">{r.datum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fälle */}
        <div className="home-sec">
          <div className="sh"><span className="st">Fälle</span></div>
          <div className="fall-grid">
            {faelle.map(f => (
              <div key={f.id} className="fall-card" onClick={() => onOpenFall(f.id, 'uebersicht')}>
                <div className="fc-top">
                  <span className="fc-ref">{f.ref}</span>
                  <span className="fc-gebiet">{f.gebiet}</span>
                </div>
                <div className="fc-title">{f.title}</div>
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

window.PraxisHome = PraxisHome;
