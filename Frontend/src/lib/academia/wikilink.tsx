import type { ReactNode } from 'react';

export interface OutlineEntry {
  lvl: number;
  text: string;
}

const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function parseOutline(content: string): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  for (const line of content.split('\n')) {
    const m = HEADING_RE.exec(line.trim());
    if (m) entries.push({ lvl: m[1].length, text: m[2].trim() });
  }
  return entries;
}

interface RenderOpts {
  resolveTitle: (title: string) => string | null;
  onOpen: (noteId: string) => void;
  onCreateUnresolved: (title: string) => void;
}

function renderInline(text: string, keyPrefix: string, opts: RenderOpts): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let i = 0;
  WIKILINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WIKILINK_RE.exec(text))) {
    if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index));
    const title = m[1].trim();
    const alias = m[2]?.trim();
    const noteId = opts.resolveTitle(title);
    const label = alias || title;
    if (noteId) {
      nodes.push(
        <span key={`${keyPrefix}-${i++}`} className="ilink" onClick={() => opts.onOpen(noteId)}>
          {label}
        </span>,
      );
    } else {
      nodes.push(
        <span
          key={`${keyPrefix}-${i++}`}
          className="ilink unresolved"
          title="Notiz noch nicht vorhanden — klicken zum Anlegen"
          onClick={() => opts.onCreateUnresolved(title)}
        >
          {label}
        </span>,
      );
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Renders raw note/chapter markdown as JSX: headings (#/##/###) + paragraphs + clickable [[Wikilinks]]. */
export function renderNoteBody(content: string, opts: RenderOpts): ReactNode[] {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;

  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ');
    blocks.push(<p key={`p-${key}`}>{renderInline(text, `p-${key}`, opts)}</p>);
    key++;
    paragraph = [];
  };

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    const heading = HEADING_RE.exec(line);
    if (heading) {
      flush();
      const lvl = heading[1].length;
      const text = heading[2].trim();
      const inline = renderInline(text, `h-${key}`, opts);
      if (lvl === 1) blocks.push(<h2 key={`h-${key}`} data-h={text}>{inline}</h2>);
      else if (lvl === 2) blocks.push(<h3 key={`h-${key}`} data-h={text}>{inline}</h3>);
      else blocks.push(<h4 key={`h-${key}`} data-h={text}>{inline}</h4>);
      key++;
    } else if (line === '') {
      flush();
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
