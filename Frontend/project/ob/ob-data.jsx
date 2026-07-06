/* global React */
const { useState, useEffect, useRef, useCallback } = React;

/* ============================================================
   ICONS  (lucide-style, 24x24 stroke)
   ============================================================ */
const ICON_PATHS = {
  "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
  "folder": '<path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
  "folder-open": '<path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2"/><path d="M3.2 11h17.6l-1.7 7.2a1 1 0 0 1-1 0.8H5.9a1 1 0 0 1-1-0.8z"/>',
  "chevron-right": '<path d="M9 6l6 6-6 6"/>',
  "chevron-down": '<path d="M6 9l6 6 6-6"/>',
  "search": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  "hash": '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  "link": '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  "graph": '<circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="7" r="2.4"/><circle cx="12" cy="17" r="2.4"/><circle cx="18" cy="18" r="2"/><path d="M7 7l3 8M17 9l-4 6M14 17l3 1"/>',
  "settings": '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.2-1.3L14 2h-4l-.3 2.4a7 7 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.3l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.2 1.3L10 22h4l.3-2.4a7 7 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12z"/>',
  "command": '<path d="M9 3a3 3 0 1 0 3 3V6h0v12a3 3 0 1 1-3-3h12a3 3 0 1 1-3 3V6a3 3 0 1 1 3 3H6"/>',
  "panel-left": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  "panel-right": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  "check": '<path d="M5 12l5 5L20 6"/>',
  "check-sm": '<path d="M4 12l5 5L20 6"/>',
  "x": '<path d="M6 6l12 12M18 6L6 18"/>',
  "plus": '<path d="M12 5v14M5 12h14"/>',
  "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  "more": '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  "book": '<path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2z"/><path d="M5 20a2 2 0 0 1 2-2h12"/>',
  "flask": '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7 15h10"/>',
  "pencil": '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  "list": '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  "list-todo": '<path d="M3 5h4v4H3zM3 15h4v4H3z"/><path d="M11 7h10M11 17h10"/><path d="M3.5 6.5l1 1 1.5-2"/>',
  "star": '<path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7z"/>',
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "sync": '<path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 4v4h-4M3 20v-4h4"/>',
  "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  "quote": '<path d="M7 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-4M17 7h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-4"/>',
  "lightbulb": '<path d="M9 18h6M10 22h4"/><path d="M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 2z"/>',
  "alert": '<path d="M10.3 4l-7.5 13A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  "map": '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  "tag": '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  "layers": '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  "moon": '<path d="M21 13A8.5 8.5 0 1 1 11 3a6.5 6.5 0 0 0 10 10z"/>',
  "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "bookmark": '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>',
  "gauge": '<path d="M12 14l4-4"/><path d="M4 18a8 8 0 1 1 16 0z" fill="none"/>',
  "table": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>',
  "dot": '<circle cx="12" cy="12" r="4"/>',
  "history": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v5l3 2"/>',
  "filter": '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  "expand": '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  "zoom-in": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
};

function Icon({ name, className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || "" }} />
  );
}

/* ============================================================
   MARKDOWN PRIMITIVES
   ============================================================ */

// internal link — clicking navigates (open is provided by context)
function ILink({ to, children, open, unresolved }) {
  return (
    <span className={"ilink" + (unresolved ? " unresolved" : "")}
      onClick={(e) => { e.stopPropagation(); if (open && to) open(to); }}>
      {children || to}
    </span>
  );
}

function Tag({ name, onTag }) {
  return <span className="tag" onClick={(e) => { e.stopPropagation(); onTag && onTag(name); }}>{name}</span>;
}

function Pill({ tone = "gray", dot, children }) {
  return <span className={"pill " + tone}>{dot && <span className="dot" />}{children}</span>;
}

const CALLOUT_ICON = { note: "info", info: "info", todo: "list-todo", tip: "lightbulb", quote: "quote", warn: "alert", danger: "alert" };
function Callout({ type = "info", title, icon, children }) {
  return (
    <div className="callout" data-type={type === "note" || type === "info" ? undefined : type}>
      <div className="c-title"><Icon name={icon || CALLOUT_ICON[type] || "info"} />{title}</div>
      {children && <div className="c-body">{children}</div>}
    </div>
  );
}

function DVCheck({ on }) {
  return on
    ? <span className="dv-check"><Icon name="check" /></span>
    : <span className="dv-x"><Icon name="dot" style={{ opacity: .4 }} /></span>;
}

/* ============================================================
   VAULT DATA
   ============================================================ */
const VAULT = [
  { type: "folder", name: "00 — Dashboard", open: true, children: [
    { type: "file", id: "dashboard", name: "Research Hub", icon: "map" },
    { type: "file", id: "weekly", name: "Weekly Review 2026-W23", icon: "history" },
  ]},
  { type: "folder", name: "10 — Sources", open: true, count: 38, children: [
    { type: "file", id: "sutton", name: "Sutton & Barto 2018", icon: "book" },
    { type: "file", id: "src-norman", name: "Norman 2013 — Design of Everyday Things", icon: "book" },
    { type: "file", id: "src-vanlehn", name: "VanLehn 2011 — Tutoring Systems", icon: "book" },
    { type: "file", id: "src-deci", name: "Deci & Ryan 2000", icon: "book" },
  ]},
  { type: "folder", name: "20 — Literature Notes", open: false, count: 24, children: [
    { type: "file", id: "n1", name: "Reward shaping risks", icon: "file-text" },
    { type: "file", id: "n2", name: "Intrinsic vs extrinsic motivation", icon: "file-text" },
    { type: "file", id: "n3", name: "Knowledge tracing models", icon: "file-text" },
  ]},
  { type: "folder", name: "30 — Experiments", open: false, count: 6, children: [
    { type: "file", id: "e1", name: "Pilot A — bandit policy", icon: "flask" },
    { type: "file", id: "e2", name: "Experiment log", icon: "flask" },
  ]},
  { type: "folder", name: "40 — Writing", open: true, children: [
    { type: "file", id: "chapter2", name: "Chapter 2 — Methods", icon: "pencil" },
    { type: "file", id: "ch-outline", name: "Thesis outline", icon: "list" },
  ]},
  { type: "folder", name: "Templates", open: false, count: 4, children: [
    { type: "file", id: "t1", name: "Source note", icon: "file-text" },
    { type: "file", id: "t2", name: "Daily note", icon: "file-text" },
  ]},
];

// note id -> tab metadata
const NOTE_META = {
  dashboard: { title: "Research Hub", icon: "map", folder: "00 — Dashboard" },
  sutton:    { title: "Sutton & Barto 2018", icon: "book", folder: "10 — Sources" },
  chapter2:  { title: "Chapter 2 — Methods", icon: "pencil", folder: "40 — Writing" },
  graph:     { title: "Graph view", icon: "graph", folder: null },
};
function metaFor(id) {
  return NOTE_META[id] || { title: (findFile(id) || {}).name || id, icon: (findFile(id) || {}).icon || "file-text", folder: null };
}
function findFile(id) {
  for (const f of VAULT) for (const c of (f.children || [])) if (c.id === id) return c;
  return null;
}

// right-panel data per note
const BACKLINKS = {
  dashboard: [
    { id: "weekly", name: "Weekly Review 2026-W23", ctx: ["Pulled this week's focus from the ", "[[Research Hub]]", " MOC."] },
    { id: "chapter2", name: "Chapter 2 — Methods", ctx: ["Linked back to ", "[[Research Hub]]", " for the open questions list."] },
    { id: "e1", name: "Pilot A — bandit policy", ctx: ["Tracked under ", "[[Research Hub]]", " → Pipeline → Doing."] },
  ],
  sutton: [
    { id: "n1", name: "Reward shaping risks", ctx: ["Builds on ", "[[Sutton & Barto 2018]]", " ch. 17 on reward design."] },
    { id: "chapter2", name: "Chapter 2 — Methods", ctx: ["Policy follows ", "[[Sutton & Barto 2018]]", ", §2.7 (UCB)."] },
    { id: "dashboard", name: "Research Hub", ctx: ["Core reference in ", "[[Sutton & Barto 2018]]", "."] },
  ],
  chapter2: [
    { id: "dashboard", name: "Research Hub", ctx: ["Draft tracked in ", "[[Chapter 2 — Methods]]", "."] },
  ],
};

const OUTLINES = {
  dashboard: [
    { lvl: 1, t: "Research Hub" }, { lvl: 2, t: "This week" }, { lvl: 2, t: "Open questions" },
    { lvl: 2, t: "Sources" }, { lvl: 2, t: "Pipeline" }, { lvl: 2, t: "Tasks" }, { lvl: 2, t: "Map of content" },
  ],
  sutton: [
    { lvl: 1, t: "Sutton & Barto 2018" }, { lvl: 2, t: "Abstract" }, { lvl: 2, t: "Highlights" },
    { lvl: 2, t: "My take" }, { lvl: 2, t: "Related" },
  ],
  chapter2: [
    { lvl: 1, t: "Methods" }, { lvl: 2, t: "2.1 Study design" }, { lvl: 2, t: "2.2 The tutoring policy" },
    { lvl: 3, t: "Reward signal" }, { lvl: 2, t: "2.3 Participants" }, { lvl: 2, t: "2.4 Measures" },
  ],
};

const TAGS = [
  { name: "thesis", c: 41 }, { name: "moc", c: 6 }, { name: "rl", c: 28 }, { name: "tutoring", c: 22 },
  { name: "method", c: 17 }, { name: "to-read", c: 9 }, { name: "key", c: 14 }, { name: "experiment", c: 11 },
  { name: "open-question", c: 7 }, { name: "motivation", c: 8 },
];

Object.assign(window, {
  React, useState, useEffect, useRef, useCallback,
  Icon, ILink, Tag, Pill, Callout, DVCheck,
  VAULT, NOTE_META, metaFor, findFile, BACKLINKS, OUTLINES, TAGS,
});
