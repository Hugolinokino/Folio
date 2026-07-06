/* Strategy Hub — Datenmodell · Persistenz · Verknüpfungen · Export
   Vorhaben: «Kanzlei 2030» — Strategie der Kanzlei Bodenmann */

const ST_KEY = 'rh-strategie-v1';

const ST_SEED = {
  meta: { vorhaben: 'Kanzlei 2030', horizont: '2026–2031', heute: 2026.5, heuteLabel: '4. Jul 2026' },

  /* ---------- Akteure ---------- */
  akteure: [
    { id: 'ak-keller', name: 'Keller & Partner', rolle: 'Gegenspieler', macht: 78, interesse: 58,
      ziele: ['Marktanteil Wirtschaftsrecht ZH ausbauen', 'Laterale Abwerbung von Senior-Talenten'],
      ressourcen: '12 Partner, eigenes KM-Team, Preisspielraum', muster: 'Reagiert auf Konkurrenz mit Preisdruck und aggressivem Hiring; meidet Produktinnovation.', tags: ['kanzlei', 'wettbewerb'] },
    { id: 'ak-lexon', name: 'Lexon AI', rolle: 'Gegenspieler', macht: 55, interesse: 85,
      ziele: ['KMU-Rechtsberatung als Software-Abo', 'Anwaltsmonopol politisch aufweichen'],
      ressourcen: 'VC-finanziert (Serie B), 40 Entwickler, kein Forensik-Zugang', muster: 'Kontert Beratungsangebote mit Gratis-Tools; sucht Kanzlei-Partnerschaften als Vertriebskanal.', tags: ['legaltech', 'substitut'] },
    { id: 'ak-gerichte', name: 'Zürcher Gerichte / Justitia 4.0', rolle: 'Stakeholder', macht: 88, interesse: 30,
      ziele: ['Elektronischer Rechtsverkehr flächendeckend', 'Effizienz der Verfahren'],
      ressourcen: 'Regulatorische Autorität, Projektbudget Bund', muster: 'Langsam, aber irreversibel; setzt Standards, die alle binden.', tags: ['justiz', 'regulierung'] },
    { id: 'ak-kmu', name: 'KMU-Mandantschaft', rolle: 'Partner', macht: 52, interesse: 75,
      ziele: ['Planbare Rechtskosten', 'Erreichbarkeit & persönliche Betreuung'],
      ressourcen: 'Mandatsvolumen, Weiterempfehlungen', muster: 'Preissensibel bei Standardarbeit, loyal bei Streitfällen — vergleicht zunehmend Offerten.', tags: ['kunden'] },
    { id: 'ak-uni', name: 'Universität Zürich', rolle: 'Partner', macht: 35, interesse: 62,
      ziele: ['Praxisnahe Lehre', 'Drittmittel & Publikationen'],
      ressourcen: 'Reputation, Talentzugang, Forschungsinfrastruktur', muster: 'Kooperiert gern, entscheidet langsam über Gremien.', tags: ['academia'] },
    { id: 'ak-versicherer', name: 'Rechtsschutzversicherer', rolle: 'Gegenspieler', macht: 60, interesse: 48,
      ziele: ['Schadenkosten senken', 'Eigene Beratungsstrecken aufbauen'],
      ressourcen: 'Kundenzugang, Datenbestand, Panels', muster: 'Steuert Mandate in eigene Panels; drückt Ansätze über Rahmenverträge.', tags: ['versicherung'] },
  ],

  /* ---------- Faktoren: Trends · Weak Signals · Umweltfaktoren ---------- */
  faktoren: [
    { id: 'fk-genai', titel: 'Generative KI in der Rechtsarbeit', art: 'Trend', pestel: 'T', unsicherheit: 42, impact: 92, horizont: 'mittel', quelle: 'Eigene Pilotierung · Branchenstudien', datum: '02. Mär 2026', relevanz: 3, note: 'Entwurfsarbeit und Aktenanalyse bereits produktiv einsetzbar; forensische Vertretung unberührt.', links: ['an-ki', 'op-ki'] },
    { id: 'fk-justitia', titel: 'Justitia 4.0 — eRechtsverkehr wird Pflicht', art: 'Trend', pestel: 'P', unsicherheit: 18, impact: 70, horizont: 'kurz', quelle: 'BJ, Projektstand 05/2026', datum: '12. Mai 2026', relevanz: 3, note: 'Übergangsfristen laufen; Prozesse der Kanzlei müssen 2027 umgestellt sein.', links: ['an-justitia'] },
    { id: 'fk-honorar', titel: 'Erosion des Stundenhonorars', art: 'Trend', pestel: 'E', unsicherheit: 50, impact: 80, horizont: 'mittel', quelle: 'Offertvergleiche, Verbandsumfrage', datum: '20. Apr 2026', relevanz: 3, note: 'KMU fragen Fixpreise nach; Versicherer drücken Ansätze über Panels.', links: ['op-fixpreis', 'an-praemie'] },
    { id: 'fk-talent', titel: 'Verknappung juristischer Talente', art: 'Trend', pestel: 'S', unsicherheit: 35, impact: 62, horizont: 'mittel', quelle: 'Bewerbungslage, Lohnentwicklung', datum: '15. Jan 2026', relevanz: 2, note: 'Grosskanzleien zahlen Einstiegslöhne, die Boutiquen nicht matchen können.', links: [] },
    { id: 'fk-bgfa', titel: 'Lockerung Anwaltsmonopol (BGFA-Revision)', art: 'Umweltfaktor', pestel: 'L', unsicherheit: 78, impact: 88, horizont: 'lang', quelle: 'Parl. Initiative, Vernehmlassung erwartet 2027', datum: '08. Jun 2026', relevanz: 3, note: 'Würde Beratungsmarkt für Nicht-Anwälte öffnen — grösster einzelner Unsicherheitsfaktor.', links: ['sz-plattform'] },
    { id: 'fk-esg', titel: 'ESG-Klagewelle erreicht KMU', art: 'Signal', pestel: 'L', unsicherheit: 74, impact: 58, horizont: 'lang', quelle: 'NZZ 14.06.26 · 2 Mandatsanfragen', datum: '14. Jun 2026', relevanz: 2, note: 'Zwei Anfragen zu Lieferketten-Sorgfalt binnen eines Monats — beobachten.', links: [] },
    { id: 'fk-panel', titel: 'Versicherer bauen Inhouse-Beratung auf', art: 'Signal', pestel: 'E', unsicherheit: 68, impact: 55, horizont: 'mittel', quelle: 'Stelleninserate AXA/Zurich Legal', datum: '22. Mai 2026', relevanz: 2, note: 'Erste Inserate für «Legal Advisors KMU» bei zwei Versicherern.', links: ['ak-versicherer'] },
    { id: 'fk-plattf', titel: 'Mandats-Plattformen mit Ausschreibungslogik', art: 'Signal', pestel: 'T', unsicherheit: 62, impact: 45, horizont: 'mittel', quelle: 'Anwalt24-Launch 03/2026', datum: '03. Mär 2026', relevanz: 1, note: 'Bisher nur Standardmandate; Preiskampf nach unten.', links: ['jr-plattform'] },
  ],

  /* ---------- Annahmen (mit Falsifikationskriterium) ---------- */
  annahmen: [
    { id: 'an-ki', text: 'KI ersetzt in den nächsten 5 Jahren keine forensische Vertretung.', falsifikation: 'Erste von einem ZH-Gericht akzeptierte, vollständig KI-generierte Rechtsschrift.', pruefdatum: '15. Jan 2027', tage: 195, status: 'offen', links: ['fk-genai', 'sz-hybrid'] },
    { id: 'an-praemie', text: 'KMU zahlen für persönliche Beratung eine Prämie von ≥ 20 % gegenüber Software.', falsifikation: 'Drei verlorene Offerten in Folge mit Preis als dokumentiertem Ablehnungsgrund.', pruefdatum: '31. Okt 2026', tage: 119, status: 'offen', links: ['fk-honorar', 'op-fixpreis'] },
    { id: 'an-fixpreis', text: 'Fixpreis-Produkte kannibalisieren das Stundenhonorar-Geschäft nicht.', falsifikation: 'Bestandsmandant wechselt dokumentiert von Stundenhonorar auf Fixpreis-Paket mit ≥ 30 % Umsatzverlust.', pruefdatum: '30. Sep 2026', tage: 88, status: 'kritisch', links: ['op-fixpreis', 'in-fixpreis'] },
    { id: 'an-justitia', text: 'Justitia 4.0 wird bis Ende 2027 für Anwälte verbindlich.', falsifikation: 'Erneute Verschiebung des Obligatoriums durch den Bund.', pruefdatum: '01. Mär 2027', tage: 240, status: 'bestätigt', links: ['fk-justitia'] },
  ],

  /* ---------- SWOT / TOWS ---------- */
  swot: {
    S: [ { id: 'sw-s1', text: 'Prozesserfahrung Bau- & Werkvertragsrecht' }, { id: 'sw-s2', text: 'Doppelprofil Praxis + Academia (Reputation)' }, { id: 'sw-s3', text: 'Persönliche, langjährige Mandatsbeziehungen' } ],
    W: [ { id: 'sw-w1', text: 'Ein-Partner-Risiko, keine Vertretungstiefe' }, { id: 'sw-w2', text: '100 % Umsatz aus Stundenhonorar' }, { id: 'sw-w3', text: 'Keine skalierbare Wissensablage' } ],
    O: [ { id: 'sw-o1', text: 'KI-gestützte Fixpreis-Produkte für KMU' }, { id: 'sw-o2', text: 'Legal-Ops-Beratung als zweites Standbein' }, { id: 'sw-o3', text: 'Lehrauftrag als Talent-Pipeline' } ],
    T: [ { id: 'sw-t1', text: 'Honorarerosion durch Panels & Software' }, { id: 'sw-t2', text: 'LegalTech-Substitution der Standardarbeit' }, { id: 'sw-t3', text: 'BGFA-Öffnung des Beratungsmarkts' } ],
  },
  tows: {
    SO: 'Reputation + KI-Kompetenz nutzen, um als erste Boutique glaubwürdige Fixpreis-Produkte zu lancieren.',
    ST: 'Forensische Stärke betonen: dort ist weder Software noch Panel substituierbar.',
    WO: 'Wissensablage aufbauen, damit Produkte nicht am Ein-Partner-Engpass scheitern.',
    WT: 'Abhängigkeit vom Stundenhonorar vor der BGFA-Entscheidung reduzieren — nicht danach.',
  },

  /* ---------- Zukunftslinien (mehrsträngige Foresight-Timeline) ---------- */
  entscheidungspunkte: [
    { id: 'ep-bgfa', jahr: 2027.25, kurz: 'EP 1', titel: 'BGFA-Revision — Vernehmlassungsergebnis', tage: 255, datum: '~ Mär 2027' },
    { id: 'ep-ki', jahr: 2028.4, kurz: 'EP 2', titel: 'KI-Eingaben: Praxis der ZH-Gerichte gefestigt', tage: 680, datum: '~ Mai 2028' },
  ],
  straenge: [
    { id: 'sz-hybrid', titel: 'Hybride Kanzlei', art: 'ziel', prob: 40, parent: 'trunk', branch: 2027.25, laneY: 120,
      kurz: 'KI-Adoption schnell · Monopol bleibt', zielbild: '2031: 40 % des Umsatzes aus Produkten & Legal Ops, Forensik als Premium-Kern.',
      events: [ { jahr: 2027.6, titel: 'Fixpreis-Linie am Markt', art: 'ms' }, { jahr: 2028.6, titel: 'Erster Legal-Ops-Rahmenvertrag', art: 'ms' }, { jahr: 2029.5, titel: 'Zweite Anwältin als Partnerin', art: 'ms' }, { jahr: 2030.8, titel: 'Zielbild erreicht: 40 % Nicht-Stunden-Umsatz', art: 'ziel' } ],
      backcast: [ '2030 — Produktumsatz trägt eine Vollzeitstelle', '2029 — Partnerin an Bord, Forensik delegierbar', '2028 — Legal-Ops-Angebot referenzierbar', '2027 — Fixpreis-Linie lanciert & kalkuliert', 'Heute — Pilot abschliessen, Deckungsbeitrag messen' ],
      links: ['an-ki', 'op-fixpreis', 'op-legalops'] },
    { id: 'sz-handwerk', titel: 'Handwerk behauptet sich', art: 'basis', prob: 35, parent: 'trunk', branch: 2027.25, laneY: 250,
      kurz: 'KI-Adoption langsam · Monopol bleibt', zielbild: '2031: Boutique wie heute, leicht gewachsen — Effizienzgewinne intern, Geschäftsmodell unverändert.',
      events: [ { jahr: 2027.8, titel: 'Justitia 4.0 umgesetzt', art: 'ms' }, { jahr: 2029.2, titel: 'KI nur als internes Werkzeug', art: 'ms' }, { jahr: 2030.8, titel: 'Status quo plus — solide, verwundbar', art: 'ziel' } ],
      backcast: [ '2029 — Effizienzrendite in Marge überführt', '2027 — eRechtsverkehr sauber umgestellt', 'Heute — keine Sonderinvestitionen nötig' ],
      links: ['an-praemie'] },
    { id: 'sz-plattform', titel: 'Plattform-Markt', art: 'stress', prob: 20, parent: 'sz-hybrid', branch: 2028.4, laneY: 45,
      kurz: 'KI schnell · Monopol fällt', zielbild: '2031: Beratung ist Plattformgeschäft — überleben nur Marken mit Produkt oder radikale Nische.',
      events: [ { jahr: 2029.0, titel: 'Erste Nicht-Anwalts-Anbieter zugelassen', art: 'ms' }, { jahr: 2029.8, titel: 'Preiszerfall Standardberatung −40 %', art: 'ms' }, { jahr: 2030.8, titel: 'Stresstest: Nur Produkt- & Forensik-Umsatz übrig', art: 'ziel' } ],
      backcast: [ '2029 — Marke & Produkte müssen bereits stehen', '2028 — Entscheid: Plattform-Teilnahme ja/nein', 'Heute — Optionswert von Produkten sichern' ],
      links: ['fk-bgfa'] },
    { id: 'sz-nische', titel: 'Boutique-Nische', art: 'wild', prob: 5, parent: 'sz-handwerk', branch: 2028.4, laneY: 330,
      kurz: 'KI langsam · Monopol fällt', zielbild: '2031: Markt fragmentiert; hochspezialisierte Einzelkanzleien mit Nischenpreismacht.',
      events: [ { jahr: 2029.4, titel: 'Spezialisierung Baurecht vertieft', art: 'ms' }, { jahr: 2030.8, titel: 'Nische verteidigt, Wachstum begrenzt', art: 'ziel' } ],
      backcast: [ '2029 — Fachautorität publizistisch belegt', 'Heute — Academia-Schiene konsequent pflegen' ],
      links: [] },
  ],

  /* ---------- Optionen & taktische Züge ---------- */
  optionen: [
    { id: 'op-fixpreis', titel: 'Fixpreis-Produktlinie für KMU', these: 'Standardisierbare Beratung («Gründung kompakt», «Bau-Check») als Paket mit Fixpreis — Antwort auf Honorarerosion, bevor Substitute den Preis setzen.',
      reversibilitaet: 4, ressourcen: 2, optionswert: 4, passung: 5, horizont: '12 Mt.', status: 'pilot',
      zuege: [ { id: 'zg-f1', titel: 'Pilot mit 5 Bestandsmandanten', status: 'laufend' }, { id: 'zg-f2', titel: 'Deckungsbeitrag je Paket kalkulieren', status: 'erledigt' }, { id: 'zg-f3', titel: 'Offertprozess & Paketseite aufsetzen', status: 'offen' } ],
      premortem: [ { id: 'pm-f1', grund: 'Preisanker ruiniert Stundenhonorar-Mandate.', gegen: 'Pakete strikt auf Standardarbeit begrenzen; Streitfälle explizit ausgenommen.' }, { id: 'pm-f2', grund: 'Kalkulationsfehler bei versteckt komplexen Fällen.', gegen: 'Komplexitäts-Triage im Erstgespräch, Ausstiegsklausel im Paket.' }, { id: 'pm-f3', grund: 'Kein Owner — Produkt verhungert neben Tagesgeschäft.', gegen: 'Fester Wochenblock; Kill-Kriterium bei < 3 Piloten bis 09/26.' } ],
      links: ['fk-honorar', 'an-praemie', 'an-fixpreis', 'in-fixpreis'] },
    { id: 'op-ki', titel: 'Interne KI-Workbench ausbauen', these: 'Entwurfs- und Aktenanalyse-Werkzeuge intern produktiv machen — Effizienzrendite heben und Kompetenz für spätere Produkte aufbauen.',
      reversibilitaet: 3, ressourcen: 3, optionswert: 5, passung: 5, horizont: '6 Mt.', status: 'laufend',
      zuege: [ { id: 'zg-k1', titel: 'Replik-Workflow auf KI-Entwurf umstellen', status: 'erledigt' }, { id: 'zg-k2', titel: 'Aktenanalyse-Prompts standardisieren', status: 'laufend' }, { id: 'zg-k3', titel: 'Messung: gesparte Std./Woche etablieren', status: 'laufend' } ],
      premortem: [ { id: 'pm-k1', grund: 'Werkzeuge bleiben Spielzeug ohne Prozessanschluss.', gegen: 'Jedes Werkzeug an einen konkreten Mandats-Workflow binden.' } ],
      links: ['fk-genai', 'an-ki', 'in-ki'] },
    { id: 'op-legalops', titel: 'Legal-Ops-Beratung als 2. Standbein', these: 'KMU beim Aufbau interner Rechtsprozesse beraten (Verträge, Fristen, Wissensablage) — verkauft Erfahrung statt Stunden.',
      reversibilitaet: 4, ressourcen: 3, optionswert: 4, passung: 4, horizont: '18 Mt.', status: 'geprüft',
      zuege: [ { id: 'zg-l1', titel: 'Angebotsskizze mit 2 Mandanten testen', status: 'offen' }, { id: 'zg-l2', titel: 'Referenzfall aus eigenem Hub-Aufbau dokumentieren', status: 'offen' } ],
      premortem: [ { id: 'pm-l1', grund: 'Beratung konkurrenziert mit grossen Beratungshäusern.', gegen: 'Nur Segment < 100 MA, wo Big 4 nicht hinsieht.' } ],
      links: ['sz-hybrid'] },
    { id: 'op-fusion', titel: 'Fusion mit Steuerberatung Frey', these: 'Zusammenschluss zu multidisziplinärer Boutique — Grösse gegen das Ein-Partner-Risiko.',
      reversibilitaet: 1, ressourcen: 5, optionswert: 2, passung: 2, horizont: '24 Mt.', status: 'zurückgestellt',
      zuege: [ { id: 'zg-m1', titel: 'Sondierungsgespräch geführt', status: 'erledigt' } ],
      premortem: [ { id: 'pm-m1', grund: 'Kulturbruch; Reputationsrisiko bei Scheitern irreversibel.', gegen: 'Erst nach EP 1 (BGFA) neu bewerten — nicht vorher.' } ],
      links: ['ep-bgfa'] },
  ],
  matrix: { kriterien: [
    { id: 'passung', label: 'Passung Zielbild', gewicht: 30, invers: false },
    { id: 'optionswert', label: 'Optionswert', gewicht: 25, invers: false },
    { id: 'reversibilitaet', label: 'Reversibilität', gewicht: 25, invers: false },
    { id: 'ressourcen', label: 'Ressourcenbedarf', gewicht: 20, invers: true },
  ] },

  /* ---------- Wargaming ---------- */
  wargame: { runden: [
    { nr: 1, zuege: [
      { akteur: 'wir', text: 'Lancierung Fixpreis-Paket «Gründung kompakt» (Pilot, 5 Mandanten).', folge: 'Sichtbarkeit im KMU-Segment; Preisanker gesetzt.' },
      { akteur: 'ak-lexon', text: 'Kontert mit kostenlosem Gründungs-Dokumentengenerator + Werbekampagne.', folge: 'Preisdruck auf das Paket; Differenzierung muss über Haftung & Beratung laufen.' },
      { akteur: 'ak-kmu', text: 'Zwei Pilotmandanten fragen, was das Paket «mehr kann als das Gratis-Tool».', folge: 'Werttreiber explizit machen: Prüfung, Haftung, Ansprechperson.' },
    ] },
    { nr: 2, zuege: [
      { akteur: 'wir', text: 'Paket um «Anwaltliche Prüfung & Haftungsübernahme» geschärft, Preis gehalten.', folge: 'Abgrenzung zum Substitut; Marge unter Beobachtung.' },
      { akteur: 'ak-keller', text: 'Ignoriert Produktzug, wirbt stattdessen unsere Ziel-Associate ab.', folge: 'Talentrisiko realisiert sich vor Produktrisiko — Priorität Partnerin-Suche steigt.' },
    ] },
  ] },

  /* ---------- Initiativen (Execution) ---------- */
  initiativen: [
    { id: 'in-fixpreis', titel: 'Pilot Fixpreis-Produkte', option: 'op-fixpreis', status: 'laufend',
      meilensteine: [ { titel: 'Kalkulation & Paketzuschnitt', datum: 'Mai 2026', done: true }, { titel: '5 Pilotmandate gewonnen', datum: 'Sep 2026', done: false }, { titel: 'Go/No-Go Marktlancierung', datum: 'Nov 2026', done: false } ],
      kennzahlen: [ { name: 'Pilotmandate', ziel: 5, ist: 3, einheit: '' }, { name: 'Deckungsbeitrag', ziel: 55, ist: 61, einheit: '%' } ],
      kill: [ { text: '< 3 Pilotmandate bis 30.09.2026', status: 'beobachten' }, { text: 'Deckungsbeitrag < 40 % in zwei Fällen', status: 'ok' } ] },
    { id: 'in-ki', titel: 'KI-Workbench produktiv', option: 'op-ki', status: 'laufend',
      meilensteine: [ { titel: 'Replik-Workflow live', datum: 'Apr 2026', done: true }, { titel: '10 Std./Woche Ersparnis stabil', datum: 'Dez 2026', done: false } ],
      kennzahlen: [ { name: 'Ersparnis', ziel: 10, ist: 6.5, einheit: 'Std./Wo.' } ],
      kill: [ { text: 'Ersparnis < 4 Std./Wo. über ein Quartal', status: 'ok' } ] },
    { id: 'in-plattform', titel: 'Test Mandats-Plattform Anwalt24', option: 'op-fixpreis', status: 'gestoppt',
      meilensteine: [ { titel: '3 Monate Testpräsenz', datum: 'Mai 2026', done: true } ],
      kennzahlen: [ { name: 'Mandate via Plattform', ziel: 4, ist: 1, einheit: '' } ],
      kill: [ { text: '< 2 Mandate im Testquartal', status: 'ausgelöst' } ] },
  ],

  /* ---------- Strategisches Gedächtnis ---------- */
  journal: [
    { id: 'jr-ki', datum: '12. Mai 2026', titel: 'KI-Workbench: Make statt Buy', entscheid: 'Interne Werkzeuge selbst aufbauen statt LegalTech-Suite lizenzieren.',
      begruendung: 'Kompetenzaufbau ist Teil des Optionswerts; Lizenzlösungen binden an fremde Roadmaps.', infolage: 'Zwei Demos (Lexon, Weblaw), eigene Pilotversuche seit Q1; keine belastbaren Benchmarks.', beteiligte: 'JB · M. Steiner (extern)',
      erwartung: 'Produktiv nutzbar bis Q4/2026, ≥ 10 Std./Wo. Ersparnis.', ergebnis: null, abweichung: null, links: ['op-ki', 'an-ki', 'in-ki'] },
    { id: 'jr-plattform', datum: '30. Mai 2026', titel: 'Rückzug von Mandats-Plattform', entscheid: 'Testpräsenz auf Anwalt24 nach einem Quartal beendet (Kill-Kriterium ausgelöst).',
      begruendung: 'Plattformlogik drückt auf Preis, nicht auf Qualität; Akquisekanal passt nicht zum Positionierungsziel.', infolage: '1 Mandat in 3 Monaten, Durchschnittshonorar 40 % unter Kanzleisatz.', beteiligte: 'JB',
      erwartung: 'Kein spürbarer Umsatzverlust durch Rückzug.', ergebnis: 'Zwei Anfragen verloren — Volumen unerheblich, Entscheid trägt.', abweichung: 'gering', links: ['fk-plattf', 'in-plattform'] },
    { id: 'jr-fusion', datum: '20. Feb 2026', titel: 'Fusion Frey zurückgestellt', entscheid: 'Sondierung beendet, Option auf Wiedervorlage nach BGFA-Entscheid.',
      begruendung: 'Irreversibler Zug unter der grössten offenen Unsicherheit (EP 1) — Optionswert des Wartens überwiegt.', infolage: 'Ein Sondierungsgespräch; keine Due Diligence.', beteiligte: 'JB · R. Frey',
      erwartung: 'Kein Nachteil durch Warten bis 2027.', ergebnis: null, abweichung: null, links: ['op-fusion', 'ep-bgfa'] },
  ],

  /* ---------- Wirkungslogik (Systemsicht) ---------- */
  loops: [
    { id: 'lp-r1', typ: 'R', titel: 'Produkt-Daten-Schwungrad', kette: ['KI-Effizienz', 'Fixpreise attraktiv', 'mehr Volumen', 'mehr Falldaten', 'KI-Effizienz'] },
    { id: 'lp-b1', typ: 'B', titel: 'Preisdruck-Bremse', kette: ['Preisdruck', 'Marge sinkt', 'Investitionsbudget sinkt', 'Differenzierung sinkt', 'Preisdruck steigt'] },
  ],
};

/* ============ Mehrere Vorhaben: Registry + Persistenz + Reaktivität ============ */
const ST_REG_KEY = 'rh-strategie-registry-v1';
const ST_CUR_KEY = 'rh-strategie-current-v1';
const ST_DATA_PREFIX = 'rh-strategie-data-v1:';
const stDataKey = (id) => ST_DATA_PREFIX + id;

const ST_MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
function stTodayMeta() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const heute = now.getFullYear() + (now - start) / (365 * 24 * 3600 * 1000);
  return { heute, heuteLabel: `${now.getDate()}. ${ST_MONATE[now.getMonth()]} ${now.getFullYear()}` };
}
function stSlug(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'vorhaben';
}
function stEmptyVorhaben(titel, horizont) {
  const { heute, heuteLabel } = stTodayMeta();
  return {
    meta: { vorhaben: titel || 'Neues Vorhaben', horizont: horizont || '', heute, heuteLabel },
    akteure: [], faktoren: [], annahmen: [],
    swot: { S: [], W: [], O: [], T: [] },
    tows: { SO: '', ST: '', WO: '', WT: '' },
    entscheidungspunkte: [],
    straenge: [],
    optionen: [],
    matrix: { kriterien: [
      { id: 'passung', label: 'Passung Zielbild', gewicht: 30, invers: false },
      { id: 'optionswert', label: 'Optionswert', gewicht: 25, invers: false },
      { id: 'reversibilitaet', label: 'Reversibilität', gewicht: 25, invers: false },
      { id: 'ressourcen', label: 'Ressourcenbedarf', gewicht: 20, invers: true },
    ] },
    wargame: { runden: [{ nr: 1, zuege: [] }] },
    initiativen: [],
    journal: [],
    loops: [],
  };
}

let stReg = [];
let stCurId = null;
const stRegSubs = new Set();
function stRegNotify() { stRegSubs.forEach((f) => f()); }
function stRegSave() { try { localStorage.setItem(ST_REG_KEY, JSON.stringify(stReg)); } catch (e) {} }
function stCurSave() { try { localStorage.setItem(ST_CUR_KEY, stCurId); } catch (e) {} }

function stInitRegistry() {
  let reg = null;
  try { const raw = localStorage.getItem(ST_REG_KEY); if (raw) reg = JSON.parse(raw); } catch (e) {}
  if (reg && reg.length) {
    stReg = reg;
    stCurId = localStorage.getItem(ST_CUR_KEY) || reg[0].id;
    if (!stReg.find((r) => r.id === stCurId)) stCurId = reg[0].id;
    return;
  }
  /* Migration einer alten Einzel-Vorhaben-Ablage, sonst frischer Seed */
  let legacy = null;
  try { const raw = localStorage.getItem(ST_KEY); if (raw) legacy = JSON.parse(raw); } catch (e) {}
  const seedData = (legacy && legacy.meta && legacy.straenge) ? legacy : JSON.parse(JSON.stringify(ST_SEED));
  const id = 'kanzlei-2030';
  stReg = [{ id, titel: seedData.meta.vorhaben, horizont: seedData.meta.horizont }];
  stCurId = id;
  try { localStorage.setItem(stDataKey(id), JSON.stringify(seedData)); } catch (e) {}
  stRegSave(); stCurSave();
}
stInitRegistry();

function stDbLoad(id) {
  try { const raw = localStorage.getItem(stDataKey(id)); if (raw) { const d = JSON.parse(raw); if (d && d.meta) return d; } } catch (e) {}
  return stEmptyVorhaben('Neues Vorhaben', '');
}

/* ============ Store: Persistenz + Reaktivität (aktuelles Vorhaben) ============ */
let stDb = stDbLoad(stCurId);
const stSubs = new Set();
function stGet() { return stDb; }
function stSet(next) {
  stDb = next;
  try { localStorage.setItem(stDataKey(stCurId), JSON.stringify(stDb)); } catch (e) {}
  /* Registry-Namen synchron halten, falls Titel/Horizont im Vorhaben geändert wurden */
  const entry = stReg.find((r) => r.id === stCurId);
  if (entry && (entry.titel !== stDb.meta.vorhaben || entry.horizont !== stDb.meta.horizont)) {
    entry.titel = stDb.meta.vorhaben; entry.horizont = stDb.meta.horizont;
    stRegSave(); stRegNotify();
  }
  stSubs.forEach((f) => f());
}
function stUpdate(fn) { const copy = JSON.parse(JSON.stringify(stDb)); fn(copy); stSet(copy); }
function useStDb() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { const f = () => force(); stSubs.add(f); return () => stSubs.delete(f); }, []);
  return stDb;
}
let stSeq = 0;
function stId(prefix) { return `${prefix}-${Date.now().toString(36)}${(stSeq++).toString(36)}`; }

/* ============ Vorhaben wechseln / anlegen ============ */
function stVorhabenList() { return stReg; }
function stVorhabenCurrentId() { return stCurId; }
function stVorhabenSwitch(id) {
  if (!stReg.find((r) => r.id === id) || id === stCurId) return;
  stCurId = id;
  stCurSave();
  stDb = stDbLoad(id);
  stSubs.forEach((f) => f());
  stRegNotify();
}
function stVorhabenCreate(titel, horizont) {
  const base = stSlug(titel);
  let id = base, n = 2;
  while (stReg.find((r) => r.id === id)) id = `${base}-${n++}`;
  const data = stEmptyVorhaben((titel || '').trim() || 'Neues Vorhaben', (horizont || '').trim());
  stReg = [...stReg, { id, titel: data.meta.vorhaben, horizont: data.meta.horizont }];
  stRegSave();
  try { localStorage.setItem(stDataKey(id), JSON.stringify(data)); } catch (e) {}
  stVorhabenSwitch(id);
  return id;
}
function useStVorhabenList() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { const f = () => force(); stRegSubs.add(f); return () => stRegSubs.delete(f); }, []);
  return stReg;
}

/* ============ Objekt-Index & Verknüpfungen ============ */
const ST_TYP = {
  ak: { label: 'Akteur', view: 's-analyse' }, fk: { label: 'Faktor', view: 's-foresight' },
  an: { label: 'Annahme', view: 's-foresight' }, sz: { label: 'Szenario', view: 's-timeline' },
  op: { label: 'Option', view: 's-optionen' }, zg: { label: 'Zug', view: 's-optionen' },
  in: { label: 'Initiative', view: 's-execution' }, jr: { label: 'Entscheidung', view: 's-journal' },
  ep: { label: 'Entscheidungspunkt', view: 's-timeline' }, sw: { label: 'SWOT', view: 's-analyse' },
  lp: { label: 'Loop', view: 's-foresight' },
};
function stFind(id) {
  const d = stGet();
  const all = [
    ...d.akteure, ...d.faktoren, ...d.annahmen, ...d.straenge, ...d.optionen,
    ...d.initiativen, ...d.journal, ...d.entscheidungspunkte, ...d.loops,
    ...d.optionen.flatMap((o) => o.zuege),
    ...['S', 'W', 'O', 'T'].flatMap((k) => d.swot[k]),
  ];
  return all.find((o) => o.id === id) || null;
}
function stTitle(id) {
  const o = stFind(id);
  return o ? (o.titel || o.name || o.text || o.titel) : id;
}
function stTypOf(id) { return ST_TYP[id.slice(0, 2)] || { label: 'Objekt', view: 's-home' }; }

/* Chip für bidirektionale Verknüpfungen */
function StChip({ id, onOpen }) {
  const typ = stTypOf(id);
  const t = stTitle(id);
  return (
    <span className="st-chip" title={`${typ.label} · ${t}`} onClick={(e) => { e.stopPropagation(); onOpen && onOpen(typ.view); }}>
      <span className="tc">{typ.label}</span>{String(t).length > 34 ? String(t).slice(0, 33) + '…' : t}
    </span>
  );
}
/* Rückverweise: alle Objekte, die auf `id` zeigen */
function stBacklinks(id) {
  const d = stGet();
  const res = [];
  const scan = (o) => { if (o.links && o.links.includes(id)) res.push(o.id); };
  [...d.akteure, ...d.faktoren, ...d.annahmen, ...d.straenge, ...d.optionen, ...d.initiativen, ...d.journal].forEach(scan);
  return res;
}

/* ============ Export: JSON & Markdown (Obsidian) ============ */
function stDownload(name, text, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function stExportJson() {
  stDownload('strategy-hub-export.json', JSON.stringify(stGet(), null, 2), 'application/json');
}
function stExportMd() {
  const d = stGet();
  const wl = (ids) => (ids && ids.length ? ids.map((i) => `[[${stTitle(i)}]]`).join(' · ') : '—');
  const sec = [];
  sec.push(`# Strategy Hub — ${d.meta.vorhaben}\nExport: ${d.meta.heuteLabel} · Horizont ${d.meta.horizont}`);
  sec.push('## Akteure\n' + d.akteure.map((a) => `### ${a.name}\n- Rolle: ${a.rolle} · Macht ${a.macht} · Interesse ${a.interesse}\n- Ziele: ${a.ziele.join('; ')}\n- Ressourcen: ${a.ressourcen}\n- Reaktionsmuster: ${a.muster}\n- Tags: ${a.tags.join(', ')}`).join('\n\n'));
  sec.push('## Faktoren & Signale\n' + d.faktoren.map((f) => `### ${f.titel}\n- Art: ${f.art} (${f.pestel}) · Unsicherheit ${f.unsicherheit} · Impact ${f.impact} · Horizont ${f.horizont}\n- Quelle: ${f.quelle} (${f.datum})\n- ${f.note}\n- Verknüpft: ${wl(f.links)}`).join('\n\n'));
  sec.push('## Annahmen\n' + d.annahmen.map((a) => `### ${a.text}\n- Status: ${a.status} · Prüfung: ${a.pruefdatum}\n- Falsifikation: ${a.falsifikation}\n- Verknüpft: ${wl(a.links)}`).join('\n\n'));
  sec.push('## Szenarien (Zukunftslinien)\n' + d.straenge.map((s) => `### ${s.titel} (${s.prob} %)\n- ${s.kurz}\n- Zielbild: ${s.zielbild}\n- Ereignisse: ${s.events.map((e) => `${e.jahr} ${e.titel}`).join('; ')}\n- Backcasting: ${s.backcast.join(' → ')}\n- Verknüpft: ${wl(s.links)}`).join('\n\n'));
  sec.push('## Optionen\n' + d.optionen.map((o) => `### ${o.titel}\n- ${o.these}\n- Reversibilität ${o.reversibilitaet}/5 · Ressourcen ${o.ressourcen}/5 · Optionswert ${o.optionswert}/5 · Passung ${o.passung}/5 · Horizont ${o.horizont} · Status: ${o.status}\n- Züge: ${o.zuege.map((z) => `${z.titel} (${z.status})`).join('; ')}\n- Pre-Mortem: ${o.premortem.map((p) => `${p.grund} → ${p.gegen}`).join(' | ')}\n- Verknüpft: ${wl(o.links)}`).join('\n\n'));
  sec.push('## Initiativen\n' + d.initiativen.map((i) => `### ${i.titel}\n- Option: [[${stTitle(i.option)}]] · Status: ${i.status}\n- Meilensteine: ${i.meilensteine.map((m) => `${m.titel} (${m.datum}${m.done ? ' ✓' : ''})`).join('; ')}\n- Kennzahlen: ${i.kennzahlen.map((k) => `${k.name} ${k.ist}${k.einheit} / Ziel ${k.ziel}${k.einheit}`).join('; ')}\n- Kill-Kriterien: ${i.kill.map((k) => `${k.text} [${k.status}]`).join('; ')}`).join('\n\n'));
  sec.push('## Entscheidungsjournal\n' + d.journal.map((j) => `### ${j.datum} — ${j.titel}\n- Entscheid: ${j.entscheid}\n- Begründung: ${j.begruendung}\n- Informationslage: ${j.infolage}\n- Beteiligte: ${j.beteiligte}\n- Erwartung: ${j.erwartung}${j.ergebnis ? `\n- Ergebnis: ${j.ergebnis} (Abweichung: ${j.abweichung})` : ''}\n- Verknüpft: ${wl(j.links)}`).join('\n\n'));
  stDownload('strategy-hub-export.md', sec.join('\n\n---\n\n'), 'text/markdown');
}

Object.assign(window, {
  stGet, stSet, stUpdate, useStDb, stId, stFind, stTitle, stTypOf, StChip, stBacklinks, stExportJson, stExportMd, ST_SEED_KEY: ST_KEY,
  stVorhabenList, stVorhabenCurrentId, stVorhabenSwitch, stVorhabenCreate, useStVorhabenList,
});
