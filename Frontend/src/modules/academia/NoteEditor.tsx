import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Icon } from '../../components/Icon';
import { academiaApi, type NoteDetailDto, type NoteRefDto, type NoteSummaryDto } from '../../lib/academia/api';
import { parseOutline, renderNoteBody } from '../../lib/academia/wikilink';

interface MentionState {
  start: number;
  end: number;
  query: string;
}

type RightTab = 'backlinks' | 'outline' | 'tags';

const DEBOUNCE_MS = 500;
const MENTION_RE = /\[\[([^\]]*)$/;

export function NoteEditor({
  noteId,
  allNotes,
  onSave,
  onOpenNote,
  onCreateNote,
}: {
  noteId: string;
  allNotes: NoteSummaryDto[];
  onSave: (noteId: string, content: string, tags: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
}) {
  const [note, setNote] = useState<NoteDetailDto | null>(null);
  const [backlinks, setBacklinks] = useState<NoteRefDto[]>([]);
  const [mode, setMode] = useState<'edit' | 'read'>('edit');
  const [rightTab, setRightTab] = useState<RightTab>('backlinks');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mention, setMention] = useState<MentionState | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(null);
    setMention(null);
    Promise.all([academiaApi.getNote(noteId), academiaApi.listBacklinks(noteId)]).then(([n, bl]) => {
      setNote(n);
      setContent(n.content);
      setTags(n.tags ? n.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);
      setBacklinks(bl);
    });
  }, [noteId]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const scheduleSave = (nextContent: string, nextTags: string[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSave(noteId, nextContent, nextTags.join(',')), DEBOUNCE_MS);
  };

  const detectMention = (value: string, cursor: number): MentionState | null => {
    const upTo = value.slice(0, cursor);
    const m = MENTION_RE.exec(upTo);
    if (!m) return null;
    return { start: cursor - m[0].length, end: cursor, query: m[1] };
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    scheduleSave(value, tags);
    setMention(detectMention(value, e.target.selectionStart));
  };

  const handleContentKeyUp = (e: KeyboardEvent<HTMLTextAreaElement> | MouseEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setMention(detectMention(el.value, el.selectionStart));
  };

  const insertMention = (title: string) => {
    if (!mention) return;
    const before = content.slice(0, mention.start);
    const after = content.slice(mention.end);
    const nextValue = `${before}[[${title}]]${after}`;
    setContent(nextValue);
    scheduleSave(nextValue, tags);
    setMention(null);
    const cursorPos = before.length + title.length + 4;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) { el.focus(); el.setSelectionRange(cursorPos, cursorPos); }
    });
  };

  const mentionMatches = useMemo(() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    return allNotes.filter((n) => n.id !== noteId && n.title.toLowerCase().includes(q)).slice(0, 8);
  }, [mention, allNotes, noteId]);

  const addTag = (raw: string) => {
    const clean = raw.trim().replace(/^#/, '').toLowerCase();
    if (!clean || tags.includes(clean)) { setTagInput(''); return; }
    const next = [...tags, clean];
    setTags(next);
    setTagInput('');
    scheduleSave(content, next);
  };

  const removeTag = (t: string) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    scheduleSave(content, next);
  };

  const resolveTitle = (title: string): string | null => {
    const hit = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    return hit ? hit.id : null;
  };

  const outline = useMemo(() => parseOutline(content), [content]);

  if (!note) {
    return (
      <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="t-sans-sm">Notiz wird geladen …</span>
      </div>
    );
  }

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-head">
        <span className="title">{note.title}</span>
        <button className="btn-ghost-glass" onClick={() => setMode((m) => (m === 'edit' ? 'read' : 'edit'))}>
          <Icon name={mode === 'edit' ? 'eye' : 'edit'} size={13} /> {mode === 'edit' ? 'Lesen' : 'Bearbeiten'}
        </button>
      </div>

      <div className="wb-split" style={{ flex: 1, minHeight: 0 }}>
        <div className="wb-paper scroll">
          {mode === 'edit' ? (
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
                placeholder="Schreib los — [[ verlinkt zu einer anderen Notiz …"
              />
              {mention && (
                <div className="panel" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 300, maxHeight: 240, overflow: 'auto', zIndex: 10, padding: 8 }}>
                  {mentionMatches.length > 0 ? (
                    mentionMatches.map((n) => (
                      <div key={n.id} className="wb-akt" style={{ cursor: 'pointer' }} onMouseDown={(e) => { e.preventDefault(); insertMention(n.title); }}>
                        <span className="od-t">{n.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="wb-akt" style={{ cursor: 'pointer' }} onMouseDown={(e) => { e.preventDefault(); insertMention(mention.query || 'Neue Notiz'); }}>
                      <span className="od-t">＋ „{mention.query || 'Neue Notiz'}" verlinken</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="writer">
              {content.trim() === '' ? (
                <p className="t-sans-sm">Diese Notiz ist noch leer.</p>
              ) : (
                renderNoteBody(content, { resolveTitle, onOpen: onOpenNote, onCreateUnresolved: onCreateNote })
              )}
            </div>
          )}
        </div>

        <div className="wb-side">
          <div className="tabs" style={{ alignSelf: 'stretch', display: 'flex' }}>
            {([['backlinks', 'Backlinks'], ['outline', 'Gliederung'], ['tags', 'Tags']] as [RightTab, string][]).map(([id, l]) => (
              <span key={id} className={`tab ${rightTab === id ? 'on' : ''}`} style={{ flex: 1, textAlign: 'center' }} onClick={() => setRightTab(id)}>{l}</span>
            ))}
          </div>

          {rightTab === 'backlinks' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="t-mono-sm" style={{ marginBottom: 10 }}>Verweist hierher</div>
              {backlinks.length === 0 && <div className="t-sans-sm">Noch keine Backlinks.</div>}
              <div className="col" style={{ gap: 4 }}>
                {backlinks.map((b) => (
                  <div key={b.id} className="backlink" onClick={() => onOpenNote(b.id)}>
                    <span style={{ flex: 1 }}>{b.title}</span>
                    <Icon name="arrow-up-right" size={12} style={{ color: 'var(--ink-4)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightTab === 'outline' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="tree">
                {outline.length === 0 && <div className="t-sans-sm">Keine Überschriften.</div>}
                {outline.map((o, i) => (
                  <div
                    key={i}
                    className={`node l${o.lvl}`}
                    onClick={() => document.querySelector(`[data-h="${o.text}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    <span>{o.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightTab === 'tags' && (
            <div className="panel scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div className="row-flex" style={{ gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {tags.map((t) => (
                  <span key={t} className="tag">
                    <span className="hsh">#</span>{t}
                    <span className="rm" onClick={() => removeTag(t)}><Icon name="close" size={10} /></span>
                  </span>
                ))}
                <input
                  className="tag-input"
                  placeholder="tag …"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
