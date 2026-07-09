import { download } from '../download';
import type { Mandat } from './types';

function organOf(d: Mandat, id: string): string {
  const o = d.organe.find((x) => x.id === id);
  return o ? o.name : id;
}

export function exportJson(d: Mandat) {
  download('governance-hub-export.json', JSON.stringify(d, null, 2), 'application/json');
}

export function exportMarkdown(d: Mandat) {
  const sec: string[] = [];
  sec.push(`# Governance Analyse — ${d.meta.mandat}\n${d.meta.rechtsform} · Stand ${d.meta.stand}`);
  sec.push(
    '## Erlass-Register\n' +
      d.erlasse
        .map((e) => `### ${e.titel} (${e.kurz})\n- Typ: ${e.typ} · Stufe ${e.stufe} · Erlassorgan: ${e.organ}\n- Rechtsgrundlage: ${e.basis || '⚠ keine'} · Revisionsstand: ${e.revision} · Status: ${e.status}`)
        .join('\n\n'),
  );
  sec.push(
    '## Konsistenz-Befunde\n' +
      d.befunde.map((b) => `- **${b.typ}** (${b.schwere}) — ${b.fund}: ${b.text} [${b.status}]`).join('\n'),
  );
  sec.push(
    '## Kompetenzmatrix\n' +
      d.kompetenzen.map((k) => `- ${k.befugnis} → ${organOf(d, k.organ)} (${k.quelle})${k.luecke ? ' ⚠ LÜCKE' : ''}`).join('\n'),
  );
  sec.push(
    '## Checks & Balances\n' +
      d.checks.map((c) => `- ${c.bereich}: ${c.mechanismus} — **${c.status}**${c.luecke ? ` (${c.luecke})` : ''}`).join('\n'),
  );
  sec.push(
    '## Compliance-Kalender\n' +
      d.kalender.map((k) => `- ${k.dueDateIso} — ${k.titel} (${organOf(d, k.organ)}, ${k.quelle})`).join('\n'),
  );
  sec.push(
    '## Scorecard\n' +
      d.scorecard.map((s) => `- ${s.label}: ${s.score}/100 (Vorjahr ${s.vorjahr}) — ${s.note}`).join('\n'),
  );
  sec.push(
    '## Reform-Optionen\n' +
      d.reformen
        .map((r) => `### ${r.titel}\n- ${r.these}\n- Aufwand: ${r.aufwand} · Wirkung: ${r.wirkung}\n- Risiken: ${r.risiken.join('; ')}`)
        .join('\n\n'),
  );
  download('governance-hub-export.md', sec.join('\n\n---\n\n'), 'text/markdown');
}
