import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { api } from '../lib/tauri';

interface LoginProps {
  onUnlocked: () => void;
}

type Mode = 'loading' | 'create' | 'unlock';

export function Login({ onUnlocked }: LoginProps) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rh-theme') || 'dark');
  const [mode, setMode] = useState<Mode>('loading');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rh-theme', theme);
  }, [theme]);

  useEffect(() => {
    api.hasWorkspace().then((exists) => setMode(exists ? 'unlock' : 'create'));
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pw.trim()) {
      setError('Bitte Passwort eingeben.');
      return;
    }
    if (mode === 'create') {
      if (pw.trim().length < 8) {
        setError('Passwort muss mindestens 8 Zeichen haben.');
        return;
      }
      if (pw !== pw2) {
        setError('Passwörter stimmen nicht überein.');
        return;
      }
    }
    setError('');
    setLoading(true);
    const task = mode === 'create'
      ? api.createWorkspace(pw, name)
      : api.unlockWorkspace(pw);
    task
      .then(() => onUnlocked())
      .catch((err) => {
        setError(typeof err === 'string' ? err : 'Anmeldung fehlgeschlagen.');
        setLoading(false);
      });
  };

  return (
    <div className="room">
      <div className="floor"></div>
      <div className="ceiling-light"></div>

      <div
        className="theme-toggle"
        style={{ position: 'absolute', top: 24, right: 28, zIndex: 10 }}
        title={theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
      </div>

      <div className="login-stage bloom" data-screen-label="Login">
        <div className="login-brand">
          <span className="brand-mark" style={{ width: 36, height: 36, borderRadius: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3h7l4 4v14H7z" />
              <path d="M14 3v4h4" />
              <path d="M10 13h5M10 16.5h5" />
            </svg>
          </span>
          <span className="brand-name" style={{ fontSize: 23 }}>Folio<span className="dot">.</span></span>
        </div>
        <div className="login-tenant t-mono"></div>

        {mode === 'loading' ? (
          <div className="login-card glass-strong" style={{ padding: 32 }}>
            <span className="t-sans-sm">Wird geladen …</span>
          </div>
        ) : (
          <form className="login-card glass-strong" onSubmit={submit}>
            <div className="login-head">
              <h1 className="t-h2">{mode === 'create' ? 'Workspace einrichten' : 'Willkommen zurück'}</h1>
            </div>

            {error && <div className="login-error">{error}</div>}

            <label className="login-field">
              <span className="t-mono-sm">Name</span>
              <div className="login-input-wrap">
                <Icon name="mail" size={16} />
                <input
                  className="input"
                  type="text"
                  placeholder="Kanzlei Bodenmann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </label>

            <label className="login-field">
              <span className="t-mono-sm">{mode === 'create' ? 'Passwort festlegen' : 'Passwort'}</span>
              <div className="login-input-wrap">
                <Icon name="lock" size={16} />
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
                <span className="login-eye" onClick={() => setShowPw((s) => !s)}>
                  <Icon name="eye" size={16} />
                </span>
              </div>
            </label>

            {mode === 'create' && (
              <label className="login-field">
                <span className="t-mono-sm">Passwort bestätigen</span>
                <div className="login-input-wrap">
                  <Icon name="lock" size={16} />
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                  />
                </div>
              </label>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Wird angemeldet …' : mode === 'create' ? 'Workspace erstellen' : 'Anmelden'}
              {!loading && <Icon name="arrow-right" size={16} />}
            </button>
          </form>
        )}

        <div className="login-foot t-sans-sm">
          Alle Daten bleiben ausschliesslich lokal auf diesem Gerät.
        </div>
      </div>
    </div>
  );
}
