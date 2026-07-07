import { useEffect, useState } from 'react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Icon, type IconName } from '../components/Icon';
import { api } from '../lib/tauri';
import { PraxisHome } from '../modules/praxis/PraxisHome';
import { FallSpace } from '../modules/praxis/FallSpace';
import { Workbench } from '../modules/praxis/Workbench';
import { CaseListProvider, useCaseList } from '../lib/praxis/store';
import { praxisMeta, type PraxisViewId } from '../lib/praxis/nav';
import { AcademiaHome } from '../modules/academia/AcademiaHome';
import { ProjectSpace } from '../modules/academia/ProjectSpace';
import { ProjectListProvider, useProjectList } from '../lib/academia/store';
import { academiaMeta, type AcademiaViewId } from '../lib/academia/nav';
import { StrategieProvider, useStrategie } from '../lib/strategie/store';
import { StrategieHome } from '../modules/strategie/StrategieHome';
import { Analyse } from '../modules/strategie/Analyse';
import { Foresight } from '../modules/strategie/Foresight';
import { Timeline } from '../modules/strategie/Timeline';
import { Optionen } from '../modules/strategie/Optionen';
import { Wargame } from '../modules/strategie/Wargame';
import { Execution } from '../modules/strategie/Execution';
import { Journal } from '../modules/strategie/Journal';
import { ST_MODULES, strategieMeta, type StrategieViewId } from '../lib/strategie/modules';
import { exportJson, exportMarkdown } from '../lib/strategie/export';

type Mode = 'praxis' | 'academia' | 'strategie';

const MODE_ICON: Record<Mode, IconName> = {
  praxis: 'scales',
  academia: 'book',
  strategie: 'flag',
};

const ST_VIEW_COMP: Record<StrategieViewId, (props: { onOpen: (v: StrategieViewId) => void }) => React.JSX.Element> = {
  's-home': StrategieHome,
  's-analyse': Analyse,
  's-foresight': Foresight,
  's-timeline': Timeline,
  's-optionen': Optionen,
  's-wargame': Wargame,
  's-execution': Execution,
  's-journal': Journal,
};

export function Shell() {
  return (
    <StrategieProvider>
      <CaseListProvider>
        <ProjectListProvider>
          <ShellInner />
        </ProjectListProvider>
      </CaseListProvider>
    </StrategieProvider>
  );
}

function ShellInner() {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('rh-mode') as Mode) || 'praxis');
  const [theme, setTheme] = useState(() => localStorage.getItem('rh-theme') || 'dark');
  const [displayName, setDisplayName] = useState('Folio');

  const [stView, setStView] = useState<StrategieViewId>('s-home');
  const [stTabs, setStTabs] = useState<StrategieViewId[]>(['s-home']);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [newVorhaben, setNewVorhaben] = useState('');

  const [pxView, setPxView] = useState<PraxisViewId>('p-home');
  const [pxTabs, setPxTabs] = useState<PraxisViewId[]>(['p-home']);
  const [pxSwitchOpen, setPxSwitchOpen] = useState(false);
  const [newFallTitle, setNewFallTitle] = useState('');
  const [fallInitTab, setFallInitTab] = useState<Record<string, string>>({});
  const { cases } = useCaseList();

  const [acView, setAcView] = useState<AcademiaViewId>('a-home');
  const [acTabs, setAcTabs] = useState<AcademiaViewId[]>(['a-home']);
  const [acSwitchOpen, setAcSwitchOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [projectInitTab, setProjectInitTab] = useState<Record<string, string>>({});
  const { projects } = useProjectList();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rh-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rh-mode', mode);
  }, [mode]);

  useEffect(() => {
    api.getWorkspaceInfo().then((info) => {
      if (info.displayName) setDisplayName(info.displayName);
    }).catch(() => {});
  }, []);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'FO';

  const openStView = (v: StrategieViewId) => {
    setStView(v);
    setStTabs((t) => (t.includes(v) ? t : [...t, v]));
  };
  const closeStTab = (e: React.MouseEvent, v: StrategieViewId) => {
    e.stopPropagation();
    setStTabs((t) => {
      const nt = t.filter((x) => x !== v);
      if (stView === v) {
        const idx = t.indexOf(v);
        setStView(nt[Math.min(idx, nt.length - 1)] || 's-home');
      }
      return nt.length ? nt : ['s-home'];
    });
  };

  const openPxView = (v: PraxisViewId) => {
    setPxView(v);
    setPxTabs((t) => (t.includes(v) ? t : [...t, v]));
  };
  const openFall = (fallId: string, tab?: string) => {
    if (tab) setFallInitTab((m) => ({ ...m, [fallId]: tab }));
    openPxView(`fall:${fallId}`);
  };
  const openWorkbench = (fallId: string, entwurfId: string) => openPxView(`wb:${fallId}:${entwurfId}`);
  const closePxTab = (e: React.MouseEvent, v: PraxisViewId) => {
    e.stopPropagation();
    setPxTabs((t) => {
      const nt = t.filter((x) => x !== v);
      if (pxView === v) {
        const idx = t.indexOf(v);
        setPxView(nt[Math.min(idx, nt.length - 1)] || 'p-home');
      }
      return nt.length ? nt : ['p-home'];
    });
  };
  /** A deleted Fall may still be open in a tab (or the Workbench under it) — drop those before the data disappears underneath them. */
  const cleanupFallTabs = (fallId: string) => {
    setPxTabs((t) => {
      const nt = t.filter((x) => x !== `fall:${fallId}` && !x.startsWith(`wb:${fallId}:`));
      return nt.length ? nt : ['p-home'];
    });
    setPxView((v) => (v === `fall:${fallId}` || v.startsWith(`wb:${fallId}:`) ? 'p-home' : v));
  };

  const openProject = (projectId: string, tab?: string) => {
    if (tab) setProjectInitTab((m) => ({ ...m, [projectId]: tab }));
    const v: AcademiaViewId = `project:${projectId}`;
    setAcView(v);
    setAcTabs((t) => (t.includes(v) ? t : [...t, v]));
  };
  const closeAcTab = (e: React.MouseEvent, v: AcademiaViewId) => {
    e.stopPropagation();
    setAcTabs((t) => {
      const nt = t.filter((x) => x !== v);
      if (acView === v) {
        const idx = t.indexOf(v);
        setAcView(nt[Math.min(idx, nt.length - 1)] || 'a-home');
      }
      return nt.length ? nt : ['a-home'];
    });
  };
  /** Same idea as cleanupFallTabs, for a deleted Academia project. */
  const cleanupProjectTabs = (projectId: string) => {
    setAcTabs((t) => {
      const nt = t.filter((x) => x !== `project:${projectId}`);
      return nt.length ? nt : ['a-home'];
    });
    setAcView((v) => (v === `project:${projectId}` ? 'a-home' : v));
  };

  const renderAcademia = () => {
    if (acView === 'a-home') return <AcademiaHome onOpenProject={openProject} />;
    if (acView.startsWith('project:')) {
      const projectId = acView.slice(8);
      return <ProjectSpace key={acView} projectId={projectId} initialTab={projectInitTab[projectId]} />;
    }
    return null;
  };

  const renderPraxis = () => {
    if (pxView === 'p-home') return <PraxisHome onOpenFall={openFall} onOpenWorkbench={openWorkbench} />;
    if (pxView.startsWith('fall:')) {
      const fallId = pxView.slice(5);
      return <FallSpace key={pxView} fallId={fallId} initialTab={fallInitTab[fallId]} onOpenWorkbench={openWorkbench} />;
    }
    if (pxView.startsWith('wb:')) {
      const [, fallId, entwurfId] = pxView.split(':');
      return <Workbench key={pxView} fallId={fallId} entwurfId={entwurfId} onOpenFall={openFall} />;
    }
    return null;
  };

  const renderContent = () => {
    if (mode === 'praxis') return renderPraxis();
    if (mode === 'academia') return renderAcademia();
    const Comp = ST_VIEW_COMP[stView];
    return <Comp onOpen={openStView} />;
  };

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
            <span className={mode === 'praxis' ? 'on' : ''} onClick={() => setMode('praxis')}>Praxis</span>
            <span className={mode === 'academia' ? 'on' : ''} onClick={() => setMode('academia')}>Academia</span>
            <span className={mode === 'strategie' ? 'on' : ''} onClick={() => setMode('strategie')}>Strategie</span>
          </div>

          {mode === 'strategie' ? (
            <StrategieSwitcher
              open={switchOpen}
              setOpen={setSwitchOpen}
              newVorhaben={newVorhaben}
              setNewVorhaben={setNewVorhaben}
              onOpenHome={() => openStView('s-home')}
            />
          ) : mode === 'praxis' ? (
            <PraxisSwitcher
              open={pxSwitchOpen}
              setOpen={setPxSwitchOpen}
              newFallTitle={newFallTitle}
              setNewFallTitle={setNewFallTitle}
              onOpenFall={openFall}
              onDeletedFall={cleanupFallTabs}
            />
          ) : mode === 'academia' ? (
            <AcademiaSwitcher
              open={acSwitchOpen}
              setOpen={setAcSwitchOpen}
              newProjectTitle={newProjectTitle}
              setNewProjectTitle={setNewProjectTitle}
              onOpenProject={openProject}
              onDeletedProject={cleanupProjectTabs}
            />
          ) : (
            <div className="ws-switch">
              <span className="av">{initials}</span>
              <span className="nm">{displayName}</span>
            </div>
          )}

          <div className="side-scroll">
            {mode === 'strategie' ? (
              <>
                <div className="nav-i" onClick={() => openStView('s-journal')}>
                  <span className="ico"><Icon name="edit" size={16} /></span> Entscheid protokollieren
                </div>
                <div className={`nav-i ${stView === 's-home' ? 'on' : ''}`} onClick={() => openStView('s-home')}>
                  <span className="ico"><Icon name="home" size={16} /></span> Startseite
                </div>

                <div className="side-label">Werkbank</div>
                {ST_MODULES.map((m) => (
                  <div key={m.id} className={`nav-i ${stView === m.id ? 'on' : ''}`} onClick={() => openStView(m.id)}>
                    <span className="ico"><span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.04em' }}>{m.num}</span></span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.titel}</span>
                  </div>
                ))}

                <StrategieExportNav />
              </>
            ) : mode === 'praxis' ? (
              <>
                <div
                  className="nav-i"
                  onClick={() => (cases[0] ? openFall(cases[0].id) : openPxView('p-home'))}
                >
                  <span className="ico"><Icon name="edit" size={16} /></span> Eingabe entwerfen
                </div>
                <div className={`nav-i ${pxView === 'p-home' ? 'on' : ''}`} onClick={() => openPxView('p-home')}>
                  <span className="ico"><Icon name="home" size={16} /></span> Startseite
                </div>

                <div className="side-label">Fälle</div>
                {cases.map((c) => {
                  const vid = `fall:${c.id}`;
                  return (
                    <div key={c.id} className={`nav-i ${pxView === vid ? 'on' : ''}`} onClick={() => openFall(c.id)}>
                      <span className="ico"><span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.02em' }}>{c.ref.slice(-3)}</span></span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                    </div>
                  );
                })}
              </>
            ) : mode === 'academia' ? (
              <>
                <div
                  className="nav-i"
                  onClick={() => (projects[0] ? openProject(projects[0].id, 'notizen') : setAcView('a-home'))}
                >
                  <span className="ico"><Icon name="edit" size={16} /></span> Notiz anlegen
                </div>
                <div className={`nav-i ${acView === 'a-home' ? 'on' : ''}`} onClick={() => setAcView('a-home')}>
                  <span className="ico"><Icon name="home" size={16} /></span> Startseite
                </div>

                <div className="side-label">Projekte</div>
                {projects.map((p) => {
                  const vid = `project:${p.id}`;
                  return (
                    <div key={p.id} className={`nav-i ${acView === vid ? 'on' : ''}`} onClick={() => openProject(p.id)}>
                      <span className="ico"><span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.02em' }}>{p.title.slice(0, 2).toUpperCase()}</span></span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="nav-i on">
                <span className="ico"><Icon name={MODE_ICON[mode]} size={16} /></span>
                Startseite
              </div>
            )}

            <div className="side-div"></div>

            <div className="files-tab">
              <span className="on">Dateien</span>
              <span>Chats</span>
            </div>
            <div className="folder-i" style={{ opacity: 0.5, cursor: 'default' }}>
              <span className="t-sans-sm">Noch keine Dateien</span>
            </div>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <div className="ws-main">
          <div className="ws-top">
            {mode === 'strategie' ? (
              stTabs.map((v) => {
                const meta = strategieMeta(v);
                return (
                  <div key={v} className={`doc-tab ${stView === v ? 'on' : ''}`} onClick={() => setStView(v)}>
                    <span className="ico"><Icon name={meta.icon} size={14} /></span>
                    <span className="tt">{meta.label}</span>
                    {v !== 's-home' && (
                      <span className="x" onClick={(e) => closeStTab(e, v)}><Icon name="close" size={12} /></span>
                    )}
                  </div>
                );
              })
            ) : mode === 'praxis' ? (
              pxTabs.map((v) => {
                const meta = praxisMeta(v, cases);
                return (
                  <div key={v} className={`doc-tab ${pxView === v ? 'on' : ''}`} onClick={() => setPxView(v)}>
                    <span className="ico"><Icon name={meta.icon} size={14} /></span>
                    <span className="tt">{meta.label}</span>
                    {v !== 'p-home' && (
                      <span className="x" onClick={(e) => closePxTab(e, v)}><Icon name="close" size={12} /></span>
                    )}
                  </div>
                );
              })
            ) : mode === 'academia' ? (
              acTabs.map((v) => {
                const meta = academiaMeta(v, projects);
                return (
                  <div key={v} className={`doc-tab ${acView === v ? 'on' : ''}`} onClick={() => setAcView(v)}>
                    <span className="ico"><Icon name={meta.icon} size={14} /></span>
                    <span className="tt">{meta.label}</span>
                    {v !== 'a-home' && (
                      <span className="x" onClick={(e) => closeAcTab(e, v)}><Icon name="close" size={12} /></span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="doc-tab on">
                <span className="ico"><Icon name={MODE_ICON[mode]} size={14} /></span>
                <span className="tt">Startseite</span>
              </div>
            )}
            <div className="spacer"></div>
            <div className="theme-toggle" title={theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'} onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
            </div>
          </div>

          <div className="ws-content">
            {renderContent()}
          </div>
        </div>
      </div>
  );
}

/** One entry in a mode switcher's dropdown (Fall/Vorhaben/Projekt): click to
 * open, pencil to rename inline, × to delete (with confirmation). Shared
 * across all three switchers since the interaction is identical. */
function SwitcherRow({
  id,
  title,
  subtitle,
  onOpen,
  onRename,
  onDelete,
}: {
  id: string;
  title: string;
  subtitle: string;
  onOpen: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  useEffect(() => {
    if (!editing) setValue(title);
  }, [title, editing]);

  const commit = () => {
    setEditing(false);
    const clean = value.trim();
    if (clean && clean !== title) onRename(id, clean);
    else setValue(title);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm(`"${title}" unwiderruflich löschen? Alle zugehörigen Daten gehen verloren.`, {
      title: 'Löschen',
      kind: 'warning',
    });
    if (ok) onDelete(id);
  };

  return (
    <div className="po" onClick={editing ? undefined : onOpen}>
      <span className="pc" style={{ background: 'var(--accent)' }}></span>
      {editing ? (
        <input
          className="po-add-input"
          style={{ flex: 1 }}
          value={value}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setValue(title); setEditing(false); }
          }}
        />
      ) : (
        <span className="pt">{title}</span>
      )}
      <span className="ps">{subtitle}</span>
      {!editing && (
        <button className="ab" title="Umbenennen" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
          <Icon name="edit" size={12} />
        </button>
      )}
      <button className="ab danger" title="Löschen" onClick={handleDelete}><Icon name="close" size={12} /></button>
    </div>
  );
}

function PraxisSwitcher({
  open,
  setOpen,
  newFallTitle,
  setNewFallTitle,
  onOpenFall,
  onDeletedFall,
}: {
  open: boolean;
  setOpen: (fn: (o: boolean) => boolean) => void;
  newFallTitle: string;
  setNewFallTitle: (v: string) => void;
  onOpenFall: (id: string) => void;
  onDeletedFall: (id: string) => void;
}) {
  const { cases, createCase, renameCase, deleteCase } = useCaseList();

  const create = () => {
    const name = newFallTitle.trim();
    if (!name) return;
    createCase(name, '').then(() => setOpen(() => false));
    setNewFallTitle('');
  };

  const handleDelete = async (id: string) => {
    await deleteCase(id);
    onDeletedFall(id);
  };

  return (
    <div className="ws-switch" onClick={() => setOpen((o) => !o)}>
      <span className="av">FA</span>
      <span className="nm">Fälle{cases.length > 0 ? ` (${cases.length})` : ''}</span>
      <span className="cv"><Icon name="chevron-down" size={15} /></span>
      {open && (
        <div className="pop" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '4px 10px 6px' }}>
            Fall öffnen
          </div>
          {cases.map((c) => (
            <SwitcherRow
              key={c.id}
              id={c.id}
              title={c.title}
              subtitle={c.ref}
              onOpen={() => { onOpenFall(c.id); setOpen(() => false); }}
              onRename={renameCase}
              onDelete={handleDelete}
            />
          ))}
          <div className="po-add">
            <input
              className="po-add-input"
              placeholder="Neuer Fall …"
              value={newFallTitle}
              onChange={(e) => setNewFallTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="po-add-btn" onClick={create}><Icon name="plus" size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function AcademiaSwitcher({
  open,
  setOpen,
  newProjectTitle,
  setNewProjectTitle,
  onOpenProject,
  onDeletedProject,
}: {
  open: boolean;
  setOpen: (fn: (o: boolean) => boolean) => void;
  newProjectTitle: string;
  setNewProjectTitle: (v: string) => void;
  onOpenProject: (id: string) => void;
  onDeletedProject: (id: string) => void;
}) {
  const { projects, createProject, renameProject, deleteProject } = useProjectList();

  const create = () => {
    const name = newProjectTitle.trim();
    if (!name) return;
    createProject(name, 'Projekt', '').then(() => setOpen(() => false));
    setNewProjectTitle('');
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    onDeletedProject(id);
  };

  return (
    <div className="ws-switch" onClick={() => setOpen((o) => !o)}>
      <span className="av">PR</span>
      <span className="nm">Projekte{projects.length > 0 ? ` (${projects.length})` : ''}</span>
      <span className="cv"><Icon name="chevron-down" size={15} /></span>
      {open && (
        <div className="pop" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '4px 10px 6px' }}>
            Projekt öffnen
          </div>
          {projects.map((p) => (
            <SwitcherRow
              key={p.id}
              id={p.id}
              title={p.title}
              subtitle={p.type}
              onOpen={() => { onOpenProject(p.id); setOpen(() => false); }}
              onRename={renameProject}
              onDelete={handleDelete}
            />
          ))}
          <div className="po-add">
            <input
              className="po-add-input"
              placeholder="Neues Projekt …"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="po-add-btn" onClick={create}><Icon name="plus" size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategieSwitcher({
  open,
  setOpen,
  newVorhaben,
  setNewVorhaben,
  onOpenHome,
}: {
  open: boolean;
  setOpen: (fn: (o: boolean) => boolean) => void;
  newVorhaben: string;
  setNewVorhaben: (v: string) => void;
  onOpenHome: () => void;
}) {
  const { workspaces, currentId, switchWorkspace, createWorkspace, renameWorkspace, deleteWorkspace } = useStrategie();
  const current = workspaces.find((w) => w.id === currentId);

  const create = () => {
    const name = newVorhaben.trim();
    if (!name) return;
    createWorkspace(name, '').then(onOpenHome);
    setNewVorhaben('');
    setOpen(() => false);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);
    onOpenHome();
  };

  return (
    <div className="ws-switch" onClick={() => setOpen((o) => !o)}>
      <span className="av">{(current?.title || 'V').slice(0, 2).toUpperCase()}</span>
      <span className="nm">{current?.title || 'Vorhaben'}</span>
      <span className="cv"><Icon name="chevron-down" size={15} /></span>
      {open && (
        <div className="pop" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '4px 10px 6px' }}>
            Vorhaben öffnen
          </div>
          {workspaces.map((w) => (
            <SwitcherRow
              key={w.id}
              id={w.id}
              title={w.title}
              subtitle={w.horizon}
              onOpen={() => { switchWorkspace(w.id); onOpenHome(); setOpen(() => false); }}
              onRename={renameWorkspace}
              onDelete={handleDelete}
            />
          ))}
          <div className="po-add">
            <input
              className="po-add-input"
              placeholder="Neues Vorhaben …"
              value={newVorhaben}
              onChange={(e) => setNewVorhaben(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="po-add-btn" onClick={create}><Icon name="plus" size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategieExportNav() {
  const { data } = useStrategie();
  return (
    <>
      <div className="side-label">Export</div>
      <div className="nav-i" onClick={() => exportMarkdown(data)}>
        <span className="ico"><Icon name="export" size={15} /></span> Markdown (Obsidian)
      </div>
      <div className="nav-i" onClick={() => exportJson(data)}>
        <span className="ico"><Icon name="export" size={15} /></span> JSON-Datenstand
      </div>
    </>
  );
}
