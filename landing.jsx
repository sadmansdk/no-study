/* ===================== LANDING PAGE ===================== */

const Nav = ({ go, auth, logout }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const avatarRef = React.useRef(null);
  const close = () => setMobileOpen(false);
  const nav = (r) => { close(); setAvatarOpen(false); go(r); };
  const scroll = (id) => {
    close();
    if (document.getElementById(id)) {
      document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    } else {
      go("home");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  };

  React.useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarOpen]);

  const user = auth?.user;
  const initial = user?.name ? user.name[0].toUpperCase() : "?";

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="logo" onClick={() => nav("home")} style={{ padding: 0 }}>
          <img src="nostudy-logo.png" alt="No Study" style={{ height: 56, width: 'auto', display: 'block', maxWidth: 200 }}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
          <span style={{ display:'none', alignItems:'center', gap:8 }}>
            <span className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6 L 4 20 L 20 20 L 20 6 L 12 10 Z" stroke="#0E1430" strokeWidth="2.5" strokeLinejoin="round" fill="#FFD23F"/>
              </svg>
            </span>
            <span>No <span className="logo-strike">Study</span></span>
          </span>
        </a>
        <div className="nav-links">
          <a onClick={() => nav("home")}>Home</a>
          <a onClick={() => scroll("programs")}>Programs</a>
          <a onClick={() => scroll("levels")}>Levels</a>
          <a onClick={() => nav("pricing")}>Pricing</a>
          <a onClick={() => nav("instructors")}>Instructors</a>
          {user && (
            <a onClick={() => nav(user.role === "admin" ? "admin" : "dashboard")} style={{ fontWeight: 700, color: "var(--orange)" }}>
              {user.role === "admin" ? "Admin" : "Dashboard"}
            </a>
          )}
        </div>
        <div className="nav-cta">
          {user ? (
            <div ref={avatarRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "var(--orange)", color: "white",
                  border: "2.5px solid var(--ink)", fontWeight: 700, fontSize: 15,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}
              >{initial}</button>
              {avatarOpen && (
                <div style={{
                  position: "absolute", right: 0, top: 48,
                  background: "var(--paper)", border: "2px solid var(--ink)",
                  borderRadius: 14, boxShadow: "var(--shadow-lg)",
                  minWidth: 190, zIndex: 999, overflow: "hidden"
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1.5px solid rgba(14,20,48,0.1)" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", textTransform: "capitalize" }}>{user.role}</div>
                  </div>
                  <a onClick={() => nav(user.role === "admin" ? "admin" : "dashboard")}
                     style={{ display: "block", padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                    {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </a>
                  <a onClick={() => { setAvatarOpen(false); logout && logout(); }}
                     style={{ display: "block", padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "var(--orange)", fontWeight: 600, borderTop: "1.5px solid rgba(14,20,48,0.1)" }}>
                    Sign out
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn--ghost" onClick={() => nav("login")} style={{ marginRight: 8 }}>Sign in</button>
              <button className="btn btn--orange" onClick={() => nav("pricing")}>Enroll Now →</button>
            </>
          )}
          <button className="nav-burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="nav-mobile">
          <a onClick={() => nav("home")}>Home</a>
          <a onClick={() => scroll("programs")}>Programs</a>
          <a onClick={() => scroll("levels")}>Levels</a>
          <a onClick={() => nav("pricing")}>Pricing</a>
          <a onClick={() => nav("instructors")}>Instructors</a>
          {user ? (
            <>
              <a onClick={() => nav(user.role === "admin" ? "admin" : "dashboard")}>
                {user.role === "admin" ? "Admin Panel" : "Dashboard"}
              </a>
              <button className="btn btn--ghost" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => { close(); logout && logout(); }}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn btn--ghost" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => nav("login")}>Sign in</button>
              <button className="btn btn--orange" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => nav("pricing")}>Enroll Now →</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const TypeWriter = ({ text, speed }) => {
  const [shown, setShown] = React.useState('');
  const [phase, setPhase] = React.useState('typing');
  const [idx,   setIdx]   = React.useState(0);

  React.useEffect(() => {
    let timer;
    if (phase === 'typing') {
      if (idx < text.length) {
        timer = setTimeout(() => { setShown(text.slice(0, idx + 1)); setIdx(i => i + 1); }, speed || 90);
      } else {
        timer = setTimeout(() => setPhase('pause'), 2000);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('clearing'), 100);
    } else {
      timer = setTimeout(() => { setShown(''); setIdx(0); setPhase('typing'); }, 350);
    }
    return () => clearTimeout(timer);
  }, [phase, idx, text]);

  return (
    <span>
      {shown}
      <span style={{ animation: 'tw-blink 0.65s step-start infinite', marginLeft: 1, opacity: phase === 'pause' ? 0 : 1 }}>|</span>
    </span>
  );
};

const Hero = ({ go, intensity }) => (
  <section className="hero wrap">
    <div className="hero-grid">
      <div>
        <span className="chip chip--yellow">⚡ Live Learning · Age 8–15 · Batch 1</span>
        <h1>
          <span className="bn" style={{ fontSize: "0.55em", color: "var(--orange)" }}>
            <TypeWriter text="চলো শিখি —" speed={90}/>
          </span><br/>
          Where <span className="strike">Boring</span> <br/>
          <span className="pop">Study</span> ends &<br/>
          Real Skills begin.
        </h1>
        <p className="lead">
          One unique program. Seven live classes a month. Chess, AI, Robotics, Coding, Public Speaking and more — taught the way kids actually learn: by playing, building, and breaking things on purpose.
        </p>
        <div className="hero-ctas">
          <button className="btn btn--orange btn--lg" onClick={() => go("pricing")}>
            Start Parallel Study
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          <button className="btn btn--ghost btn--lg" onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}>
            See Course Tracks
          </button>
        </div>
      </div>
      <Hero3DScene intensity={intensity}/>
    </div>
  </section>
);

const Strip = () => (
  <div className="strip">
    <div className="strip-track">
      <span>
        <span>♟ CHESS MASTERY</span><span className="dot">●</span>
        <span>🤖 BUILD A ROBOT</span><span className="dot">●</span>
        <span>🧠 AI FOR KIDS</span><span className="dot">●</span>
        <span>💻 CODE YOUR GAME</span><span className="dot">●</span>
        <span>🎤 PUBLIC SPEAKING</span><span className="dot">●</span>
        <span>💡 YOUNG ENTREPRENEUR</span><span className="dot">●</span>
        <span>🎨 CREATIVE LAB</span><span className="dot">●</span>
      </span>
      <span aria-hidden="true">
        <span>♟ CHESS MASTERY</span><span className="dot">●</span>
        <span>🤖 BUILD A ROBOT</span><span className="dot">●</span>
        <span>🧠 AI FOR KIDS</span><span className="dot">●</span>
        <span>💻 CODE YOUR GAME</span><span className="dot">●</span>
        <span>🎤 PUBLIC SPEAKING</span><span className="dot">●</span>
        <span>💡 YOUNG ENTREPRENEUR</span><span className="dot">●</span>
        <span>🎨 CREATIVE LAB</span><span className="dot">●</span>
      </span>
    </div>
  </div>
);

const PROGRAMS = [
  { e: "🧠", t: "Smart Thinking & Brain Skills", d: "Puzzles, memory hacks, strategy games. Build the IQ muscle.", tags: ["Logic", "Memory", "Strategy"], c: "bg-yellow" },
  { e: "♟️", t: "Chess Mastery Program", d: "Openings to endgames + monthly online tournaments.", tags: ["Beginner→Pro", "Tournaments"], c: "bg-mint" },
  { e: "🤖", t: "Robotics & DIY Engineering", d: "Arduino, sensors, motors. Build a real line-follower robot.", tags: ["Arduino", "Hardware"], c: "bg-orange" },
  { e: "💻", t: "Coding & App Development", d: "Scratch → Python → ship a game or simple app.", tags: ["Scratch", "Python", "Web"], c: "bg-berry" },
  { e: "🤖", t: "AI for Kids", d: "Chatbots, image gen, ethics. Build your own AI assistant.", tags: ["Chatbot", "Ethics"], c: "bg-yellow" },
  { e: "🎮", t: "Game Design & Creativity", d: "Story, characters, logic. Launch your own mini game.", tags: ["2D Games", "Story"], c: "bg-mint" },
  { e: "🎤", t: "Communication & Confidence", d: "Public speaking, debate, storytelling, presentation.", tags: ["Speak", "Debate"], c: "bg-orange" },
  { e: "💡", t: "Young Entrepreneur", d: "From idea → pitch. Marketing, money, mindset.", tags: ["Pitch", "Business"], c: "bg-berry" },
  { e: "🌍", t: "Future Skills & Real-Life Learning", d: "Digital literacy, internet safety, time management.", tags: ["Life-ready"], c: "bg-yellow" },
];

const Programs = () => (
  <section className="section wrap" id="programs" style={{ position: "relative" }}>
    <DoodleArrow className="doodle" style={{ position: "absolute", top: 50, left: 40, width: 80, transform: "rotate(20deg)" }} color="#22C9A8"/>
    <div className="section-head">
      <span className="chip chip--orange" style={{ color: "white" }}>10 Tracks · One Program</span>
      <h2>What kids actually <span style={{ color: "var(--orange)" }}>learn</span> with us</h2>
      <p>One Parallel Study subscription unlocks all of these. Rotating monthly themes so curiosity never sleeps.</p>
    </div>
    <div className="programs">
      {PROGRAMS.map((p, i) => (
        <div className={`prog-card ${p.c}`} key={i}>
          <div className="emoji">{p.e}</div>
          <h3>{p.t}</h3>
          <p>{p.d}</p>
          <div className="tags">
            {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Levels = () => (
  <section className="section" id="levels" style={{ background: "var(--ink)", color: "var(--cream)" }}>
    <div className="wrap">
      <div className="section-head">
        <span className="chip chip--yellow">Program Structure</span>
        <h2 style={{ color: "var(--cream)" }}>Three levels.<br/>One <span style={{ color: "var(--orange)" }}>parallel</span> journey.</h2>
        <p style={{ color: "rgba(255,253,247,0.7)" }}>Kids progress from explorer to innovator — no race, no comparison, just their own path.</p>
      </div>
      <div className="levels">
        {[
          { n: "01", name: "Explorer", age: "Age 8–10", color: "var(--yellow)", desc: "First taste of code, chess, and curiosity. Story-led lessons. No homework, only adventures.", inc: ["Live classes (7/mo)", "Mini-projects", "Gamified challenges", "Final showcase"] },
          { n: "02", name: "Creator", age: "Age 11–13", color: "var(--orange)", desc: "Make stuff for real. Build games, robots, chatbots. Compete in monthly tournaments.", inc: ["Deeper modules", "Real Arduino kit projects", "Monthly tournaments", "Community badges"] },
          { n: "03", name: "Innovator", age: "Age 14–15", color: "var(--mint)", desc: "Lead. Pitch. Ship. Final real-world capstone with mentor reviews.", inc: ["Advanced AI/Robotics", "Capstone project", "Mentor reviews", "Certificate + portfolio"] },
        ].map((l) => (
          <div className="level-card" key={l.n} style={{ background: l.color, color: "var(--ink)" }}>
            <div className="lvl-num" style={{ background: "var(--paper)" }}>{l.n}</div>
            <div className="hand" style={{ fontSize: 28, color: "var(--ink)", marginBottom: 4 }}>Level {l.n}</div>
            <h3 style={{ fontFamily: "Bricolage Grotesque", fontSize: 32, margin: "0 0 4px" }}>{l.name}</h3>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, marginBottom: 14, opacity: 0.7 }}>{l.age}</div>
            <p style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>{l.desc}</p>
            <div style={{ borderTop: "2px dashed var(--ink)", paddingTop: 14 }}>
              {l.inc.map((x) => (
                <div key={x} style={{ fontSize: 13, padding: "4px 0", display: "flex", gap: 8 }}>
                  <span>✓</span><span>{x}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = ({ go }) => (
  <section className="section wrap">
    <div className="section-head">
      <span className="chip chip--mint">How it works</span>
      <h2>From <span className="bn" style={{ color: "var(--orange)" }}>সাইন আপ</span> to first class — in 4 steps</h2>
    </div>
    <div className="steps">
      {[
        { n: "01", t: "Choose plan", d: "Pick 1, 3, 6 or 12 months. Bigger plans = bigger discount." },
        { n: "02", t: "Pay via bKash", d: "Send Money to 01781838853, then submit your trxn ID." },
        { n: "03", t: "Get batch link", d: "We confirm within 24h, send Zoom link + community invite." },
        { n: "04", t: "Start parallel", d: "Live class on day 1 of next month. 7 classes × 2 hrs." },
      ].map((s) => (
        <div className="step" key={s.n}>
          <div className="step-num">{s.n}</div>
          <h4 style={{ fontFamily: "Bricolage Grotesque", fontSize: 20, margin: "10px 0 6px" }}>{s.t}</h4>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>{s.d}</p>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <button className="btn btn--orange btn--lg" onClick={() => go("pricing")}>See pricing →</button>
    </div>
  </section>
);

const Gamification = () => (
  <section className="section wrap">
    <div className="gami">
      <div>
        <span className="chip chip--orange" style={{ color: "white" }}>🎮 Gamification</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 56px)", lineHeight: 1, margin: "16px 0 18px" }}>
          Earn XP. <br/>Level up. <br/>Win <span style={{ color: "var(--orange)" }}>real</span> badges.
        </h2>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 }}>
          Every challenge gives XP. Every project earns a badge. Every month a leaderboard. Kids learn because they actually want to — not because we made them.
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div className="card-flat" style={{ padding: 16, minWidth: 140 }}>
            <div className="hand" style={{ fontSize: 22, color: "var(--orange)" }}>this week</div>
            <div className="display" style={{ fontSize: 36 }}>+340 <small style={{ fontSize: 14 }}>XP</small></div>
          </div>
          <div className="card-flat" style={{ padding: 16, minWidth: 140 }}>
            <div className="hand" style={{ fontSize: 22, color: "var(--mint)" }}>rank</div>
            <div className="display" style={{ fontSize: 36 }}>#12 <small style={{ fontSize: 14 }}>of 248</small></div>
          </div>
        </div>
      </div>
      <div className="badges-grid">
        {[
          { e: "♟️", n: "Grandmaster", c: "var(--yellow-soft)" },
          { e: "🤖", n: "Robot Builder", c: "var(--orange-soft)" },
          { e: "💻", n: "Code Wizard", c: "var(--mint-soft)" },
          { e: "🎤", n: "Storyteller", c: "#FFDAE6" },
          { e: "🧠", n: "Puzzle King", c: "var(--yellow-soft)" },
          { e: "🚀", n: "Innovator", c: "var(--mint-soft)" },
          { e: "🎨", n: "Creative", c: "var(--orange-soft)" },
          { e: "💡", n: "Founder", c: "#FFDAE6" },
          { e: "🏆", n: "Champion", c: "var(--yellow)" },
        ].map((b, i) => (
          <div className="badge-card" key={i} style={{ background: b.c }}>
            <div>
              <div className="b-emoji">{b.e}</div>
              <div className="b-name">{b.n}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Founder = () => (
  <section className="wrap" style={{ padding: "60px 0" }}>
    <div className="founder">
      <DoodleStars className="doodle" style={{ position: "absolute", top: 30, right: 50, width: 50 }} color="#FFD23F"/>
      <div className="founder-photo" style={{ padding: 0, background: 'var(--ink)', overflow: 'hidden' }}>
        <img src="founder.jpg" alt="Sadman Sadik"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', position: 'relative', zIndex: 2 }}
          onError={e => { e.target.style.display='none'; }}/>
      </div>
      <div>
        <div className="role">Founder</div>
        <p style={{ lineHeight: 1.7, fontSize: 16, color: "rgba(255,253,247,0.85)", marginBottom: 24, marginTop: 16 }}>
          I started No Study after seeing how traditional education turns curiosity into routine. Kids spend years memorizing answers, yet rarely learn how to build, think, or create for the modern world. No Study was born to change that — through hands-on projects, creativity, technology, and mentors who inspire exploration instead of pressure.
        </p>
        <div style={{ marginTop: 20, fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 18 }}>— Sadman Sadik</div>
        <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Engineer and Founder, No Study Academy</div>
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const [reviews, setReviews] = React.useState([]);
  React.useEffect(() => {
    nsApi.testimonials().then(setReviews).catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="section wrap">
      <div className="section-head">
        <span className="chip chip--yellow">Parents say</span>
        <h2>Real reviews from <span style={{ color: "var(--orange)" }}>real</span> parents</h2>
      </div>
      <div className="testimonials">
        {reviews.map((t, i) => (
          <div className="testimonial" key={t.id || i} style={{ background: t.bg_color || 'var(--yellow-soft)' }}>
            <div className="stars">★★★★★</div>
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>"{t.quote}"</p>
            <div className="who">
              <div className="avatar" style={{ background: "var(--paper)" }}>{t.avatar_initial || t.name?.[0] || '?'}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const FAQ = () => {
  const [open, setOpen] = React.useState(0);
  const items = [
    { q: "When do classes start?", a: "Every batch starts on the 1st day of the month. Once you pay, we lock your seat and send the Zoom link 48 hours before the start day." },
    { q: "What if my kid misses a class?", a: "Every class is recorded and lives in your dashboard forever. You also get notes and a re-watch challenge to reinforce the lesson." },
    { q: "Is this only in Bangla or English?", a: "Mentors teach in friendly Banglish — English for technical terms, Bangla for everything else. Kids feel comfortable in 5 minutes." },
    { q: "What's the refund policy?", a: "If you're unhappy after the first 2 classes, we refund the unused months. No questions asked, just a quick chat to learn how we can do better." },
    { q: "Do I need to buy any hardware?", a: "Only the Robotics track needs a kit (~৳1,500 one-time). All other tracks just need a laptop and Zoom." },
  ];
  return (
    <section className="section wrap">
      <div className="section-head">
        <span className="chip">FAQ</span>
        <h2>Quick answers, <span style={{ color: "var(--orange)" }}>no fluff</span></h2>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {items.map((it, i) => (
          <div key={i} className="card" style={{ padding: 20, marginBottom: 12, cursor: "pointer" }} onClick={() => setOpen(open === i ? -1 : i)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="display" style={{ fontSize: 20 }}>{it.q}</div>
              <div style={{ fontSize: 24, color: "var(--orange)", transform: open === i ? "rotate(45deg)" : "rotate(0)", transition: "transform .2s" }}>+</div>
            </div>
            {open === i && <p style={{ marginTop: 12, color: "var(--ink-soft)", lineHeight: 1.6, fontSize: 15 }}>{it.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

const FinalCTA = ({ go }) => (
  <section className="wrap" style={{ padding: "60px 0 100px" }}>
    <div style={{ background: "var(--orange)", borderRadius: 32, border: "2px solid var(--ink)", boxShadow: "var(--shadow-lg)", padding: "70px 50px", textAlign: "center", color: "white", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 30, left: 50 }}><DoodleStars color="#FFD23F"/></div>
      <div style={{ position: "absolute", bottom: 40, right: 60 }}><DoodleLoop color="#FFFDF7"/></div>
      <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, margin: 0, color: "white" }}>
        Ready for the <br/>parallel <span style={{ color: "var(--yellow)" }}>universe</span>?
      </h2>
      <p style={{ fontSize: 18, maxWidth: 540, margin: "20px auto 30px", opacity: 0.92 }}>
        Next batch starts on the 1st. Only 25 seats. Lock yours before they're gone.
      </p>
      <button className="btn btn--yellow btn--lg" onClick={() => go("pricing")}>
        Enroll for Parallel Study →
      </button>
    </div>
  </section>
);

const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    content: [
      { h: "Information We Collect", p: "When you enroll, we collect your child's name, age, parent name, phone number, and email address. Payment details (bKash transaction ID) are collected solely to verify your subscription." },
      { h: "How We Use Your Information", p: "We use your information to manage your subscription, send Zoom class links, share progress updates, and communicate about batch schedules. We never sell or share your data with third parties." },
      { h: "Data Storage", p: "All data is stored securely on servers located in Bangladesh. We retain your data for the duration of your subscription plus 12 months." },
      { h: "Children's Privacy", p: "No Study Academy is designed for children ages 8–15. Parents or guardians must create accounts on behalf of their children. We do not knowingly collect data directly from children." },
      { h: "Contact", p: "For any privacy concerns, email us at info.nostudy@gmail.com." },
    ]
  },
  terms: {
    title: "Terms of Service",
    content: [
      { h: "Enrollment", p: "Enrollment is confirmed only after manual payment verification by our team. We will contact you within 24 hours of submission." },
      { h: "Subscription Plans", p: "Plans are available for 1, 3, 6, or 12 months. Each plan includes 7 live classes per month across all enrolled course tracks." },
      { h: "Class Access", p: "Class recordings and materials are accessible through your student dashboard for the duration of your active subscription." },
      { h: "Batch Assignment", p: "Students are assigned to a batch based on age and level. Batch transfers may be requested once per subscription period subject to availability." },
      { h: "Conduct", p: "Students and parents agree to treat mentors and fellow students with respect during all live sessions. Disruptive behavior may result in removal without refund." },
      { h: "Changes to Service", p: "No Study Academy reserves the right to modify class schedules, mentors, or course content. Material changes will be communicated at least 7 days in advance." },
    ]
  },
  refunds: {
    title: "Refund Policy",
    content: [
      { h: "30-Day Satisfaction Guarantee", p: "If you are unsatisfied after attending the first 2 classes, contact us within the first month and we will refund all unused months — no questions asked." },
      { h: "How to Request a Refund", p: "Email info.nostudy@gmail.com with your registered email and transaction ID. Refunds are processed within 5–7 business days via bKash." },
      { h: "Partial Refunds", p: "For multi-month plans, refunds are calculated based on unused full months remaining. Partially used months are not refunded." },
      { h: "Non-Refundable Cases", p: "Refunds are not issued for missed classes, hardware kit purchases (Robotics track), or cancellations after the 30-day window without exceptional circumstances." },
      { h: "Exceptional Cases", p: "For medical emergencies or other exceptional circumstances, please contact us directly. We review these on a case-by-case basis." },
    ]
  }
};

const PolicyModal = ({ policy, onClose }) => {
  const data = POLICIES[policy];
  if (!data) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(14,20,48,0.6)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--paper)', borderRadius:20, border:'2px solid var(--ink)', boxShadow:'6px 6px 0 var(--ink)', maxWidth:620, width:'100%', maxHeight:'80vh', overflow:'auto', padding:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 className="display" style={{ fontSize:28, margin:0 }}>{data.title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:24, color:'var(--ink-soft)', lineHeight:1 }}>✕</button>
        </div>
        {data.content.map((s, i) => (
          <div key={i} style={{ marginBottom:18 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{s.h}</div>
            <p style={{ margin:0, fontSize:14, color:'var(--ink-soft)', lineHeight:1.65 }}>{s.p}</p>
          </div>
        ))}
        <div style={{ marginTop:24, fontSize:12, color:'var(--ink-soft)' }}>Last updated: April 2026 · No Study Academy</div>
      </div>
    </div>
  );
};

const Footer = ({ go }) => {
  const [policyOpen, setPolicyOpen] = React.useState(null);
  return (
    <footer className="footer">
      {policyOpen && <PolicyModal policy={policyOpen} onClose={() => setPolicyOpen(null)}/>}
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div>
              <img src="nostudy-logo.png" alt="No Study" style={{ height: 90, width: 'auto', display: 'block', mixBlendMode: 'screen' }}
                onError={e => { e.target.style.display='none'; }}/>
            </div>
            <p style={{ marginTop: 16, opacity: 0.7, lineHeight: 1.6, fontSize: 14 }}>
              A parallel education for kids 8–15. Live classes, real projects, no boring textbooks.
            </p>
          </div>
          <div>
            <h4>Program</h4>
            <a onClick={() => go("home")}>Parallel Study</a>
            <a onClick={() => go("pricing")}>Pricing</a>
            <a onClick={() => { go("home"); setTimeout(() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" }), 120); }}>Course tracks</a>
            <a onClick={() => { go("home"); setTimeout(() => document.getElementById("levels")?.scrollIntoView({ behavior: "smooth" }), 120); }}>Levels</a>
          </div>
          <div>
            <h4>Account</h4>
            <a onClick={() => go("dashboard")}>Student Dashboard</a>
            <a onClick={() => go("pay")}>Pay via bKash</a>
            <a onClick={() => go("admin")}>Admin Panel</a>
          </div>
          <div>
            <h4>Contact</h4>
            <div style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.9 }}>
              info.nostudy@gmail.com<br/>
              Dhaka, Bangladesh
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>No Study Academy All Rights Reserved.</div>
          <div style={{ display:'flex', gap:16 }}>
            <a style={{ cursor:'pointer', opacity:0.8 }} onClick={() => setPolicyOpen('privacy')}>Privacy</a>
            <span style={{ opacity:0.4 }}>·</span>
            <a style={{ cursor:'pointer', opacity:0.8 }} onClick={() => setPolicyOpen('terms')}>Terms</a>
            <span style={{ opacity:0.4 }}>·</span>
            <a style={{ cursor:'pointer', opacity:0.8 }} onClick={() => setPolicyOpen('refunds')}>Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const InstructorsPage = ({ go, auth, logout }) => {
  const [instructors, setInstructors] = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [err,         setErr]         = React.useState('');

  React.useEffect(() => {
    nsApi.instructors()
      .then(d => { setInstructors(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  return (
    <>
      <Nav go={go} auth={auth} logout={logout}/>
      <div className="wrap" style={{ paddingTop: 60, paddingBottom: 80, minHeight: '70vh' }}>
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="chip chip--orange" style={{ color: 'white' }}>Our Team</span>
          <h2>Meet the <span style={{ color: 'var(--orange)' }}>Instructors</span></h2>
          <p style={{ maxWidth: 560, margin: '0 auto' }}>Expert mentors who make learning hands-on, exciting, and meaningful for every kid.</p>
        </div>

        {err && <div style={{ background: 'var(--orange-soft)', border: '2px solid var(--orange)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>⚠ {err}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>Loading…
          </div>
        ) : instructors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👩‍🏫</div>
            <div style={{ fontFamily: 'Bricolage Grotesque', fontSize: 22, marginBottom: 8 }}>Instructors coming soon!</div>
            <p>We're building an amazing team. Check back shortly.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
            {instructors.map(inst => (
              <div key={inst.id} style={{ background: 'var(--paper)', borderRadius: 20, border: '2px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 200, background: 'var(--cream-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {inst.image_url ? (
                    <img src={inst.image_url} alt={inst.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  ) : (
                    <div style={{ fontSize: 64, opacity: 0.3 }}>👤</div>
                  )}
                </div>
                <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{inst.name}</div>
                  {inst.designation && (
                    <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600, marginBottom: 6 }}>{inst.designation}</div>
                  )}
                  {inst.specialization && (
                    <div style={{ fontSize: 12, marginBottom: 12 }}>
                      {inst.specialization.split(',').map(s => (
                        <span key={s} className="chip" style={{ fontSize: 11, padding: '3px 9px', marginRight: 6, marginBottom: 4, display: 'inline-block' }}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                  {inst.quote && (
                    <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1.5px dashed rgba(14,20,48,0.15)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55, fontStyle: 'italic' }}>
                      "{inst.quote}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer go={go}/>
    </>
  );
};

const Landing = ({ go, intensity, auth, logout }) => (
  <>
    <Nav go={go} auth={auth} logout={logout}/>
    <Hero go={go} intensity={intensity}/>
    <Strip/>
    <Programs/>
    <Levels/>
    <HowItWorks go={go}/>
    <Gamification/>
    <Founder/>
    <Testimonials/>
    <FAQ/>
    <FinalCTA go={go}/>
    <Footer go={go}/>
  </>
);

Object.assign(window, { Landing, Nav, Footer, InstructorsPage });
