import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Icon } from '../../components/Icon';
import { countWords } from '../../lib/praxis/format';
import type { ChapterDto, NoteSummaryDto } from '../../lib/academia/api';
import { renderNoteBody } from '../../lib/academia/wikilink';

interface MentionState {
  start: number;
  end: number;
  query: string;
}

/** A new object (bump `requestId`) tells the editor to insert `text` at the
 * cursor — used by the Fussnoten-Generator to drop a citation into the chapter
 * currently open, without the editor exposing an imperative ref. */
export interface InsertRequest {
  text: string;
  requestId: number;
}

const DEBOUNCE_MS = 500;
const MENTION_RE = /\[\[([^\]]*)$/;

export function ChapterEditor({
  chapter,
  allNotes,
  insertRequest,
  onSave,
  onOpenNote,
  onCreateNote,
}: {
  chapter: ChapterDto;
  allNotes: NoteSummaryDto[];
  insertRequest?: InsertRequest | null;
  onSave: (chapterId: string, content: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
}) {
  const [mode, setMode] = useState<'edit' | 'read'>('edit');
  const [content, setContent] = useState(chapter.content);
  const [mention, setMention] = useState<MentionState | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedId = useRef<string | null>(null);

  useEffect(() => {
    if (loadedId.current !== chapter.id) {
      setContent(chapter.content);
      loadedId.current = chapter.id;
      setMention(null);
    }
  }, [chapter]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    if (!insertRequest) return;
    const el = textareaRef.current;
    let next: string;
    if (el && document.activeElement === el) {
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      next = content.slice(0, start) + insertRequest.text + content.slice(end);
    } else {
      const sep = content.length === 0 || content.endsWith('\n') ? '' : '\n';
      next = content + sep + insertRequest.text;
    }
    setContent(next);
    scheduleSave(next);
  }, [insertRequest]);

  const scheduleSave = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSave(chapter.id, value), DEBOUNCE_MS);
  };

  const detectMention = (value: string, cursor: number): MentionState | null => {
    const upTo = value.slice(0, cursor);
    const m = MENTION_RE.exec(upTo);
    if (!m) return null;
    return { start: cursor - m[0].length, end: cursor, query: m[1] };
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    scheduleSave(value);
    setMention(detectMention(value, e.target.selectionStart));
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement> | MouseEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setMention(detectMention(el.value, el.selectionStart));
  };

  const insertMention = (title: string) => {
    if (!mention) return;
    const before = content.slice(0, mention.start);
    const after = content.slice(mention.end);
    const nextValue = `${before}[[${title}]]${after}`;
    setContent(nextValue);
    scheduleSave(nextValue);
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
    return allNotes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 8);
  }, [mention, allNotes]);

  const resolveTitle = (title: string): string | null => {
    const hit = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    return hit ? hit.id : null;
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <div className="panel-head">
        <span className="row-flex" style={{ gap: 12, alignItems: 'baseline' }}>
          <span className="title">{chapter.title}</span>
          <span className="t-mono-sm">{chapter.status} · {countWords(content).toLocaleString('de-CH')} Wörter</span>
        </span>
        <button className="btn-ghost-glass" onClick={() => setMode((m) => (m === 'edit' ? 'read' : 'edit'))}>
          <Icon name={mode === 'edit' ? 'eye' : 'edit'} size={13} /> {mode === 'edit' ? 'Lesen' : 'Bearbeiten'}
        </button>
      </div>

      <div className="scroll writer" style={{ flex: 1, overflow: 'auto' }}>
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
              onChange={handleChange}
              onKeyUp={handleKeyUp}
              onClick={handleKeyUp}
              onBlur={() => setMention(null)}
              placeholder="Rz. 1 — weiterschreiben …"
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
                  <div className="t-sans-sm" style={{ padding: 6 }}>Keine Treffer</div>
                )}
              </div>
            )}
          </div>
        ) : content.trim() === '' ? (
          <p className="t-sans-sm">Dieses Kapitel ist noch leer.</p>
        ) : (
          renderNoteBody(content, { resolveTitle, onOpen: onOpenNote, onCreateUnresolved: onCreateNote })
        )}
      </div>
    </div>
  );
}
