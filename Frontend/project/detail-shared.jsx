/* Shared detail-page chrome */

function DetailHead({ board, project, onOverview, right }) {
  const Icon = window.Icon;
  return (
    <div className="detail-top">
      <div className="col">
        <div className="t-mono-sm crumb-line">
          {onOverview ? (
            <span className="crumb-back" onClick={onOverview}>
              <Icon name="arrow-left" size={12} /> Übersicht
            </span>
          ) : (
            <span>{project?.title}</span>
          )}
          <span style={{ margin: '0 6px', opacity: 0.5 }}>/</span>
          <span style={{ color: board.color }}>Board {board.num}</span>
        </div>
        <div className="detail-head" style={{ '--mc': board.color, marginTop: 2 }}>
          <h1>{board.title}<span className="ac">.</span></h1>
        </div>
      </div>
      <div className="row-flex" style={{ gap: 8 }}>{right}</div>
    </div>
  );
}

/* Single-page landing for a board — quiet list of entry points */
function BoardLanding({ board, project, lede, stats, entries, onEnter }) {
  const Icon = window.Icon;
  return (
    <div className="detail board-landing view-in" data-screen-label={`Board ${board.num} · Übersicht`} style={{ '--mc': board.color }}>
      <DetailHead board={board} project={project} right={
        <button className="btn-primary-dark" onClick={() => onEnter(entries[0])}>
          {entries[0].title} öffnen <Icon name="arrow-right" size={14} />
        </button>
      } />

      <div className="bl-scroll scroll">
        <div className="bl-inner">
          <div className="bl-list">
            {entries.map((e) => (
              <div key={e.id} className="bl-row" onClick={() => onEnter(e)}>
                <span className="bl-ico"><Icon name={e.icon} size={17} /></span>
                <span className="bl-title">{e.title}</span>
                <span className="go"><Icon name="arrow-right" size={15} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DetailHead = DetailHead;
window.BoardLanding = BoardLanding;
