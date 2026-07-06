/* global React, Icon, ILink, Tag, Pill, Callout, DVCheck, useState */

/* ============================================================
   NOTE — DASHBOARD (the MOC, centerpiece)
   ============================================================ */
function DashboardNote({ open, onTag }) {
  return (
    <div className="md">
      <div className="properties">
        <div className="prop-head"><Icon name="list" /> Properties</div>
        <div className="prop-row"><span className="prop-key"><Icon name="dot" /> status</span>
          <span className="prop-val"><Pill tone="amber" dot>In progress</Pill></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="target" /> phase</span>
          <span className="prop-val">Pilot study <span className="muted">→ analysis</span></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="user" /> advisor</span>
          <span className="prop-val"><ILink to="src-norman" open={open}>Dr. M. Reyes</ILink></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="calendar" /> deadline</span>
          <span className="prop-val">2026-09-15 <span className="due soon"><Icon name="clock" />14 weeks left</span></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="gauge" /> progress</span>
          <span className="prop-val"><span className="meter"><span style={{ width: "42%" }} /></span><span className="num">42%</span></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="hash" /> tags</span>
          <span className="prop-val">
            <Tag name="moc" onTag={onTag} /><Tag name="thesis" onTag={onTag} />
            <Tag name="rl" onTag={onTag} /><Tag name="tutoring" onTag={onTag} />
          </span></div>
      </div>

      <p className="lede">A living map of the dissertation — adaptive tutoring with reinforcement learning.
        Everything links back here: sources, notes, experiments and drafts.</p>

      <h2 data-h="This week"><span className="hh">§</span>This week</h2>
      <Callout type="todo" title="Focus — week 23">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Finish the pilot analysis and update <ILink to="e1" open={open}>Pilot A — bandit policy</ILink>.</li>
          <li>Draft <ILink to="chapter2" open={open}>§2.2 The tutoring policy</ILink> (≈ 600 words).</li>
          <li>Reply to advisor on reward design — see <ILink to="n1" open={open}>Reward shaping risks</ILink>.</li>
        </ul>
      </Callout>

      <h2 data-h="Open questions"><span className="hh">§</span>Open questions</h2>
      <div className="dv">
        <div className="dv-cap"><span className="q">LIST</span> where contains(#open-question)<span className="ct">3 results</span></div>
        <table className="dv-table">
          <thead><tr><th>Question</th><th>Status</th><th>Linked note</th></tr></thead>
          <tbody>
            <tr onClick={() => open("n1")}>
              <td>Does reward shaping bias the learned policy?</td>
              <td><Pill tone="amber" dot>investigating</Pill></td>
              <td><ILink to="n1" open={open}>Reward shaping risks</ILink></td></tr>
            <tr onClick={() => open("n2")}>
              <td>Intrinsic vs. extrinsic reward for engagement?</td>
              <td><Pill tone="blue" dot>open</Pill></td>
              <td><ILink to="n2" open={open}>Intrinsic vs extrinsic</ILink></td></tr>
            <tr onClick={() => open("n3")}>
              <td>Which knowledge-tracing model as state?</td>
              <td><Pill tone="green" dot>decided</Pill></td>
              <td><ILink to="n3" open={open}>Knowledge tracing models</ILink></td></tr>
          </tbody>
        </table>
      </div>

      <h2 data-h="Sources"><span className="hh">§</span>Sources</h2>
      <div className="dv">
        <div className="dv-cap"><span className="q">TABLE</span> author, year, type, read, tags FROM "10 — Sources"<span className="ct">38 total · 4 shown</span></div>
        <table className="dv-table">
          <thead><tr><th>Author</th><th>Year</th><th>Type</th><th>Read</th><th>Tags</th></tr></thead>
          <tbody>
            <tr onClick={() => open("sutton")}>
              <td><ILink to="sutton" open={open}>Sutton & Barto</ILink></td>
              <td><span className="num">2018</span></td><td>Book</td>
              <td><DVCheck on /></td>
              <td><div className="cellstack"><Tag name="rl" onTag={onTag} /><Tag name="key" onTag={onTag} /></div></td></tr>
            <tr onClick={() => open("src-vanlehn")}>
              <td><ILink to="src-vanlehn" open={open}>VanLehn</ILink></td>
              <td><span className="num">2011</span></td><td>Article</td>
              <td><DVCheck on /></td>
              <td><div className="cellstack"><Tag name="tutoring" onTag={onTag} /></div></td></tr>
            <tr onClick={() => open("src-deci")}>
              <td><ILink to="src-deci" open={open}>Deci & Ryan</ILink></td>
              <td><span className="num">2000</span></td><td>Article</td>
              <td><DVCheck /></td>
              <td><div className="cellstack"><Tag name="motivation" onTag={onTag} /><Tag name="to-read" onTag={onTag} /></div></td></tr>
            <tr onClick={() => open("src-norman")}>
              <td><ILink to="src-norman" open={open}>Norman</ILink></td>
              <td><span className="num">2013</span></td><td>Book</td>
              <td><DVCheck /></td>
              <td><div className="cellstack"><Tag name="to-read" onTag={onTag} /></div></td></tr>
          </tbody>
        </table>
      </div>

      <h2 data-h="Pipeline"><span className="hh">§</span>Pipeline</h2>
      <div className="board">
        <div className="col-k">
          <div className="kh"><span className="kdot" style={{ background: "var(--text-faint)" }} />Backlog<span className="kc">3</span></div>
          <div className="kcard">Ablation: state features<div className="kt"><Tag name="experiment" onTag={onTag} /></div></div>
          <div className="kcard">Recruit cohort 2<div className="kt"><Tag name="method" onTag={onTag} /></div></div>
          <div className="kcard">Related work pass</div>
        </div>
        <div className="col-k">
          <div className="kh"><span className="kdot" style={{ background: "var(--cal-info)" }} />Doing<span className="kc">2</span></div>
          <div className="kcard">Pilot A analysis<div className="kt"><Tag name="rl" onTag={onTag} /></div></div>
          <div className="kcard">Draft §2.2 policy<div className="kt"><Tag name="thesis" onTag={onTag} /></div></div>
        </div>
        <div className="col-k">
          <div className="kh"><span className="kdot" style={{ background: "var(--cal-warn)" }} />Review<span className="kc">1</span></div>
          <div className="kcard">Reward function spec<div className="kt"><Tag name="open-question" onTag={onTag} /></div></div>
        </div>
        <div className="col-k">
          <div className="kh"><span className="kdot" style={{ background: "var(--cal-tip)" }} />Done<span className="kc">2</span></div>
          <div className="kcard">IRB approval</div>
          <div className="kcard">Sim environment v1</div>
        </div>
      </div>

      <h2 data-h="Tasks"><span className="hh">§</span>Tasks</h2>
      <TaskList onTag={onTag} />

      <Callout type="quote" title="Guiding question">
        Can a tutor that optimises long-term mastery — not next-answer correctness —
        keep learners motivated without gaming the reward?
      </Callout>

      <h2 data-h="Map of content"><span className="hh">§</span>Map of content</h2>
      <div className="linkgrid">
        <div className="linkcard" onClick={() => open("graph")}>
          <span className="lc-ic"><Icon name="graph" /></span>
          <span className="lc-tx"><span className="lc-t">Open in Graph view</span><span className="lc-s">88 notes · 214 links</span></span></div>
        <div className="linkcard" onClick={() => open("chapter2")}>
          <span className="lc-ic"><Icon name="pencil" /></span>
          <span className="lc-tx"><span className="lc-t">Chapter 2 — Methods</span><span className="lc-s">Draft · 1,240 words</span></span></div>
        <div className="linkcard" onClick={() => open("e2")}>
          <span className="lc-ic"><Icon name="flask" /></span>
          <span className="lc-tx"><span className="lc-t">Experiment log</span><span className="lc-s">6 runs tracked</span></span></div>
        <div className="linkcard" onClick={() => open("weekly")}>
          <span className="lc-ic"><Icon name="history" /></span>
          <span className="lc-tx"><span className="lc-t">Weekly Review 2026-W23</span><span className="lc-s">Updated today</span></span></div>
      </div>
    </div>
  );
}

function TaskList({ onTag }) {
  const init = [
    { t: "Export pilot results to figures/", done: false, due: "2026-06-05", tone: "soon", tag: "experiment" },
    { t: "Email Deci & Ryan PDF to reading queue", done: false, due: "2026-06-08", tag: "to-read" },
    { t: "Re-run UCB sweep with c = 1.4", done: true, due: "2026-06-02" },
    { t: "Define reward clipping range", done: false, due: "2026-06-01", tone: "over", tag: "open-question" },
    { t: "Backup vault + push to git", done: true, due: "2026-05-31" },
  ];
  const [tasks, setTasks] = useState(init);
  const toggle = (i) => setTasks((t) => t.map((x, j) => j === i ? { ...x, done: !x.done } : x));
  return (
    <div className="tasks">
      {tasks.map((tk, i) => (
        <div key={i} className={"task" + (tk.done ? " done" : "")} onClick={() => toggle(i)}>
          <span className="box"><Icon name="check-sm" /></span>
          <span className="tk-main">
            <span className="tk-text">{tk.t}</span>
            <span className="tk-meta">
              <span className={"due" + (tk.tone ? " " + tk.tone : "")}><Icon name="calendar" />{tk.due}</span>
              {tk.tag && <Tag name={tk.tag} onTag={onTag} />}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   NOTE — SOURCE (literature note)
   ============================================================ */
function SourceNote({ open, onTag }) {
  return (
    <div className="md">
      <div className="properties">
        <div className="prop-head"><Icon name="list" /> Properties</div>
        <div className="prop-row"><span className="prop-key"><Icon name="user" /> authors</span>
          <span className="prop-val">Richard S. Sutton · Andrew G. Barto</span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="calendar" /> year</span><span className="prop-val">2018</span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="book" /> type</span><span className="prop-val"><Pill tone="blue">Book · 2nd ed.</Pill></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="dot" /> status</span><span className="prop-val"><Pill tone="green" dot>Read</Pill></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="star" /> rating</span><span className="prop-val" style={{ color: "var(--cal-warn)", letterSpacing: 2 }}>★★★★★</span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="link" /> doi</span><span className="prop-val"><span className="ilink">10.5555/3312046</span></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="hash" /> tags</span>
          <span className="prop-val"><Tag name="rl" onTag={onTag} /><Tag name="key" onTag={onTag} /><Tag name="method" onTag={onTag} /></span></div>
      </div>

      <p className="lede">The reference text. Returned to here whenever the policy or value-function
        formulation needs grounding.</p>

      <h2 data-h="Abstract"><span className="hh">§</span>Abstract</h2>
      <Callout type="info" title="Source summary">
        A comprehensive treatment of reinforcement learning — agents learning from interaction to
        maximise a numerical reward signal. Foundations: value functions, temporal-difference
        learning, policy gradients, and the exploration–exploitation trade-off.
      </Callout>

      <h2 data-h="Highlights"><span className="hh">§</span>Highlights</h2>
      <p><span className="hl">Reinforcement learning is learning what to do — how to map situations to
        actions — so as to maximise a numerical reward signal.</span> <span className="fnref">p.1</span> —
        the framing the whole tutoring policy is built on.</p>
      <p><span className="hl">A learner is not told which actions to take, but must discover which actions
        yield the most reward by trying them.</span> <span className="fnref">p.2</span> Maps directly to the
        tutor's item-selection problem — see <ILink to="n1" open={open}>Reward shaping risks</ILink>.</p>
      <div className="blockquote">UCB selects the action maximising Q(a) + c·√(ln t / N(a)) — optimism
        in the face of uncertainty. <span className="fnref">§2.7</span></div>

      <h2 data-h="My take"><span className="hh">§</span>My take</h2>
      <Callout type="tip" title="Why this matters for the thesis">
        The contextual-bandit framing (ch. 2) is enough for the pilot; full MDP / TD-learning
        (ch. 6) only becomes necessary once the state carries <ILink to="n3" open={open}>knowledge
        tracing</ILink> across a session. Start simple, escalate.
      </Callout>

      <h2 data-h="Related"><span className="hh">§</span>Related</h2>
      <div className="linkgrid">
        <div className="linkcard" onClick={() => open("dashboard")}>
          <span className="lc-ic"><Icon name="map" /></span>
          <span className="lc-tx"><span className="lc-t">Research Hub</span><span className="lc-s">Back to the MOC</span></span></div>
        <div className="linkcard" onClick={() => open("chapter2")}>
          <span className="lc-ic"><Icon name="pencil" /></span>
          <span className="lc-tx"><span className="lc-t">Chapter 2 — Methods</span><span className="lc-s">Cites §2.7</span></span></div>
      </div>
    </div>
  );
}

/* ============================================================
   NOTE — CHAPTER (writing / draft)
   ============================================================ */
function ChapterNote({ open, onTag }) {
  return (
    <div className="md">
      <div className="properties">
        <div className="prop-head"><Icon name="list" /> Properties</div>
        <div className="prop-row"><span className="prop-key"><Icon name="layers" /> type</span><span className="prop-val"><Pill tone="blue">Draft</Pill></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="list" /> chapter</span><span className="prop-val">2 of 6</span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="dot" /> status</span><span className="prop-val"><Pill tone="amber" dot>Drafting</Pill></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="pencil" /> words</span><span className="prop-val"><span className="num">1,240</span> <span className="muted">/ ~3,000 target</span></span></div>
        <div className="prop-row"><span className="prop-key"><Icon name="hash" /> tags</span>
          <span className="prop-val"><Tag name="thesis" onTag={onTag} /><Tag name="method" onTag={onTag} /></span></div>
      </div>

      <h2 data-h="2.1 Study design"><span className="hh">2.1</span>Study design</h2>
      <p>This chapter describes the design of the adaptive tutoring system and the protocol used to
        evaluate it. The system is framed as a sequential decision problem in which a policy selects
        the next learning item for a student given an estimate of their current mastery
        <span className="fnref">1</span>.</p>
      <p>We adopt a contextual-bandit formulation rather than a full Markov decision process for the
        pilot, following <ILink to="sutton" open={open}>Sutton & Barto</ILink>. This keeps the action
        space interpretable while still allowing the reward to reflect longer-term mastery.</p>

      <h2 data-h="2.2 The tutoring policy"><span className="hh">2.2</span>The tutoring policy</h2>
      <p>At each step <span className="code">t</span>, the tutor observes a context vector
        <span className="code">x_t</span> summarising the learner's knowledge state and selects an item
        <span className="code">a_t</span> to maximise expected reward. Exploration uses an upper-confidence
        bound, <span className="code">Q(a) + c·√(ln t / N(a))</span> <span className="fnref">2</span>.</p>
      <h3><span className="hh">·</span>Reward signal</h3>
      <p>The reward is <em>not</em> next-answer correctness but the post-test gain on a held-out probe,
        discouraging the policy from exploiting easy items. The risks of this choice are catalogued in
        <ILink to="n1" open={open}>Reward shaping risks</ILink>.</p>
      <div className="blockquote">Design note: clip the per-item reward to [−1, 1] before the update —
        unbounded gains destabilised the value estimates in <ILink to="e1" open={open}>Pilot A</ILink>.</div>

      <h2 data-h="2.3 Participants"><span className="hh">2.3</span>Participants</h2>
      <p>Forty undergraduate participants completed the pilot; a second cohort is planned (see the
        <ILink to="dashboard" open={open}>Research Hub</ILink> pipeline). All sessions ran in the browser
        with knowledge tracing updated server-side.</p>

      <div className="footnotes">
        <div className="fn"><span className="fi">1.</span> Mastery is estimated with a Bayesian knowledge-tracing model; see <ILink to="n3" open={open}>Knowledge tracing models</ILink>.</div>
        <div className="fn"><span className="fi">2.</span> Sutton & Barto (2018), §2.7. Exploration constant <span className="code">c = 1.4</span> after the sweep in Pilot A.</div>
      </div>
    </div>
  );
}

/* ============================================================
   GENERIC STUB NOTE (for not-yet-written notes)
   ============================================================ */
function StubNote({ id, open }) {
  const m = window.metaFor(id);
  return (
    <div className="md">
      <p className="lede">This note is part of the vault but only stubbed for the mockup.</p>
      <Callout type="warn" title="Placeholder">
        <strong>{m.title}</strong> would open here. The wikilinks, tags and Dataview queries on the
        <ILink to="dashboard" open={open}> Research Hub</ILink> are all live — try the dashboard, the
        source note <ILink to="sutton" open={open}>Sutton & Barto 2018</ILink>, or
        <ILink to="chapter2" open={open}> Chapter 2 — Methods</ILink>.
      </Callout>
    </div>
  );
}

/* ============================================================
   GRAPH VIEW
   ============================================================ */
const GRAPH_NODES = [
  { id: "dashboard", x: 0.50, y: 0.46, r: 16, label: "Research Hub", hub: true },
  { id: "sutton", x: 0.26, y: 0.30, r: 10, label: "Sutton & Barto" },
  { id: "chapter2", x: 0.74, y: 0.30, r: 11, label: "Chapter 2" },
  { id: "n1", x: 0.30, y: 0.66, r: 8, label: "Reward shaping" },
  { id: "n2", x: 0.18, y: 0.50, r: 7, label: "Intrinsic vs extrinsic" },
  { id: "n3", x: 0.42, y: 0.74, r: 8, label: "Knowledge tracing" },
  { id: "e1", x: 0.66, y: 0.66, r: 8, label: "Pilot A" },
  { id: "e2", x: 0.80, y: 0.56, r: 7, label: "Experiment log" },
  { id: "src-vanlehn", x: 0.62, y: 0.16, r: 7, label: "VanLehn" },
  { id: "src-deci", x: 0.14, y: 0.34, r: 6, label: "Deci & Ryan" },
  { id: "weekly", x: 0.56, y: 0.80, r: 7, label: "Weekly Review" },
  { id: "src-norman", x: 0.86, y: 0.40, r: 6, label: "Norman" },
];
const GRAPH_EDGES = [
  ["dashboard", "sutton"], ["dashboard", "chapter2"], ["dashboard", "n1"], ["dashboard", "n3"],
  ["dashboard", "e1"], ["dashboard", "weekly"], ["dashboard", "n2"], ["chapter2", "sutton"],
  ["chapter2", "n1"], ["chapter2", "e1"], ["sutton", "n1"], ["e1", "e2"], ["src-vanlehn", "chapter2"],
  ["src-deci", "n2"], ["n3", "dashboard"], ["src-norman", "dashboard"],
];

function GraphView({ open, activeId }) {
  const [hover, setHover] = useState(null);
  const W = 900, H = 560;
  const pos = {};
  GRAPH_NODES.forEach((n) => { pos[n.id] = { x: n.x * W, y: n.y * H }; });
  const neighbors = new Set();
  if (hover) GRAPH_EDGES.forEach(([a, b]) => { if (a === hover) neighbors.add(b); if (b === hover) neighbors.add(a); });

  return (
    <div className="graph-wrap">
      <svg className="graph-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {GRAPH_EDGES.map(([a, b], i) => {
          const hot = hover && (a === hover || b === hover);
          return <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y}
            stroke={hot ? "var(--accent)" : "var(--border-strong)"}
            strokeWidth={hot ? 1.6 : 1} strokeOpacity={hover && !hot ? 0.25 : 0.7} />;
        })}
        {GRAPH_NODES.map((n) => {
          const isHot = !hover || n.id === hover || neighbors.has(n.id);
          const fill = n.id === hover ? "var(--accent)"
            : n.hub ? "var(--accent)"
            : "var(--text-faint)";
          return (
            <g key={n.id} style={{ cursor: "pointer", opacity: isHot ? 1 : 0.3, transition: "opacity 150ms" }}
              onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
              onClick={() => open(n.id)}>
              <circle cx={pos[n.id].x} cy={pos[n.id].y} r={n.r}
                fill={fill} fillOpacity={n.hub ? 0.95 : 0.85}
                stroke="var(--bg-primary)" strokeWidth="2" />
              <text className="gnode-label" x={pos[n.id].x} y={pos[n.id].y + n.r + 13}
                textAnchor="middle" style={{ fontWeight: n.hub ? 600 : 400, fill: n.hub ? "var(--text-normal)" : "var(--text-muted)" }}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="graph-toolbar">
        <button className="gt" title="Zoom in"><Icon name="zoom-in" /></button>
        <button className="gt" title="Fit"><Icon name="expand" /></button>
        <button className="gt" title="Filter"><Icon name="filter" /></button>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardNote, SourceNote, ChapterNote, StubNote, GraphView });
