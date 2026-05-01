/* ===================== LOGIN & SIGNUP PAGE ===================== */

const LoginPage = ({ go, onLogin, auth, logout }) => {
  const [mode, setMode]       = React.useState('login'); // 'login' or 'signup'
  const [form, setForm]       = React.useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState('');

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await nsApi.signup(form.email.trim(), form.password);
      }

      const data = await nsApi.login(form.email.trim(), form.password);
      nsApi.setToken(data.token);
      nsApi.setUser(data.user);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav go={go} auth={auth} logout={logout}/>
      <section className="wrap" style={{ padding: '80px 0 120px', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 460, padding: 40 }}>

          <div className="hand" style={{ fontSize: 28, color: 'var(--orange)', marginBottom: 4 }}>
            {mode === 'login' ? 'welcome back —' : 'start your journey —'}
          </div>
          <h1 className="display" style={{ fontSize: 36, margin: '0 0 28px', lineHeight: 1 }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>

          {error && (
            <div style={{ background: 'var(--orange-soft)', border: '2px solid var(--orange)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label className="label">Full Name</label>
                <input className="field" type="text" required autoFocus
                  value={form.name} onChange={upd('name')} placeholder="Your Name"/>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label className="label">Email</label>
              <input className="field" type="email" required autoFocus={mode === 'login'}
                value={form.email} onChange={upd('email')} placeholder="parent@example.com"/>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label className="label">Password</label>
              <input className="field" type="password" required
                value={form.password} onChange={upd('password')} placeholder="••••••••"/>
            </div>
            <button type="submit" className="btn btn--orange btn--lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in →' : 'Sign up →')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-soft)' }}>
            {mode === 'login' ? (
              <>
                No account?{' '}
                <a onClick={() => setMode('signup')} style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
                  Sign up instead →
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a onClick={() => setMode('login')} style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
                  Sign in instead →
                </a>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--ink-soft)' }}>
             Or explore{' '}
            <a onClick={() => go('pricing')} style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>
              Enrolled Tracks →
            </a>
          </div>
        </div>
      </section>
      <Footer go={go}/>
    </>
  );
};

Object.assign(window, { LoginPage });
