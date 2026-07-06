/* Startseite — quick actions · getting started · recently used */
const { useState: useHm } = React;

function Home({ project, onOpen, onPickProject }) {
  const recents = window.RECENTS;
  const recentRef = React.useRef(null);

  const quick = [
    { id: 'upload', icon: 'upload', t: 'Quelle hochladen', mc: 'var(--accent-blue)', go: 'quellen' },
    { id: 'note',   icon: 'edit',   t: 'Notiz erstellen', mc: 'var(--accent-red)', go: 'notizen' },
    { id: 'chat',   icon: 'chat',   t: 'Mit Quelle chatten', mc: 'var(--accent-green)', go: 'notizen' },
    { id: 'search', icon: 'search', t: 'Recherche starten', mc: 'var(--accent-amber)', go: 'recherche' },
  ];

  const scrollRecents = (dir) => {
    if (recentRef.current) recentRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  const pct = Math.round(project.progress * 100);

  return (
    <div className="home view-in" data-screen-label="Startseite">
      <div className="home-inner">
        {/* hero */}
        <div className="home-hero">
          <h1>{project.title}</h1>
        </div>

        {/* Schnellaktionen */}
        <div className="home-sec">
          <div className="sh"><span className="st">Schnellaktionen</span></div>
          <div className="qa-grid">
            {quick.map(q => (
              <div key={q.id} className="qa-card" style={{ '--mc': q.mc }} onClick={() => onOpen(q.go)}>
                <span className="ico"><Icon name={q.icon} size={16} /></span>
                <span className="qt">{q.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zuletzt verwendet */}
        <div className="home-sec" style={{ marginBottom: 8 }}>
          <div className="sh">
            <span className="st">Zuletzt verwendet</span>
            <span className="nav-arrows">
              <span onClick={() => scrollRecents(-1)}><Icon name="arrow-left" size={14} /></span>
              <span onClick={() => scrollRecents(1)}><Icon name="arrow-right" size={14} /></span>
            </span>
          </div>
          <div className="recents" ref={recentRef}>
            {recents.map((r, i) => {
              const mc = r.type === 'quelle' ? 'var(--accent-blue)' : r.type === 'notiz' ? 'var(--accent-red)' : 'var(--accent-amber)';
              const go = r.type === 'quelle' ? 'quellen' : r.type === 'these' ? 'notizen' : 'notizen';
              return (
                <div key={i} className="recent-card" style={{ '--mc': mc }} onClick={() => onOpen(go)}>
                  <div className="ri">
                    <Icon name={r.icon} size={15} />
                    <span className="rt">{r.type}</span>
                  </div>
                  <div className="rttl">{r.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Home = Home;
