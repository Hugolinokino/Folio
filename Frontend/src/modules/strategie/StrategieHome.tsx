import { Icon, type IconName } from '../../components/Icon';
import { useStrategie } from '../../lib/strategie/store';
import { exportJson, exportMarkdown } from '../../lib/strategie/export';
import { ST_MODULES, type StrategieViewId } from '../../lib/strategie/modules';
import type { Vorhaben } from '../../lib/strategie/types';

interface LageRow {
  tage: number;
  titel: string;
  meta: string;
  art: 'exogen' | 'prüfung' | 'kritisch' | 'kill';
  datum: string;
  go: StrategieViewId;
}

function moduleCount(id: StrategieViewId, d: Vorhaben): string {
  switch (id) {
    case 's-analyse':
      return `${d.akteure.length} Akteure · ${(['S', 'W', 'O', 'T'] as const).reduce((s, k) => s + d.swot[k].length, 0)} SWOT-Punkte`;
    case 's-foresight':
      return `${d.faktoren.length} Faktoren · ${d.annahmen.length} Annahmen`;
    case 's-timeline':
      return `${d.straenge.length} Stränge · ${d.entscheidungspunkte.length} Entscheidungspunkte`;
    case 's-optionen':
      return `${d.optionen.length} Optionen · ${d.optionen.reduce((s, o) => s + o.zuege.length, 0)} Züge`;
    case 's-wargame':
      return `${d.wargame.runden.length} Runden simuliert`;
    case 's-execution':
      return `${d.initiativen.filter((i) => i.status === 'laufend').length} laufend · ${d.initiativen.filter((i) => i.status === 'gestoppt').length} gestoppt`;
    case 's-journal':
      return `${d.journal.length} Entscheide protokolliert`;
    default:
      return '';
  }
}

export function StrategieHome({ onOpen }: { onOpen: (view: StrategieViewId) => void }) {
  const { data: db } = useStrategie();

  const ep = [...db.entscheidungspunkte].sort((a, b) => a.tage - b.tage)[0];
  const an = [...db.annahmen]
    .filter((a): a is typeof a & { tage: number } => a.tage != null && a.status !== 'falsifiziert')
    .sort((a, b) => a.tage - b.tage)[0];
  const killWatch = db.initiativen.flatMap((i) => i.kill.filter((k) => k.status === 'beobachten').map((k) => ({ ...k, ini: i })))[0];

  const lage: LageRow[] = [];
  if (ep) {
    lage.push({ tage: ep.tage, titel: ep.titel, meta: `Entscheidungspunkt ${ep.kurz} · Zukunftslinien`, art: 'exogen', datum: ep.datum, go: 's-timeline' });
  }
  if (an) {
    lage.push({
      tage: an.tage,
      titel: `Annahmenprüfung: ${an.text.length > 62 ? `${an.text.slice(0, 61)}…` : an.text}`,
      meta: `Status ${an.status} · Assumption Log`,
      art: an.status === 'kritisch' ? 'kritisch' : 'prüfung',
      datum: an.pruefdatum,
      go: 's-foresight',
    });
  }
  if (killWatch) {
    lage.push({
      tage: 88,
      titel: `Kill-Kriterium unter Beobachtung: ${killWatch.text}`,
      meta: `${killWatch.ini.titel} · Umsetzung`,
      art: 'kill',
      datum: '',
      go: 's-execution',
    });
  }
  lage.sort((a, b) => a.tage - b.tage);

  const quick: { icon: IconName; t: string; go: () => void }[] = [
    { icon: 'sparkle', t: 'Signal erfassen', go: () => onOpen('s-foresight') },
    { icon: 'flag', t: 'Zug simulieren', go: () => onOpen('s-wargame') },
    { icon: 'archive' as const, t: 'Entscheid protokollieren', go: () => onOpen('s-journal') },
    { icon: 'export', t: 'Export für Obsidian (MD + JSON)', go: () => { exportMarkdown(db); exportJson(db); } },
  ];

  return (
    <div className="home view-in" data-screen-label="Strategie · Startseite">
      <div className="home-inner">
        <div className="home-hero">
          <h1>Strategie.</h1>
        </div>

        <div className="home-sec">
          <div className="sh"><span className="st">Lagebild</span></div>
          <div className="radar">
            {lage.length === 0 && <div className="t-sans-sm" style={{ padding: '8px 4px' }}>Noch keine Fristen oder Prüfpunkte hinterlegt.</div>}
            {lage.map((r, i) => (
              <div key={i} className="radar-row" onClick={() => onOpen(r.go)}>
                <span className={`countdown ${r.tage <= 100 ? 'warm' : ''} ${r.art === 'kritisch' ? 'hot' : ''}`}>{r.tage} T</span>
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
            {ST_MODULES.map((m) => (
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
