/* ===================== 3D SCENE COMPONENTS ===================== */
/* CSS-3D objects: Chess Knight, AI Cube, Robot, Book Stack, Doodles */

const ChessKnight = ({ size = 220 }) => (
  <svg viewBox="0 0 220 220" width={size} height={size} style={{ filter: "drop-shadow(8px 12px 0 rgba(14,20,48,0.18))" }}>
    <defs>
      <linearGradient id="kbody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1B2347"/>
        <stop offset="100%" stopColor="#0E1430"/>
      </linearGradient>
      <linearGradient id="kbase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD23F"/>
        <stop offset="100%" stopColor="#FF9E2C"/>
      </linearGradient>
    </defs>
    {/* base */}
    <ellipse cx="110" cy="200" rx="70" ry="10" fill="url(#kbase)" stroke="#0E1430" strokeWidth="3"/>
    <rect x="46" y="170" width="128" height="22" rx="8" fill="url(#kbase)" stroke="#0E1430" strokeWidth="3"/>
    {/* knight body */}
    <path d="M70 175 C 70 130 75 100 90 80 C 85 65 95 50 110 45 C 130 35 165 50 170 90 C 175 130 165 165 165 175 Z"
          fill="url(#kbody)" stroke="#0E1430" strokeWidth="3" strokeLinejoin="round"/>
    {/* mane */}
    <path d="M105 60 L 95 100 L 105 95 L 100 130 L 115 110 L 110 140"
          fill="none" stroke="#FFD23F" strokeWidth="3" strokeLinecap="round"/>
    {/* eye */}
    <circle cx="138" cy="85" r="4" fill="#FFD23F"/>
    {/* highlight */}
    <path d="M150 70 Q 165 90 162 120" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const AICube = ({ size = 140 }) => (
  <div className="cube" style={{ width: size, height: size }}>
    <div className="face f-front">AI</div>
    <div className="face f-back">ML</div>
    <div className="face f-right">{ '</>'}</div>
    <div className="face f-left">★</div>
    <div className="face f-top">∞</div>
    <div className="face f-bottom">↯</div>
  </div>
);

const Robot = ({ size = 180 }) => (
  <svg viewBox="0 0 200 220" width={size} height={size} style={{ filter: "drop-shadow(6px 10px 0 rgba(14,20,48,0.2))" }}>
    <defs>
      <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF7A50"/>
        <stop offset="100%" stopColor="#FF5B2E"/>
      </linearGradient>
    </defs>
    {/* antenna */}
    <line x1="100" y1="35" x2="100" y2="10" stroke="#0E1430" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="100" cy="8" r="6" fill="#FFD23F" stroke="#0E1430" strokeWidth="2.5">
      <animate attributeName="r" values="6;8;6" dur="1.4s" repeatCount="indefinite"/>
    </circle>
    {/* head */}
    <rect x="50" y="35" width="100" height="80" rx="18" fill="url(#rbody)" stroke="#0E1430" strokeWidth="3"/>
    {/* visor */}
    <rect x="62" y="55" width="76" height="34" rx="10" fill="#0E1430" stroke="#0E1430" strokeWidth="3"/>
    {/* eyes */}
    <circle cx="82" cy="72" r="6" fill="#22C9A8">
      <animate attributeName="r" values="6;3;6" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="118" cy="72" r="6" fill="#22C9A8">
      <animate attributeName="r" values="6;3;6" dur="3s" repeatCount="indefinite"/>
    </circle>
    {/* mouth */}
    <rect x="84" y="98" width="32" height="6" rx="3" fill="#FFD23F"/>
    {/* ears */}
    <rect x="38" y="60" width="14" height="28" rx="4" fill="#0E1430"/>
    <rect x="148" y="60" width="14" height="28" rx="4" fill="#0E1430"/>
    {/* neck */}
    <rect x="86" y="115" width="28" height="12" fill="#0E1430"/>
    {/* body */}
    <rect x="40" y="127" width="120" height="80" rx="14" fill="#FFD23F" stroke="#0E1430" strokeWidth="3"/>
    {/* chest screen */}
    <rect x="62" y="145" width="76" height="40" rx="8" fill="#FFFDF7" stroke="#0E1430" strokeWidth="2.5"/>
    <text x="100" y="171" textAnchor="middle" fill="#0E1430" fontSize="20" fontWeight="800" fontFamily="JetBrains Mono, monospace">{'<3'}</text>
    {/* buttons */}
    <circle cx="56" cy="200" r="4" fill="#22C9A8" stroke="#0E1430" strokeWidth="2"/>
    <circle cx="144" cy="200" r="4" fill="#FF5B2E" stroke="#0E1430" strokeWidth="2"/>
  </svg>
);

const BookStack = ({ size = 200 }) => (
  <svg viewBox="0 0 240 200" width={size} height={size * 0.83} style={{ filter: "drop-shadow(8px 10px 0 rgba(14,20,48,0.18))" }}>
    {/* book 1 */}
    <g transform="translate(20 130) rotate(-4)">
      <rect width="200" height="36" rx="4" fill="#22C9A8" stroke="#0E1430" strokeWidth="3"/>
      <rect x="6" y="6" width="188" height="24" rx="2" fill="none" stroke="#0E1430" strokeWidth="1.5"/>
      <text x="100" y="24" textAnchor="middle" fill="#0E1430" fontSize="13" fontWeight="800" fontFamily="Bricolage Grotesque">CHESS</text>
    </g>
    {/* book 2 */}
    <g transform="translate(30 90) rotate(3)">
      <rect width="180" height="36" rx="4" fill="#FFD23F" stroke="#0E1430" strokeWidth="3"/>
      <rect x="6" y="6" width="168" height="24" rx="2" fill="none" stroke="#0E1430" strokeWidth="1.5"/>
      <text x="90" y="24" textAnchor="middle" fill="#0E1430" fontSize="13" fontWeight="800" fontFamily="Bricolage Grotesque">ROBOTICS</text>
    </g>
    {/* book 3 */}
    <g transform="translate(40 50) rotate(-2)">
      <rect width="160" height="36" rx="4" fill="#FF5B2E" stroke="#0E1430" strokeWidth="3"/>
      <rect x="6" y="6" width="148" height="24" rx="2" fill="none" stroke="#0E1430" strokeWidth="1.5"/>
      <text x="80" y="24" textAnchor="middle" fill="#FFFDF7" fontSize="13" fontWeight="800" fontFamily="Bricolage Grotesque">AI 4 KIDS</text>
    </g>
    {/* apple */}
    <g transform="translate(155 14)">
      <circle cx="14" cy="20" r="14" fill="#E94B7B" stroke="#0E1430" strokeWidth="2.5"/>
      <path d="M14 8 Q 18 0 24 4" stroke="#0E1430" strokeWidth="2.5" fill="none"/>
      <ellipse cx="9" cy="14" rx="3" ry="2" fill="rgba(255,255,255,0.5)"/>
    </g>
  </svg>
);

const SparkBurst = ({ size = 80 }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} style={{ animation: "drift 3.5s ease-in-out infinite" }}>
    <g stroke="#FF5B2E" strokeWidth="3" strokeLinecap="round" fill="none">
      <line x1="40" y1="10" x2="40" y2="22"/>
      <line x1="40" y1="58" x2="40" y2="70"/>
      <line x1="10" y1="40" x2="22" y2="40"/>
      <line x1="58" y1="40" x2="70" y2="40"/>
      <line x1="20" y1="20" x2="28" y2="28"/>
      <line x1="52" y1="52" x2="60" y2="60"/>
      <line x1="60" y1="20" x2="52" y2="28"/>
      <line x1="28" y1="52" x2="20" y2="60"/>
    </g>
    <circle cx="40" cy="40" r="8" fill="#FFD23F" stroke="#0E1430" strokeWidth="2"/>
  </svg>
);

const DoodleArrow = ({ className = "", color = "#0E1430" }) => (
  <svg className={className} viewBox="0 0 100 60" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 30 Q 30 5 60 25 T 95 30"/>
    <path d="M85 22 L 95 30 L 87 40"/>
  </svg>
);

const DoodleStars = ({ className = "", color = "#FFD23F" }) => (
  <svg className={className} viewBox="0 0 60 60" fill={color} stroke="#0E1430" strokeWidth="1.5">
    <path d="M14 10 L 17 18 L 25 18 L 19 23 L 21 31 L 14 26 L 7 31 L 9 23 L 3 18 L 11 18 Z"/>
    <path d="M44 32 L 46 38 L 52 38 L 47 42 L 49 48 L 44 44 L 39 48 L 41 42 L 36 38 L 42 38 Z"/>
  </svg>
);

const DoodleLoop = ({ className = "", color = "#22C9A8" }) => (
  <svg className={className} viewBox="0 0 70 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
    <path d="M5 25 Q 15 5 30 25 Q 45 45 60 25"/>
  </svg>
);

const DoodleSquig = ({ className = "", color = "#FF5B2E" }) => (
  <svg className={className} viewBox="0 0 100 30" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
    <path d="M5 15 Q 15 5 25 15 T 45 15 T 65 15 T 95 15"/>
  </svg>
);

const Hero3DScene = ({ intensity = 1 }) => {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const sceneRef = React.useRef(null);

  React.useEffect(() => {
    const handle = (e) => {
      if (!sceneRef.current) return;
      const r = sceneRef.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const par = (depth) => ({
    transform: `translate3d(${mouse.x * depth * intensity}px, ${mouse.y * depth * intensity}px, 0) rotateY(${mouse.x * 4 * intensity}deg) rotateX(${-mouse.y * 4 * intensity}deg)`
  });

  return (
    <div className="scene" ref={sceneRef}>
      <div className="scene-floor"/>
      <div className="float3d f-knight" style={par(20)}>
        <div className="knight"><ChessKnight size={220}/></div>
      </div>
      <div className="float3d f-robot" style={par(30)}>
        <div className="robot"><Robot size={180}/></div>
      </div>
      <div className="float3d f-cube" style={par(40)}>
        <AICube size={140}/>
      </div>
      <div className="float3d f-book" style={par(15)}>
        <div className="bookstack"><BookStack size={200}/></div>
      </div>
      <div className="float3d f-spark" style={par(50)}>
        <SparkBurst size={70}/>
      </div>

      {/* Doodles */}
      <DoodleArrow className="doodle d-arrow1"/>
      <DoodleStars className="doodle d-stars"/>
      <DoodleLoop  className="doodle d-loop"/>
      <DoodleSquig className="doodle d-squig"/>
    </div>
  );
};

Object.assign(window, {
  Hero3DScene, ChessKnight, AICube, Robot, BookStack, SparkBurst,
  DoodleArrow, DoodleStars, DoodleLoop, DoodleSquig
});
