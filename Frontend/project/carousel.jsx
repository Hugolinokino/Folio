/* Level 2 — Whiteboard carousel (5 boards arranged in 3D ring) */
const { useEffect: useEff2, useRef: useRef2, useState: useState2 } = React;

function Carousel({ project, onBack, onOpenBoard }) {
  const boards = window.BOARDS;
  const N = boards.length;
  const STEP = 360 / N;
  const RADIUS = 460;

  const [idx, setIdx] = useState2(0);
  const wheelAcc = useRef2(0);
  const lastWheel = useRef2(0);
  const dragRef = useRef2({ active: false, startX: 0, startIdx: 0 });

  const rotate = (d) => setIdx((p) => (p + d + N * 10) % N);

  // Keyboard
  useEff2(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') rotate(1);
      else if (e.key === 'ArrowLeft') rotate(-1);
      else if (e.key === 'Enter') onOpenBoard(boards[idx]);
      else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  // Wheel (trackpad horizontal swipe — accumulate)
  const onWheel = (e) => {
    const now = performance.now();
    if (now - lastWheel.current > 600) wheelAcc.current = 0;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAcc.current += delta;
    if (Math.abs(wheelAcc.current) > 70) {
      rotate(wheelAcc.current > 0 ? 1 : -1);
      wheelAcc.current = 0;
      lastWheel.current = now;
    }
  };

  // Drag
  const onPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startIdx: idx };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const step = Math.round(-dx / 110);
    if (step !== 0 && idx !== (dragRef.current.startIdx + step + N) % N) {
      setIdx((dragRef.current.startIdx + step + N * 10) % N);
    }
  };
  const onPointerUp = () => { dragRef.current.active = false; };

  const rot = -idx * STEP;

  return (
    <div className="scene view-in" data-screen-label="02 Whiteboards">
      <div className="floor"></div>
      <div className="ceiling-light"></div>

      <div className="scene-topbar">
        <div className="crumb">
          <span className="arrow" onClick={onBack}><Icon name="arrow-left" size={14} /></span>
          <span className="t-mono">Research Hub <span style={{ opacity: 0.4, margin: '0 6px' }}>/</span> {project?.title}</span>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          <span className="pill blue"><span className="dot"></span>{project?.type}</span>
          <span className="t-mono-sm">Abgabe {project?.due}</span>
          <button className="btn-ghost-glass"><Icon name="menu-dots" size={14} /> Projekt</button>
        </div>
      </div>

      <div
        className="carousel-wrap"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="rail left" onClick={() => rotate(-1)}><Icon name="arrow-left" size={18} /></div>
        <div className="rail right" onClick={() => rotate(1)}><Icon name="arrow-right" size={18} /></div>

        <div className="carousel" style={{ '--rot': `${rot}deg`, transform: `translate(-50%, -50%) rotateY(${rot}deg)` }}>
          {boards.map((b, i) => {
            const y = i * STEP;
            const isActive = i === idx;
            return (
              <div
                key={b.id}
                className={`board-card ${isActive ? 'active' : 'inactive'}`}
                style={{
                  transform: `rotateY(${y}deg) translateZ(${RADIUS}px)`,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
                onClick={() => isActive && onOpenBoard(b)}
              >
                <div className="board" style={{ width: 520, height: 340, '--mc': b.color }}>
                  <div className="frame"></div>
                  <div className="accent-bar"></div>

                  <div className="bc-inner">
                    <div className="bc-head">
                      <div>
                        <div className="bc-num" style={{ color: b.color }}>Board {b.num}</div>
                        <div className="bc-title">{b.title}</div>
                        <div className="bc-sub">{b.italic}</div>
                      </div>
                      <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
                        <span className="t-mono-sm" style={{ color: b.color }}>● modul</span>
                        <span className="t-mono-num">{String(i + 1).padStart(2, '0')} / 0{N}</span>
                      </div>
                    </div>

                    <div className="bc-bullets">
                      {b.bullets.map((row) => (
                        <div className="row" key={row.key}>
                          <span className="key">{row.key}</span>
                          <span className="ttl">{row.t}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bc-foot">
                      <div className="bc-stats">
                        {b.stats.map((s, j) => (
                          <div className="stat" key={j}>
                            <div className="n">{s.n}</div>
                            <div className="l">{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="open-link" style={{ color: b.color }}>
                        Board öffnen <Icon name="arrow-up-right" size={12} />
                      </div>
                    </div>
                  </div>

                  <div className="marker-tray">
                    <span className="marker" style={{ '--mc': 'var(--accent-ink)' }}></span>
                    <span className="marker" style={{ '--mc': 'var(--accent-blue)' }}></span>
                    <span className="marker" style={{ '--mc': 'var(--accent-red)' }}></span>
                    <span className="marker" style={{ '--mc': 'var(--accent-green)' }}></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dots">
          {boards.map((b, i) => (
            <span key={b.id} className={`dot ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
      </div>

      <div className="kbd-hint">
        <span className="k">←</span><span className="k">→</span>
        navigate
        <span style={{ width: 12 }}></span>
        <span className="k">↵</span> open
        <span style={{ width: 12 }}></span>
        <span className="k">esc</span> back
      </div>
    </div>
  );
}

window.Carousel = Carousel;
