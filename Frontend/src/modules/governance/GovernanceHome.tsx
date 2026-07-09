import { Icon, type IconName } from '../../components/Icon';
import { useGovernance } from '../../lib/governance/store';
import { exportJson, exportMarkdown } from '../../lib/governance/export';
import { GV_MODULES, type GovernanceViewId } from '../../lib/governance/modules';
import { daysUntil, formatDateDe } from '../../lib/praxis/format';
import type { Mandat } from '../../lib/governance/types';

interface LageRow {
  tage: number;
  ueberfaellig: boolean;
  titel: string;
  art: string;
  datum: string;
  go: GovernanceViewId;
}

function moduleCount(id: GovernanceViewId, d: Mandat): string {
  switch (id) {
    case 'g-normen':
      return `${d.erlasse.length} Erlasse`;
    case 'g-netz':
      return `${d.verweise.length} Verweise · ${d.befunde.filter((b) => b.status === 'offen').length} offene Befunde`;
    case 'g-organe':
      return `${d.organe.length} Organe · ${d.kompetenzen.length} Kompetenzen`;
    case 'g-prozesse':
      return `${d.prozesse.length} Prozesse · ${d.checks.length} Checks`;
    case 'g-compliance':
      return `${d.kalender.length} Termine · ${d.konflikte.length} Interessenbindungen`;
    case 'g-scorecard':
      return d.scorecard.length ? `Ø ${Math.round(d.scorecard.reduce((s, x) => s + x.score, 0) / d.scorecard.length)}/100` : 'Noch keine Bewertung';
    case 'g-simulator':
      return `${d.reformen.length} Reformoptionen`;
    default:
      return '';
  }
}

export function GovernanceHome({ onOpen }: { onOpen: (view: GovernanceViewId) => void }) {
  const { data: db } = useGovernance();

  const hotBefunde = db.befunde.filter((b) => b.schwere === 'hoch' && b.status === 'offen');
  const kalenderWithDays = db.kalender.map((k) => ({ ...k, tage: daysUntil(k.dueDateIso), datum: formatDateDe(k.dueDateIso) }));
  const ueberfaellig = kalenderWithDays.filter((k) => k.tage < 0);
  const anstehend = kalenderWithDays.filter((k) => k.tage >= 0).sort((a, b) => a.tage - b.tage);

  const lage: LageRow[] = [
    ...ueberfaellig.map((k) => ({ tage: 0, ueberfaellig: true, titel: k.titel, art: k.rhythmus, datum: k.datum, go: 'g-compliance' as const })),
    ...hotBefunde.slice(0, 2).map((b) => ({ tage: 0, ueberfaellig: false, titel: `${b.typ}: ${b.fund}`, art: 'hoch', datum: 'Befund offen', go: 'g-netz' as const })),
    ...anstehend.slice(0, 2).map((k) => ({ tage: k.tage, ueberfaellig: false, titel: k.titel, art: k.rhythmus, datum: k.datum, go: 'g-compliance' as const })),
  ];

  const quick: { icon: IconName; t: string; go: () => void }[] = [
    { icon: 'search', t: 'Konsistenz prüfen', go: () => onOpen('g-netz') },
    { icon: 'graph', t: 'Revisions-Impact analysieren', go: () => onOpen('g-netz') },
    { icon: 'sparkle', t: 'Reform simulieren', go: () => onOpen('g-simulator') },
    { icon: 'export', t: 'Export für Obsidian (MD + JSON)', go: () => { exportMarkdown(db); exportJson(db); } },
  ];

  return (
    <div className="home view-in" data-screen-label="Governance · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Governance.</h1>
          <p className="sub">{db.meta.mandat}{db.meta.rechtsform ? ` · ${db.meta.rechtsform}` : ''}</p>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Lagebild</span><span className="sc">{db.befunde.filter((b) => b.status === 'offen').length} offene Befunde</span></div>
          <div className="radar">
            {lage.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 4px' }}>Noch keine Termine oder Befunde hinterlegt.</div>}
            {lage.map((r, i) => (
              <div key={i} className="radar-row" onClick={() => onOpen(r.go)}>
                <span className={`countdown ${r.ueberfaellig || r.art === 'hoch' ? 'hot' : r.tage <= 30 ? 'warm' : ''}`}>
                  {r.ueberfaellig ? 'fällig' : r.art === 'hoch' ? 'hoch' : `${r.tage} T`}
                </span>
                <div className="col" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="rr-t">{r.titel}</span>
                </div>
                <span className="frist-art">{r.art}</span>
                <span className="rr-d">{r.datum}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Werkbank</span></div>
          <div className="st-mod-grid">
            {GV_MODULES.map((m) => (
              <div key={m.id} className="st-mod" onClick={() => onOpen(m.id)}>
                <span className="sm-num">{m.num}</span>
                <span className="sm-t">{m.titel}</span>
                <span className="sm-d">{m.desc}</span>
                <span className="sm-c">{moduleCount(m.id, db)}</span>
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
