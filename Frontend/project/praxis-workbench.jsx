/* Workbench — Schreibplatz für Eingaben & Plädoyers
   Split-View: Entwurf links · Akten / AI-Check rechts */
const { useState: useWB } = React;

/* Beispiel-Entwurfsinhalt (Replik, Fall Meier c. Immova) */
const WB_CONTENT = {
  begehren: [
    'Die Beklagte sei zu verpflichten, der Klägerin CHF 486 200.– nebst Zins zu 5 % seit 28. Dezember 2024 zu bezahlen.',
    'Das mit Verfügung vom 2. Juni 2025 provisorisch eingetragene Bauhandwerkerpfandrecht auf dem Grundstück Kat.-Nr. 6112 sei definitiv einzutragen.',
    'Unter Kosten- und Entschädigungsfolgen zulasten der Beklagten.',
  ],
  absaetze: [
    { rz: 12, text: 'Entgegen der Darstellung der Beklagten wurde das Werk am 17. Januar 2025 vorbehaltlos abgenommen. Das Abnahmeprotokoll ', cite: 'KB 7', rest: ' hält lediglich drei geringfügige Restarbeiten fest, die allesamt bis Ende Februar 2025 erledigt wurden.' },
    { rz: 13, text: 'Das von der Beklagten eingereichte Privatgutachten ', cite: 'BB 3', rest: ' ist als blosse Parteibehauptung zu würdigen (BGE 141 III 433 E. 2.6). Es datiert zudem elf Monate nach der Abnahme und äussert sich nicht zum Zustand im Abnahmezeitpunkt.' },
    { rz: 14, text: 'Die behauptete Verrechnungsforderung ist unsubstantiiert: Die Klageantwort ', cite: 'act. 5', rest: ' nennt weder Mängelrüge noch Fristansetzung im Sinne von Art. 366 Abs. 2 OR. Die Fotodokumentation ', cite2: 'BB 6', rest2: ' zeigt Verschmutzungen, keine Werkmängel.' },
  ],
};

/* AI-Argumentationscheck — Thesen gegen die Akten geprüft */
const WB_CHECKS = [
  { ok: true,  these: 'Vorbehaltlose Abnahme am 17.01.2025', beleg: 'KB 7, S. 1–2', note: 'Protokoll unterzeichnet von beiden Parteien.' },
  { ok: true,  these: 'Restforderung CHF 486 200 rechnerisch belegt', beleg: 'KB 4', note: 'Schlussrechnung mit Ausmass, stimmt mit Rechtsbegehren überein.' },
  { ok: false, these: 'Restarbeiten «bis Ende Februar 2025 erledigt»', beleg: '—', note: 'Kein Beleg in den Akten. Rapport oder Bestätigung nachreichen — sonst streichen oder Beweisofferte (Zeuge Bauleiter).' },
  { ok: true,  these: 'Keine Fristansetzung nach Art. 366 Abs. 2 OR durch Beklagte', beleg: 'act. 5, Rz. 44 ff.', note: 'Klageantwort schweigt dazu — Argument trägt.' },
  { ok: false, these: 'BB 6 zeigt «keine Werkmängel»', beleg: 'BB 6', note: 'Bild 9–11 zeigen Abplatzungen am Sockel. Formulierung abschwächen: «überwiegend Verschmutzungen».' },
];

function Workbench({ fallId, entwurfId, onOpenFall }) {
  const faelle = window.FAELLE;
  const fall = faelle.find(f => f.id === fallId) || faelle[0];
  const entwurf = fall.entwuerfe.find(e => e.id === entwurfId) || fall.entwuerfe[0];
  const [side, setSide] = useWB('akten');
  const [rubrumFlash, setRubrumFlash] = useWB(false);
  const [aktSearch, setAktSearch] = useWB('');

  const kl = fall.parteien.find(p => p.klient);
  const gg = fall.parteien.find(p => !p.klient && p.rolle !== 'Gericht' && p.rolle !== 'Rekursinstanz' && p.rolle !== 'Untersuchungsbehörde') || fall.parteien[1];

  const regenRubrum = () => { setRubrumFlash(true); setTimeout(() => setRubrumFlash(false), 900); };
  const akten = fall.akten.filter(a => !aktSearch || (a.titel + ' ' + a.nr).toLowerCase().includes(aktSearch.toLowerCase()));

  return (
    <div className="detail view-in" data-screen-label={`Workbench · ${entwurf.titel}`}>
      {/* Kopf */}
      <div className="fall-head">
        <div className="col" style={{ gap: 3, minWidth: 0 }}>
          <div className="t-mono-sm crumb-line">
            <span className="crumb-back" onClick={() => onOpenFall(fall.id, 'uebersicht')}><Icon name="arrow-left" size={12} /> {fall.ref}</span>
            <span style={{ margin: '0 6px', opacity: 0.5 }}>/</span>
            <span>Workbench</span>
          </div>
          <div className="row-flex" style={{ gap: 12 }}>
            <h1 className="fall-title">{entwurf.titel}<span className="ac">.</span></h1>
          </div>
        </div>
        <div className="row-flex" style={{ gap: 8 }}>
          <button className="btn-ghost-glass" onClick={regenRubrum}><Icon name="grid" size={13} /> Rubrum aktualisieren</button>
          <button className="btn-primary-dark"><Icon name="export" size={13} /> Export Word / PDF</button>
        </div>
      </div>

      {/* Split */}
      <div className="wb-split">
        {/* Entwurf */}
        <div className="wb-paper scroll">
          <div className={`rubrum ${rubrumFlash ? 'flash' : ''}`}>
            <div className="ru-court">{fall.gericht}</div>
            <div className="ru-nr">Geschäfts-Nr. {fall.nr}</div>
            <div className="ru-parties">
              <div><span className="ru-name">{kl.name}</span>, {kl.detail}<br /><span className="ru-vert">vertreten durch {kl.vertreter}</span><span className="ru-rolle">{kl.rolle}</span></div>
              <div className="ru-gegen">gegen</div>
              <div><span className="ru-name">{gg.name}</span>, {gg.detail}<br /><span className="ru-vert">vertreten durch {gg.vertreter}</span><span className="ru-rolle">{gg.rolle}</span></div>
            </div>
            <div className="ru-betreff">betreffend <em>{fall.kurz}</em> — {entwurf.titel}</div>
          </div>

          <div className="wb-sec-t">Rechtsbegehren</div>
          <ol className="wb-begehren">
            {WB_CONTENT.begehren.map((b, i) => <li key={i} contentEditable suppressContentEditableWarning>{b}</li>)}
          </ol>

          <div className="wb-sec-t">Begründung — II. Zur Klageantwort</div>
          {WB_CONTENT.absaetze.map((a, i) => (
            <p key={i} className="wb-p" contentEditable suppressContentEditableWarning>
              <span className="wb-rz" contentEditable={false}>{a.rz}</span>
              {a.text}<span className="cite-chip" contentEditable={false}>{a.cite}</span>{a.rest}
              {a.cite2 && <><span className="cite-chip" contentEditable={false}>{a.cite2}</span>{a.rest2}</>}
            </p>
          ))}
          <p className="wb-p ghost">Rz. 15 — weiterschreiben …</p>
        </div>

        {/* Seitenpanel */}
        <div className="wb-side">
          <div className="tabs" style={{ alignSelf: 'stretch', display: 'flex' }}>
            {[['akten', 'Akten'], ['recht', 'Recht'], ['check', 'Prüfung']].map(([id, l]) => (
              <span key={id} className={`tab ${side === id ? 'on' : ''}`} style={{ flex: 1, textAlign: 'center' }} onClick={() => setSide(id)}>{l}</span>
            ))}
          </div>

          {side === 'akten' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <input className="input" style={{ fontSize: 13.5, padding: '8px 12px', marginBottom: 10, width: '100%' }} placeholder="Akten durchsuchen …" value={aktSearch} onChange={e => setAktSearch(e.target.value)} />
              <div className="col" style={{ gap: 2 }}>
                {akten.map((a, i) => (
                  <div key={i} className="wb-akt">
                    <span className="akt-nr">{a.nr}</span>
                    <span className="od-t">{a.titel}</span>
                    <span className="wb-insert" title="Als Zitat einfügen"><Icon name="quote" size={12} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {side === 'recht' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 10 }}>Verknüpfte Rechtsprechung & Normen</div>
              <div className="col" style={{ gap: 2 }}>
                {[
                  { r: 'BGE 141 III 433', n: 'E. 2.6 — Privatgutachten als Parteibehauptung' },
                  { r: 'BGE 107 II 50', n: 'Prosequierung Bauhandwerkerpfandrecht' },
                  { r: 'Art. 366 OR', n: 'Nachbesserung, Fristansetzung' },
                  { r: 'Art. 961 ZGB', n: 'Vorläufige Eintragung' },
                ].map((x, i) => (
                  <div key={i} className="wb-akt">
                    <span className="akt-nr" style={{ width: 'auto', minWidth: 92 }}>{x.r}</span>
                    <span className="od-t">{x.n}</span>
                    <span className="wb-insert"><Icon name="quote" size={12} /></span>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ margin: '12px 0' }}></div>
              <div className="chip"><Icon name="search" size={11} /> In Recherche öffnen</div>
            </div>
          )}

          {side === 'check' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 4 }}>Argumentationscheck gegen die Akten</div>
              <div className="wb-check-sum">{WB_CHECKS.filter(c => c.ok).length} von {WB_CHECKS.length} Thesen belegt</div>
              <div className="col" style={{ gap: 8, marginTop: 10 }}>
                {WB_CHECKS.map((c, i) => (
                  <div key={i} className={`check-card ${c.ok ? 'ok' : 'warn'}`}>
                    <div className="row-flex" style={{ gap: 8 }}>
                      <span className="cc-mark"><Icon name={c.ok ? 'check' : 'close'} size={11} stroke={2.4} /></span>
                      <span className="cc-these">{c.these}</span>
                    </div>
                    <div className="cc-note">{c.note}</div>
                    {c.beleg !== '—' && <span className="beleg-chip" style={{ alignSelf: 'flex-start' }}>{c.beleg}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.Workbench = Workbench;
