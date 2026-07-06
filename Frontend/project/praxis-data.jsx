/* Praxis-Modus — Fälle, Akten, Fristen, Parteien, Chronologie, Honorar */

const FAELLE = [
  {
    id: 'meier-immova',
    ref: 'M-2024-018',
    title: 'Meier Bau AG c. Immova AG',
    kurz: 'Bauhandwerkerpfandrecht & Werklohn',
    gebiet: 'Zivilrecht',
    verfahren: 'Ordentliches Verfahren (Art. 219 ff. ZPO)',
    gericht: 'Bezirksgericht Zürich, 4. Abteilung',
    nr: 'CG240112-L',
    phase: 'Behauptungsverfahren — Replik ausstehend',
    color: 'blue',
    streitwert: 'CHF 486 200',
    rolleKlient: 'Klägerin',
    parteien: [
      { rolle: 'Klägerin', name: 'Meier Bau AG', detail: 'Werftstrasse 12, 8004 Zürich', vertreter: 'RA Julian Bodenmann', klient: true },
      { rolle: 'Beklagte', name: 'Immova Immobilien AG', detail: 'Bahnhofplatz 3, 8001 Zürich', vertreter: 'RA Dr. S. Keller (Keller & Partner)' },
      { rolle: 'Gericht', name: 'Bezirksgericht Zürich, 4. Abteilung', detail: 'Wengistrasse 30, 8004 Zürich', vertreter: 'Ref. MLaw M. Steiner' },
    ],
    nextFrist: { titel: 'Replik einreichen', datum: '21. Jul 2026', tage: 18, art: 'gerichtlich · erstreckbar' },
    fristen: [
      { datum: '21. Jul 2026', tage: 18, titel: 'Replik einreichen', art: 'gerichtlich', note: 'Erstreckung 1× gewährt (Vfg. act. 9)', urgent: true },
      { datum: '14. Aug 2026', tage: 42, titel: 'Beweismittelverzeichnis nachreichen', art: 'gerichtlich', note: 'gem. Vfg. vom 12. Jun 2026' },
      { datum: '03. Sep 2026', tage: 62, titel: 'Hauptverhandlung', art: 'termin', note: '08:30 · BezGer Zürich, Saal 4.2' },
      { datum: '12. Okt 2026', tage: 101, titel: 'Prov. Eintragung Bauhandwerkerpfandrecht — Prosequierung', art: 'gesetzlich', note: 'Art. 961 Abs. 3 ZGB — nicht erstreckbar' },
    ],
    akten: [
      { nr: 'act. 1',  datum: '14. Jan 2026', titel: 'Klageschrift', absender: 'Klägerin', typ: 'Rechtsschrift', ordner: 'Gerichtsakten', seiten: 34 },
      { nr: 'act. 2',  datum: '14. Jan 2026', titel: 'Klagebewilligung Friedensrichteramt Kreis 3+9', absender: 'Klägerin', typ: 'Beilage', ordner: 'Gerichtsakten', seiten: 2 },
      { nr: 'KB 1',    datum: '03. Mär 2024', titel: 'Werkvertrag «Neubau MFH Talwiesenstrasse»', absender: 'Klägerin', typ: 'Beilage', ordner: 'Klägerakten', seiten: 18 },
      { nr: 'KB 4',    datum: '28. Nov 2024', titel: 'Schlussrechnung Nr. 2024-311 inkl. Ausmass', absender: 'Klägerin', typ: 'Beilage', ordner: 'Klägerakten', seiten: 12 },
      { nr: 'KB 7',    datum: '17. Jan 2025', titel: 'Abnahmeprotokoll mit Mängelliste', absender: 'Klägerin', typ: 'Beilage', ordner: 'Klägerakten', seiten: 6 },
      { nr: 'KB 11',   datum: '09. Apr 2025', titel: 'Mahnung & Fristansetzung (eingeschrieben)', absender: 'Klägerin', typ: 'Korrespondenz', ordner: 'Klägerakten', seiten: 3 },
      { nr: 'act. 5',  datum: '02. Apr 2026', titel: 'Klageantwort', absender: 'Beklagte', typ: 'Rechtsschrift', ordner: 'Gerichtsakten', seiten: 41 },
      { nr: 'BB 3',    datum: '02. Apr 2026', titel: 'Privatgutachten Baumängel (Ing. Büro Frey)', absender: 'Beklagte', typ: 'Beilage', ordner: 'Beklagtenakten', seiten: 27 },
      { nr: 'BB 6',    datum: '02. Apr 2026', titel: 'Fotodokumentation Fassade Süd', absender: 'Beklagte', typ: 'Beilage', ordner: 'Beklagtenakten', seiten: 14 },
      { nr: 'act. 9',  datum: '12. Jun 2026', titel: 'Verfügung — Fristerstreckung Replik', absender: 'Gericht', typ: 'Verfügung', ordner: 'Gerichtsakten', seiten: 1 },
    ],
    chrono: [
      { datum: '03. Mär 2024', ereignis: 'Abschluss Werkvertrag über CHF 1.94 Mio.', beleg: 'KB 1' },
      { datum: '28. Nov 2024', ereignis: 'Schlussrechnung gestellt — Restforderung CHF 486 200', beleg: 'KB 4' },
      { datum: '17. Jan 2025', ereignis: 'Abnahme mit Mängelrüge der Bestellerin', beleg: 'KB 7' },
      { datum: '09. Apr 2025', ereignis: 'Mahnung mit Fristansetzung, unbenutzt verstrichen', beleg: 'KB 11' },
      { datum: '02. Jun 2025', ereignis: 'Prov. Eintragung Bauhandwerkerpfandrecht bewilligt', beleg: 'act. 2' },
      { datum: '14. Jan 2026', ereignis: 'Klage beim Bezirksgericht Zürich anhängig gemacht', beleg: 'act. 1' },
      { datum: '02. Apr 2026', ereignis: 'Klageantwort — Verrechnung mit Mängelforderung', beleg: 'act. 5' },
    ],
    korrespondenz: [
      { datum: '26. Jun 2026', richtung: 'ein', von: 'RA Dr. S. Keller', betreff: 'Vergleichsgespräch — Terminvorschläge', typ: 'E-Mail' },
      { datum: '18. Jun 2026', richtung: 'aus', von: 'an T. Meier (Klient)', betreff: 'Einschätzung nach Klageantwort & weiteres Vorgehen', typ: 'Brief' },
      { datum: '12. Jun 2026', richtung: 'ein', von: 'BezGer Zürich', betreff: 'Verfügung Fristerstreckung Replik', typ: 'Gerichtspost' },
      { datum: '04. Jun 2026', richtung: 'aus', von: 'an BezGer Zürich', betreff: 'Gesuch um Fristerstreckung', typ: 'Eingabe' },
    ],
    honorar: {
      rate: 300, budget: 60000,
      entries: [
        { datum: '30. Jun 2026', taetigkeit: 'Aktenstudium Privatgutachten BB 3, Notizen Gegenargumentation', min: 140 },
        { datum: '27. Jun 2026', taetigkeit: 'Entwurf Replik, Rz. 12–34', min: 210 },
        { datum: '18. Jun 2026', taetigkeit: 'Klientenbrief Einschätzung Klageantwort', min: 75 },
        { datum: '04. Jun 2026', taetigkeit: 'Fristerstreckungsgesuch & Telefonat Gericht', min: 30 },
        { datum: '28. Mai 2026', taetigkeit: 'Besprechung mit Klient (Werkhof)', min: 90 },
      ],
      total: 128.5,
    },
    entwuerfe: [
      { id: 'replik', titel: 'Replik', typ: 'Rechtsschrift', status: 'Entwurf · Rz. 34 von ~60', updated: 'vor 2 Std.', words: 6840 },
      { id: 'plaedoyer-notizen', titel: 'Plädoyernotizen HV', typ: 'Plädoyer', status: 'Gerüst', updated: 'vor 3 Tagen', words: 890 },
    ],
  },
  {
    id: 'bk-strafverteidigung',
    ref: 'M-2025-041',
    title: 'Verteidigung B. Keller',
    kurz: 'Fahrlässige Körperverletzung (Art. 125 StGB)',
    gebiet: 'Strafrecht',
    verfahren: 'Vorverfahren (Art. 299 ff. StPO)',
    gericht: 'Staatsanwaltschaft Winterthur/Unterland',
    nr: 'A-2/2025/10457',
    phase: 'Beweisergänzung — Gutachten ausstehend',
    color: 'red',
    streitwert: '—',
    rolleKlient: 'Beschuldigter',
    parteien: [
      { rolle: 'Beschuldigter', name: 'B. Keller', detail: 'geb. 1987, Bauführer', vertreter: 'RA Julian Bodenmann (erbetene Verteidigung)', klient: true },
      { rolle: 'Privatklägerschaft', name: 'D. Rossi', detail: 'Unfallopfer', vertreter: 'RA M. Huber' },
      { rolle: 'Untersuchungsbehörde', name: 'StA Winterthur/Unterland', detail: 'Hermann-Götz-Strasse 24', vertreter: 'Stawin lic. iur. C. Baumann' },
    ],
    nextFrist: { titel: 'Stellungnahme zum Gutachterentwurf', datum: '10. Jul 2026', tage: 7, art: 'behördlich · Art. 184 Abs. 3 StPO' },
    fristen: [
      { datum: '10. Jul 2026', tage: 7, titel: 'Stellungnahme Gutachterfragen', art: 'behördlich', note: 'Art. 184 Abs. 3 StPO', urgent: true },
      { datum: '28. Jul 2026', tage: 25, titel: 'Einvernahme Zeuge F. Odermatt', art: 'termin', note: '14:00 · StA Winterthur, Zi. 217' },
      { datum: '30. Sep 2026', tage: 89, titel: 'Ergänzende Beweisanträge', art: 'behördlich', note: 'gem. Schreiben StA vom 22. Jun 2026' },
    ],
    akten: [
      { nr: 'act. 1',  datum: '11. Nov 2025', titel: 'Polizeirapport Unfall Baustelle Grüzefeld', absender: 'Kapo ZH', typ: 'Rapport', ordner: 'Untersuchungsakten', seiten: 9 },
      { nr: 'act. 4',  datum: '11. Nov 2025', titel: 'Fotodokumentation Unfallstelle', absender: 'Kapo ZH', typ: 'Beilage', ordner: 'Untersuchungsakten', seiten: 22 },
      { nr: 'act. 7',  datum: '03. Dez 2025', titel: 'Einvernahmeprotokoll B. Keller (beschuldigte Person)', absender: 'StA', typ: 'Protokoll', ordner: 'Untersuchungsakten', seiten: 11 },
      { nr: 'act. 9',  datum: '15. Jan 2026', titel: 'Arztbericht Kantonsspital Winterthur', absender: 'Privatklägerschaft', typ: 'Beilage', ordner: 'Untersuchungsakten', seiten: 5 },
      { nr: 'act. 12', datum: '20. Feb 2026', titel: 'SUVA-Bericht Arbeitssicherheit', absender: 'SUVA', typ: 'Bericht', ordner: 'Untersuchungsakten', seiten: 16 },
      { nr: 'act. 15', datum: '22. Jun 2026', titel: 'Gutachterfragen (Entwurf) — bautechn. Gutachten', absender: 'StA', typ: 'Verfügung', ordner: 'Untersuchungsakten', seiten: 3 },
      { nr: 'VA 1',    datum: '05. Dez 2025', titel: 'Sicherheitskonzept Baustelle (intern)', absender: 'Verteidigung', typ: 'Beilage', ordner: 'Verteidigungsakten', seiten: 8 },
      { nr: 'VA 2',    datum: '14. Mär 2026', titel: 'Beweisantrag — Zeuge F. Odermatt', absender: 'Verteidigung', typ: 'Eingabe', ordner: 'Verteidigungsakten', seiten: 4 },
    ],
    chrono: [
      { datum: '10. Nov 2025', ereignis: 'Arbeitsunfall auf Baustelle Grüzefeld — Gerüstabsturz', beleg: 'act. 1' },
      { datum: '03. Dez 2025', ereignis: 'Einvernahme des Beschuldigten, bestreitet Sorgfaltspflichtverletzung', beleg: 'act. 7' },
      { datum: '20. Feb 2026', ereignis: 'SUVA-Bericht: Gerüst mangelhaft, Zuständigkeit strittig', beleg: 'act. 12' },
      { datum: '14. Mär 2026', ereignis: 'Beweisantrag Verteidigung — Zeuge zur Gerüstverantwortung', beleg: 'VA 2' },
      { datum: '22. Jun 2026', ereignis: 'StA stellt bautechnisches Gutachten in Aussicht', beleg: 'act. 15' },
    ],
    korrespondenz: [
      { datum: '25. Jun 2026', richtung: 'aus', von: 'an B. Keller (Klient)', betreff: 'Gutachterfragen — Besprechungstermin', typ: 'E-Mail' },
      { datum: '22. Jun 2026', richtung: 'ein', von: 'StA Winterthur', betreff: 'Gutachterfragen zur Stellungnahme', typ: 'Behördenpost' },
      { datum: '14. Mär 2026', richtung: 'aus', von: 'an StA Winterthur', betreff: 'Beweisantrag Zeugeneinvernahme', typ: 'Eingabe' },
    ],
    honorar: {
      rate: 280, budget: 25000,
      entries: [
        { datum: '01. Jul 2026', taetigkeit: 'Analyse Gutachterfragen, Ergänzungsfragen entworfen', min: 120 },
        { datum: '25. Jun 2026', taetigkeit: 'Klientenkontakt & Terminkoordination', min: 25 },
        { datum: '14. Mär 2026', taetigkeit: 'Beweisantrag verfasst', min: 95 },
      ],
      total: 42.0,
    },
    entwuerfe: [
      { id: 'stellungnahme-gutachten', titel: 'Stellungnahme Gutachterfragen', typ: 'Stellungnahme', status: 'Entwurf · fast fertig', updated: 'heute 09:40', words: 1620 },
      { id: 'plaedoyer', titel: 'Plädoyer (Gerüst)', typ: 'Plädoyer', status: 'Gerüst', updated: 'vor 2 Wochen', words: 1100 },
    ],
  },
  {
    id: 'stauffer-uster',
    ref: 'M-2026-007',
    title: 'Erben Stauffer c. Gemeinde Uster',
    kurz: 'Baurekurs — Verweigerung Baubewilligung',
    gebiet: 'Verwaltungsrecht',
    verfahren: 'Rekursverfahren (§ 19 ff. VRG ZH)',
    gericht: 'Baurekursgericht des Kantons Zürich',
    nr: 'BRGE 2026-0142',
    phase: 'Rekurs eingereicht — Vernehmlassung läuft',
    color: 'green',
    streitwert: 'CHF 2.1 Mio (Bauvorhaben)',
    rolleKlient: 'Rekurrenten',
    parteien: [
      { rolle: 'Rekurrenten', name: 'Erbengemeinschaft Stauffer', detail: '4 Mitglieder, vertreten durch A. Stauffer', vertreter: 'RA Julian Bodenmann', klient: true },
      { rolle: 'Rekursgegnerin', name: 'Gemeinde Uster, Bauamt', detail: 'Oberlandstrasse 78, 8610 Uster', vertreter: 'Gemeindeschreiber R. Wild' },
      { rolle: 'Rekursinstanz', name: 'Baurekursgericht Kt. Zürich', detail: 'Selnaustrasse 32, 8001 Zürich', vertreter: 'Ger.-Sekr. MLaw L. Frei' },
    ],
    nextFrist: { titel: 'Allfällige Replik zur Vernehmlassung', datum: '17. Aug 2026', tage: 45, art: 'gerichtlich · nach Zustellung' },
    fristen: [
      { datum: '17. Aug 2026', tage: 45, titel: 'Replik zur Vernehmlassung der Gemeinde', art: 'gerichtlich', note: 'Frist läuft ab Zustellung' },
      { datum: '09. Sep 2026', tage: 68, titel: 'Augenschein (in Aussicht gestellt)', art: 'termin', note: 'Parzelle Kat.-Nr. 8341, Uster' },
    ],
    akten: [
      { nr: 'act. 1', datum: '18. Mai 2026', titel: 'Rekursschrift mit Beilagen 1–9', absender: 'Rekurrenten', typ: 'Rechtsschrift', ordner: 'Gerichtsakten', seiten: 28 },
      { nr: 'RB 2',   datum: '20. Mär 2026', titel: 'Bauabschlag Gemeinde Uster (angefochtener Entscheid)', absender: 'Gemeinde', typ: 'Verfügung', ordner: 'Rekurrentenakten', seiten: 12 },
      { nr: 'RB 4',   datum: '11. Nov 2025', titel: 'Baugesuch mit Projektplänen 1:100', absender: 'Rekurrenten', typ: 'Beilage', ordner: 'Rekurrentenakten', seiten: 45 },
      { nr: 'RB 7',   datum: '02. Feb 2026', titel: 'Gutachten Ortsbildschutz (Büro Landwerk)', absender: 'Rekurrenten', typ: 'Beilage', ordner: 'Rekurrentenakten', seiten: 31 },
      { nr: 'act. 3', datum: '10. Jun 2026', titel: 'Präsidialverfügung — Vernehmlassung Gemeinde', absender: 'BRG', typ: 'Verfügung', ordner: 'Gerichtsakten', seiten: 2 },
    ],
    chrono: [
      { datum: '11. Nov 2025', ereignis: 'Baugesuch für Ersatzneubau eingereicht', beleg: 'RB 4' },
      { datum: '20. Mär 2026', ereignis: 'Bauabschlag — Verletzung Ortsbildschutz gerügt', beleg: 'RB 2' },
      { datum: '18. Mai 2026', ereignis: 'Rekurs ans Baurekursgericht (fristwahrend, 30 Tage)', beleg: 'act. 1' },
      { datum: '10. Jun 2026', ereignis: 'Gemeinde zur Vernehmlassung eingeladen', beleg: 'act. 3' },
    ],
    korrespondenz: [
      { datum: '12. Jun 2026', richtung: 'ein', von: 'Baurekursgericht ZH', betreff: 'Präsidialverfügung — Vernehmlassung', typ: 'Gerichtspost' },
      { datum: '19. Mai 2026', richtung: 'aus', von: 'an A. Stauffer (Klient)', betreff: 'Rekurs eingereicht — Kopie & Kostenrahmen', typ: 'E-Mail' },
    ],
    honorar: {
      rate: 300, budget: 30000,
      entries: [
        { datum: '18. Mai 2026', taetigkeit: 'Finalisierung & Einreichung Rekursschrift', min: 180 },
        { datum: '12. Mai 2026', taetigkeit: 'Entwurf Rekursschrift, Rügen Ortsbildschutz', min: 320 },
        { datum: '28. Apr 2026', taetigkeit: 'Besprechung Erbengemeinschaft, Instruktion', min: 110 },
      ],
      total: 31.5,
    },
    entwuerfe: [
      { id: 'replik-brg', titel: 'Replik BRG (Reserve)', typ: 'Rechtsschrift', status: 'Gerüst', updated: 'vor 1 Woche', words: 480 },
    ],
  },
];

/* Vorlagen für die Workbench */
const WB_VORLAGEN = ['Klageschrift', 'Klageantwort', 'Replik', 'Berufung', 'Beschwerde', 'Plädoyer', 'Stellungnahme', 'Rechtsschrift'];

/* Fristenradar — kanzleiweit, sortiert nach Dringlichkeit */
const fristenRadar = () => {
  const rows = [];
  FAELLE.forEach(f => f.fristen.forEach(fr => rows.push({ ...fr, fall: f })));
  return rows.sort((a, b) => a.tage - b.tage);
};

window.FAELLE = FAELLE;
window.WB_VORLAGEN = WB_VORLAGEN;
window.fristenRadar = fristenRadar;

/* ---------- Praxis: benutzerdefinierte Fälle (Persistenz + Reaktivität) ---------- */
const PX_KEY = 'rh-praxis-faelle-custom';
const PX_COLORS = ['blue', 'red', 'green', 'amber', 'ink'];
let pxCustom = [];
try { const raw = localStorage.getItem(PX_KEY); if (raw) pxCustom = JSON.parse(raw) || []; } catch (e) {}
const pxSubs = new Set();
function pxSave() { try { localStorage.setItem(PX_KEY, JSON.stringify(pxCustom)); } catch (e) {} }
function pxNotify() { pxSubs.forEach((f) => f()); }
function pxAll() { return [...FAELLE, ...pxCustom]; }
function pxCreate({ title, gebiet, ref }) {
  const id = 'fall-' + Date.now().toString(36);
  const jahr = new Date().getFullYear();
  const fall = {
    id,
    ref: (ref || '').trim() || `M-${jahr}-${String(pxAll().length + 1).padStart(3, '0')}`,
    title: (title || 'Neuer Fall').trim() || 'Neuer Fall',
    kurz: '', gebiet: (gebiet || '').trim() || 'Zivilrecht',
    verfahren: '', gericht: '', nr: '',
    phase: 'Neu eröffnet',
    color: PX_COLORS[pxAll().length % PX_COLORS.length],
    streitwert: '—', rolleKlient: 'Klient*in',
    parteien: [{ rolle: 'Klient*in', name: (title || 'Neuer Fall').trim(), detail: '', vertreter: 'RA Julian Bodenmann', klient: true }],
    nextFrist: { titel: 'Keine Frist erfasst', datum: '—', tage: 999, art: '—' },
    fristen: [], akten: [], chrono: [], korrespondenz: [],
    honorar: { rate: 280, budget: 1, entries: [], total: 0 },
    entwuerfe: [{ id: 'entwurf-1', titel: 'Erster Entwurf', typ: 'Rechtsschrift', status: 'Gerüst', updated: 'heute', words: 0 }],
  };
  pxCustom = [...pxCustom, fall];
  pxSave();
  pxNotify();
  return fall;
}
function usePxAll() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { const f = () => force(); pxSubs.add(f); return () => pxSubs.delete(f); }, []);
  return pxAll();
}
window.pxAll = pxAll;
window.pxCreate = pxCreate;
window.usePxAll = usePxAll;
