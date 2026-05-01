/* ===================== PRICING + PAYMENT ===================== */

const PLANS = [
  { id: "1", months: 1, price: 1000, oldPrice: 1000, save: 0, label: "Starter", desc: "Try the parallel universe.", featured: false },
  { id: "3", months: 3, price: 2700, oldPrice: 3000, save: 10, label: "Quarterly", desc: "Most parents start here.", featured: false },
  { id: "6", months: 6, price: 4800, oldPrice: 6000, save: 20, label: "Half-Year", desc: "Real progress, real projects.", featured: true },
  { id: "12", months: 12, price: 8400, oldPrice: 12000, save: 30, label: "Full Year", desc: "All 10 tracks, full journey.", featured: false },
];

const Pricing = ({ go, setSelectedPlan, auth, logout }) => (
  <>
    <Nav go={go} auth={auth} logout={logout}/>
    <section className="page-head wrap">
      <span className="chip chip--orange" style={{ color: "white" }}>One product · Parallel Study</span>
      <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 1, margin: "16px 0" }}>
        ৳1,000 / month. <br/><span style={{ color: "var(--orange)" }}>Bigger plan</span>, bigger discount.
      </h1>
      <p style={{ maxWidth: 600, margin: "0 auto", color: "var(--ink-soft)", fontSize: 17 }}>
        7 live Zoom classes a month · 2 hours each · batch of 25 · all 10 course tracks included.
      </p>
    </section>
    <section className="wrap" style={{ padding: "20px 0 80px" }}>
      <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {PLANS.map((p) => (
          <div className={`price-card ${p.featured ? "featured" : ""}`} key={p.id}>
            {p.featured && <div className="badge">★ MOST POPULAR</div>}
            <div className="hand" style={{ fontSize: 24, color: p.featured ? "var(--ink)" : "var(--orange)" }}>{p.label}</div>
            <div className="display" style={{ fontSize: 18, marginBottom: 8 }}>{p.months} {p.months === 1 ? "month" : "months"}</div>
            <div className="amt">৳{p.price.toLocaleString()}<small> total</small></div>
            {p.save > 0 && (
              <div style={{ marginTop: 6 }}>
                <span className="strike-old">৳{p.oldPrice.toLocaleString()}</span>{" "}
                <span className="save">save {p.save}%</span>
              </div>
            )}
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 10 }}>{p.desc}</p>
            <ul>
              <li>7 live Zoom classes / month</li>
              <li>All 10 course tracks</li>
              <li>Recorded classes + notes</li>
              <li>Community access</li>
              {p.months >= 3 && <li>Monthly tournaments</li>}
              {p.months >= 6 && <li>Mentor 1:1 (1×/mo)</li>}
              {p.months >= 12 && <li>Capstone certificate</li>}
            </ul>
            <button
              className={`btn ${p.featured ? "btn--orange" : "btn--ghost"}`}
              style={{ marginTop: "auto" }}
              onClick={() => { setSelectedPlan(p); go("pay"); }}
            >
              Choose {p.months}-month →
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 40, color: "var(--ink-soft)", fontSize: 14 }}>
        <span className="bn">পেমেন্ট bKash এ —</span> 01781838853 · Send Money only · We confirm within 24 hours.
      </div>
    </section>
    <Footer go={go}/>
  </>
);

const PayPage = ({ go, plan, auth, logout }) => {
  const selected = plan || PLANS[1];
  const [form, setForm] = React.useState({
    parent:    auth?.user?.name || "",
    student:   "",
    age:       "",
    phone:     "",
    email:     auth?.user?.email || "",
    senderNum: "",
    trxnId:    ""
  });
  const [step, setStep] = React.useState(1);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });


  const [submitErr, setSubmitErr] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [refId, setRefId] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSubmitErr('');
    setSubmitting(true);
    try {
      const res = await nsApi.submitPayment({
        parentName:  form.parent,
        studentName: form.student,
        age:         Number(form.age),
        phone:       form.phone,
        email:       form.email,
        senderNum:   form.senderNum,
        trxnId:      form.trxnId,
        planMonths:  selected.months,
        amount:      selected.price,
      });
      setRefId(res.refId);
      setStep(3);
    } catch (err) {
      setSubmitErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Nav go={go} auth={auth} logout={logout}/>
      <section className="wrap" style={{ padding: "60px 0 100px" }}>
        <div style={{ marginBottom: 28 }}>
          <a onClick={() => go("pricing")} style={{ color: "var(--ink-soft)", cursor: "pointer", fontSize: 14 }}>← Back to plans</a>
        </div>

        {step === 3 ? (
          <div className="card" style={{ maxWidth: 640, margin: "0 auto", padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <h2 className="display" style={{ fontSize: 36, margin: "10px 0" }}>Submitted!</h2>
            <p style={{ color: "var(--ink-soft)" }}>We'll verify your bKash payment and confirm your seat within 24 hours. Check your email for login credentials once approved.</p>
            <div className="card-flat" style={{ padding: 20, margin: "24px 0", textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Reference ID</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{refId}</div>
              <div style={{ marginTop: 14, fontSize: 14 }}>
                Plan: <strong>{selected.months} months · ৳{selected.price}</strong><br/>
                Student: <strong>{form.student || "—"}</strong><br/>
                Trxn ID: <strong className="mono">{form.trxnId || "—"}</strong>
              </div>
            </div>
            <button className="btn btn--orange" onClick={() => go("login")}>Sign in when approved →</button>
          </div>
        ) : (
          <div className="pay-grid">
            <div>
              <h1 className="display" style={{ fontSize: 40, margin: "0 0 8px" }}>Complete payment</h1>
              <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>
                Plan: <strong>{selected.label} · {selected.months} months · ৳{selected.price.toLocaleString()}</strong>
              </p>

              <form onSubmit={submit} className="card" style={{ padding: 28 }}>
                <h3 className="display" style={{ fontSize: 22, margin: "0 0 18px" }}>Student & Parent info</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="label">Parent name</label>
                    <input className="field" required value={form.parent} onChange={upd("parent")} placeholder="Rumana Khan"/>
                  </div>
                  <div>
                    <label className="label">Student name</label>
                    <input className="field" required value={form.student} onChange={upd("student")} placeholder="Aarav"/>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1.4fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="label">Age</label>
                    <input className="field" required type="number" min="8" max="15" value={form.age} onChange={upd("age")} placeholder="10"/>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="field" required value={form.phone} onChange={upd("phone")} placeholder="017XX XXXXXX"/>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="field" required type="email" value={form.email} onChange={upd("email")} placeholder="parent@example.com"/>
                  </div>
                </div>

                <div style={{ borderTop: "2px dashed var(--ink)", margin: "20px 0", paddingTop: 18 }}>
                  <h3 className="display" style={{ fontSize: 22, margin: "0 0 6px" }}>bKash transaction</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 0 }}>Send <strong>৳{selected.price.toLocaleString()}</strong> to <strong>01781838853</strong>, then enter the details below.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <label className="label">Sender bKash number</label>
                    <input className="field" required value={form.senderNum} onChange={upd("senderNum")} placeholder="017XX XXXXXX"/>
                  </div>
                  <div>
                    <label className="label">Transaction ID</label>
                    <input className="field mono" required value={form.trxnId} onChange={upd("trxnId")} placeholder="9A8B7C6D5E"/>
                  </div>
                </div>
                {submitErr && (
                  <div style={{ background: "var(--orange-soft)", border: "2px solid var(--orange)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>
                    ⚠ {submitErr}
                  </div>
                )}
                <button type="submit" className="btn btn--orange btn--lg" style={{ width: "100%" }} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit payment proof →"}
                </button>
              </form>
            </div>

            <div>
              <div className="bkash-box">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, background: "white", borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 800, color: "#E2136E" }}>b</div>
                  <strong style={{ fontSize: 18 }}>bKash · Send Money</strong>
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Pay using personal bKash app</div>
                <div className="num">01781838853</div>
                <div style={{ fontSize: 24, fontFamily: "Bricolage Grotesque", fontWeight: 800, textAlign: "center", marginBottom: 14 }}>
                  Amount: ৳{selected.price.toLocaleString()}
                </div>
                <ol className="steps-list">
                  <li>Open bKash → Send Money</li>
                  <li>Enter <strong>01781838853</strong> as recipient</li>
                  <li>Type amount: <strong>৳{selected.price}</strong></li>
                  <li>Confirm with bKash PIN</li>
                  <li>Copy the <strong>Transaction ID</strong> from confirmation SMS</li>
                  <li>Paste it in the form ←</li>
                </ol>
              </div>

              <div className="card" style={{ padding: 20, marginTop: 18 }}>
                <div className="hand" style={{ fontSize: 22, color: "var(--orange)" }}>important</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)" }}>
                  <li>Use <strong>Send Money</strong>, not Cash Out.</li>
                  <li>Your seat is locked once we verify (within 24h).</li>
                  <li>Wrong trxn ID? Email us with screenshot.</li>
                  <li>Refunds available within first 2 classes.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer go={go}/>
    </>
  );
};

Object.assign(window, { Pricing, PayPage, PLANS });
