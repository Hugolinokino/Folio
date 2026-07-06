/* Login — Folio workspace entry screen */
const { useState: useLg, useEffect: useLgEff } = React;

function Login() {
  const [theme, setTheme] = useLg(() => localStorage.getItem('rh-theme') || 'dark');
  const [email, setEmail] = useLg('');
  const [pw, setPw] = useLg('');
  const [showPw, setShowPw] = useLg(false);
  const [remember, setRemember] = useLg(true);
  const [error, setError] = useLg('');
  const [loading, setLoading] = useLg(false);

  useLgEff(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rh-theme', theme);
  }, [theme]);

  const submit = (e) => {
    e && e.preventDefault();
    if (!email.trim() || !pw.trim()) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => { window.location.href = 'Research Hub.html'; }, 550);
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

        <form className="login-card glass-strong" onSubmit={submit}>
          <div className="login-head">
            <h1 className="t-h2">Willkommen zurück</h1>
          </div>

          {error && <div className="login-error">{error}</div>}

          <label className="login-field">
            <span className="t-mono-sm">E-Mail</span>
            <div className="login-input-wrap">
              <Icon name="mail" size={16} />
              <input
                className="input"
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </label>

          <label className="login-field">
            <span className="t-mono-sm">Passwort</span>
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

          <div className="login-row">
            <label className="login-remember">
              <span className={`login-check ${remember ? 'on' : ''}`} onClick={() => setRemember((r) => !r)}>
                {remember && <Icon name="check" size={12} />}
              </span>
              <span className="t-sans-sm">Angemeldet bleiben</span>
            </label>
            <a className="login-forgot t-sans-sm" href="#">Passwort vergessen?</a>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Wird angemeldet …' : 'Anmelden'}
            {!loading && <Icon name="arrow-right" size={16} />}
          </button>
        </form>

        <div className="login-foot t-sans-sm">
          Noch keinen Zugang? <a href="#">Kanzlei-Admin kontaktieren</a>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Login />);
