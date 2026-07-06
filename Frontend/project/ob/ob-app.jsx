/* global React, ReactDOM, Icon, VAULT, metaFor, BACKLINKS, OUTLINES, TAGS,
   DashboardNote, SourceNote, ChapterNote, StubNote, GraphView,
   useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio,
   useState, useEffect, useRef, useCallback */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "#5b9bf6",
  "width": "normal"
}/*EDITMODE-END*/;

const ACCENTS = ["#5b9bf6", "#a684f5", "#4cc38a", "#e0894a", "#e06b8b"];

/* ---------- Vault file tree ---------- */
function FileTree({ activeNote, openNote }) {
  const [openFolders, setOpenFolders] = useState(() => {
    const o = {}; VAULT.forEach((f, i) => { o[i] = !!f.open; }); return o;
  });
  return (
    <div className="tree scroll">
      {VAULT.map((folder, i) => (
        <div key={i}>
          <div className="tree-row folder" onClick={() => setOpenFolders((s) => ({ ...s, [i]: !s[i] }))}>
            <span className={"tw" + (openFolders[i] ? "" : " collapsed")}><Icon name="chevron-down" /></span>
            <span className="ico"><Icon name={openFolders[i] ? "folder-open" : "folder"} /></span>
            <span className="nm">{folder.name}</span>
            {folder.count != null && <span className="cnt">{folder.count}</span>}
          </div>
          {openFolders[i] && folder.children.map((c) => (
            <div key={c.id} className={"tree-row file" + (activeNote === c.id ? " active" : "")}
              style={{ paddingLeft: 26 }} onClick={() => openNote(c.id)}>
              <span className="tw" />
              <span className="ico"><Icon name={c.icon || "file-text"} /></span>
              <span className="nm">{c.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Note renderer ---------- */
function NoteView({ id, openNote, onTag, mode, width }) {
  const m = metaFor(id);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [id]);

  if (id === "graph") {
    return (
      <div className="note-scroll scroll" ref={scrollRef} style={{ position: "relative" }}>
        <GraphView open={openNote} activeId={id} />
      </div>
    );
  }

  let body;
  if (id === "dashboard") body = <DashboardNote open={openNote} onTag={onTag} />;
  else if (id === "sutton") body = <SourceNote open={openNote} onTag={onTag} />;
  else if (id === "chapter2") body = <ChapterNote open={openNote} onTag={onTag} />;
  else body = <StubNote id={id} open={openNote} />;

  return (
    <div className="note-scroll scroll" ref={scrollRef} style={{ position: "relative" }}>
      <div className={"note" + (width === "wide" ? " wide" : "")} data-mode={mode} data-screen-label={"note:" + id}>
        {m.folder && (
          <div className="note-breadcrumb">
            <Icon name="folder" style={{ width: 13, height: 13 }} />
            <span>{m.folder}</span><span className="sep">/</span><span>{m.title}</span>
          </div>
        )}
        <h1 className="inline-title">{m.title}</h1>
        {body}
      </div>
    </div>
  );
}

/* ---------- Right sidebar ---------- */
function RightPanel({ id, tab, setTab, openNote, onTag }) {
  const backlinks = BACKLINKS[id] || [];
  const outline = OUTLINES[id] || [];
  return (
    <div className="right-body scroll">
      {tab === "backlinks" && (
        <>
          <div className="panel-h">Linked mentions <span className="pc">{backlinks.length}</span></div>
          {backlinks.length === 0 && <div className="bl-ctx" style={{ paddingLeft: 6 }}>No backlinks to this note yet.</div>}
          {backlinks.map((b) => (
            <div className="bl-group" key={b.id}>
              <div className="bl-src" onClick={() => openNote(b.id)}>
                <Icon name="file-text" /><span>{b.name}</span><span className="c">1</span>
              </div>
              <div className="bl-ctx" onClick={() => openNote(b.id)}>
                {b.ctx.map((seg, i) => seg.startsWith("[[")
                  ? <span className="ilink" key={i}>{seg.replace(/\[\[|\]\]/g, "")}</span>
                  : <span key={i}>{seg}</span>)}
              </div>
            </div>
          ))}
        </>
      )}
      {tab === "outline" && (
        <>
          <div className="panel-h">Outline</div>
          <div className="outline">
            {outline.length === 0 && <div className="ol">No headings.</div>}
            {outline.map((o, i) => (
              <div key={i} className={"ol l" + o.lvl} onClick={() => {
                const el = document.querySelector(`[data-h="${o.t}"]`);
                const sc = document.querySelector(".note-scroll");
                if (el && sc) sc.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
              }}>{o.t}</div>
            ))}
          </div>
        </>
      )}
      {tab === "tags" && (
        <>
          <div className="panel-h">Tags <span className="pc">{TAGS.length}</span></div>
          {TAGS.map((t) => (
            <div className="tagrow" key={t.name} onClick={() => onTag(t.name)}>
              <span className="th"><Icon name="hash" style={{ width: 14, height: 14 }} /></span>
              <span>{t.name}</span><span className="c">{t.c}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ---------- Command palette ---------- */
const COMMANDS = [
  { id: "dashboard", label: "Research Hub", icon: "map", sec: "Notes" },
  { id: "sutton", label: "Sutton & Barto 2018", icon: "book", sec: "Notes" },
  { id: "chapter2", label: "Chapter 2 — Methods", icon: "pencil", sec: "Notes" },
  { id: "graph", label: "Open graph view", icon: "graph", sec: "Notes" },
  { id: "weekly", label: "Weekly Review 2026-W23", icon: "history", sec: "Notes" },
  { id: "e1", label: "Pilot A — bandit policy", icon: "flask", sec: "Notes" },
];
function CommandPalette({ onClose, openNote }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const list = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  useEffect(() => { setSel(0); }, [q]);
  const choose = (c) => { if (c) { openNote(c.id); onClose(); } };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { choose(list[sel]); }
    else if (e.key === "Escape") { onClose(); }
  };
  return (
    <div className="palette-scrim" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <Icon name="search" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search or jump to…" />
          <span className="kbd-key">esc</span>
        </div>
        <div className="palette-list scroll">
          <div className="palette-sec">Notes</div>
          {list.map((c, i) => (
            <div key={c.id} className={"palette-item" + (i === sel ? " sel" : "")}
              onMouseEnter={() => setSel(i)} onClick={() => choose(c)}>
              <span className="pi-ic"><Icon name={c.icon} /></span>
              <span>{c.label}</span>
              <span className="kbd">↵</span>
            </div>
          ))}
          {list.length === 0 && <div className="palette-item">No matches.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tabs, setTabs] = useState(["dashboard", "sutton", "chapter2", "graph"]);
  const [active, setActive] = useState("dashboard");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState("backlinks");
  const [mode, setMode] = useState("reading"); // reading | source
  const [palette, setPalette] = useState(false);

  // apply theme + accent
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.theme, t.accent]);

  const openNote = useCallback((id) => {
    setTabs((tb) => tb.includes(id) ? tb : [...tb, id]);
    setActive(id);
  }, []);
  const closeTab = (id, e) => {
    e.stopPropagation();
    setTabs((tb) => {
      const idx = tb.indexOf(id);
      const nt = tb.filter((x) => x !== id);
      if (active === id && nt.length) setActive(nt[Math.max(0, idx - 1)]);
      return nt.length ? nt : tb; // keep at least one
    });
  };
  const onTag = (name) => { /* visual only in mockup */ };

  // keyboard
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      else if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const wordCount = active === "chapter2" ? "1,240 words" : active === "sutton" ? "284 words" : active === "dashboard" ? "320 words" : "—";
  const blCount = (BACKLINKS[active] || []).length;

  return (
    <div className="workspace">
      <div className="ws-main">
        {/* Ribbon */}
        <div className="ribbon">
          <button className={"rb" + (leftOpen ? " on" : "")} title="Files" onClick={() => setLeftOpen((v) => !v)}><Icon name="file-text" /></button>
          <button className="rb" title="Search" onClick={() => setPalette(true)}><Icon name="search" /></button>
          <button className={"rb" + (active === "graph" ? " on" : "")} title="Graph view" onClick={() => openNote("graph")}><Icon name="graph" /></button>
          <button className="rb" title="Bookmarks"><Icon name="bookmark" /></button>
          <button className="rb" title="Tags" onClick={() => { setRightOpen(true); setRightTab("tags"); }}><Icon name="hash" /></button>
          <span className="sp" />
          <button className="rb" title="Command palette" onClick={() => setPalette(true)}><Icon name="command" /></button>
          <button className="rb" title="Settings"><Icon name="settings" /></button>
        </div>

        {/* Left sidebar */}
        <div className={"left" + (leftOpen ? "" : " collapsed")}>
          <div className="left-head">
            <div className="vault"><Icon name="layers" />Research Vault<Icon name="chevron-down" className="chev" /></div>
          </div>
          <div className="nav-icons">
            <button className="ni" title="New note"><Icon name="plus" /></button>
            <button className="ni" title="New folder"><Icon name="folder" /></button>
            <span className="grow" />
            <button className="ni" title="Sort"><Icon name="filter" /></button>
            <button className="ni" title="Collapse all"><Icon name="list" /></button>
          </div>
          <FileTree activeNote={active} openNote={openNote} />
        </div>

        {/* Center */}
        <div className="center">
          <div className="tabbar">
            <div className="tabs scroll">
              {tabs.map((id) => {
                const m = metaFor(id);
                return (
                  <div key={id} className={"tab" + (active === id ? " active" : "")} onClick={() => setActive(id)}>
                    <Icon name={m.icon} className="ti" />
                    <span className="tt">{m.title}</span>
                    <span className="tx" onClick={(e) => closeTab(id, e)}><Icon name="x" /></span>
                  </div>
                );
              })}
            </div>
            <div className="tb-actions">
              <button className="tba" title="New tab" onClick={() => setPalette(true)}><Icon name="plus" /></button>
            </div>
            <span className="grow" />
            <div className="tb-actions">
              <button className="tba" title="Toggle right panel" onClick={() => setRightOpen((v) => !v)}><Icon name="panel-right" /></button>
            </div>
          </div>
          <NoteView id={active} openNote={openNote} onTag={onTag} mode={mode} width={t.width} />
        </div>

        {/* Right sidebar */}
        <div className={"right" + (rightOpen ? "" : " collapsed")}>
          <div className="right-tabs">
            <button className={"rt" + (rightTab === "backlinks" ? " on" : "")} onClick={() => setRightTab("backlinks")}><Icon name="link" />Backlinks</button>
            <button className={"rt" + (rightTab === "outline" ? " on" : "")} onClick={() => setRightTab("outline")}><Icon name="list" />Outline</button>
            <button className={"rt" + (rightTab === "tags" ? " on" : "")} onClick={() => setRightTab("tags")}><Icon name="hash" />Tags</button>
          </div>
          <RightPanel id={active} tab={rightTab} setTab={setRightTab} openNote={openNote} onTag={onTag} />
        </div>
      </div>

      {/* Status bar */}
      <div className="statusbar">
        <span className="si" onClick={() => setLeftOpen((v) => !v)} title="Toggle left sidebar"><Icon name="panel-left" /></span>
        <span className="si" onClick={() => setMode((mm) => mm === "reading" ? "source" : "reading")}>
          <Icon name={mode === "reading" ? "book" : "pencil"} />{mode === "reading" ? "Reading view" : "Source mode"}
        </span>
        <span className="grow" />
        <span className="si">{blCount} backlinks</span>
        <span className="si">{wordCount}</span>
        <span className="si live"><Icon name="sync" />Synced</span>
        <span className="si" onClick={() => setTweak("theme", t.theme === "dark" ? "light" : "dark")} title="Toggle theme">
          <Icon name={t.theme === "dark" ? "moon" : "sun"} />
        </span>
        <span className="si" onClick={() => setRightOpen((v) => !v)} title="Toggle right sidebar"><Icon name="panel-right" /></span>
      </div>

      {palette && <CommandPalette onClose={() => setPalette(false)} openNote={openNote} />}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={t.theme} options={["dark", "light"]} onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Reading" />
        <TweakRadio label="Line width" value={t.width} options={["normal", "wide"]} onChange={(v) => setTweak("width", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
