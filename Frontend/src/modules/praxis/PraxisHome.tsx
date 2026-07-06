import { Icon, type IconName } from '../../components/Icon';
import { useCaseList, useFristenradar } from '../../lib/praxis/store';

export function PraxisHome({
  onOpenFall,
}: {
  onOpenFall: (id: string, tab?: string) => void;
  onOpenWorkbench: (fallId: string, entwurfId: string) => void;
}) {
  const { cases } = useCaseList();
  const { rows } = useFristenradar();
  const radar = rows.slice(0, 6);

  const quick: { icon: IconName; t: string; go: () => void }[] = [
    { icon: 'pen', t: 'Eingabe entwerfen', go: () => { if (cases.length) onOpenFall(cases[0].id, 'uebersicht'); } },
    { icon: 'upload', t: 'Akte erfassen', go: () => { if (cases.length) onOpenFall(cases[0].id, 'akten'); } },
    { icon: 'time', t: 'Frist erfassen', go: () => { if (cases.length) onOpenFall(cases[0].id, 'fristen'); } },
    { icon: 'chat', t: 'Akten befragen', go: () => { if (cases.length) onOpenFall(cases[0].id, 'akten'); } },
  ];

  return (
    <div className="home view-in" data-screen-label="Praxis · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Guten Morgen, Julian.</h1>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Fristenradar</span></div>
          <div className="radar">
            {radar.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 4px' }}>Keine Fristen hinterlegt.</div>}
            {radar.map((r, i) => (
              <div key={i} className={`radar-row ${r.tage <= 10 ? 'hot' : ''}`} onClick={() => onOpenFall(r.caseId, 'fristen')}>
                <span className={`countdown ${r.tage <= 10 ? 'hot' : r.tage <= 30 ? 'warm' : ''}`}>{r.tage} T</span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <span className="rr-t">{r.titel}</span>
                </div>
                <span className="frist-art">{r.art}</span>
                <span className="rr-d">{r.datum}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Fälle</span></div>
          <div className="fall-grid">
            {cases.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 4px' }}>Noch keine Fälle angelegt.</div>}
            {cases.map((f) => (
              <div key={f.id} className="fall-card" onClick={() => onOpenFall(f.id, 'uebersicht')}>
                <div className="fc-top">
                  <span className="fc-ref">{f.ref}</span>
                  <span className="fc-gebiet">{f.gebiet}</span>
                </div>
                <div className="fc-title">{f.title}</div>
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
