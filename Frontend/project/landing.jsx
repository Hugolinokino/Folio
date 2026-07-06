/* Level 1 — Landing Page */
const { useState } = React;

function Landing({ onPick, onNew }) {
  const projects = window.PROJECTS;
  return (
    <div className="landing view-in" data-screen-label="01 Landing">
      <div className="landing-header">
        <div className="eyebrow bloom" style={{ animationDelay: '40ms' }}>
          <span className="glyph">R</span>
          <span className="t-mono">Research Hub · 2026</span>
        </div>
        <h1 className="t-display bloom" style={{ animationDelay: '120ms' }}>
          Research Hub<span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>.</span>
        </h1>
        <div className="sub bloom" style={{ animationDelay: '220ms' }}>Für juristische Seminar- &amp; Abschlussarbeiten</div>
        <div className="quote bloom" style={{ animationDelay: '320ms' }}>
          Quellen, Notizen und Argumente an einem Ort — von der ersten Recherche bis zur Abgabe.
        </div>
      </div>

      <div className="project-grid">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="project-card glass bloom"
            style={{ animationDelay: `${420 + i * 70}ms`, '--mc': `var(--accent-${p.color})` }}
            onClick={() => onPick(p)}
          >
            <div className="col" style={{ gap: 8 }}>
              <div className="row-flex" style={{ justifyContent: 'space-between' }}>
                <span className={`pill ${p.color === 'ink' ? '' : p.color}`}>
                  <span className="dot"></span>
                  {p.type}
                </span>
                <span className="t-mono-sm">№ {String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="title">{p.title}</div>
            </div>

            <div className="col" style={{ gap: 8 }}>
              <div className="progress-row">
                <div className="lbl">
                  <span className="t-mono-sm">Fortschritt</span>
                  <span className="t-mono-num">{Math.round(p.progress * 100)}%</span>
                </div>
                <div className="progress"><span style={{ width: `${p.progress * 100}%` }}></span></div>
              </div>
              <div className="meta">
                <span className="t-sans-sm" style={{ fontStyle: 'italic' }}>{p.advisor}</span>
                <span className="date">Abg. {p.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="landing-actions bloom" style={{ animationDelay: '880ms' }}>
        <button className="btn-serif" onClick={onNew}>
          <Icon name="plus" size={16} />
          Neues Projekt
        </button>
        <span className="t-mono-sm" style={{ margin: '0 6px' }}>oder</span>
        <button className="btn-ghost-glass">
          <Icon name="folder" size={14} />
          Aus Vorlage öffnen
        </button>
        <button className="btn-ghost-glass">
          <Icon name="archive" size={14} />
          Archiv (12)
        </button>
      </div>
    </div>
  );
}

window.Landing = Landing;
