const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('./db');
const admin    = require('firebase-admin');

// Initialize Firebase Admin
// Note: In production, place your service account key as serviceAccountKey.json
try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.warn("Firebase Admin: serviceAccountKey.json not found. Use placeholders for now.");
  // For development without the file, we can skip initialization or use env vars
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'nostudy_jwt_secret_2026';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// Static moved below routes to avoid conflicts

/* ── Auth middleware ── */
const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' });

/* ════════════════════════════════════════
   AUTH
   ════════════════════════════════════════ */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sadmansdk@gmail.com';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBWvS7ykA6z6FPOTLtFRFKhDGjhLpCBgqs';

async function verifyFirebaseToken(idToken) {
  if (admin.apps.length > 0) {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return { email: decoded.email, name: decoded.name || null };
  }
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  );
  const data = await r.json();
  if (!r.ok || !data.users?.[0]) throw new Error(data.error?.message || 'Invalid token');
  return { email: data.users[0].email, name: data.users[0].displayName || null };
}

app.post('/api/auth/firebase-login', async (req, res) => {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ error: 'ID token required' });
  try {
    const { email, name: firebaseName } = await verifyFirebaseToken(idToken);
    const normalEmail = email.toLowerCase().trim();
    const role = normalEmail === ADMIN_EMAIL ? 'admin' : 'student';

    let user = await db.get('SELECT * FROM users WHERE email = ?', [normalEmail]);
    if (!user) {
      const displayName = firebaseName || normalEmail.split('@')[0];
      const r = await db.run(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, 'FIREBASE_MANAGED', ?)",
        [displayName, normalEmail, role]
      );
      user = { id: r.lastID, name: displayName, email: normalEmail, role };
    } else if (user.role !== role) {
      await db.run('UPDATE users SET role=? WHERE id=?', [role, user.id]);
      user.role = role;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user    = await db.get('SELECT id,name,email,role FROM users WHERE id=?', [req.user.id]);
    const student = await db.get('SELECT * FROM students WHERE user_id=?', [req.user.id]);
    res.json({ user, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   PAYMENTS (public)
   ════════════════════════════════════════ */
app.all('/api/payments', auth, async (req, res) => {
  if (req.method === 'GET') return res.json({ message: 'Payments endpoint is reachable' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { parentName, studentName, age, phone, email, senderNum, trxnId, planMonths, amount } = req.body || {};
  if (!trxnId || !email) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const existing = await db.get('SELECT id FROM payments WHERE trxn_id=?', [trxnId]);
    if (existing)
      return res.status(400).json({ error: 'Transaction ID already submitted' });
    const refId  = 'NS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const result = await db.run(
      `INSERT INTO payments (user_id,parent_name,student_name,age,phone,email,sender_num,trxn_id,plan_months,amount,ref_id,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?, 'pending')`,
      [req.user.id, parentName, studentName, age || 0, phone, email.toLowerCase().trim(), senderNum, trxnId, planMonths, amount, refId]
    );
    res.json({ refId, id: result.lastID, ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ════════════════════════════════════════
   STUDENT DASHBOARD
   ════════════════════════════════════════ */
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const student = await db.get('SELECT * FROM students WHERE user_id=?', [req.user.id]);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const batch        = await db.get('SELECT * FROM batches WHERE id=?', [student.batch_id]);
    const classes      = await db.all('SELECT * FROM classes WHERE batch_id=? ORDER BY date ASC', [student.batch_id]);
    const xpResult     = await db.get('SELECT COALESCE(SUM(amount),0) as t FROM xp_log WHERE student_id=?', [student.id]);
    const xp = xpResult.t;
    const rankResult   = await db.get(
      'SELECT COUNT(*)+1 as r FROM (SELECT student_id,SUM(amount) as s FROM xp_log GROUP BY student_id) WHERE s>?',
      [xp]
    );
    const rank = rankResult.r;
    const totalResult  = await db.get('SELECT COUNT(*) as c FROM students');
    const totalStudents = totalResult.c;
    const subscription = await db.get('SELECT * FROM subscriptions WHERE student_id=? ORDER BY id DESC LIMIT 1', [student.id]);

    res.json({ student, batch, classes, xp, rank, totalStudents, subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/classes/:id', auth, async (req, res) => {
  try {
    const cls = await db.get('SELECT * FROM classes WHERE id=?', [req.params.id]);
    if (!cls) return res.status(404).json({ error: 'Not found' });
    const materials = await db.all('SELECT * FROM class_materials WHERE class_id=?', [cls.id]);
    res.json({ ...cls, materials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard', auth, async (req, res) => {
  try {
    const board = await db.all(`
      SELECT s.id, s.student_name, s.level, b.name as batch,
             COALESCE(SUM(x.amount),0) as xp
      FROM students s
      LEFT JOIN xp_log x ON x.student_id=s.id
      LEFT JOIN batches b ON b.id=s.batch_id
      GROUP BY s.id ORDER BY xp DESC LIMIT 20
    `);
    const me = await db.get('SELECT id FROM students WHERE user_id=?', [req.user.id]);
    res.json({ board, myStudentId: me?.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — STATS & ACTIVITY
   ════════════════════════════════════════ */
app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
  try {
    const activeStudents  = (await db.get("SELECT COUNT(*) as c FROM subscriptions WHERE status='active'")).c;
    const pendingPayments = (await db.get("SELECT COUNT(*) as c FROM payments WHERE status='pending'")).c;
    const activeBatches   = (await db.get('SELECT COUNT(*) as c FROM batches')).c;
    const revenue         = (await db.get("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE status='approved'")).t;
    const chart = await db.all(`
      SELECT strftime('%b', created_at) as month, COUNT(*) as v
      FROM subscriptions WHERE status='active'
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY created_at ASC LIMIT 6
    `);
    const planMix = await db.all(`
      SELECT plan_months, COUNT(*) as n FROM subscriptions WHERE status='active' GROUP BY plan_months
    `);
    res.json({ activeStudents, pendingPayments, activeBatches, revenue, chart, planMix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/activity', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT ref_id, parent_name as who, amount, status, created_at FROM payments
      ORDER BY created_at DESC LIMIT 8
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — USERS
   ════════════════════════════════════════ */
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const q = (req.query.q || '').trim();
  const like = `%${q}%`;
  try {
    const rows = await db.all(`
      SELECT u.id, u.name as parent_name, u.email,
             s.id as student_id, s.student_name, s.age, s.level,
             b.name as batch,
             sub.id as sub_id, sub.plan_months, sub.status as sub_status,
             sub.start_date, sub.end_date
      FROM users u
      LEFT JOIN students s ON s.user_id=u.id
      LEFT JOIN batches b ON b.id=s.batch_id
      LEFT JOIN subscriptions sub ON sub.student_id=s.id AND sub.status NOT IN ('cancelled','refunded')
      WHERE u.role='student' AND (s.student_name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)
      ORDER BY u.id DESC
    `, [like, like, like]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — PAYMENTS
   ════════════════════════════════════════ */
app.get('/api/admin/payments', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM payments WHERE status='pending' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/payments/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const payment = await db.get('SELECT * FROM payments WHERE id=?', [req.params.id]);
    if (!payment)                    return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    const tempPassword = Math.random().toString(36).slice(2, 8);
    const hash = bcrypt.hashSync(tempPassword, 10);

    // Get user — either from linked user_id or by email
    let user;
    if (payment.user_id) {
      user = await db.get('SELECT * FROM users WHERE id=?', [payment.user_id]);
    } else {
      user = await db.get('SELECT * FROM users WHERE email=?', [payment.email]);
    }

    if (!user) {
      const r = await db.run("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'student')",
                 [payment.parent_name, payment.email, hash]);
      user = { id: r.lastID };
    }


    // Find batch with space
    const batch = await db.get(
      'SELECT b.* FROM batches b WHERE (SELECT COUNT(*) FROM students s WHERE s.batch_id=b.id)<b.max_students LIMIT 1'
    ) || { id: 1 };

    // Create student profile if not exists
    let student = await db.get('SELECT * FROM students WHERE user_id=?', [user.id]);
    if (!student) {
      const r = await db.run('INSERT INTO students (user_id,student_name,age,parent_name,phone,batch_id,level) VALUES (?,?,?,?,?,?,1)',
                 [user.id, payment.student_name, payment.age, payment.parent_name, payment.phone, batch.id]);
      student = { id: r.lastID };
    }

    // Create subscription
    const start = new Date().toISOString().slice(0, 10);
    const end   = new Date(Date.now() + payment.plan_months * 30 * 86400000).toISOString().slice(0, 10);
    await db.run("INSERT INTO subscriptions (student_id,plan_months,price,status,start_date,end_date) VALUES (?,?,?,'active',?,?)",
      [student.id, payment.plan_months, payment.amount, start, end]);

    // Enrollment XP bonus
    await db.run("INSERT INTO xp_log (student_id,amount,reason) VALUES (?,50,'Enrollment bonus')", [student.id]);

    // Stamp payment
    await db.run("UPDATE payments SET status='approved',temp_password=?,reviewed_at=datetime('now') WHERE id=?",
      [tempPassword, payment.id]);

    res.json({ ok: true, tempPassword, email: payment.email, studentName: payment.student_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/payments/:id/reject', auth, adminOnly, async (req, res) => {
  const { reason } = req.body || {};
  try {
    await db.run("UPDATE payments SET status='rejected',reject_reason=?,reviewed_at=datetime('now') WHERE id=?",
      [reason || null, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — SUBSCRIPTIONS
   ════════════════════════════════════════ */
app.put('/api/admin/subscriptions/:id', auth, adminOnly, async (req, res) => {
  const { action, days } = req.body || {};
  try {
    const existing = await db.get('SELECT id FROM subscriptions WHERE id=?', [req.params.id]);
    if (!existing)
      return res.status(404).json({ error: 'Subscription not found' });
    if (action === 'extend')
      await db.run(`UPDATE subscriptions SET end_date=date(end_date,'+'||?||' days') WHERE id=?`, [days || 30, req.params.id]);
    else if (['pause','cancel','refund'].includes(action)) {
      const newStatus = action === 'cancel' ? 'cancelled' : action;
      await db.run('UPDATE subscriptions SET status=? WHERE id=?', [newStatus, req.params.id]);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — BATCHES
   ════════════════════════════════════════ */
app.get('/api/admin/batches', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT b.*, COUNT(s.id) as student_count
      FROM batches b LEFT JOIN students s ON s.batch_id=b.id
      GROUP BY b.id ORDER BY b.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/batches', auth, adminOnly, async (req, res) => {
  const { name, level, mentor, max_students, start_date } = req.body || {};
  try {
    const r = await db.run('INSERT INTO batches (name,level,mentor,max_students,start_date) VALUES (?,?,?,?,?)',
               [name, level || 1, mentor, max_students || 25, start_date]);
    res.json({ id: r.lastID, ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ADMIN — COURSES & MATERIALS
   ════════════════════════════════════════ */
app.get('/api/admin/courses', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT co.*, COUNT(DISTINCT c.id) as class_count,
             (SELECT COUNT(*) FROM students s2 JOIN subscriptions sub ON sub.student_id=s2.id WHERE sub.status='active') as total_students
      FROM courses co LEFT JOIN classes c ON c.course_id=co.id GROUP BY co.id ORDER BY co.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/materials', auth, adminOnly, async (req, res) => {
  const batch_id = req.query.batch_id || 1;
  try {
    const rows = await db.all(`
      SELECT c.*, COUNT(m.id) as material_count
      FROM classes c LEFT JOIN class_materials m ON m.class_id=c.id
      WHERE c.batch_id=? GROUP BY c.id ORDER BY c.date
    `, [batch_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/classes/:id', auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const allowed = ['zoom_link','zoom_password','status','title','class_num','date','notes','challenge'];
  const fields = [], vals = [];
  for (const key of allowed) {
    if (key in body) { fields.push(`${key}=?`); vals.push(body[key] ?? null); }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  try {
    await db.run(`UPDATE classes SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/courses', auth, adminOnly, async (req, res) => {
  const { emoji, name, level, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = await db.run('INSERT INTO courses (emoji,name,level,description) VALUES (?,?,?,?)',
      [emoji || '📚', name, level || 'L1,L2,L3', description || '']);
    res.json({ id: r.lastID, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/courses/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM courses WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/courses/:id', auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const allowed = ['emoji','name','level','description'];
  const fields = [], vals = [];
  for (const key of allowed) {
    if (key in body) { fields.push(`${key}=?`); vals.push(body[key] ?? null); }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  try {
    await db.run(`UPDATE courses SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/classes/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM class_materials WHERE class_id=?', [req.params.id]);
    await db.run('DELETE FROM classes WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/classes', auth, adminOnly, async (req, res) => {
  const { batch_id, class_num, title, date, zoom_link, zoom_password, notes, challenge, status } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  try {
    const r = await db.run(
      'INSERT INTO classes (batch_id,class_num,title,date,zoom_link,zoom_password,notes,challenge,status) VALUES (?,?,?,?,?,?,?,?,?)',
      [batch_id || 1, class_num || '', title, date || '', zoom_link || null, zoom_password || null, notes || '', challenge || '', status || 'upcoming']
    );
    res.json({ id: r.lastID, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/classes/:id/materials', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM class_materials WHERE class_id=? ORDER BY id', [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/classes/:id/materials', auth, adminOnly, async (req, res) => {
  const { type, name, url, size } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = await db.run('INSERT INTO class_materials (class_id,type,name,url,size) VALUES (?,?,?,?,?)',
      [req.params.id, type || 'link', name, url || '', size || '']);
    res.json({ id: r.lastID, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/materials/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM class_materials WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/batches/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM batches WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/batches/:id', auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const allowed = ['name','level','mentor','max_students','start_date'];
  const fields = [], vals = [];
  for (const key of allowed) {
    if (key in body) { fields.push(`${key}=?`); vals.push(body[key] ?? null); }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  try {
    await db.run(`UPDATE batches SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ════════════════════════════════════════
   TESTIMONIALS (public read + admin CRUD)
   ════════════════════════════════════════ */
app.get('/api/testimonials', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM testimonials ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/testimonials', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM testimonials ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/testimonials', auth, adminOnly, async (req, res) => {
  const { quote, name, role, avatar_initial, bg_color, sort_order } = req.body || {};
  if (!quote || !name) return res.status(400).json({ error: 'Quote and name required' });
  try {
    const r = await db.run(
      'INSERT INTO testimonials (quote,name,role,avatar_initial,bg_color,sort_order) VALUES (?,?,?,?,?,?)',
      [quote, name, role || '', avatar_initial || name[0].toUpperCase(), bg_color || 'var(--yellow-soft)', sort_order || 0]
    );
    res.json({ id: r.lastID, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/testimonials/:id', auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const allowed = ['quote','name','role','avatar_initial','bg_color','sort_order'];
  const fields = [], vals = [];
  for (const key of allowed) {
    if (key in body) { fields.push(`${key}=?`); vals.push(body[key] ?? null); }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  try {
    await db.run(`UPDATE testimonials SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/testimonials/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM testimonials WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ════════════════════════════════════════
   INSTRUCTORS (public read + admin CRUD)
   ════════════════════════════════════════ */
app.get('/api/instructors', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM instructors ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/instructors', auth, adminOnly, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM instructors ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/instructors', auth, adminOnly, async (req, res) => {
  const { name, designation, specialization, quote, image_url, sort_order } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const r = await db.run(
      'INSERT INTO instructors (name,designation,specialization,quote,image_url,sort_order) VALUES (?,?,?,?,?,?)',
      [name, designation || '', specialization || '', quote || '', image_url || '', sort_order || 0]
    );
    res.json({ id: r.lastID, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/instructors/:id', auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const allowed = ['name','designation','specialization','quote','image_url','sort_order'];
  const fields = [], vals = [];
  for (const key of allowed) {
    if (key in body) { fields.push(`${key}=?`); vals.push(body[key] ?? null); }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  try {
    await db.run(`UPDATE instructors SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/instructors/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.run('DELETE FROM instructors WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── Serve HTML for all non-API routes (SPA fallback) ── */
app.use(express.static(path.join(__dirname)));

app.post('*', (req, res) => {
  console.log(`[${new Date().toISOString()}] Unmatched POST ${req.path}`);
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api'))
    return res.status(404).json({ error: 'Route not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;

async function start() {
  await db.init();
  app.listen(PORT, () => {
    console.log(`\n🚀  No Study → http://localhost:${PORT}\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
