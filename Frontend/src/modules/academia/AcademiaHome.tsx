import { Icon, type IconName } from '../../components/Icon';
import { useProjectList } from '../../lib/academia/store';

export function AcademiaHome({ onOpenProject }: { onOpenProject: (id: string, tab?: string) => void }) {
  const { projects } = useProjectList();

  const quick: { icon: IconName; t: string; go: () => void }[] = [
    { icon: 'edit', t: 'Notiz anlegen', go: () => { if (projects.length) onOpenProject(projects[0].id, 'notizen'); } },
    { icon: 'upload', t: 'Quelle erfassen', go: () => { if (projects.length) onOpenProject(projects[0].id, 'bibliothek'); } },
    { icon: 'pen', t: 'Kapitel schreiben', go: () => { if (projects.length) onOpenProject(projects[0].id, 'schreiben'); } },
  ];

  return (
    <div className="home view-in" data-screen-label="Academia · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Academia</h1>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Projekte</span></div>
          <div className="fall-grid">
            {projects.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 4px' }}>Noch keine Projekte angelegt.</div>}
            {projects.map((p) => (
              <div key={p.id} className="fall-card" onClick={() => onOpenProject(p.id)}>
                <div className="fc-top">
                  <span className="fc-ref">{p.type}</span>
                  {p.advisor && <span className="fc-gebiet">{p.advisor}</span>}
                </div>
                <div className="fc-title">{p.title}</div>
                <div className="fc-foot">
                  <span className="fc-stat"><Icon name="grid" size={11} /> {Math.round(p.progress * 100)}%</span>
                  {p.dueDate && <span className="fc-stat">{p.dueDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

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
