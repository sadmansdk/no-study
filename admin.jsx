/* ===================== ADMIN PANEL ===================== */

const Spinner = () => (
  <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-soft)' }}>
    <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>Loading…
  </div>
);
const ErrBox = ({ msg }) => (
  <div style={{ background: 'var(--orange-soft)', border: '2px solid var(--orange)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
    ⚠ {msg}
  </div>
);

/* ════════════════════════════════════════
   ADMIN ROOT
════════════════════════════════════════ */
const Admin = ({ go, auth, logout }) => {
  const [view, setView] = React.useState('overview');

  const sections = [
    ['overview', '📊 Overview'],
    ['users',    '👤 Users'],
    ['subs',     '💳 Subscriptions'],
    ['payments', '🧾 Pending Payments'],
    ['courses',  '📚 Courses'],
    ['materials','📁 Class Materials'],
    ['batches',      '🎓 Batches'],
    ['instructors',  '👩‍🏫 Instructors'],
    ['reviews',      '⭐ Reviews'],
    ['settings',     '⚙️ Settings'],
  ];

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a className="logo" onClick={() => go('home')} style={{ color: 'var(--cream)' }}>
            <span className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M4 6 L 4 20 L 20 20 L 20 6 L 12 10 Z" stroke="#0E1430" strokeWidth="2.5" strokeLinejoin="round" fill="#FFD23F"/>
              </svg>
            </span>
            <span>No <span className="logo-strike">Study</span></span>
          </a>
          <span className="chip" style={{ background: 'var(--orange)', color: 'white', borderColor: 'var(--orange)' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--cream)', opacity: 0.8 }}>{auth?.user?.name || 'Admin'}</span>
          <button className="btn btn--ghost" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', borderColor: 'rgba(255,255,255,0.3)', boxShadow: 'none', padding: '8px 14px', fontSize: 13 }} onClick={() => go('home')}>Exit ↗</button>
          {logout && <button className="btn btn--ghost" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', borderColor: 'rgba(255,255,255,0.3)', boxShadow: 'none', padding: '8px 14px', fontSize: 13 }} onClick={logout}>Logout</button>}
        </div>
      </div>

      <div className="admin-grid">
        <aside className="admin-side">
          <div className="dash-nav" style={{ marginTop: 0 }}>
            {sections.map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} className={view === k ? 'active' : ''}
                style={{ display: 'block', width: '100%', padding: '12px 14px', margin: '2px 0', border: 0, background: view === k ? 'var(--orange)' : 'transparent', color: view === k ? 'white' : 'var(--ink)', textAlign: 'left', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500 }}
              >{l}</button>
            ))}
          </div>
        </aside>

        <main className="admin-main">
          {view === 'overview'  && <AdminOverview/>}
          {view === 'users'     && <AdminUsers/>}
          {view === 'subs'      && <AdminSubs/>}
          {view === 'payments'  && <AdminPayments/>}
          {view === 'courses'   && <AdminCourses/>}
          {view === 'materials' && <AdminMaterials/>}
          {view === 'batches'      && <AdminBatches/>}
          {view === 'instructors'  && <AdminInstructors/>}
          {view === 'reviews'      && <AdminReviews/>}
          {view === 'settings'     && <AdminSettingsView/>}
        </main>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   OVERVIEW (live stats)
════════════════════════════════════════ */
const AdminOverview = () => {
  const [stats,    setStats]    = React.useState(null);
  const [activity, setActivity] = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [err,      setErr]      = React.useState('');

  React.useEffect(() => {
    Promise.all([nsApi.admin.stats(), nsApi.admin.activity()])
      .then(([s, a]) => { setStats(s); setActivity(a); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  if (loading) return <Spinner/>;

  const s = stats || { activeStudents: '—', pendingPayments: '—', activeBatches: '—', revenue: 0 };
  const statCards = [
    { l: 'Active students',   v: s.activeStudents,  d: 'enrolled',       c: 'var(--paper)'       },
    { l: 'Monthly revenue',   v: '৳' + (s.revenue/1000).toFixed(0) + 'K', d: 'approved payments', c: 'var(--yellow-soft)' },
    { l: 'Pending payments',  v: s.pendingPayments, d: 'need review',    c: 'var(--orange-soft)' },
    { l: 'Active batches',    v: s.activeBatches,   d: 'running now',    c: 'var(--mint-soft)'   },
  ];

  const chart = s.chart?.length ? s.chart : [
    {month:'Nov',v:120},{month:'Dec',v:145},{month:'Jan',v:168},{month:'Feb',v:198},{month:'Mar',v:230},{month:'Apr',v:248},
  ];
  const maxV = Math.max(...chart.map(b => b.v), 1);

  const planMix = s.planMix?.length ? s.planMix : [
    {plan_months:1,n:28},{plan_months:3,n:78},{plan_months:6,n:92},{plan_months:12,n:50},
  ];
  const planTotal = planMix.reduce((a, p) => a + p.n, 0) || 1;
  const planColors = { 1:'var(--cream-2)', 3:'var(--yellow)', 6:'var(--orange)', 12:'var(--mint)' };

  return (
    <>
      <h1 className="display" style={{ fontSize: 32, margin: '0 0 6px' }}>Overview</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>April 2026 · live snapshot</p>
      {err && <ErrBox msg={err}/>}

      <div className="admin-stats">
        {statCards.map(sc => (
          <div className="admin-stat" key={sc.l} style={{ background: sc.c }}>
            <div className="l">{sc.l}</div>
            <div className="v">{sc.v}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{sc.d}</div>
          </div>
        ))}
      </div>

      <div className="rg-2-1" style={{ marginBottom: 20 }}>
        <div className="dash-card">
          <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Enrollments — last 6 months</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, paddingTop: 20 }}>
            {chart.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)' }}>{b.v}</div>
                <div style={{ width: '100%', height: `${(b.v / maxV) * 100}%`, background: i === chart.length - 1 ? 'var(--orange)' : 'var(--ink)', borderRadius: '8px 8px 0 0', border: '2px solid var(--ink)', borderBottom: 0 }}/>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{b.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-card">
          <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Plan mix</h3>
          {planMix.map(p => (
            <div key={p.plan_months} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <strong>{p.plan_months}-month</strong><span>{p.n} students</span>
              </div>
              <div style={{ height: 12, background: 'var(--cream)', borderRadius: 999, border: '2px solid var(--ink)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.n / planTotal) * 100}%`, background: planColors[p.plan_months] || 'var(--orange)' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3 className="display" style={{ fontSize: 22, margin: '0 0 14px' }}>Recent activity</h3>
        {activity.length === 0 && <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No activity yet.</p>}
        {activity.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px dashed rgba(14,20,48,0.15)', fontSize: 14 }}>
            <div style={{ fontSize: 20 }}>💳</div>
            <div style={{ flex: 1 }}>
              Payment {a.status} — {a.who} · ৳{a.amount?.toLocaleString()} · {a.ref_id}
            </div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 12, whiteSpace: 'nowrap' }}>
              {new Date(a.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ════════════════════════════════════════
   USERS (live data)
════════════════════════════════════════ */
const AdminUsers = () => {
  const [users,   setUsers]   = React.useState([]);
  const [q,       setQ]       = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [err,     setErr]     = React.useState('');

  const load = (query) => {
    setLoading(true);
    nsApi.admin.users(query)
      .then(d => { setUsers(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  };

  React.useEffect(() => { load(''); }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0 }}>Users</h1>
          <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{users.length} students</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="field" placeholder="🔍 Search…" value={q}
            style={{ width: 220, minWidth: 160 }}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(q)}/>
          <button className="btn btn--orange" onClick={() => load(q)}>Search</button>
        </div>
      </div>
      {err && <ErrBox msg={err}/>}
      {loading ? <Spinner/> : (
        <table className="tbl">
          <thead><tr><th>Student</th><th>Parent</th><th>Plan</th><th>Batch</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td><strong>{u.student_name || '—'}, {u.age}</strong></td>
                <td>{u.parent_name}<br/><span style={{ fontSize: 11, opacity: 0.6 }}>{u.email}</span></td>
                <td>{u.plan_months ? `${u.plan_months}-month` : '—'}</td>
                <td><span className="chip" style={{ fontSize: 11, padding: '3px 8px' }}>{u.batch || '—'}</span></td>
                <td style={{ fontSize: 13 }}>{u.end_date || '—'}</td>
                <td>
                  <span className={`status-pill ${u.sub_status === 'active' ? 's-active' : u.sub_status === 'paused' ? 's-pending' : 's-expired'}`}>
                    {u.sub_status || 'no sub'}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students found.</td></tr>}
          </tbody>
        </table>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   SUBSCRIPTIONS
════════════════════════════════════════ */
const AdminSubs = () => {
  const [studentId, setStudentId] = React.useState('');
  const [action,    setAction]    = React.useState('extend');
  const [days,      setDays]      = React.useState(30);
  const [msg,       setMsg]       = React.useState('');
  const [users,     setUsers]     = React.useState([]);

  React.useEffect(() => {
    nsApi.admin.users().then(setUsers).catch(() => {});
  }, []);

  const apply = async () => {
    const u = users.find(x => x.student_name?.toLowerCase().includes(studentId.toLowerCase()));
    if (!u?.sub_id) { setMsg('Student or subscription not found'); return; }
    try {
      await nsApi.admin.updateSub(u.sub_id, action, days);
      setMsg(`✓ ${action} applied to ${u.student_name}`);
    } catch (e) {
      setMsg('Error: ' + e.message);
    }
  };

  const expiring = users.filter(u => {
    if (!u.end_date) return false;
    const days = Math.ceil((new Date(u.end_date) - Date.now()) / 86400000);
    return days >= 0 && days <= 30;
  });

  return (
    <>
      <h1 className="display" style={{ fontSize: 32, margin: '0 0 6px' }}>Subscriptions</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Extend access, refund, or pause individual student subscriptions.</p>
      <div className="dash-card" style={{ marginBottom: 18 }}>
        <h3 className="display" style={{ fontSize: 20, margin: '0 0 14px' }}>Quick controls</h3>
        {msg && <div style={{ padding: '10px 14px', borderRadius: 10, background: msg.startsWith('✓') ? 'var(--mint-soft)' : 'var(--orange-soft)', marginBottom: 14, fontSize: 14 }}>{msg}</div>}
        <div className="rg-sub-ctrl">
          <div>
            <label className="label">Find student</label>
            <input className="field" placeholder="Student name…" value={studentId} onChange={e => setStudentId(e.target.value)}/>
          </div>
          <div>
            <label className="label">Action</label>
            <select className="field" value={action} onChange={e => setAction(e.target.value)}>
              <option value="extend">Extend access</option>
              <option value="pause">Pause</option>
              <option value="refund">Refund</option>
              <option value="cancel">Cancel</option>
            </select>
          </div>
          <div>
            <label className="label">Days (extend)</label>
            <select className="field" value={days} onChange={e => setDays(Number(e.target.value))}>
              <option value={30}>+30 days</option>
              <option value={90}>+90 days</option>
              <option value={365}>+1 year</option>
            </select>
          </div>
          <button className="btn btn--orange" onClick={apply}>Apply</button>
        </div>
      </div>

      <div className="dash-card">
        <h3 className="display" style={{ fontSize: 20, margin: '0 0 14px' }}>Expiring within 30 days</h3>
        {expiring.length === 0
          ? <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No subscriptions expiring soon.</p>
          : (
          <table className="tbl">
            <thead><tr><th>Student</th><th>Plan</th><th>Expires</th><th>Days left</th><th></th></tr></thead>
            <tbody>
              {expiring.map((u, i) => {
                const d = Math.ceil((new Date(u.end_date) - Date.now()) / 86400000);
                return (
                  <tr key={i}>
                    <td><strong>{u.student_name}</strong></td>
                    <td>{u.plan_months}-month</td>
                    <td>{u.end_date}</td>
                    <td><span className="status-pill s-pending">{d}d</span></td>
                    <td><button className="btn btn--orange" style={{ padding: '6px 12px', fontSize: 12 }}>Send renewal nudge</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

/* ════════════════════════════════════════
   PENDING PAYMENTS (live — approve/reject)
════════════════════════════════════════ */
const AdminPayments = () => {
  const [payments, setPayments] = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [err,      setErr]      = React.useState('');
  const [toast,    setToast]    = React.useState('');

  React.useEffect(() => {
    nsApi.admin.payments()
      .then(d => { setPayments(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const approve = async (id) => {
    try {
      const res = await nsApi.admin.approvePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      showToast(`✓ Approved! Login: ${res.email} / ${res.tempPassword}`);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await nsApi.admin.rejectPayment(id, reason);
      setPayments(prev => prev.filter(p => p.id !== id));
      showToast('Payment rejected.');
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  return (
    <>
      <h1 className="display" style={{ fontSize: 32, margin: '0 0 6px' }}>Pending bKash payments</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
        Verify trxn IDs on bKash and approve to create student accounts. {payments.length > 0 ? `${payments.length} awaiting.` : ''}
      </p>
      {err && <ErrBox msg={err}/>}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.startsWith('✓') ? 'var(--mint)' : 'var(--orange)', color: 'var(--ink)', padding: '14px 20px', borderRadius: 14, border: '2px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)', maxWidth: 420, fontSize: 14, fontWeight: 600 }}>
          {toast}
        </div>
      )}
      {loading ? <Spinner/> : payments.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div className="display" style={{ fontSize: 24 }}>All clear!</div>
          <p style={{ color: 'var(--ink-soft)' }}>No pending payments to verify.</p>
        </div>
      ) : payments.map(p => (
        <div key={p.id} className="dash-card rg-pay-card" style={{ marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Parent / Student</div>
            <div style={{ fontWeight: 700 }}>{p.parent_name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.student_name}, age {p.age}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>bKash details</div>
            <div className="mono" style={{ fontSize: 14 }}>{p.sender_num}</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Trxn: {p.trxn_id}</div>
            <div style={{ fontSize: 12 }}>Ref: <strong>{p.ref_id}</strong></div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.plan_months}-month · {new Date(p.created_at).toLocaleDateString()}</div>
            <div className="display" style={{ fontSize: 28 }}>৳{p.amount?.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn--orange" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => approve(p.id)}>✓ Approve</button>
            <button className="btn btn--ghost"  style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => reject(p.id)}>✕ Reject</button>
          </div>
        </div>
      ))}
    </>
  );
};

/* ════════════════════════════════════════
   COURSES (full CRUD)
════════════════════════════════════════ */
const AdminCourses = () => {
  const [courses,  setCourses]  = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [err,      setErr]      = React.useState('');
  const [editing,  setEditing]  = React.useState(null); // null | 'new' | course object
  const [form,     setForm]     = React.useState({ emoji: '📚', name: '', level: 'L1,L2,L3', description: '' });
  const [saving,   setSaving]   = React.useState(false);
  const [toast,    setToast]    = React.useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  React.useEffect(() => {
    nsApi.admin.courses()
      .then(d => { setCourses(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const openNew = () => {
    setForm({ emoji: '📚', name: '', level: 'L1,L2,L3', description: '' });
    setEditing('new');
  };
  const openEdit = (c) => {
    setForm({ emoji: c.emoji || '📚', name: c.name, level: c.level || 'L1,L2,L3', description: c.description || '' });
    setEditing(c);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const r = await nsApi.admin.createCourse(form);
        setCourses(prev => [...prev, { ...form, id: r.id, class_count: 0 }]);
        showToast('✓ Course created');
      } else {
        await nsApi.admin.updateCourse(editing.id, form);
        setCourses(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
        showToast('✓ Course updated');
      }
      setEditing(null);
    } catch (e) { showToast('Error: ' + e.message); }
    setSaving(false);
  };

  const removeCourse = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      await nsApi.admin.deleteCourse(c.id);
      setCourses(prev => prev.filter(x => x.id !== c.id));
      showToast('Deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const LEVELS = ['L1,L2,L3','L1','L2','L3','L1,L2','L2,L3'];

  return (
    <>
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background: toast.startsWith('✓') ? 'var(--mint)' : 'var(--orange)', color:'var(--ink)', padding:'12px 20px', borderRadius:14, border:'2px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', fontSize:14, fontWeight:600 }}>{toast}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="display" style={{ fontSize:32, margin:0 }}>Courses</h1>
          <p style={{ color:'var(--ink-soft)', margin:0 }}>{courses.length} tracks</p>
        </div>
        <button className="btn btn--orange" onClick={openNew}>+ New course</button>
      </div>
      {err && <ErrBox msg={err}/>}

      {editing && (
        <div className="dash-card" style={{ marginBottom:20, border:'2px solid var(--orange)' }}>
          <h3 className="display" style={{ fontSize:20, margin:'0 0 16px' }}>{editing === 'new' ? 'New course' : 'Edit: ' + editing.name}</h3>
          <div className="rg-3" style={{ gap: 12, marginBottom: 12 }}>
            <div><label className="label">Emoji</label><input className="field" value={form.emoji} onChange={upd('emoji')}/></div>
            <div><label className="label">Name *</label><input className="field" value={form.name} onChange={upd('name')} placeholder="Chess Mastery"/></div>
            <div>
              <label className="label">Level</label>
              <select className="field" value={form.level} onChange={upd('level')}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="label">Description</label>
            <input className="field" value={form.description} onChange={upd('description')} placeholder="Short description shown on landing page…"/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn--orange" onClick={save} disabled={saving || !form.name.trim()}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <Spinner/> : (
        <div className="rg-2" style={{ gap: 16 }}>
          {courses.map(c => (
            <div className="dash-card" key={c.id} style={{ display:'grid', gridTemplateColumns:'56px 1fr auto', gap:14, alignItems:'center', background: editing?.id === c.id ? 'var(--yellow-soft)' : 'var(--paper)' }}>
              <div style={{ fontSize:34 }}>{c.emoji}</div>
              <div>
                <div className="display" style={{ fontSize:17 }}>{c.name}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{c.level} · {c.class_count || 0} classes</div>
                {c.description && <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>{c.description}</div>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn--ghost" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => openEdit(c)}>Edit</button>
                <button onClick={() => removeCourse(c)} style={{ background:'none', border:'1.5px solid var(--orange)', color:'var(--orange)', borderRadius:8, cursor:'pointer', padding:'6px 10px', fontSize:12 }}>🗑</button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p style={{ color:'var(--ink-soft)', gridColumn:'1/-1' }}>No courses yet.</p>}
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   CLASS MATERIALS — full management
════════════════════════════════════════ */
const AdminMaterials = () => {
  const [batches,    setBatches]    = React.useState([]);
  const [batchId,    setBatchId]    = React.useState('');
  const [classes,    setClasses]    = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);
  const [selected,   setSelected]   = React.useState(null);
  const [tab,        setTab]        = React.useState('info');
  const [materials,  setMaterials]  = React.useState([]);
  const [loadingMat, setLoadingMat] = React.useState(false);
  const [err,        setErr]        = React.useState('');
  const [toast,      setToast]      = React.useState('');

  // new-class form
  const [showNew,  setShowNew]  = React.useState(false);
  const [newCls,   setNewCls]   = React.useState({ class_num:'', title:'', date:'' });

  // edit class info
  const [editInfo, setEditInfo] = React.useState({});

  // zoom form
  const [zoomForm, setZoomForm] = React.useState({ link:'', password:'' });

  // notes / challenge
  const [content, setContent] = React.useState({ notes:'', challenge:'' });

  // add material
  const [newMat, setNewMat] = React.useState({ type:'notes', name:'', url:'', size:'' });

  const showToast = m => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const updNew  = k => e => setNewCls(f => ({ ...f, [k]: e.target.value }));
  const updMat  = k => e => setNewMat(f => ({ ...f, [k]: e.target.value }));

  const MAT_TYPES = ['notes','slides','recording','code','link','homework'];
  const MAT_ICONS = { notes:'📝', slides:'📊', recording:'🎬', code:'💻', link:'🔗', homework:'🎯' };

  React.useEffect(() => {
    nsApi.admin.batches().then(bs => {
      setBatches(bs);
      if (bs.length) { setBatchId(String(bs[0].id)); loadClasses(bs[0].id); }
      else setLoading(false);
    }).catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const loadClasses = bid => {
    setLoading(true); setSelected(null);
    nsApi.admin.materials(bid)
      .then(d => { setClasses(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  };

  const selectClass = cls => {
    setSelected(cls);
    setTab('info');
    setEditInfo({ class_num: cls.class_num||'', title: cls.title||'', date: cls.date||'' });
    setZoomForm({ link: cls.zoom_link||'', password: cls.zoom_password||'' });
    setContent({ notes: cls.notes||'', challenge: cls.challenge||'' });
    setLoadingMat(true);
    nsApi.admin.classMaterials(cls.id)
      .then(d => { setMaterials(d); setLoadingMat(false); })
      .catch(e => { showToast('Error: ' + e.message); setLoadingMat(false); });
  };

  const patchClass = async (data, successMsg) => {
    try {
      await nsApi.admin.updateClass(selected.id, data);
      const updated = { ...selected, ...data };
      setSelected(updated);
      setClasses(prev => prev.map(c => c.id === selected.id ? { ...c, ...data } : c));
      showToast(successMsg || '✓ Saved');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const createClass = async () => {
    if (!newCls.title.trim()) return;
    try {
      const r = await nsApi.admin.createClass({ ...newCls, batch_id: batchId });
      const created = { ...newCls, id: r.id, batch_id: Number(batchId), status:'upcoming', material_count:0, zoom_link:'', zoom_password:'', notes:'', challenge:'' };
      setClasses(prev => [...prev, created]);
      setNewCls({ class_num:'', title:'', date:'' });
      setShowNew(false);
      showToast('✓ Class created');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const changeStatus = async (cls, status) => {
    try {
      await nsApi.admin.updateClass(cls.id, { status });
      setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, status } : c));
      if (selected?.id === cls.id) setSelected(prev => ({ ...prev, status }));
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const addMaterial = async () => {
    if (!newMat.name.trim()) return;
    try {
      const r = await nsApi.admin.addMaterial(selected.id, newMat);
      setMaterials(prev => [...prev, { ...newMat, id: r.id }]);
      setClasses(prev => prev.map(c => c.id === selected.id ? { ...c, material_count: (c.material_count||0)+1 } : c));
      setNewMat({ type:'notes', name:'', url:'', size:'' });
      showToast('✓ Material added');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const deleteClass = async cls => {
    if (!window.confirm(`Delete class "${cls.title}"? All materials will be removed.`)) return;
    try {
      await nsApi.admin.deleteClass(cls.id);
      setClasses(prev => prev.filter(c => c.id !== cls.id));
      if (selected?.id === cls.id) setSelected(null);
      showToast('Class deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const deleteMat = async id => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await nsApi.admin.deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
      setClasses(prev => prev.map(c => c.id === selected.id ? { ...c, material_count: Math.max(0,(c.material_count||1)-1) } : c));
      showToast('Deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)} style={{ padding:'8px 16px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', border:'none', borderBottom: tab===key ? '3px solid var(--orange)' : '3px solid transparent', background:'transparent', color: tab===key ? 'var(--orange)' : 'var(--ink-soft)' }}>{label}</button>
  );

  return (
    <>
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background: toast.startsWith('✓')||toast==='Deleted' ? 'var(--mint)' : 'var(--orange)', color:'var(--ink)', padding:'12px 20px', borderRadius:14, border:'2px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', fontSize:14, fontWeight:600 }}>{toast}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="display" style={{ fontSize:32, margin:0 }}>Classes & Materials</h1>
          <p style={{ color:'var(--ink-soft)', margin:0 }}>Manage classes, Zoom links, notes, challenges and files</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <select className="field" value={batchId} onChange={e => { setBatchId(e.target.value); loadClasses(e.target.value); }}>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="btn btn--orange" onClick={() => setShowNew(!showNew)}>+ New class</button>
        </div>
      </div>
      {err && <ErrBox msg={err}/>}

      {showNew && (
        <div className="dash-card" style={{ marginBottom:18, border:'2px solid var(--orange)' }}>
          <h3 className="display" style={{ fontSize:18, margin:'0 0 14px' }}>New class</h3>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 160px', gap:12, marginBottom:12 }}>
            <div><label className="label"># No.</label><input className="field" placeholder="01" value={newCls.class_num} onChange={updNew('class_num')}/></div>
            <div><label className="label">Title *</label><input className="field" placeholder="Chess: Pawn Structure" value={newCls.title} onChange={updNew('title')}/></div>
            <div><label className="label">Date</label><input className="field" type="date" value={newCls.date} onChange={updNew('date')}/></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn--orange" onClick={createClass} disabled={!newCls.title.trim()}>Create</button>
            <button className="btn btn--ghost" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap:20 }}>
        {/* ── Class list ── */}
        <div className="dash-card" style={{ padding:0, overflow:'hidden' }}>
          {loading ? <Spinner/> : (
            <table className="tbl">
              <thead><tr><th>#</th><th>Title</th><th>Date</th><th>Mats</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id} style={{ cursor:'pointer', background: selected?.id===c.id ? 'var(--yellow-soft)' : '' }}
                      onClick={() => selectClass(c)}>
                    <td><strong>{c.class_num||'—'}</strong></td>
                    <td style={{ maxWidth:160 }}>{c.title}</td>
                    <td style={{ fontSize:12, whiteSpace:'nowrap' }}>{c.date||'—'}</td>
                    <td><span className="chip" style={{ fontSize:11, padding:'2px 8px' }}>{c.material_count||0}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select style={{ fontSize:11, padding:'3px 6px', border:'1.5px solid var(--ink)', borderRadius:6, fontFamily:'inherit', cursor:'pointer' }}
                        value={c.status} onChange={e => changeStatus(c, e.target.value)}>
                        <option value="upcoming">upcoming</option>
                        <option value="live">live</option>
                        <option value="done">done</option>
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => deleteClass(c)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--orange)', fontSize:16, padding:'2px 4px', lineHeight:1 }}>🗑</button>
                    </td>
                  </tr>
                ))}
                {classes.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--ink-soft)', padding:30 }}>No classes. Create one above.</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div>
            <div className="dash-card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1.5px solid rgba(14,20,48,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div className="display" style={{ fontSize:17 }}>{selected.title}</div>
                  <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Class {selected.class_num} · {selected.date||'no date'}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--ink-soft)', lineHeight:1 }}>✕</button>
              </div>

              <div style={{ display:'flex', borderBottom:'1.5px solid rgba(14,20,48,0.1)' }}>
                {tabBtn('info','📋 Info')}
                {tabBtn('zoom','🔗 Zoom')}
                {tabBtn('content','📝 Notes & Challenge')}
                {tabBtn('files','📁 Materials')}
              </div>

              <div style={{ padding:16 }}>

                {/* ── INFO tab ── */}
                {tab==='info' && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:10, marginBottom:10 }}>
                      <div><label className="label"># No.</label><input className="field" value={editInfo.class_num} onChange={e => setEditInfo(f=>({...f,class_num:e.target.value}))}/></div>
                      <div><label className="label">Title</label><input className="field" value={editInfo.title} onChange={e => setEditInfo(f=>({...f,title:e.target.value}))}/></div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label className="label">Date</label>
                      <input className="field" type="date" value={editInfo.date} onChange={e => setEditInfo(f=>({...f,date:e.target.value}))}/>
                    </div>
                    <button className="btn btn--orange" onClick={() => patchClass(editInfo, '✓ Class info saved')}>Save info</button>
                  </>
                )}

                {/* ── ZOOM tab ── */}
                {tab==='zoom' && (
                  <>
                    <div style={{ marginBottom:10 }}>
                      <label className="label">Zoom / Meet link</label>
                      <input className="field" placeholder="https://zoom.us/j/…" value={zoomForm.link} onChange={e => setZoomForm(f=>({...f,link:e.target.value}))}/>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label className="label">Passcode (optional)</label>
                      <input className="field" placeholder="abc123" value={zoomForm.password} onChange={e => setZoomForm(f=>({...f,password:e.target.value}))}/>
                    </div>
                    <button className="btn btn--orange" onClick={() => patchClass({ zoom_link: zoomForm.link, zoom_password: zoomForm.password }, '✓ Zoom link saved')}>Save link</button>
                    {selected.zoom_link && (
                      <div style={{ marginTop:12, padding:10, background:'var(--mint-soft)', borderRadius:10, fontSize:13, wordBreak:'break-all' }}>
                        Current: <strong>{selected.zoom_link}</strong>
                      </div>
                    )}
                  </>
                )}

                {/* ── CONTENT tab: notes + challenge ── */}
                {tab==='content' && (
                  <>
                    <div style={{ marginBottom:14 }}>
                      <label className="label">📝 Class notes / summary</label>
                      <textarea className="field" rows={5} placeholder="Write notes, key points, links to resources…" value={content.notes} onChange={e => setContent(f=>({...f,notes:e.target.value}))} style={{ resize:'vertical', fontFamily:'inherit', fontSize:14 }}/>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label className="label">🎯 Weekly challenge / homework</label>
                      <textarea className="field" rows={4} placeholder="Describe the challenge students should complete before next class…" value={content.challenge} onChange={e => setContent(f=>({...f,challenge:e.target.value}))} style={{ resize:'vertical', fontFamily:'inherit', fontSize:14 }}/>
                    </div>
                    <button className="btn btn--orange" onClick={() => patchClass({ notes: content.notes, challenge: content.challenge }, '✓ Content saved')}>Save content</button>
                  </>
                )}

                {/* ── FILES / MATERIALS tab ── */}
                {tab==='files' && (
                  <>
                    {loadingMat ? <Spinner/> : (
                      <>
                        {materials.map(m => (
                          <div key={m.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px dashed rgba(14,20,48,0.12)', alignItems:'center' }}>
                            <div style={{ fontSize:20, width:28, textAlign:'center' }}>{MAT_ICONS[m.type]||'📎'}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:600, fontSize:14 }}>{m.name}</div>
                              {m.url && <div style={{ fontSize:11, color:'var(--ink-soft)', wordBreak:'break-all' }}>{m.url}</div>}
                              {m.size && <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{m.size}</div>}
                            </div>
                            <button onClick={() => deleteMat(m.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--orange)', fontSize:18, padding:4, lineHeight:1 }}>🗑</button>
                          </div>
                        ))}
                        {materials.length===0 && <p style={{ color:'var(--ink-soft)', fontSize:14, marginBottom:14 }}>No materials yet.</p>}

                        <div style={{ marginTop:16, paddingTop:14, borderTop:'2px dashed rgba(14,20,48,0.15)' }}>
                          <div className="label" style={{ marginBottom:8 }}>Add material</div>
                          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:8, marginBottom:8 }}>
                            <select className="field" value={newMat.type} onChange={updMat('type')}>
                              {MAT_TYPES.map(t => <option key={t} value={t}>{MAT_ICONS[t]} {t}</option>)}
                            </select>
                            <input className="field" placeholder="Name *" value={newMat.name} onChange={updMat('name')}/>
                          </div>
                          <input className="field" placeholder="URL (optional)" value={newMat.url} onChange={updMat('url')} style={{ marginBottom:8 }}/>
                          <input className="field" placeholder="Size / duration (e.g. PDF · 2 MB)" value={newMat.size} onChange={updMat('size')} style={{ marginBottom:10 }}/>
                          <button className="btn btn--orange" style={{ width:'100%', justifyContent:'center' }} onClick={addMaterial} disabled={!newMat.name.trim()}>+ Add</button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ════════════════════════════════════════
   BATCHES (full CRUD)
════════════════════════════════════════ */
const AdminBatches = () => {
  const [batches,  setBatches]  = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [err,      setErr]      = React.useState('');
  const [toast,    setToast]    = React.useState('');
  const [editing,  setEditing]  = React.useState(null); // null | 'new' | batch object
  const [form,     setForm]     = React.useState({ name: '', level: 1, mentor: '', max_students: 25, start_date: '' });

  const showToast = m => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const upd = k => e => setForm(f => ({ ...f, [k]: k === 'level' || k === 'max_students' ? Number(e.target.value) : e.target.value }));

  React.useEffect(() => {
    nsApi.admin.batches()
      .then(d => { setBatches(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const openNew = () => {
    setForm({ name: '', level: 1, mentor: '', max_students: 25, start_date: '' });
    setEditing('new');
  };
  const openEdit = b => {
    setForm({ name: b.name, level: b.level, mentor: b.mentor || '', max_students: b.max_students, start_date: b.start_date || '' });
    setEditing(b);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    try {
      if (editing === 'new') {
        const res = await nsApi.admin.createBatch(form);
        setBatches(prev => [...prev, { ...form, id: res.id, student_count: 0 }]);
        showToast('✓ Batch created');
      } else {
        await nsApi.admin.updateBatch(editing.id, form);
        setBatches(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
        showToast('✓ Batch updated');
      }
      setEditing(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const removeBatch = async b => {
    if (!window.confirm(`Delete batch "${b.name}"?`)) return;
    try {
      await nsApi.admin.deleteBatch(b.id);
      setBatches(prev => prev.filter(x => x.id !== b.id));
      showToast('Deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const LEVEL_LABELS = { 1: 'L1 Explorer', 2: 'L2 Creator', 3: 'L3 Innovator' };

  return (
    <>
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background: toast.startsWith('✓') ? 'var(--mint)' : 'var(--orange)', color:'var(--ink)', padding:'12px 20px', borderRadius:14, border:'2px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', fontSize:14, fontWeight:600 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0 }}>Batches</h1>
          <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{batches.length} batches</p>
        </div>
        <button className="btn btn--orange" onClick={openNew}>+ New batch</button>
      </div>
      {err && <ErrBox msg={err}/>}

      {editing && (
        <div className="dash-card" style={{ marginBottom: 20, border: '2px solid var(--orange)' }}>
          <h3 className="display" style={{ fontSize: 20, margin: '0 0 14px' }}>{editing === 'new' ? 'New batch' : 'Edit: ' + editing.name}</h3>
          <div className="rg-3" style={{ gap: 12, marginBottom: 12 }}>
            <div><label className="label">Batch name *</label><input className="field" value={form.name} onChange={upd('name')} placeholder="B-10"/></div>
            <div>
              <label className="label">Level</label>
              <select className="field" value={form.level} onChange={upd('level')}>
                <option value={1}>L1 Explorer</option>
                <option value={2}>L2 Creator</option>
                <option value={3}>L3 Innovator</option>
              </select>
            </div>
            <div><label className="label">Mentor</label><input className="field" value={form.mentor} onChange={upd('mentor')} placeholder="Sadia Rahman"/></div>
            <div><label className="label">Max students</label><input className="field" type="number" min={1} max={100} value={form.max_students} onChange={upd('max_students')}/></div>
            <div><label className="label">Start date</label><input className="field" type="date" value={form.start_date} onChange={upd('start_date')}/></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn btn--orange" onClick={save} disabled={!form.name.trim()}>Save</button>
              <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <Spinner/> : (
        <div className="rg-3" style={{ gap: 14 }}>
          {batches.map(b => {
            const full = b.student_count >= b.max_students;
            const isEditing = editing?.id === b.id;
            return (
              <div className="dash-card" key={b.id} style={{ background: isEditing ? 'var(--yellow-soft)' : full ? 'var(--orange-soft)' : 'var(--paper)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="display" style={{ fontSize: 22 }}>{b.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {full && <span className="status-pill s-expired">FULL</span>}
                    <button className="btn btn--ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(b)}>Edit</button>
                    <button onClick={() => removeBatch(b)} style={{ background:'none', border:'1.5px solid var(--orange)', color:'var(--orange)', borderRadius:8, cursor:'pointer', padding:'4px 8px', fontSize:12 }}>🗑</button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{LEVEL_LABELS[b.level] || 'Level ' + b.level}</div>
                {b.start_date && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Starts: {b.start_date}</div>}
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 8, background: 'var(--cream-2)', borderRadius: 999, border: '2px solid var(--ink)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (b.student_count / b.max_students) * 100)}%`, background: 'var(--orange)' }}/>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{b.student_count} / {b.max_students} students</div>
                </div>
                <div style={{ fontSize: 12, marginTop: 10, color: 'var(--ink-soft)' }}>Mentor: <strong>{b.mentor || '—'}</strong></div>
              </div>
            );
          })}
          {batches.length === 0 && <p style={{ color: 'var(--ink-soft)', gridColumn: '1/-1' }}>No batches yet.</p>}
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   INSTRUCTORS (full CRUD)
════════════════════════════════════════ */
const AdminInstructors = () => {
  const [instructors, setInstructors] = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [err,         setErr]         = React.useState('');
  const [toast,       setToast]       = React.useState('');
  const [editing,     setEditing]     = React.useState(null); // null | 'new' | instructor object
  const [form,        setForm]        = React.useState({ name:'', designation:'', specialization:'', quote:'', image_url:'', sort_order:0 });
  const [saving,      setSaving]      = React.useState(false);

  const showToast = m => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const upd = k => e => setForm(f => ({ ...f, [k]: k === 'sort_order' ? Number(e.target.value) : e.target.value }));

  React.useEffect(() => {
    nsApi.admin.instructors()
      .then(d => { setInstructors(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const openNew = () => {
    setForm({ name:'', designation:'', specialization:'', quote:'', image_url:'', sort_order: instructors.length });
    setEditing('new');
  };
  const openEdit = inst => {
    setForm({ name: inst.name, designation: inst.designation||'', specialization: inst.specialization||'', quote: inst.quote||'', image_url: inst.image_url||'', sort_order: inst.sort_order||0 });
    setEditing(inst);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const r = await nsApi.admin.createInstructor(form);
        setInstructors(prev => [...prev, { ...form, id: r.id }]);
        showToast('✓ Instructor added');
      } else {
        await nsApi.admin.updateInstructor(editing.id, form);
        setInstructors(prev => prev.map(x => x.id === editing.id ? { ...x, ...form } : x));
        showToast('✓ Instructor updated');
      }
      setEditing(null);
    } catch (e) { showToast('Error: ' + e.message); }
    setSaving(false);
  };

  const remove = async inst => {
    if (!window.confirm(`Delete ${inst.name}?`)) return;
    try {
      await nsApi.admin.deleteInstructor(inst.id);
      setInstructors(prev => prev.filter(x => x.id !== inst.id));
      showToast('Deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  return (
    <>
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background: toast.startsWith('✓')||toast==='Deleted' ? 'var(--mint)' : 'var(--orange)', color:'var(--ink)', padding:'12px 20px', borderRadius:14, border:'2px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', fontSize:14, fontWeight:600 }}>{toast}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="display" style={{ fontSize:32, margin:0 }}>Instructors</h1>
          <p style={{ color:'var(--ink-soft)', margin:0 }}>{instructors.length} mentors</p>
        </div>
        <button className="btn btn--orange" onClick={openNew}>+ Add instructor</button>
      </div>
      {err && <ErrBox msg={err}/>}

      {editing && (
        <div className="dash-card" style={{ marginBottom:24, border:'2px solid var(--orange)' }}>
          <h3 className="display" style={{ fontSize:20, margin:'0 0 16px' }}>{editing === 'new' ? 'New instructor' : 'Edit: ' + editing.name}</h3>
          <div className="rg-2" style={{ gap: 12, marginBottom: 12 }}>
            <div><label className="label">Name *</label><input className="field" value={form.name} onChange={upd('name')} placeholder="Sadman Sadik"/></div>
            <div><label className="label">Designation</label><input className="field" value={form.designation} onChange={upd('designation')} placeholder="Lead Chess Instructor"/></div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="label">Specialization <span style={{ opacity:0.5, fontSize:11 }}>(comma-separated)</span></label>
            <input className="field" value={form.specialization} onChange={upd('specialization')} placeholder="Chess, Strategy, Robotics"/>
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="label">Image URL</label>
            <input className="field" value={form.image_url} onChange={upd('image_url')} placeholder="https://example.com/photo.jpg"/>
            {form.image_url && (
              <div style={{ marginTop:8, width:80, height:80, borderRadius:12, overflow:'hidden', border:'2px solid var(--ink)' }}>
                <img src={form.image_url} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'}/>
              </div>
            )}
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="label">Quote / Bio</label>
            <textarea className="field" rows={3} value={form.quote} onChange={upd('quote')} placeholder="What they say about learning…" style={{ resize:'vertical', fontFamily:'inherit', fontSize:14 }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="label">Sort order</label>
            <input className="field" type="number" min={0} value={form.sort_order} onChange={upd('sort_order')} style={{ width:100 }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn--orange" onClick={save} disabled={saving || !form.name.trim()}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <Spinner/> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {instructors.map(inst => (
            <div key={inst.id} className="dash-card" style={{ padding:0, overflow:'hidden', background: editing?.id===inst.id ? 'var(--yellow-soft)' : 'var(--paper)' }}>
              <div style={{ height:160, background:'var(--cream-2)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {inst.image_url
                  ? <img src={inst.image_url} alt={inst.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ fontSize:52, opacity:0.3 }}>👤</div>
                }
              </div>
              <div style={{ padding:'16px 18px' }}>
                <div className="display" style={{ fontSize:18, marginBottom:2 }}>{inst.name}</div>
                {inst.designation && <div style={{ fontSize:12, color:'var(--orange)', fontWeight:600, marginBottom:6 }}>{inst.designation}</div>}
                {inst.specialization && (
                  <div style={{ marginBottom:8 }}>
                    {inst.specialization.split(',').map(s => (
                      <span key={s} className="chip" style={{ fontSize:11, padding:'2px 8px', marginRight:4, display:'inline-block' }}>{s.trim()}</span>
                    ))}
                  </div>
                )}
                {inst.quote && <p style={{ fontSize:12, color:'var(--ink-soft)', margin:'8px 0 12px', lineHeight:1.5, fontStyle:'italic' }}>"{inst.quote}"</p>}
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button className="btn btn--ghost" style={{ flex:1, padding:'6px 10px', fontSize:12, justifyContent:'center' }} onClick={() => openEdit(inst)}>Edit</button>
                  <button onClick={() => remove(inst)} style={{ background:'none', border:'1.5px solid var(--orange)', color:'var(--orange)', borderRadius:8, cursor:'pointer', padding:'6px 10px', fontSize:12 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          {instructors.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'var(--ink-soft)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👩‍🏫</div>
              <div>No instructors yet. Add your first one.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   REVIEWS / TESTIMONIALS (full CRUD)
════════════════════════════════════════ */
const AdminReviews = () => {
  const [reviews,  setReviews]  = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [err,      setErr]      = React.useState('');
  const [toast,    setToast]    = React.useState('');
  const [editing,  setEditing]  = React.useState(null);
  const [form,     setForm]     = React.useState({ quote:'', name:'', role:'', avatar_initial:'', bg_color:'var(--yellow-soft)', sort_order:0 });
  const [saving,   setSaving]   = React.useState(false);

  const showToast = m => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const upd = k => e => setForm(f => ({ ...f, [k]: k === 'sort_order' ? Number(e.target.value) : e.target.value }));

  const BG_OPTIONS = [
    { label: 'Yellow', value: 'var(--yellow-soft)' },
    { label: 'Orange', value: 'var(--orange-soft)' },
    { label: 'Mint',   value: 'var(--mint-soft)'   },
    { label: 'Pink',   value: '#FFDAE6'             },
    { label: 'Cream',  value: 'var(--cream-2)'      },
  ];

  React.useEffect(() => {
    nsApi.admin.testimonials()
      .then(d => { setReviews(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const openNew = () => {
    setForm({ quote:'', name:'', role:'', avatar_initial:'', bg_color:'var(--yellow-soft)', sort_order: reviews.length });
    setEditing('new');
  };
  const openEdit = r => {
    setForm({ quote: r.quote, name: r.name, role: r.role||'', avatar_initial: r.avatar_initial||'', bg_color: r.bg_color||'var(--yellow-soft)', sort_order: r.sort_order||0 });
    setEditing(r);
  };

  const autoInitial = () => {
    if (!form.avatar_initial && form.name) setForm(f => ({ ...f, avatar_initial: f.name[0].toUpperCase() }));
  };

  const save = async () => {
    if (!form.quote.trim() || !form.name.trim()) return;
    setSaving(true);
    const data = { ...form, avatar_initial: form.avatar_initial || form.name[0]?.toUpperCase() || '?' };
    try {
      if (editing === 'new') {
        const r = await nsApi.admin.createTestimonial(data);
        setReviews(prev => [...prev, { ...data, id: r.id }]);
        showToast('✓ Review added');
      } else {
        await nsApi.admin.updateTestimonial(editing.id, data);
        setReviews(prev => prev.map(x => x.id === editing.id ? { ...x, ...data } : x));
        showToast('✓ Review updated');
      }
      setEditing(null);
    } catch (e) { showToast('Error: ' + e.message); }
    setSaving(false);
  };

  const remove = async r => {
    if (!window.confirm(`Delete review from ${r.name}?`)) return;
    try {
      await nsApi.admin.deleteTestimonial(r.id);
      setReviews(prev => prev.filter(x => x.id !== r.id));
      showToast('Deleted');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  return (
    <>
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background: toast.startsWith('✓')||toast==='Deleted' ? 'var(--mint)' : 'var(--orange)', color:'var(--ink)', padding:'12px 20px', borderRadius:14, border:'2px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', fontSize:14, fontWeight:600 }}>{toast}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="display" style={{ fontSize:32, margin:0 }}>Reviews</h1>
          <p style={{ color:'var(--ink-soft)', margin:0 }}>{reviews.length} parent testimonials</p>
        </div>
        <button className="btn btn--orange" onClick={openNew}>+ Add review</button>
      </div>
      {err && <ErrBox msg={err}/>}

      {editing && (
        <div className="dash-card" style={{ marginBottom:24, border:'2px solid var(--orange)' }}>
          <h3 className="display" style={{ fontSize:20, margin:'0 0 16px' }}>{editing === 'new' ? 'New review' : 'Edit review'}</h3>
          <div style={{ marginBottom:12 }}>
            <label className="label">Review / Quote *</label>
            <textarea className="field" rows={3} value={form.quote} onChange={upd('quote')} placeholder="What the parent said…" style={{ resize:'vertical', fontFamily:'inherit', fontSize:14 }}/>
          </div>
          <div className="rg-2" style={{ gap: 12, marginBottom: 12 }}>
            <div><label className="label">Parent name *</label><input className="field" value={form.name} onChange={upd('name')} onBlur={autoInitial} placeholder="Rumana K."/></div>
            <div><label className="label">Role / Relation</label><input className="field" value={form.role} onChange={upd('role')} placeholder="Mom of Aarav (10)"/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 100px', gap:12, marginBottom:14 }}>
            <div><label className="label">Initial</label><input className="field" maxLength={2} value={form.avatar_initial} onChange={upd('avatar_initial')} placeholder="R"/></div>
            <div>
              <label className="label">Card color</label>
              <select className="field" value={form.bg_color} onChange={upd('bg_color')}>
                {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label className="label">Order</label><input className="field" type="number" min={0} value={form.sort_order} onChange={upd('sort_order')}/></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn--orange" onClick={save} disabled={saving || !form.quote.trim() || !form.name.trim()}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <Spinner/> : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {reviews.map(r => (
            <div key={r.id} className="dash-card" style={{ background: r.bg_color || 'var(--yellow-soft)', display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'start', border: editing?.id===r.id ? '2px solid var(--orange)' : '2px solid var(--ink)' }}>
              <div>
                <div style={{ fontSize:20, color:'var(--orange)', marginBottom:8 }}>★★★★★</div>
                <p style={{ fontSize:15, lineHeight:1.55, margin:'0 0 12px', fontStyle:'italic' }}>"{r.quote}"</p>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--paper)', border:'2px solid var(--ink)', display:'grid', placeItems:'center', fontWeight:700, fontSize:14 }}>{r.avatar_initial || r.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                    <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{r.role}</div>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                <button className="btn btn--ghost" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => openEdit(r)}>Edit</button>
                <button onClick={() => remove(r)} style={{ background:'none', border:'1.5px solid var(--orange)', color:'var(--orange)', borderRadius:8, cursor:'pointer', padding:'6px 10px', fontSize:12 }}>🗑 Delete</button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div style={{ textAlign:'center', padding:60, color:'var(--ink-soft)' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
              <div>No reviews yet. Add your first one.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════
   SETTINGS
════════════════════════════════════════ */
const AdminSettingsView = () => (
  <>
    <h1 className="display" style={{ fontSize: 32, margin: '0 0 20px' }}>Settings</h1>
    <div className="dash-card">
      <h3 className="display" style={{ fontSize: 20, margin: '0 0 14px' }}>Payment</h3>
      <div className="rg-settings-pay">
        <div><label className="label">bKash receive number</label><input className="field mono" defaultValue="01781838853"/></div>
        <div><label className="label">Auto-verify window</label><select className="field"><option>24 hours</option><option>12 hours</option><option>Immediate</option></select></div>
      </div>
    </div>
    <div className="dash-card" style={{ marginTop: 18 }}>
      <h3 className="display" style={{ fontSize: 20, margin: '0 0 14px' }}>Pricing</h3>
      <div className="rg-settings-price">
        {[['1 month','1000'],['3 months','2700'],['6 months','4800'],['12 months','8400']].map(([l, v]) => (
          <div key={l}><label className="label">{l}</label><input className="field" defaultValue={v}/></div>
        ))}
      </div>
      <button className="btn btn--orange" style={{ marginTop: 14 }}>Save settings</button>
    </div>
  </>
);

Object.assign(window, { Admin });
