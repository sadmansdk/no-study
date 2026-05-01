const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const path = require('path');

let db;

async function init() {
  db = await open({
    filename: path.join(__dirname, 'nostudy.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      mentor TEXT,
      max_students INTEGER DEFAULT 25,
      start_date TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      student_name TEXT NOT NULL,
      age INTEGER,
      parent_name TEXT,
      phone TEXT,
      batch_id INTEGER REFERENCES batches(id),
      level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES students(id),
      plan_months INTEGER,
      price INTEGER,
      status TEXT DEFAULT 'active',
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      parent_name TEXT,

      student_name TEXT,
      age INTEGER,
      phone TEXT,
      email TEXT,
      sender_num TEXT,
      trxn_id TEXT UNIQUE,
      plan_months INTEGER,
      amount INTEGER,
      ref_id TEXT,
      status TEXT DEFAULT 'pending',
      temp_password TEXT,
      reject_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji TEXT,
      name TEXT,
      level TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER REFERENCES batches(id),
      course_id INTEGER REFERENCES courses(id),
      class_num TEXT,
      title TEXT NOT NULL,
      date TEXT,
      zoom_link TEXT,
      zoom_password TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS class_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER REFERENCES classes(id),
      type TEXT,
      name TEXT,
      url TEXT,
      size TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS xp_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES students(id),
      amount INTEGER DEFAULT 0,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS instructors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT DEFAULT '',
      specialization TEXT DEFAULT '',
      quote TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      avatar_initial TEXT DEFAULT '',
      bg_color TEXT DEFAULT 'var(--yellow-soft)',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  try { await db.exec('ALTER TABLE payments ADD COLUMN user_id INTEGER REFERENCES users(id)'); } catch(e) {}
  try { await db.exec('ALTER TABLE classes ADD COLUMN notes TEXT DEFAULT ""'); } catch(e) {}
  try { await db.exec('ALTER TABLE classes ADD COLUMN challenge TEXT DEFAULT ""'); } catch(e) {}

  const testCount = await db.get('SELECT COUNT(*) as c FROM testimonials');
  if (testCount.c === 0) {
    const reviews = [
      ["My daughter went from 'I hate math' to building her own quiz game in Scratch in 6 weeks. Worth every taka.", "Rumana K.", "Mom of Aarav (10)", "R", "var(--yellow-soft)", 0],
      ["The chess class is unreal. He's now beating his uncle at 12. The mentors actually engage — not just lectures.", "Imran A.", "Dad of Zayan (12)", "I", "var(--orange-soft)", 1],
      ["Loved the robot project. The kit arrived on time, instructions were super clear, and my son refused to sleep till it walked.", "Nadia S.", "Mom of Rian (13)", "N", "var(--mint-soft)", 2],
    ];
    for (const [quote, name, role, initial, bg, order] of reviews) {
      await db.run('INSERT INTO testimonials (quote,name,role,avatar_initial,bg_color,sort_order) VALUES (?,?,?,?,?,?)',
        [quote, name, role, initial, bg, order]);
    }
  }


  const batchCount = await db.get('SELECT COUNT(*) as c FROM batches');
  if (batchCount.c === 0) {
    const batches = [
      ['B-04', 1, 'Sadia Rahman', 25],
      ['B-05', 1, 'Faisal Khan',  25],
      ['B-06', 2, 'Anika Sen',    25],
      ['B-07', 2, 'Tanvir Hassan',25],
      ['B-08', 3, 'Rashed Miah',  20],
      ['B-09', 1, 'Sadia Rahman', 25],
    ];
    for (const [name, level, mentor, max] of batches) {
      await db.run("INSERT INTO batches (name,level,mentor,max_students,start_date) VALUES (?,?,?,?,'2026-04-01')",
        [name, level, mentor, max]);
    }

    const courses = [
      ['🧠', 'Smart Thinking & Brain Skills', 'L1,L2,L3'],
      ['♟️', 'Chess Mastery',                 'L1,L2,L3'],
      ['🤖', 'Robotics & DIY Engineering',    'L2,L3'   ],
      ['💻', 'Coding & App Development',      'L1,L2,L3'],
      ['🤖', 'AI for Kids',                   'L2,L3'   ],
      ['🎮', 'Game Design & Creativity',      'L1,L2'   ],
      ['🎤', 'Communication & Confidence',    'L1,L2'   ],
      ['💡', 'Young Entrepreneur',            'L1,L2'   ],
      ['🌍', 'Future Skills',                 'L1,L2,L3'],
    ];
    for (const [e, n, l] of courses) {
      await db.run('INSERT INTO courses (emoji,name,level) VALUES (?,?,?)', [e, n, l]);
    }

    const classRows = [
      ['01', 'Chess: Pawn structure & openings',    '2026-04-01', 'https://zoom.us/j/89274639281', 'parallel1', 'done'    ],
      ['02', 'Robotics: Sensors & Arduino setup',   '2026-04-05', 'https://zoom.us/j/89274639281', 'parallel2', 'done'    ],
      ['03', 'AI: What is a chatbot really?',       '2026-04-09', 'https://zoom.us/j/89274639281', 'parallel3', 'done'    ],
      ['04', 'Coding: Build your first Scratch game','2026-04-14', 'https://zoom.us/j/89274639281', 'parallel4', 'live'    ],
      ['05', 'Speaking: Tell a story in 3 minutes', '2026-04-18', null, null, 'upcoming'],
      ['06', 'Entrepreneur: Pitch your idea',       '2026-04-22', null, null, 'upcoming'],
      ['07', 'Final Showcase: Demo day',            '2026-04-28', null, null, 'upcoming'],
    ];
    for (const [num, title, date, link, pwd, status] of classRows) {
      await db.run('INSERT INTO classes (batch_id,class_num,title,date,zoom_link,zoom_password,status) VALUES (1,?,?,?,?,?,?)',
        [num, title, date, link, pwd, status]);
    }
  }
}

module.exports = {
  init,
  get: (...args) => db.get(...args),
  all: (...args) => db.all(...args),
  run: (...args) => db.run(...args),
  exec: (...args) => db.exec(...args)
};
