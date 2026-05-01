/* ===================== STUDENT DASHBOARD ===================== */

/* Emoji map by class index (fallback for API data) */
const CLASS_EMOJIS = ['♟️','🤖','🧠','💻','🎤','💡','🏆','🌍','🎮','🤖'];
const CLASS_COLORS = [
  'var(--mint-soft)','var(--yellow-soft)','var(--orange-soft)',
  'var(--yellow)','var(--paper)','var(--paper)','var(--paper)',
];

function classColor(status, idx) {
  if (status === 'live')     return 'var(--yellow)';
  if (status === 'done')     return CLASS_COLORS[idx % 3];
  return 'var(--paper)';
}

/* ── Spinner ── */
const DashSpinner = () => (
  <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-soft)', fontSize: 16 }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
    Loading…
  </div>
);

/* ── Error banner ── */
const ErrBanner = ({ msg }) => (
  <div style={{ background: 'var(--orange-soft)', border: '2px solid var(--orange)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, fontSize: 14 }}>
    ⚠ {msg}
  </div>
);

/* ════════════════════════════════════════
   DASHBOARD ROOT
════════════════════════════════════════ */
const Dashboard = ({ go, auth, logout }) => {
  const [view,        setView]        = React.useState('home');
  const [activeClass, setActiveClass] = React.useState(null);
  const [data,        setData]        = React.useState(null);
  const [loading,     setLoading]     = React.useState(true);
  const [err,         setErr]         = React.useState('');

  React.useEffect(() => {
    nsApi.dashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const student      = data?.student      || {};
  const batch        = data?.batch        || {};
  const classes      = data?.classes      || [];
  const xp           = data?.xp           || 0;
  const rank         = data?.rank         || '—';
  const totalStudents= data?.totalStudents|| '—';
  const subscription = data?.subscription || null;

  const studentName  = student.student_name || auth?.user?.name || 'Student';
  const batchName    = batch.name || 'B-01';
  const level        = student.level || 1;

  if (activeClass) return <ClassDetail cls={activeClass} back={() => setActiveClass(null)} go={go}/>;

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <a className="logo" onClick={() => go('home')} style={{ color: 'var(--cream)' }}>
          <span className="logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M4 6 L 4 20 L 20 20 L 20 6 L 12 10 Z" stroke="#0E1430" strokeWidth="2.5" strokeLinejoin="round" fill="#FFD23F"/>
            </svg>
          </span>
          <span>No <span className="logo-strike">Study</span></span>
        </a>
        <div style={{ marginTop: 24, padding: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Welcome back,</div>
          <div className="display" style={{ fontSize: 18, color: 'var(--yellow)' }}>{studentName} 👋</div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
            Level {level} · Explorer · Batch {batchName}
          </div>
        </div>
        <div className="dash-nav">
          <button className={view === 'home'        ? 'active' : ''} onClick={() => setView('home')}>🏠 Overview</button>
          <button className={view === 'classes'     ? 'active' : ''} onClick={() => setView('classes')}>📺 Classes</button>
          <button className={view === 'community'   ? 'active' : ''} onClick={() => setView('community')}>💬 Community</button>
          <button className={view === 'leaderboard' ? 'active' : ''} onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
          <button className={view === 'settings'    ? 'active' : ''} onClick={() => setView('settings')}>⚙️ Settings</button>
          <button onClick={() => go('home')} style={{ marginTop: 18, opacity: 0.6 }}>↗ Back to website</button>
          {logout && (
            <button onClick={logout} style={{ opacity: 0.6 }}>🚪 Logout</button>
          )}
        </div>
      </aside>

      <main className="dash-main">
        {err && <ErrBanner msg={err}/>}
        {loading && !err && <DashSpinner/>}
        {!loading && (
          <>
            {view === 'home'        && <DashHome classes={classes} xp={xp} rank={rank} totalStudents={totalStudents} onPickClass={setActiveClass} setView={setView}/>}
            {view === 'classes'     && <DashClasses classes={classes} onPickClass={setActiveClass}/>}
            {view === 'community'   && <DashCommunity/>}
            {view === 'leaderboard' && <DashLeaderboard myStudentId={student.id}/>}
            {view === 'settings'    && <DashSettings go={go} student={student} subscription={subscription} logout={logout}/>}
          </>
        )}
      </main>
    </div>
  );
};

/* ════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════ */
const DashHome = ({ classes, xp, rank, totalStudents, onPickClass, setView }) => {
  const done     = classes.filter(c => c.status === 'done').length;
  const total    = classes.length || 7;
  const liveClass= classes.find(c => c.status === 'live');
  const nextClass= liveClass || classes.find(c => c.status === 'upcoming');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="hand" style={{ fontSize: 28, color: 'var(--orange)' }}>Hey explorer —</div>
          <h1 className="display" style={{ fontSize: 40, margin: 0 }}>
            You're <span style={{ color: 'var(--orange)' }}>{done} {done === 1 ? 'class' : 'classes'}</span> deep this month.
          </h1>
          {nextClass && (
            <p style={{ color: 'var(--ink-soft)', marginTop: 6 }}>
              Next class · <strong>{nextClass.title}</strong> · {nextClass.date}
            </p>
          )}
        </div>
        {liveClass && (
          <a href={liveClass.zoom_link || '#'} target="_blank" rel="noopener noreferrer">
            <button className="btn btn--orange btn--lg">Join live class →</button>
          </a>
        )}
      </div>

      <div className="rg-2-1 dash-home-stats" style={{ marginBottom: 20 }}>
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Monthly progress</h3>
            <span className="chip chip--mint">{done} / {total} classes</span>
          </div>
          <div style={{ height: 14, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden', border: '2px solid var(--ink)' }}>
            <div style={{ width: `${total ? (done / total) * 100 : 0}%`, height: '100%', background: 'var(--orange)', transition: 'width .4s' }}/>
          </div>
          <div className="streak">
            {classes.slice(0, total).map((c, i) => (
              <div
                key={i}
                className={`day${c.status === 'done' ? ' done' : c.status === 'live' ? ' today' : ''}`}
                title={c.date}
              >{i + 1}</div>
            ))}
          </div>
        </div>

        <div className="dash-card" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          <div className="hand" style={{ fontSize: 22, color: 'var(--yellow)' }}>this month</div>
          <div className="display" style={{ fontSize: 44 }}>+{xp} <small style={{ fontSize: 14 }}>XP</small></div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
            Rank #{rank} of {totalStudents} students
          </div>
          <button className="btn btn--yellow" style={{ marginTop: 14 }} onClick={() => setView('leaderboard')}>
            See leaderboard →
          </button>
        </div>
      </div>

      <div className="dash-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="display" style={{ fontSize: 22, margin: 0 }}>This month's classes</h3>
          <a onClick={() => setView('classes')} style={{ cursor: 'pointer', color: 'var(--orange)', fontWeight: 600, fontSize: 14 }}>View all →</a>
        </div>
        {classes.slice(0, 5).map((c, i) => (
          <ClassRow key={c.id} c={c} i={i} onClick={() => onPickClass(c)}/>
        ))}
        {classes.length === 0 && (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No classes scheduled yet.</p>
        )}
      </div>

      <div className="rg-2 dash-home-community">
        <div className="dash-card" style={{ background: 'var(--yellow)' }}>
          <div className="hand" style={{ fontSize: 22 }}>community</div>
          <h3 className="display" style={{ fontSize: 24, margin: '4px 0 8px' }}>Join Discord</h3>
          <p style={{ fontSize: 14, margin: '0 0 14px' }}>248 fellow explorers building chatbots, chess strategies, and tiny robots together.</p>
          <button className="btn">Open Discord invite →</button>
        </div>
        <div className="dash-card" style={{ background: 'var(--mint-soft)' }}>
          <div className="hand" style={{ fontSize: 22 }}>upcoming</div>
          <h3 className="display" style={{ fontSize: 24, margin: '4px 0 8px' }}>Monthly Tournament</h3>
          <p style={{ fontSize: 14, margin: '0 0 14px' }}>Chess Mastery — Apr 30 · 6:00 PM. Top 3 win badges and certificates.</p>
          <button className="btn">Register →</button>
        </div>
      </div>
    </>
  );
};

/* ── Shared class row ── */
const ClassRow = ({ c, i, onClick }) => (
  <div className="class-row" onClick={onClick} style={{ background: classColor(c.status, i) }}>
    <div className="class-thumb" style={{ background: 'var(--paper)' }}>
      {CLASS_EMOJIS[i % CLASS_EMOJIS.length]}
    </div>
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Class {c.class_num || String(i+1).padStart(2,'0')} · {c.date}</div>
      <div className="display" style={{ fontSize: 16 }}>{c.title}</div>
    </div>
    <div>
      {c.status === 'done'     && <span className="status-pill s-active">✓ Completed</span>}
      {c.status === 'live'     && <span className="status-pill" style={{ background: 'var(--orange)', color: 'white' }}>● LIVE TODAY</span>}
      {c.status === 'upcoming' && <span className="status-pill s-pending">Upcoming</span>}
    </div>
    <div style={{ fontSize: 18, color: 'var(--ink-soft)' }}>→</div>
  </div>
);

/* ════════════════════════════════════════
   ALL CLASSES
════════════════════════════════════════ */
const DashClasses = ({ classes, onPickClass }) => (
  <>
    <h1 className="display" style={{ fontSize: 36, margin: '0 0 8px' }}>All classes</h1>
    <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>April 2026 · Level 1 Explorer</p>
    {classes.map((c, i) => <ClassRow key={c.id} c={c} i={i} onClick={() => onPickClass(c)}/>)}
    {classes.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No classes yet.</p>}
  </>
);

/* ════════════════════════════════════════
   CLASS DETAIL
════════════════════════════════════════ */
const ClassDetail = ({ cls, back, go }) => {
  const [tab, setTab] = React.useState('link');
  const i = 0;

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <a className="logo" onClick={() => go('home')} style={{ color: 'var(--cream)' }}>
          <span className="logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M4 6 L 4 20 L 20 20 L 20 6 L 12 10 Z" stroke="#0E1430" strokeWidth="2.5" strokeLinejoin="round" fill="#FFD23F"/>
            </svg>
          </span>
          <span>No <span className="logo-strike">Study</span></span>
        </a>
        <div className="dash-nav"><button onClick={back}>← All classes</button></div>
      </aside>

      <main className="dash-main">
        <a onClick={back} style={{ color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 14 }}>← Back to classes</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '12px 0 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: 18, border: '2px solid var(--ink)', background: classColor(cls.status, i), display: 'grid', placeItems: 'center', fontSize: 38 }}>
            {CLASS_EMOJIS[i]}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Class {cls.class_num} · {cls.date} · 7:00 PM BDT · 2 hrs</div>
            <h1 className="display" style={{ fontSize: 32, margin: '4px 0' }}>{cls.title}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              {cls.status === 'live'     && <span className="status-pill" style={{ background: 'var(--orange)', color: 'white' }}>● LIVE NOW</span>}
              {cls.status === 'done'     && <span className="status-pill s-active">✓ Completed</span>}
              {cls.status === 'upcoming' && <span className="status-pill s-pending">Upcoming</span>}
              <span className="chip">25 / 25 students</span>
            </div>
          </div>
        </div>

        <div className="class-detail-grid">
          <div>
            <div className="tab-row">
              {[['link','🔗 Class Link'],['rec','📺 Recordings'],['notes','📝 Notes'],['homework','🎯 Challenge']].map(([k,l]) => (
                <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            {tab === 'link' && (
              <div className="dash-card">
                <div className="video-box" style={{ marginBottom: 18 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🎥</div>
                    <div className="display" style={{ fontSize: 22 }}>
                      {cls.zoom_link ? 'Class link ready' : 'Link not yet posted'}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                      {cls.zoom_link ? 'Click Join now to enter' : 'Available 15 min before class'}
                    </div>
                  </div>
                </div>
                {cls.zoom_link && (
                  <div className="card-flat" style={{ padding: 18, background: 'var(--cream-2)' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Zoom Link</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, wordBreak: 'break-all' }}>{cls.zoom_link}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <a href={cls.zoom_link} target="_blank" rel="noopener noreferrer">
                        <button className="btn btn--orange">Join now →</button>
                      </a>
                      <button className="btn btn--ghost" onClick={() => navigator.clipboard?.writeText(cls.zoom_link)}>Copy link</button>
                    </div>
                    {cls.zoom_password && (
                      <div style={{ marginTop: 14, padding: 12, background: 'var(--yellow-soft)', borderRadius: 10, border: '2px solid var(--ink)', fontSize: 14 }}>
                        <strong>Passcode:</strong> {cls.zoom_password}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'rec' && (
              <div className="dash-card">
                <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Recorded sessions</h3>
                {cls.status !== 'upcoming' ? [
                  { e: '🎬', n: 'Full class recording.mp4', s: '1h 58m · 412 MB' },
                  { e: '✂️', n: 'Highlights only.mp4',       s: '12 min · 86 MB'  },
                  { e: '🎯', n: 'Q&A segment.mp4',           s: '18 min · 124 MB' },
                ].map((r, i) => (
                  <div className="rec-item" key={i}>
                    <div className="file-ico" style={{ background: 'var(--orange-soft)' }}>{r.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.n}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{r.s}</div>
                    </div>
                    <button className="btn btn--ghost">Watch ▶</button>
                  </div>
                )) : <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Recordings appear after the class.</p>}
              </div>
            )}

            {tab === 'notes' && (
              <div className="dash-card">
                <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Class notes & resources</h3>
                {[
                  { e: '📄', n: 'Class slides.pdf',          s: 'PDF · 2.4 MB'    },
                  { e: '📘', n: 'Reference guide.pdf',        s: 'PDF · 1.1 MB'    },
                  { e: '💻', n: 'Starter code.zip',           s: 'ZIP · 240 KB'    },
                  { e: '🔗', n: 'External resources & links', s: '12 curated links'},
                ].map((r, i) => (
                  <div className="note-item" key={i}>
                    <div className="file-ico" style={{ background: 'var(--mint-soft)' }}>{r.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.n}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{r.s}</div>
                    </div>
                    <button className="btn btn--ghost">Download ↓</button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'homework' && (
              <div className="dash-card" style={{ background: 'var(--yellow-soft)' }}>
                <div className="hand" style={{ fontSize: 24, color: 'var(--orange)' }}>this week's challenge</div>
                <h3 className="display" style={{ fontSize: 26, margin: '4px 0 10px' }}>Build a 3-screen Scratch game</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6 }}>
                  Take what you learned today and build a game with: a title screen, a game screen, and a win screen.
                  Use at least 2 sprites and 1 sound. Submit before next class for +50 XP.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="btn btn--orange">Submit project →</button>
                  <button className="btn btn--ghost">See examples</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="dash-card" style={{ marginBottom: 14 }}>
              <h4 className="display" style={{ fontSize: 18, margin: '0 0 10px' }}>Mentor</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--ink)', background: 'var(--orange)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>S</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Sadia Rahman</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Coding Mentor · 8 yrs</div>
                </div>
              </div>
              <button className="btn btn--ghost" style={{ marginTop: 12, width: '100%' }}>Send a message</button>
            </div>

            <div className="dash-card" style={{ marginBottom: 14 }}>
              <h4 className="display" style={{ fontSize: 18, margin: '0 0 12px' }}>What you'll learn</h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {['Sprite movement & events','Variables & score tracking','Game-over conditions','Sound effects & polish'].map(x => (
                  <li key={x} style={{ padding: '6px 0', display: 'flex', gap: 8, fontSize: 14, borderBottom: '1px dashed rgba(14,20,48,0.15)' }}>
                    <span style={{ color: 'var(--mint)' }}>✓</span>{x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dash-card" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
              <div className="hand" style={{ fontSize: 22, color: 'var(--yellow)' }}>complete to earn</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 6 }}>
                <div style={{ fontSize: 38 }}>🏅</div>
                <div>
                  <div className="display" style={{ fontSize: 20 }}>+50 XP</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Code Wizard badge progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ════════════════════════════════════════
   COMMUNITY
════════════════════════════════════════ */
const DashCommunity = () => (
  <>
    <h1 className="display" style={{ fontSize: 36, margin: '0 0 8px' }}>Community</h1>
    <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>Hang out with fellow explorers</p>
    <div className="rg-2">
      <div className="dash-card" style={{ background: 'var(--yellow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, background: '#5865F2', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>D</div>
          <div>
            <div className="display" style={{ fontSize: 20 }}>Discord Server</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>248 members online</div>
          </div>
        </div>
        <p style={{ fontSize: 14 }}>Daily chat, project showcases, mentor office hours, monthly tournaments.</p>
        <button className="btn btn--orange">Join server →</button>
      </div>
      <div className="dash-card" style={{ background: 'var(--mint-soft)' }}>
        <div className="display" style={{ fontSize: 20, marginBottom: 6 }}>Project Showcase</div>
        <p style={{ fontSize: 14 }}>Share what you built. Get votes, feedback, and badges from peers + mentors.</p>
        <button className="btn">Open showcase →</button>
      </div>
    </div>
    <div className="dash-card" style={{ marginTop: 20 }}>
      <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>This week's posts</h3>
      {[
        { who: 'Zayan, 12', t: 'Built my first chess bot 🤖♟️',       k: '🎯 Challenge', c: 'var(--orange-soft)' },
        { who: 'Tanha, 10', t: 'Made a robot that follows my cat',     k: '🤖 Robotics',  c: 'var(--yellow-soft)' },
        { who: 'Aarav, 11', t: 'Help — my Scratch sprite won\'t jump?',k: '❓ Help',      c: 'var(--mint-soft)'   },
      ].map((p, i) => (
        <div key={i} style={{ padding: 14, marginBottom: 10, border: '2px solid var(--ink)', borderRadius: 14, background: p.c, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.who} · 2h ago</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{p.t}</div>
          </div>
          <span className="chip">{p.k}</span>
        </div>
      ))}
    </div>
  </>
);

/* ════════════════════════════════════════
   LEADERBOARD (live data)
════════════════════════════════════════ */
const DashLeaderboard = ({ myStudentId }) => {
  const [board,   setBoard]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err,     setErr]     = React.useState('');

  React.useEffect(() => {
    nsApi.leaderboard()
      .then(d => { setBoard(d.board || []); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const medals = ['🥇','🥈','🥉'];

  return (
    <>
      <h1 className="display" style={{ fontSize: 36, margin: '0 0 8px' }}>Leaderboard</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>April 2026 · Top explorers ranked by XP</p>
      {err && <ErrBanner msg={err}/>}
      {loading && <DashSpinner/>}
      {!loading && (
        <div className="dash-card">
          {board.map((s, i) => {
            const isMe = s.id === myStudentId;
            return (
              <div key={s.id} className="lb-row" style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto auto', alignItems: 'center', padding: 14, marginBottom: 8, border: '2px solid var(--ink)', borderRadius: 14, background: isMe ? 'var(--yellow)' : 'var(--paper)' }}>
                <div className="display" style={{ fontSize: 24 }}>#{i+1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--orange)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, border: '2px solid var(--ink)', fontSize: 14 }}>
                    {s.student_name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.student_name}{isMe ? ' (you)' : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.batch} · L{s.level}</div>
                  </div>
                </div>
                <div className="display" style={{ fontSize: 22, paddingRight: 14 }}>{s.xp} XP</div>
                <div style={{ fontSize: 22 }}>{medals[i] || '🎯'}</div>
              </div>
            );
          })}
          {board.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No data yet.</p>}
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   SETTINGS
════════════════════════════════════════ */
const DashSettings = ({ go, student, subscription, logout }) => (
  <>
    <h1 className="display" style={{ fontSize: 36, margin: '0 0 8px' }}>Settings</h1>
    <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>Manage your subscription and profile.</p>

    {subscription && (
      <div className="dash-card" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Subscription</h3>
        <div className="rg-3" style={{ gap: 14 }}>
          <div className="card-flat" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Plan</div>
            <div className="display" style={{ fontSize: 22 }}>{subscription.plan_months}-month · ৳{subscription.price?.toLocaleString()}</div>
          </div>
          <div className="card-flat" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Expires</div>
            <div className="display" style={{ fontSize: 22 }}>{subscription.end_date}</div>
          </div>
          <div className="card-flat" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Status</div>
            <div className="display" style={{ fontSize: 22, color: subscription.status === 'active' ? 'var(--mint)' : 'var(--orange)' }}>
              ● {subscription.status}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn--orange" onClick={() => go('pricing')}>Upgrade plan</button>
          <button className="btn btn--ghost">Cancel subscription</button>
        </div>
      </div>
    )}

    <div className="dash-card" style={{ marginBottom: 18 }}>
      <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Profile</h3>
      <div className="rg-2" style={{ gap: 14 }}>
        <div><label className="label">Student name</label><input className="field" defaultValue={student.student_name || ''}/></div>
        <div><label className="label">Age</label><input className="field" defaultValue={student.age || ''}/></div>
        <div><label className="label">Parent name</label><input className="field" defaultValue={student.parent_name || ''}/></div>
        <div><label className="label">Phone</label><input className="field" defaultValue={student.phone || ''}/></div>
      </div>
      <button className="btn btn--orange" style={{ marginTop: 18 }}>Save changes</button>
    </div>

    {logout && (
      <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
        🚪 Sign out
      </button>
    )}
  </>
);

Object.assign(window, { Dashboard });
