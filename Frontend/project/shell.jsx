/* Workspace shell — Modus-Umschalter Praxis ⇄ Academia ⇄ Strategie,
   persistente Sidebar + Tab-Leiste */
const { useState: useSh, useEffect: useShEff } = React;

/* Academia view registry */
const VIEW_META = {
  home: { label: 'Startseite', icon: 'home', boardId: null },
  projekte: { label: 'Projektverwaltung', icon: 'flag', boardId: 'projekte' },
  quellen: { label: 'Bibliothek', icon: 'book', boardId: 'quellen' },
  recherche: { label: 'Recherche', icon: 'search', boardId: 'recherche' },
  notizen: { label: 'Notizen', icon: 'note', boardId: 'notizen' },
  schreiben: { label: 'Schreiben', icon: 'pen', boardId: 'schreiben' }
};

const BOARD_COMP = {
  projekte: () => window.Board01,
  quellen: () => window.Board02,
  recherche: () => window.Board03,
  notizen: () => window.Board04,
  schreiben: () => window.Board05
};

/* Strategie view meta — ids: 's-home' | 's-<modul>' */
function strategieMeta(v) {
  if (v === 's-home') return { label: 'Startseite', icon: 'home' };
  const m = window.ST_MODULE && window.ST_MODULE.find((x) => x.id === v);
  return m ? { label: m.titel, icon: m.icon } : { label: v, icon: 'doc' };
}

const ST_COMP = {
  's-analyse': () => window.StAnalyse,
  's-foresight': () => window.StForesight,
  's-timeline': () => window.StTimeline,
  's-optionen': () => window.StOptionen,
  's-wargame': () => window.StWargame,
  's-execution': () => window.StExecution,
  's-journal': () => window.StJournal
};

/* Praxis view meta — ids: 'p-home' | 'fall:<id>' | 'wb:<fallId>:<entwurfId>' */
function praxisMeta(v) {
  if (v === 'p-home') return { label: 'Startseite', icon: 'home' };
  if (v.startsWith('fall:')) {
    const f = window.pxAll().find(x => x.id === v.slice(5));
    return { label: f ? f.title : 'Fall', icon: 'scales' };
  }
  if (v.startsWith('wb:')) {
    const [, fid, eid] = v.split(':');
    const f = window.pxAll().find(x => x.id === fid);
    const e = f && f.entwuerfe.find(x => x.id === eid);
    return { label: e ? `${e.titel} — ${f.ref}` : 'Workbench', icon: 'pen' };
  }
  return { label: v, icon: 'doc' };
}

function Shell() {
  const projects = usePjAll();
  const boards = window.BOARDS;
  const faelle = usePxAll();
  const vorhabenList = useStVorhabenList();

  const [mode, setMode] = useSh(() => localStorage.getItem('rh-mode') || 'praxis');
  const [project, setProject] = useSh(projects[0]);
  const [switchOpen, setSwitchOpen] = useSh(false);
  const [newItemName, setNewItemName] = useSh('');
  const [filesTab, setFilesTab] = useSh('dateien');
  const [theme, setTheme] = useSh(() => localStorage.getItem('rh-theme') || 'dark');

  /* per-mode view + tabs */
  const [acView, setAcView] = useSh('home');
  const [acTabs, setAcTabs] = useSh(['home', 'quellen', 'projekte']);
  const [pxView, setPxView] = useSh('p-home');
  const [pxTabs, setPxTabs] = useSh(['p-home']);
  const [stView, setStView] = useSh('s-home');
  const [stTabs, setStTabs] = useSh(['s-home', 's-timeline']);
  const [fallInit, setFallInit] = useSh({}); // fallId -> initial tab

  const praxis = mode === 'praxis';
  const strategie = mode === 'strategie';
  const view = praxis ? pxView : strategie ? stView : acView;
  const openTabs = praxis ? pxTabs : strategie ? stTabs : acTabs;
  const setView = praxis ? setPxView : strategie ? setStView : setAcView;
  const setOpenTabs = praxis ? setPxTabs : strategie ? setStTabs : setAcTabs;

  useShEff(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rh-theme', theme);
  }, [theme]);
  useShEff(() => { localStorage.setItem('rh-mode', mode); }, [mode]);

  const open = (v) => {
    setView(v);
    setOpenTabs((t) => t.includes(v) ? t : [...t, v]);
  };
  const openFall = (fallId, tab) => {
    if (tab) setFallInit((m) => ({ ...m, [fallId]: tab }));
    open(`fall:${fallId}`);
  };
  const openWorkbench = (fallId, entwurfId) => open(`wb:${fallId}:${entwurfId}`);

  const createNew = () => {
    const name = newItemName.trim();
    if (!name) return;
    if (strategie) {
      window.stVorhabenCreate(name);
      open('s-home');
    } else if (praxis) {
      const f = window.pxCreate({ title: name });
      openFall(f.id);
    } else {
      const p = window.pjCreate({ title: name });
      setProject(p);
      open('home');
    }
    setNewItemName('');
    setSwitchOpen(false);
  };

  const closeTab = (e, v) => {
    e.stopPropagation();
    const homeId = praxis ? 'p-home' : strategie ? 's-home' : 'home';
    setOpenTabs((t) => {
      const nt = t.filter((x) => x !== v);
      if (view === v) {
        const idx = t.indexOf(v);
        const next = nt[Math.min(idx, nt.length - 1)] || homeId;
        setView(next);
      }
      return nt.length ? nt : [homeId];
    });
  };

  const boardFor = (viewId) => boards.find((b) => b.id === VIEW_META[viewId].boardId);

  const renderContent = () => {
    if (praxis) {
      if (pxView === 'p-home') return <PraxisHome onOpenFall={openFall} onOpenWorkbench={openWorkbench} />;
      if (pxView.startsWith('fall:')) {
        const f = faelle.find(x => x.id === pxView.slice(5));
        if (!f) return null;
        const init = fallInit[f.id];
        return <FallSpace key={pxView + (init || '')} fall={f} initialTab={init} onOpenWorkbench={openWorkbench} />;
      }
      if (pxView.startsWith('wb:')) {
        const [, fid, eid] = pxView.split(':');
        return <Workbench key={pxView} fallId={fid} entwurfId={eid} onOpenFall={openFall} />;
      }
      return null;
    }
    if (strategie) {
      if (stView === 's-home') return <StrategieHome onOpen={open} />;
      const Comp = ST_COMP[stView] && ST_COMP[stView]();
      if (!Comp) return null;
      return <Comp key={stView} onOpen={open} />;
    }
    if (acView === 'home') return <Home project={project} onOpen={open} onPickProject={setProject} />;
    const meta = VIEW_META[acView];
    const Comp = BOARD_COMP[meta.boardId] && BOARD_COMP[meta.boardId]();
    const board = boardFor(acView);
    if (!Comp || !board) return null;
    return <Comp key={acView + project.id} board={board} project={project} onBack={() => open('home')} />;
  };

  const tabMeta = (v) => praxis ? praxisMeta(v) : strategie ? strategieMeta(v) : VIEW_META[v];

  return (
    <div className="ws">
      {/* ============ SIDEBAR ============ */}
      <aside className="ws-side">
        <div className="brand">
          <span className="brand-mark">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3h7l4 4v14H7z" />
              <path d="M14 3v4h4" />
              <path d="M10 13h5M10 16.5h5" />
            </svg>
          </span>
          <span className="brand-name">Folio<span className="dot">.</span></span>
        </div>

        <div className="mode-switch">
          <span className={praxis ? 'on' : ''} onClick={() => setMode('praxis')}>Praxis</span>
          <span className={mode === 'academia' ? 'on' : ''} onClick={() => setMode('academia')}>Academia</span>
          <span className={strategie ? 'on' : ''} onClick={() => setMode('strategie')}>Strategie</span>
        </div>

        <div className="ws-switch" onClick={() => setSwitchOpen((o) => !o)}>
          <span className="av">JB</span>
          <span className="nm">{(praxis || strategie) ? 'Kanzlei Bodenmann' : 'Julian Bodenmann'}</span>
          <span className="cv"><Icon name="chevron-down" size={15} /></span>
          {switchOpen &&
          <div className="pop" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '4px 10px 6px' }}>{praxis ? 'Fall öffnen' : strategie ? 'Vorhaben öffnen' : 'Projekt wechseln'}</div>
              {strategie ?
              vorhabenList.map((v) =>
              <div key={v.id} className="po" onClick={() => {window.stVorhabenSwitch(v.id);open('s-home');setSwitchOpen(false);}}>
                    <span className="pc" style={{ background: 'var(--accent)' }}></span>
                    <span className="pt">{v.titel}</span>
                    <span className="ps">{v.horizont}</span>
                  </div>
              ) :
              praxis ?
              faelle.map((f) =>
              <div key={f.id} className="po" onClick={() => {openFall(f.id);setSwitchOpen(false);}}>
                    <span className="pc" style={{ background: 'var(--accent)' }}></span>
                    <span className="pt">{f.title}</span>
                    <span className="ps">{f.ref}</span>
                  </div>
              ) :
              projects.map((p) =>
              <div key={p.id} className="po" onClick={() => {setProject(p);open('home');setSwitchOpen(false);}}>
                    <span className="pc" style={{ background: `var(--accent-${p.color})` }}></span>
                    <span className="pt">{p.title}</span>
                    <span className="ps">{p.type.split(/[\s-]/)[0]}</span>
                  </div>
              )}
              <div className="po-add">
                <input
                  className="po-add-input"
                  placeholder={strategie ? 'Neues Vorhaben …' : praxis ? 'Neuer Fall …' : 'Neues Projekt …'}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNew()}
                  onClick={(e) => e.stopPropagation()}
                />
                <button className="po-add-btn" onClick={createNew}><Icon name="plus" size={13} /></button>
              </div>
            </div>
          }
        </div>

        <div className="side-scroll">
          {strategie ? (
            <>
              <div className="nav-i" onClick={() => open('s-journal')}>
                <span className="ico"><Icon name="edit" size={16} /></span> Entscheid protokollieren
              </div>
              <div className={`nav-i ${view === 's-home' ? 'on' : ''}`} onClick={() => open('s-home')}>
                <span className="ico"><Icon name="home" size={16} /></span> Startseite
              </div>

              <div className="side-label">Werkbank</div>
              {window.ST_MODULE.map((m) => (
                <div key={m.id} className={`nav-i ${view === m.id ? 'on' : ''}`} onClick={() => open(m.id)}>
                  <span className="ico"><span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.04em' }}>{m.num}</span></span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.titel}</span>
                </div>
              ))}

              <div className="side-label">Export</div>
              <div className="nav-i" onClick={() => stExportMd()}>
                <span className="ico"><Icon name="export" size={15} /></span> Markdown (Obsidian)
              </div>
              <div className="nav-i" onClick={() => stExportJson()}>
                <span className="ico"><Icon name="export" size={15} /></span> JSON-Datenstand
              </div>
            </>
          ) : praxis ? (
            <>
              <div className="nav-i" onClick={() => openWorkbench(faelle[0].id, faelle[0].entwuerfe[0].id)}>
                <span className="ico"><Icon name="edit" size={16} /></span> Eingabe entwerfen
              </div>
              <div className={`nav-i ${view === 'p-home' ? 'on' : ''}`} onClick={() => open('p-home')}>
                <span className="ico"><Icon name="home" size={16} /></span> Startseite
              </div>
              <div className="nav-i" onClick={() => open('p-home')}>
                <span className="ico"><Icon name="search" size={16} /></span> Recherche
              </div>

              <div className="side-label">Fälle</div>
              {faelle.map((f) => {
                const vid = `fall:${f.id}`;
                return (
                  <div key={f.id} className={`nav-i ${view === vid ? 'on' : ''}`} onClick={() => openFall(f.id)}>
                    <span className="ico"><span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.02em' }}>{f.ref.slice(-3)}</span></span>
                    <span className="col" style={{ minWidth: 0, gap: 1 }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</span>
                    </span>
                    {f.nextFrist.tage <= 10 && <span className="dotc" style={{ background: 'var(--accent)' }}></span>}
                  </div>
                );
              })}

              <div className="side-label">Workbench</div>
              {faelle.flatMap((f) => f.entwuerfe.map((e) => {
                const vid = `wb:${f.id}:${e.id}`;
                return (
                  <div key={vid} className={`nav-i ${view === vid ? 'on' : ''}`} onClick={() => openWorkbench(f.id, e.id)}>
                    <span className="ico"><Icon name="pen" size={14} /></span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titel}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--ink-5)', flexShrink: 0 }}>{f.ref.slice(-3)}</span>
                  </div>
                );
              }))}
            </>
          ) : (
            <>
              <div className="nav-i" onClick={() => open('notizen')}>
                <span className="ico"><Icon name="edit" size={16} /></span> Erstellen
              </div>
              <div className={`nav-i ${view === 'home' ? 'on' : ''}`} onClick={() => open('home')}>
                <span className="ico"><Icon name="home" size={16} /></span> Startseite
              </div>
              <div className={`nav-i ${view === 'quellen' ? 'on' : ''}`} style={{ '--mc': 'var(--accent-blue)' }} onClick={() => open('quellen')}>
                <span className="ico"><Icon name="book" size={16} /></span> Bibliothek
              </div>
              <div className={`nav-i ${view === 'recherche' ? 'on' : ''}`} style={{ '--mc': 'var(--accent-green)' }} onClick={() => open('recherche')}>
                <span className="ico"><Icon name="search" size={16} /></span> Suchen
              </div>

              <div className="side-label">Arbeitsbereich</div>
              {boards.map((b) => {
                const vid = b.id;
                return (
                  <div key={b.id} className={`nav-i ${view === vid ? 'on' : ''}`} style={{ '--mc': b.color }} onClick={() => open(vid)}>
                    <span className="ico" style={{ color: view === vid ? b.color : undefined }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.04em' }}>{b.num}</span>
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
                    <span className="dotc" style={{ background: b.color, opacity: view === vid ? 1 : 0.32 }}></span>
                  </div>);
              })}
            </>
          )}

          <div className="side-div"></div>

          <div className="files-tab">
            <span className={filesTab === 'dateien' ? 'on' : ''} onClick={() => setFilesTab('dateien')}>Dateien</span>
            <span className={filesTab === 'chats' ? 'on' : ''} onClick={() => setFilesTab('chats')}>Chats</span>
          </div>
          {filesTab === 'dateien' ?
          (strategie ? [{ id: 'lagebilder', name: 'Lagebilder & Quartalsreviews' }, { id: 'quellen', name: 'Quellen & Studien' }] : praxis ? [{ id: 'vorlagen', name: 'Vorlagen Kanzlei' }, { id: 'wissen', name: 'Kanzlei-Wissen' }] : window.FOLDERS).map((f) =>
          <div key={f.id} className="folder-i">
                  <span className="ico"><Icon name="folder" size={15} /></span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                </div>
          ) :
          (strategie ? ['Rotes Team — Fixpreis-Angriff', 'BGFA-Szenarien sortieren', 'Kill-Kriterien Q3 prüfen'] : praxis ? ['Verrechnung Art. 366 OR — Substantiierung', 'Prosequierungsfrist BauHWPfR', 'Gutachterfragen Ergänzung'] : ['Kerngehalt — Klärung', 'Recherche Auffangfunktion', 'Gliederung Kap. II']).map((c, i) =>
          <div key={i} className="folder-i">
                  <span className="ico"><Icon name="chat" size={15} /></span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>
                </div>
          )}
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="ws-main">
        <div className="ws-top">
          {openTabs.map((v) => {
            const meta = tabMeta(v);
            if (!meta) return null;
            const board = !praxis && !strategie && VIEW_META[v] ? boardFor(v) : null;
            const homeId = praxis ? 'p-home' : strategie ? 's-home' : 'home';
            return (
              <div key={v} className={`doc-tab ${view === v ? 'on' : ''}`} style={{ '--mc': board ? board.color : 'var(--ink)' }} onClick={() => setView(v)}>
                <span className="ico"><Icon name={meta.icon} size={14} /></span>
                <span className="tt">{meta.label}</span>
                {v !== homeId &&
                <span className="x" onClick={(e) => closeTab(e, v)}><Icon name="close" size={12} /></span>
                }
              </div>);
          })}
          <div className="tab-add" title="Neuer Tab" onClick={() => open(praxis ? 'p-home' : strategie ? 's-home' : 'home')}><Icon name="plus" size={15} /></div>
          <div className="spacer"></div>
          <div className="top-btn agent"><Icon name="chat" size={13} /> Agent</div>
          <div className="theme-toggle" title={theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </div>
        </div>

        <div className="ws-content">
          {renderContent()}
        </div>
      </div>
    </div>);
}

window.Shell = Shell;
