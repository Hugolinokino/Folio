import { titleOf, type Vorhaben } from './types';

function download(name: string, text: string, mime: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function exportJson(d: Vorhaben) {
  download('strategy-hub-export.json', JSON.stringify(d, null, 2), 'application/json');
}

export function exportMarkdown(d: Vorhaben) {
  const wl = (ids: string[]) => (ids && ids.length ? ids.map((i) => `[[${titleOf(d, i)}]]`).join(' · ') : '—');
  const sec: string[] = [];
  sec.push(`# Strategy Hub — ${d.meta.vorhaben}\nExport: ${d.meta.heuteLabel} · Horizont ${d.meta.horizont}`);
  sec.push(
    '## Akteure\n' +
      d.akteure
        .map(
          (a) =>
            `### ${a.name}\n- Rolle: ${a.rolle} · Macht ${a.macht} · Interesse ${a.interesse}\n- Ziele: ${a.ziele.join('; ')}\n- Ressourcen: ${a.ressourcen}\n- Reaktionsmuster: ${a.muster}\n- Tags: ${a.tags.join(', ')}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Faktoren & Signale\n' +
      d.faktoren
        .map(
          (f) =>
            `### ${f.titel}\n- Art: ${f.art} (${f.pestel}) · Unsicherheit ${f.unsicherheit} · Impact ${f.impact} · Horizont ${f.horizont}\n- Quelle: ${f.quelle} (${f.datum})\n- ${f.note}\n- Verknüpft: ${wl(f.links)}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Annahmen\n' +
      d.annahmen
        .map(
          (a) =>
            `### ${a.text}\n- Status: ${a.status} · Prüfung: ${a.pruefdatum}\n- Falsifikation: ${a.falsifikation}\n- Verknüpft: ${wl(a.links)}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Szenarien (Zukunftslinien)\n' +
      d.straenge
        .map(
          (s) =>
            `### ${s.titel} (${s.prob} %)\n- ${s.kurz}\n- Zielbild: ${s.zielbild}\n- Ereignisse: ${s.events.map((e) => `${e.jahr} ${e.titel}`).join('; ')}\n- Backcasting: ${s.backcast.join(' → ')}\n- Verknüpft: ${wl(s.links)}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Optionen\n' +
      d.optionen
        .map(
          (o) =>
            `### ${o.titel}\n- ${o.these}\n- Reversibilität ${o.reversibilitaet}/5 · Ressourcen ${o.ressourcen}/5 · Optionswert ${o.optionswert}/5 · Passung ${o.passung}/5 · Horizont ${o.horizont} · Status: ${o.status}\n- Züge: ${o.zuege.map((z) => `${z.titel} (${z.status})`).join('; ')}\n- Pre-Mortem: ${o.premortem.map((p) => `${p.grund} → ${p.gegen}`).join(' | ')}\n- Verknüpft: ${wl(o.links)}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Initiativen\n' +
      d.initiativen
        .map(
          (i) =>
            `### ${i.titel}\n- Option: [[${titleOf(d, i.option)}]] · Status: ${i.status}\n- Meilensteine: ${i.meilensteine.map((m) => `${m.titel} (${m.datum}${m.done ? ' ✓' : ''})`).join('; ')}\n- Kennzahlen: ${i.kennzahlen.map((k) => `${k.name} ${k.ist}${k.einheit} / Ziel ${k.ziel}${k.einheit}`).join('; ')}\n- Kill-Kriterien: ${i.kill.map((k) => `${k.text} [${k.status}]`).join('; ')}`,
        )
        .join('\n\n'),
  );
  sec.push(
    '## Entscheidungsjournal\n' +
      d.journal
        .map(
          (j) =>
            `### ${j.datum} — ${j.titel}\n- Entscheid: ${j.entscheid}\n- Begründung: ${j.begruendung}\n- Informationslage: ${j.infolage}\n- Beteiligte: ${j.beteiligte}\n- Erwartung: ${j.erwartung}${j.ergebnis ? `\n- Ergebnis: ${j.ergebnis} (Abweichung: ${j.abweichung})` : ''}\n- Verknüpft: ${wl(j.links)}`,
        )
        .join('\n\n'),
  );
  download('strategy-hub-export.md', sec.join('\n\n---\n\n'), 'text/markdown');
}
