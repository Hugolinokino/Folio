import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { checkForUpdate, type AvailableUpdate } from '../lib/updater';

type Status = 'idle' | 'available' | 'installing' | 'error';

export function UpdateBanner() {
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkForUpdate()
      .then((u) => {
        if (u) {
          setUpdate(u);
          setStatus('available');
        }
      })
      .catch(() => {
        // No network / no release published yet — fail silent, this is a background check.
      });
  }, []);

  const install = async () => {
    if (!update) return;
    setStatus('installing');
    setError('');
    try {
      await update.install();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  if (!update || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--paper)', border: '1px solid var(--glass-border)', borderRadius: 12,
        boxShadow: 'var(--sh-3)', padding: '12px 14px', maxWidth: 360,
      }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="download" size={16} />
      </span>
      <div className="col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <span className="t-sans-sm" style={{ color: 'var(--ink)', fontWeight: 500 }}>Update {update.version} verfügbar</span>
        {status === 'error' ? (
          <span className="t-mono-sm" style={{ color: '#c0392b' }}>{error}</span>
        ) : (
          <span className="t-mono-sm">{status === 'installing' ? 'Wird installiert …' : 'Neustart nach Installation'}</span>
        )}
      </div>
      {status !== 'installing' && (
        <>
          <button className="btn-primary-dark" style={{ height: 30, padding: '0 12px' }} onClick={install}>
            Installieren
          </button>
          <button className="ab" title="Später" onClick={() => setDismissed(true)}>
            <Icon name="close" size={12} />
          </button>
        </>
      )}
    </div>
  );
}
