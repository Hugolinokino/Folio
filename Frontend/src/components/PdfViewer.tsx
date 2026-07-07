import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { invoke } from '@tauri-apps/api/core';
import { Icon } from './Icon';

/** Full-screen modal that renders a stored PDF in-app. The file is read
 * through the existing `read_binary_file` command and handed to WKWebView's
 * native PDF renderer via a blob URL — no extra viewer dependency. */
export function PdfViewer({ filePath, title, onClose }: { filePath: string; title: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    invoke<number[]>('read_binary_file', { path: filePath })
      .then((bytes) => {
        if (cancelled) return;
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((err) => setError(typeof err === 'string' ? err : 'PDF konnte nicht geladen werden.'));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Rendered into document.body via a portal: any ancestor with an active CSS
  // transform/animation (e.g. the `.view-in` entrance animation used all over
  // this app) turns into a containing block for `position: fixed` descendants,
  // which otherwise made this modal render relative to that ancestor's box
  // instead of the viewport — showing up "too high" whenever the window was
  // maximized/fullscreen and that box didn't span the full window.
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: 'min(960px, 94vw)', height: '90vh', display: 'flex', flexDirection: 'column', padding: 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row-flex" style={{ marginBottom: 10, gap: 10 }}>
          <span className="title" style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </span>
          <span className="spacer"></span>
          <button className="btn-ghost-glass" onClick={onClose}><Icon name="close" size={13} /> Schliessen</button>
        </div>
        {error && <div className="t-sans-sm" style={{ padding: 12 }}>{error}</div>}
        {!error && !url && <div className="t-sans-sm" style={{ padding: 12 }}>PDF wird geladen …</div>}
        {url && (
          <iframe
            src={url}
            title={title}
            style={{ flex: 1, width: '100%', border: '1px solid var(--line-1)', borderRadius: 8, background: '#525659' }}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
