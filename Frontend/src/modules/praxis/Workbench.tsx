import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Icon } from '../../components/Icon';
import { useCaseWorkspace } from '../../lib/praxis/store';
import type { Akte, Frist } from '../../lib/praxis/types';

interface WorkbenchProps {
  fallId: string;
  entwurfId: string;
  onOpenFall: (fallId: string, tab?: string) => void;
}

type SideTab = 'akten' | 'recht' | 'check';

interface MentionState {
  trigger: '@' | '#';
  start: number;
  end: number;
  query: string;
}

const DEBOUNCE_MS = 500;

const MENTION_RE = /[@#][^\s@#]*$/;

/** Matches Swiss BGE references like "BGE 137 I 16". */
const BGE_RE = /BGE\s?\d+\s?[IVX]+\s?\d+/g;
/** Matches "Art. 97 OR", "Art. 41 Abs. 1 ZGB", "Art. 8 Abs. 2 lit. a BV" etc. — trailing 2–10 uppercase letters as the Erlass-Kürzel. */
const ART_RE = /Art\.\s?\d+[a-z]?(?:\s?Abs\.\s?\d+)?(?:\s?(?:Ziff\.|lit\.)\s?[a-zA-Z0-9]+)?\s+[A-ZÄÖÜ]{2,10}\b/g;
/** Any @Akte-mention already inserted into the draft text. */
const AT_MENTION_RE = /@[^\s@#]+/;

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((v) => v.replace(/\s+/g, ' ').trim()))];
}

export function Workbench({ fallId, entwurfId, onOpenFall }: WorkbenchProps) {
  const { fall, loading, updateDraftContent, exportDraftDocx, exportDraftPdf } = useCaseWorkspace(fallId);
  const entwurf = fall?.entwuerfe.find((e) => e.id === entwurfId) ?? fall?.entwuerfe[0] ?? null;

  const [side, setSide] = useState<SideTab>('akten');
  const [rubrumFlash, setRubrumFlash] = useState(false);
  const [aktSearch, setAktSearch] = useState('');
  const [content, setContent] = useState('');
  const [mention, setMention] = useState<MentionState | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedDraftId = useRef<string | null>(null);

  useEffect(() => {
    if (entwurf && loadedDraftId.current !== entwurf.id) {
      setContent(entwurf.content);
      loadedDraftId.current = entwurf.id;
      setMention(null);
    }
  }, [entwurf]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scheduleSave = (draftId: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateDraftContent(draftId, value);
    }, DEBOUNCE_MS);
  };

  const detectMention = (value: string, cursor: number): MentionState | null => {
    const upTo = value.slice(0, cursor);
    const m = MENTION_RE.exec(upTo);
    if (!m) return null;
    const trigger = m[0][0] as '@' | '#';
    return { trigger, start: cursor - m[0].length, end: cursor, query: m[0].slice(1) };
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (entwurf) scheduleSave(entwurf.id, value);
    setMention(detectMention(value, e.target.selectionStart));
  };

  const handleContentKeyUp = (e: KeyboardEvent<HTMLTextAreaElement> | MouseEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setMention(detectMention(el.value, el.selectionStart));
  };

  const applyMention = (insertText: string) => {
    if (!mention || !entwurf) return;
    const before = content.slice(0, mention.start);
    const after = content.slice(mention.end);
    const nextValue = before + insertText + after;
    setContent(nextValue);
    scheduleSave(entwurf.id, nextValue);
    setMention(null);
    const cursorPos = before.length + insertText.length;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const insertAkte = (a: Akte) => applyMention(`@${a.titel} `);
  const insertFrist = (f: Frist) => applyMention(`#${f.titel} `);

  const appendAktenQuote = (a: Akte) => {
    if (!entwurf) return;
    const nextValue = content + `@${a.titel} `;
    setContent(nextValue);
    scheduleSave(entwurf.id, nextValue);
  };

  const regenRubrum = () => {
    setRubrumFlash(true);
    setTimeout(() => setRubrumFlash(false), 900);
  };

  const mentionAkten = useMemo(() => {
    if (!mention || mention.trigger !== '@' || !fall) return [];
    const q = mention.query.toLowerCase();
    return fall.akten.filter((a) => a.titel.toLowerCase().includes(q)).slice(0, 8);
  }, [mention, fall]);

  const mentionFristen = useMemo(() => {
    if (!mention || mention.trigger !== '#' || !fall) return [];
    const q = mention.query.toLowerCase();
    return fall.fristen.filter((f) => f.titel.toLowerCase().includes(q)).slice(0, 8);
  }, [mention, fall]);

  /** Deterministic regex scan of the live draft text — no AI, just pattern matching for BGE/Art.-citations. */
  const rechtFunde = useMemo(() => ({
    bge: dedupe(content.match(BGE_RE) || []),
    art: dedupe(content.match(ART_RE) || []),
  }), [content]);

  /** Lücken-Check: paragraphs of substance (>40 chars) that cite no @Akte — mirrors Academia's Argument-ohne-Quelle check. */
  const pruefAbschnitte = useMemo(() => {
    return content
      .split(/\n{2,}/)
      .map((text, i) => ({ nr: i + 1, text: text.trim() }))
      .filter((a) => a.text.length > 0);
  }, [content]);
  const pruefLuecken = pruefAbschnitte.filter((a) => a.text.length > 40 && !AT_MENTION_RE.test(a.text));

  const handleExportDocx = () => {
    setExportOpen(false);
    if (entwurf) exportDraftDocx(entwurf.id, entwurf.titel);
  };
  const handleExportPdf = () => {
    setExportOpen(false);
    if (entwurf) exportDraftPdf(entwurf.id, entwurf.titel);
  };

  if (loading && !fall) {
    return (
      <div className="detail view-in" style={{ padding: 40 }}>
        <p className="t-sans-sm">Lädt …</p>
      </div>
    );
  }

  if (!fall || !entwurf) {
    return (
      <div className="detail view-in" style={{ padding: 40 }}>
        <div className="t-mono-sm crumb-line">
          <span className="crumb-back" onClick={() => onOpenFall(fallId, 'uebersicht')}><Icon name="arrow-left" size={12} /> Zurück</span>
        </div>
        <p className="t-sans-sm" style={{ marginTop: 16 }}>Noch kein Entwurf für diesen Fall vorhanden.</p>
      </div>
    );
  }

  const kl = fall.parteien.find((p) => p.klient);
  const gg = fall.parteien.find((p) => !p.klient);
  const akten = fall.akten.filter((a) => !aktSearch || (a.titel + ' ' + a.nr).toLowerCase().includes(aktSearch.toLowerCase()));

  return (
    <div className="detail view-in" data-screen-label={`Workbench · ${entwurf.titel}`}>
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
        <div className="row-flex" style={{ gap: 8, position: 'relative' }}>
          <button className="btn-ghost-glass" onClick={regenRubrum}><Icon name="grid" size={13} /> Rubrum aktualisieren</button>
          <button className="btn-primary-dark" onClick={() => setExportOpen((o) => !o)}><Icon name="export" size={13} /> Export Word / PDF</button>
          {exportOpen && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
                background: 'var(--paper)', border: '1px solid var(--glass-border)', borderRadius: 12,
                boxShadow: 'var(--sh-3)', padding: 6, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nav-i" onClick={handleExportDocx}><span className="ico"><Icon name="doc" size={14} /></span> Als Word (.docx)</div>
              <div className="nav-i" onClick={handleExportPdf}><span className="ico"><Icon name="doc" size={14} /></span> Als PDF</div>
            </div>
          )}
        </div>
      </div>
      {exportOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setExportOpen(false)}></div>}

      <div className="wb-split">
        <div className="wb-paper scroll">
          <div className={`rubrum ${rubrumFlash ? 'flash' : ''}`}>
            <div className="ru-court">{fall.gericht || '—'}</div>
            <div className="ru-nr">Geschäfts-Nr. {fall.nr || '—'}</div>
            <div className="ru-parties">
              <div>
                {kl ? (
                  <>
                    <span className="ru-name">{kl.name}</span>, {kl.detail}<br />
                    <span className="ru-vert">vertreten durch {kl.vertreter || '—'}</span><span className="ru-rolle">{kl.rolle}</span>
                  </>
                ) : (
                  <span className="ru-name" style={{ opacity: 0.5 }}>Keine Klientschaft erfasst</span>
                )}
              </div>
              <div className="ru-gegen">gegen</div>
              <div>
                {gg ? (
                  <>
                    <span className="ru-name">{gg.name}</span>, {gg.detail}<br />
                    <span className="ru-vert">vertreten durch {gg.vertreter || '—'}</span><span className="ru-rolle">{gg.rolle}</span>
                  </>
                ) : (
                  <span className="ru-name" style={{ opacity: 0.5 }}>Keine Gegenpartei erfasst</span>
                )}
              </div>
            </div>
            <div className="ru-betreff">betreffend <em>{fall.kurz || fall.title}</em> — {entwurf.titel}</div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              style={{
                display: 'block', width: '100%', minHeight: 420, border: 'none', outline: 'none',
                resize: 'vertical', background: 'transparent', fontFamily: 'var(--serif)',
                fontSize: 15.5, lineHeight: 1.66, color: 'var(--ink-2)', padding: 0,
              }}
              value={content}
              onChange={handleContentChange}
              onKeyUp={handleContentKeyUp}
              onClick={handleContentKeyUp}
              onBlur={() => setMention(null)}
              placeholder="Rz. 1 — weiterschreiben …"
            />
            {mention && (
              <div className="panel" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 300, maxHeight: 240, overflow: 'auto', zIndex: 10, padding: 8 }}>
                {mention.trigger === '@' && (
                  mentionAkten.length > 0
                    ? mentionAkten.map((a) => (
                      <div key={a.id} className="wb-akt" style={{ cursor: 'pointer' }} onMouseDown={(e) => { e.preventDefault(); insertAkte(a); }}>
                        <span className="akt-nr">{a.nr}</span>
                        <span className="od-t">{a.titel}</span>
                      </div>
                    ))
                    : <div className="t-sans-sm" style={{ padding: 6 }}>Keine Treffer</div>
                )}
                {mention.trigger === '#' && (
                  mentionFristen.length > 0
                    ? mentionFristen.map((f) => (
                      <div key={f.id} className="wb-akt" style={{ cursor: 'pointer' }} onMouseDown={(e) => { e.preventDefault(); insertFrist(f); }}>
                        <span className="akt-nr" style={{ width: 'auto', minWidth: 92 }}>{f.datum}</span>
                        <span className="od-t">{f.titel}</span>
                      </div>
                    ))
                    : <div className="t-sans-sm" style={{ padding: 6 }}>Keine Treffer</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="wb-side">
          <div className="tabs" style={{ alignSelf: 'stretch', display: 'flex' }}>
            {([['akten', 'Akten'], ['recht', 'Recht'], ['check', 'Prüfung']] as [SideTab, string][]).map(([id, l]) => (
              <span key={id} className={`tab ${side === id ? 'on' : ''}`} style={{ flex: 1, textAlign: 'center' }} onClick={() => setSide(id)}>{l}</span>
            ))}
          </div>

          {side === 'akten' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <input className="input" style={{ fontSize: 13.5, padding: '8px 12px', marginBottom: 10, width: '100%' }} placeholder="Akten durchsuchen …" value={aktSearch} onChange={(e) => setAktSearch(e.target.value)} />
              <div className="col" style={{ gap: 2 }}>
                {akten.map((a) => (
                  <div key={a.id} className="wb-akt">
                    <span className="akt-nr">{a.nr}</span>
                    <span className="od-t">{a.titel}</span>
                    <span className="wb-insert" title="Als Zitat einfügen" onClick={() => appendAktenQuote(a)}><Icon name="quote" size={12} /></span>
                  </div>
                ))}
                {akten.length === 0 && <div className="t-sans-sm" style={{ padding: 8 }}>Keine Akten gefunden.</div>}
              </div>
            </div>
          )}

          {side === 'recht' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 4 }}>Bundesgerichtsentscheide</div>
              <p className="t-sans-sm" style={{ marginBottom: 10, opacity: 0.7 }}>im Entwurf-Text gefunden</p>
              <div className="col" style={{ gap: 2, marginBottom: 16 }}>
                {rechtFunde.bge.map((c) => (
                  <div key={c} className="wb-akt"><span className="od-t">{c}</span></div>
                ))}
                {rechtFunde.bge.length === 0 && <div className="t-sans-sm" style={{ padding: '2px 8px', opacity: 0.6 }}>Keine BGE-Zitate im Text (Format „BGE 137 I 16").</div>}
              </div>

              <div className="t-mono-sm" style={{ marginBottom: 4 }}>Gesetzesartikel</div>
              <p className="t-sans-sm" style={{ marginBottom: 10, opacity: 0.7 }}>im Entwurf-Text gefunden</p>
              <div className="col" style={{ gap: 2 }}>
                {rechtFunde.art.map((c) => (
                  <div key={c} className="wb-akt"><span className="od-t">{c}</span></div>
                ))}
                {rechtFunde.art.length === 0 && <div className="t-sans-sm" style={{ padding: '2px 8px', opacity: 0.6 }}>Keine Gesetzesartikel im Text (Format „Art. 97 OR").</div>}
              </div>
            </div>
          )}

          {side === 'check' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 4 }}>Lücken-Check: Absätze ohne Aktenbezug</div>
              <p className="t-sans-sm" style={{ marginBottom: 10, opacity: 0.7 }}>
                {pruefAbschnitte.length === 0
                  ? 'Noch kein Text vorhanden.'
                  : `${pruefLuecken.length} von ${pruefAbschnitte.length} Absätzen ohne @-Aktenverweis`}
              </p>
              <div className="col" style={{ gap: 8 }}>
                {pruefLuecken.map((a) => (
                  <div key={a.nr} className="panel" style={{ padding: '10px 12px' }}>
                    <div className="t-mono-sm" style={{ marginBottom: 4 }}>Absatz {a.nr}</div>
                    <p className="t-sans-sm" style={{ margin: 0 }}>{a.text.slice(0, 180)}{a.text.length > 180 ? '…' : ''}</p>
                  </div>
                ))}
                {pruefAbschnitte.length > 0 && pruefLuecken.length === 0 && (
                  <div className="t-sans-sm" style={{ padding: '2px 8px', opacity: 0.6 }}>Jeder Absatz verweist auf mindestens eine Akte.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
