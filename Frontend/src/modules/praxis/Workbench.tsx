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

export function Workbench({ fallId, entwurfId, onOpenFall }: WorkbenchProps) {
  const { fall, loading, updateDraftContent } = useCaseWorkspace(fallId);
  const entwurf = fall?.entwuerfe.find((e) => e.id === entwurfId) ?? fall?.entwuerfe[0] ?? null;

  const [side, setSide] = useState<SideTab>('akten');
  const [rubrumFlash, setRubrumFlash] = useState(false);
  const [aktSearch, setAktSearch] = useState('');
  const [content, setContent] = useState('');
  const [mention, setMention] = useState<MentionState | null>(null);

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
        <div className="row-flex" style={{ gap: 8 }}>
          <button className="btn-ghost-glass" onClick={regenRubrum}><Icon name="grid" size={13} /> Rubrum aktualisieren</button>
          <button className="btn-primary-dark"><Icon name="export" size={13} /> Export Word / PDF</button>
        </div>
      </div>

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
              <div className="t-mono-sm" style={{ marginBottom: 10 }}>Verknüpfte Rechtsprechung & Normen</div>
              <p className="t-sans-sm">Verknüpfte Rechtsprechung folgt mit der Recherche-Integration.</p>
            </div>
          )}

          {side === 'check' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 10 }}>Argumentationscheck gegen die Akten</div>
              <p className="t-sans-sm">KI-Argumentationscheck folgt mit der Offline-KI-Integration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
