import { useState, useEffect, useCallback, useRef } from "react";

// ============ GAME CONFIG ============
const XP_PER_MILESTONE = 50;

const ACHIEVEMENTS = [
  { id: "first_move", title: "First Move", desc: "Complete your first milestone", icon: "🚀", check: (s) => s.totalDone >= 1 },
  { id: "legal_eagle", title: "Legal Eagle", desc: "Complete all Legal & Entity milestones", icon: "⚖️", check: (s) => s.streamDone.legal === s.streamTotal.legal },
  { id: "boots_on_ground", title: "Boots on the Ground", desc: "Complete all This Week milestones", icon: "🥾", check: (s) => s.streamDone.immediate === s.streamTotal.immediate },
  { id: "streak_3", title: "On a Roll", desc: "Complete 3 milestones in one session", icon: "🔥", check: (s) => s.sessionDone >= 3 },
  { id: "streak_5", title: "Unstoppable", desc: "Complete 5 milestones in one session", icon: "⚡", check: (s) => s.sessionDone >= 5 },
  { id: "half_way", title: "Halfway There", desc: "Complete 50% of all milestones", icon: "🏔️", check: (s) => s.totalDone >= s.totalAll / 2 },
  { id: "real_numbers", title: "Reality Check", desc: "Calibrate cost-per-stop + update financial model", icon: "📞", check: (s) => s.milestoneDone.sl1 && s.milestoneDone.sl4 },
  { id: "launch_ready", title: "Launch Ready", desc: "Complete all Ops & Marketing milestones", icon: "🧠", check: (s) => s.streamDone.ops === s.streamTotal.ops && s.streamDone.marketing === s.streamTotal.marketing },
  { id: "full_clear", title: "Reid & Shatto is Real", desc: "Complete every milestone", icon: "🏆", check: (s) => s.totalDone === s.totalAll },
];

const WORKSTREAMS = [
  {
    id: "immediate", name: "This Week", color: "#dc2626", icon: "🔥", urgency: "now",
    xpMultiplier: 2.0, priorityLabel: "Highest priority", priorityWhy: "These actions kick off everything — do them before anything else",
    description: "Legal kickoff, route search, team planning, market conversations.",
    milestones: [
      { id: "i1", label: "Retain FL business attorney", target: "Feb 2026", done: false, notes: "Call 3 attorneys Mon–Tue. Schedule consults same week. Need: LLC formation, operating agreement, pool service liability. Budget $2–5K. Try FL Bar Referral, Searchfunder.com recs." },
      { id: "i2", label: "Search routes for sale — Brevard / Space Coast", target: "Feb 2026", done: false, notes: "Check PoolRoutesForSale.com, BizBuySell.com, FL Swimming Pool Assoc classifieds. Post in local pool tech Facebook groups. Target: 15–30 accounts in Viera/Suntree area. Routes sell at 10–12x monthly." },
      { id: "i3", label: "Trish planning conversation", target: "Feb 2026", done: false, notes: "Discuss: (1) operator compensation structure, (2) CPO certification timeline (2 days), (3) can she start ride-alongs in March? (4) April 1 launch plan and timeline." },
      { id: "i4", label: "5-conversation test — call pool owners in Viera", target: "Feb 2026", done: false, notes: "Not a survey — just conversations. \"What do you pay? Happy? What would make you switch?\" Talk to neighbors, your mom's network, Nextdoor. This takes one afternoon and gives you real pricing + pain data." },
      { id: "i5", label: "Pool density scan — Viera satellite view", target: "Feb 2026", done: false, notes: "30 min on Google Earth: count pools per block in Viera subdivisions. Or use Nearmap/EagleView. This confirms route density and identifies the exact neighborhoods to target first." },
    ],
  },
  {
    id: "legal", name: "Legal & Entity", color: "#2563eb", icon: "⚖️", urgency: "now",
    xpMultiplier: 1.5, priorityLabel: "High priority", priorityWhy: "Unblocks everything — no business exists without this",
    description: "File LLC, get insurance, open accounts — attorney handles most of this.",
    milestones: [
      { id: "l1", label: "File LLC — Reid & Shatto Holdings", target: "Feb 2026", done: false, notes: "FL Sunbiz (dos.fl.gov/sunbiz). Attorney handles. Check trademark first. Takes 3–5 business days online." },
      { id: "l2", label: "EIN + business bank account", target: "Mar 2026", done: false, notes: "EIN: irs.gov (instant). Bank: Mercury.com for modern biz banking. Do this same day as LLC approval." },
      { id: "l3", label: "Operating agreement drafted", target: "Mar 2026", done: false, notes: "Must include: member roles, operator equity vesting (4yr w/ 1yr cliff?), profit distribution, exit provisions. Trish's role defined here." },
      { id: "l4", label: "Insurance — GL + Workers Comp", target: "Mar 2026", done: false, notes: "Get 3 quotes: Next Insurance, Thimble, local FL agent. Pool service needs both. Can't operate without this. Often approved same day online." },
      { id: "l5", label: "Business credit card", target: "Mar 2026", done: false, notes: "Apply after EIN + bank account. Chase Ink Preferred, Amex Blue Business Plus, or Brex. Build biz credit early." },
      { id: "l6", label: "Trademark search — Reid & Shatto", target: "Mar 2026", done: false, notes: "USPTO TESS search. Attorney files if clear. ~$250–350/class. Not a blocker for launch but start early." },
    ],
  },
  {
    id: "ops", name: "Ops & Training", color: "#059669", icon: "🛠️", urgency: "next",
    xpMultiplier: 1.0, priorityLabel: "Standard", priorityWhy: "Vehicle, equipment, Trish CPO cert — needed before first route",
    description: "Vehicle, equipment, Trish CPO cert, CRM setup, website live, tech app MVP.",
    milestones: [
      { id: "o1", label: "Trish — CPO Certification", target: "Mar 2026", done: false, notes: "2-day course + exam. Available online or in-person across FL. Register NOW for a March session. Not legally required for cleaning in FL, but essential for credibility + chemical knowledge." },
      { id: "o2", label: "Vehicle — used van/truck + wrap", target: "Mar 2026", done: false, notes: "Budget $15–25K for used cargo van. Wrap costs $2–3K for full. Wrapped vehicle = mobile billboard, zero permitting. This IS your marketing." },
      { id: "o3", label: "Equipment + chemical supply", target: "Mar 2026", done: false, notes: "Pool pole, skimmer, brush, vacuum, test kit, chemical kit. ~$2–5K startup. Source: Pool Supply World, SCP Distributors, local Pinch-A-Penny. Buy wholesale account." },
      { id: "o4", label: "CRM + billing setup", target: "Mar 2026", done: false, notes: "Skimmer (pool-specific) or Jobber (general field service). Don't over-build. Needs: route scheduling, invoicing, customer comms. Integrate Stripe for payments + ACH discount." },
      { id: "o5", label: "Website live — landing + online booking", target: "Mar 2026", done: false, notes: "Simple, modern, mobile-first. Online booking form, pricing tiers, \"instant quote\" CTA. Deploy to Cloudflare Pages. You can build this in a weekend with AI." },
      { id: "o6", label: "Google Business Profile + Local Services Ads", target: "Mar 2026", done: false, notes: "Create GBP immediately — takes 1–2 weeks to verify. Google Local Services Ads (pay-per-lead) is the highest-ROI ad spend for local service businesses. Budget $500–1K/mo to start." },
      { id: "o7", label: "Trish ride-alongs (if route acquired)", target: "Mar 2026", done: false, notes: "If you find a route to buy, Trish shadows the existing tech for 1 week minimum. Learns the pools, meets customers, calibrates real cost-per-stop data." },
      { id: "o8", label: "Tech App MVP — critical path", target: "Mar 2026", done: false, notes: "Must-have: tech check-in/check-out per stop, before/after photo capture (auto-timestamped), customer auto-notification (\"Your pool was serviced\"), basic service log (chemicals used, notes). Nice-to-have: route optimization/map view, water chemistry log, customer rating prompt. Build on React + Cloudflare. Target: working on 3–5 friendly pools before April 1 launch." },
      { id: "o9", label: "Test app on 3–5 friendly pools", target: "Mar 2026", done: false, notes: "Use mom's pool, neighbors, anyone willing. Real-world test of check-in flow, photo capture, and customer notification. Fix bugs before April 1 launch." },
    ],
  },
  {
    id: "marketing", name: "Marketing Blitz", color: "#d97706", icon: "🎯", urgency: "next",
    xpMultiplier: 1.0, priorityLabel: "Standard", priorityWhy: "Saturate Viera/Suntree before launch — every lead matters",
    description: "Yard signs, door hangers, Nextdoor, Google ads — saturate target neighborhoods.",
    milestones: [
      { id: "m1", label: "Door hanger campaign — Viera subdivisions", target: "Mar 2026", done: false, notes: "Print 1,000 door hangers ($150–200). Hit every door in target subdivisions. Include: QR code → online booking, \"first month 20% off\" launch offer, before/after photo promise. Cheapest lead gen." },
      { id: "m2", label: "Nextdoor + Facebook local groups", target: "Mar 2026", done: false, notes: "Post in Viera/Suntree/Rockledge Nextdoor. Join local Facebook groups. Don't hard-sell — introduce yourself, mention the tech-forward approach, offer a launch special. One good Nextdoor post can generate 5–10 leads." },
      { id: "m3", label: "Launch special: first month free or 20% off", target: "Mar 2026", done: false, notes: "Yes, this is a loss leader. But it gets you 10–15 accounts fast, generates before/after photos for marketing, and builds route density. Worth every penny." },
      { id: "m4", label: "Google Local Services Ads — go live", target: "Mar 2026", done: false, notes: "Should be verified by now. Turn on ads targeting: pool cleaning, pool service, pool maintenance in 32940, 32955 zip codes only. Start at $500/mo budget." },
      { id: "m5", label: "Yard signs — \"Pool service by R&S\"", target: "Mar 2026", done: false, notes: "Brevard allows yard signs on private property w/ homeowner permission. Ask every early customer: \"Can I leave a small sign for 2 weeks?\" Budget: $5/sign × 20 = $100. High visibility in subdivisions." },
    ],
  },
  {
    id: "launch", name: "Soft Launch", color: "#7c3aed", icon: "🚀", urgency: "later",
    xpMultiplier: 1.0, priorityLabel: "Standard", priorityWhy: "First real revenue — calibrate everything with real data",
    description: "First 10–20 accounts, calibrate costs, refine operations.",
    milestones: [
      { id: "sl1", label: "First 5 pools serviced — calibrate cost-per-stop", target: "Apr 2026", done: false, notes: "Track EVERYTHING: drive time, time on site, chemicals used, water test results. This is the #1 variable in your model. You need real data within the first week." },
      { id: "sl2", label: "Before/after photo system operational", target: "Apr 2026", done: false, notes: "Even if MVP — Trish takes 2 photos per pool, texts them to customer same day. Iterate to app later. This IS your differentiator from day 1." },
      { id: "sl3", label: "Target: 15–20 recurring accounts by end of April", target: "Apr 2026", done: false, notes: "Mix of: acquired route accounts (if available) + organic signups from marketing blitz + word of mouth. 15 accounts = ~1.5 full days/week of routes. Manageable for Trish while still learning." },
      { id: "sl4", label: "Update financial model with real data", target: "Apr 2026", done: false, notes: "Plug in actual: cost-per-stop, chemical costs, drive times, customer acquisition cost. Run break-even analysis with real numbers. This is where you go/no-go on scaling." },
    ],
  },
  {
    id: "scale", name: "Scale to 50+", color: "#0891b2", icon: "📈", urgency: "later",
    xpMultiplier: 0.8, priorityLabel: "Lower priority", priorityWhy: "Only after soft launch validates the model",
    description: "Expand zones, acquire route if available, hire tech #2.",
    milestones: [
      { id: "sc1", label: "Expand to Priority 2 zones: Merritt Island + beaches", target: "May 2026", done: false, notes: "Add 32953 (Merritt Island) and 32937 (Satellite Beach) to marketing. Door hangers + Google ads in new zips." },
      { id: "sc2", label: "Acquire small route if available (15–30 accounts)", target: "May 2026", done: false, notes: "Budget $30–50K. Instantly doubles customer base + provides route density. Trish absorbs accounts into existing schedule." },
      { id: "sc3", label: "Hire tech #2 (at 40+ accounts)", target: "Jun 2026", done: false, notes: "Trish maxes out at ~40 pools/week solo. Hire tech #2 before she's overwhelmed. Pay: $18–22/hr. Trish trains and supervises." },
      { id: "sc4", label: "Tech app v2 — customer portal + route optimization", target: "Jun 2026", done: false, notes: "Build on the MVP launched in Phase 2. Add: customer-facing portal (service history, upcoming schedule), route optimization algorithm, water chemistry trending, integration with CRM/billing. Consider whether to build or integrate with Skimmer." },
      { id: "sc5", label: "Target: 50 recurring accounts, $8–10K MRR", target: "Jun 2026", done: false, notes: "50 accounts × $170 avg (mix of tiers) = $8,500/mo recurring. At this level you're covering operator salary + beginning to cover overhead." },
    ],
  },
  {
    id: "peak", name: "Peak Season", color: "#be185d", icon: "👑", urgency: "later",
    xpMultiplier: 0.8, priorityLabel: "Lower priority", priorityWhy: "The payoff — but only if earlier phases are solid",
    description: "80–100 accounts, $15–20K MRR, start thinking acquisition #2.",
    milestones: [
      { id: "p1", label: "Target: 80–100 recurring accounts", target: "Sep 2026", done: false, notes: "Peak season = every pool owner is shopping. This is when your marketing and word-of-mouth compound. Push hard on referral bonuses ($50 credit per referral)." },
      { id: "p2", label: "$20K MRR milestone — recurring revenue empire begins", target: "Sep 2026", done: false, notes: "100 accounts × $200 avg = $20K MRR. At this point: business is cash-flow positive, fundable, and acquirable. Start scouting pest control vertical." },
      { id: "p3", label: "Board formation + governance", target: "Sep 2026", done: false, notes: "Once ops are stable and Trish is running day-to-day, Reid transitions to board/strategy role. This is the holdings company vision coming to life." },
    ],
  },
];

// Compute actual max from real data — Owner requires completing everything
const MAX_XP = WORKSTREAMS.reduce((sum, s) =>
  sum + s.milestones.length * Math.round(XP_PER_MILESTONE * s.xpMultiplier), 0
);

const LEVELS = [
  { level: 1, title: "Dreamer", xpNeeded: 0, emoji: "💭", desc: "You have a vision. Time to act on it." },
  { level: 2, title: "Researcher", xpNeeded: Math.round(MAX_XP * 0.10), emoji: "🔍", desc: "You're gathering real data — not just dreaming." },
  { level: 3, title: "Architect", xpNeeded: Math.round(MAX_XP * 0.25), emoji: "📐", desc: "Strategy is forming. The plan has shape." },
  { level: 4, title: "Builder", xpNeeded: Math.round(MAX_XP * 0.45), emoji: "🏗️", desc: "Deals are in motion. Infrastructure exists." },
  { level: 5, title: "Operator", xpNeeded: Math.round(MAX_XP * 0.70), emoji: "⚙️", desc: "A business is running. Revenue is flowing." },
  { level: 6, title: "Owner", xpNeeded: MAX_XP, emoji: "👑", desc: "Reid & Shatto Holdings is real. You own it." },
];

const URGENCY_CONFIG = {
  now: { label: "DO NOW", bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  next: { label: "NEXT UP", bg: "#fffbeb", border: "#fcd34d", text: "#d97706" },
  later: { label: "CAN WAIT", bg: "#f0fdf4", border: "#86efac", text: "#059669" },
  ongoing: { label: "ONGOING", bg: "#eff6ff", border: "#93c5fd", text: "#2563eb" },
};

function Confetti({ color }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const colors = [color, "#fbbf24", "#34d399", "#818cf8", "#fb7185", "#38bdf8"];
    particles.current = Array.from({ length: 60 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 16 - 4,
      size: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      life: 1,
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.vx *= 0.98;
        p.rotation += p.rotSpeed; p.life -= 0.013;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [color]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100 }} />;
}

function Toast({ message, visible, color }) {
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 100}px)`,
      background: "#1e293b", color: "white", padding: "14px 28px",
      borderRadius: 14, fontSize: 15, fontWeight: 700,
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      zIndex: 200, display: "flex", alignItems: "center", gap: 10,
      borderLeft: `4px solid ${color || "#3b82f6"}`,
    }}>{message}</div>
  );
}

function ProgressRing({ done, total, color, size = 48 }) {
  const pct = total === 0 ? 0 : done / total;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: 13, fontWeight: 700, fill: color }}>
        {done}/{total}
      </text>
    </svg>
  );
}

function XpBar({ xp, level, nextLevel, onClickPath }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{level.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Level {level.level}: {level.title}</span>
          <button onClick={onClickPath} style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
            background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)",
            border: "none", cursor: "pointer", letterSpacing: 0.3,
          }}>see full path</button>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
          {xp} / {MAX_XP} pts
        </span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 100, height: 14, overflow: "hidden", position: "relative" }}>
        {/* Level markers */}
        {LEVELS.slice(1).map(l => (
          <div key={l.level} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${(l.xpNeeded / MAX_XP) * 100}%`,
            width: 2, background: "rgba(255,255,255,0.15)", zIndex: 1,
          }} />
        ))}
        <div style={{
          height: "100%", borderRadius: 100,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
          width: `${(xp / MAX_XP) * 100}%`,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 0 16px rgba(139,92,246,0.5)",
          zIndex: 2, position: "relative",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          {level.desc}
        </div>
        {nextLevel && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {nextLevel.xpNeeded - xp} pts to {nextLevel.emoji} {nextLevel.title}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ PERSISTENCE ============
const API_URL = "/api/state";

function applyPersistedState(persisted) {
  if (!persisted || !persisted.milestones) return WORKSTREAMS;
  return WORKSTREAMS.map(s => ({
    ...s,
    milestones: s.milestones.map(m => {
      const saved = persisted.milestones[m.id];
      if (saved) return { ...m, done: saved.done, completedAt: saved.completedAt || null, notes: saved.notes ?? m.notes };
      return m;
    }),
  }));
}

function extractState(streams, achievements) {
  const milestones = {};
  streams.forEach(s => {
    s.milestones.forEach(m => {
      milestones[m.id] = { done: m.done, completedAt: m.completedAt || null, notes: m.notes };
    });
  });
  return { milestones, unlockedAchievements: achievements };
}

async function loadState() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return null;
    const data = await res.json();
    return Object.keys(data).length > 0 ? data : null;
  } catch { return null; }
}

async function saveState(streams, achievements) {
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extractState(streams, achievements)),
    });
  } catch { /* silently fail — state will persist next save */ }
}

export default function RoadmapTracker() {
  const [streams, setStreams] = useState(WORKSTREAMS);
  const [expandedStream, setExpandedStream] = useState("legal");
  const [view, setView] = useState("streams");
  const [toast, setToast] = useState({ message: "", visible: false, color: "" });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiColor, setConfettiColor] = useState("#3b82f6");
  const [sessionDoneIds, setSessionDoneIds] = useState(new Set());
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [xpAnim, setXpAnim] = useState(null);
  const [showXpInfo, setShowXpInfo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ganttCollapsed, setGanttCollapsed] = useState({});
  const toastTimer = useRef(null);
  const xpAnimTimer = useRef(null);
  const levelUpTimer = useRef(null);
  const achieveTimer = useRef(null);
  const achieveHideTimer = useRef(null);

  // Load persisted state on mount
  useEffect(() => {
    loadState().then(persisted => {
      if (persisted) {
        setStreams(applyPersistedState(persisted));
        if (persisted.unlockedAchievements) setUnlockedAchievements(persisted.unlockedAchievements);
      }
      setLoaded(true);
    });
  }, []);

  // Revalidate achievements after load — removes stale unlocks (e.g. session-based)
  useEffect(() => {
    if (!loaded) return;
    const currentStats = getStats(streams, 0);
    setUnlockedAchievements(prev => {
      const valid = prev.filter(id => {
        const a = ACHIEVEMENTS.find(ach => ach.id === id);
        return a && a.check(currentStats);
      });
      return valid.length !== prev.length ? valid : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Auto-save whenever streams or achievements change (skip initial load)
  useEffect(() => {
    if (!loaded) return;
    saveState(streams, unlockedAchievements);
  }, [streams, unlockedAchievements, loaded]);

  const calcXp = useCallback((s) => {
    let xp = 0;
    s.forEach(stream => {
      stream.milestones.forEach(m => {
        if (m.done) xp += Math.round(XP_PER_MILESTONE * stream.xpMultiplier);
      });
    });
    return xp;
  }, []);

  const getStats = useCallback((s, sessDone) => {
    const totalDone = s.reduce((a, st) => a + st.milestones.filter(m => m.done).length, 0);
    const totalAll = s.reduce((a, st) => a + st.milestones.length, 0);
    const streamDone = {}; const streamTotal = {}; const milestoneDone = {};
    s.forEach(st => {
      streamDone[st.id] = st.milestones.filter(m => m.done).length;
      streamTotal[st.id] = st.milestones.length;
      st.milestones.forEach(m => { milestoneDone[m.id] = m.done; });
    });
    return { totalDone, totalAll, streamDone, streamTotal, milestoneDone, sessionDone: sessDone };
  }, []);

  const xp = calcXp(streams);
  const currentLevel = [...LEVELS].reverse().find(l => xp >= l.xpNeeded) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.xpNeeded > xp) || null;
  const stats = getStats(streams, sessionDoneIds.size);

  const showToast = useCallback((message, color) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true, color });
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const fireConfetti = useCallback((color) => {
    setConfettiColor(color);
    setConfettiTrigger(prev => prev + 1);
  }, []);

  const toggleMilestone = (streamId, milestoneId) => {
    const stream = streams.find(s => s.id === streamId);
    const milestone = stream.milestones.find(m => m.id === milestoneId);
    const wasUndone = !milestone.done;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newStreams = streams.map(s =>
      s.id === streamId
        ? { ...s, milestones: s.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done, completedAt: wasUndone ? dateStr : null } : m) }
        : s
    );
    setStreams(newStreams);

    if (wasUndone) {
      const earnedXp = Math.round(XP_PER_MILESTONE * stream.xpMultiplier);
      const newSessionIds = new Set(sessionDoneIds).add(milestoneId);
      setSessionDoneIds(newSessionIds);
      const newSessionDone = newSessionIds.size;
      clearTimeout(xpAnimTimer.current);
      setXpAnim({ id: milestoneId, amount: earnedXp });
      xpAnimTimer.current = setTimeout(() => setXpAnim(null), 1200);

      const ptsLabel = earnedXp + " pts";
      const tag = stream.xpMultiplier >= 2 ? " — highest priority!" : stream.xpMultiplier >= 1.5 ? " — high priority!" : stream.xpMultiplier < 1 ? " — do the real-world stuff for more" : "";
      showToast(`+${ptsLabel}${tag}`, stream.color);
      fireConfetti(stream.color);

      const newXp = calcXp(newStreams);
      const newLevel = [...LEVELS].reverse().find(l => newXp >= l.xpNeeded);
      clearTimeout(levelUpTimer.current);
      if (newLevel && newLevel.level > currentLevel.level) {
        levelUpTimer.current = setTimeout(() => {
          showToast(`LEVEL UP → ${newLevel.emoji} ${newLevel.title}!`, "#8b5cf6");
          fireConfetti("#8b5cf6");
        }, 1500);
      }

      const newStats = getStats(newStreams, newSessionDone);
      clearTimeout(achieveTimer.current);
      clearTimeout(achieveHideTimer.current);
      achieveTimer.current = setTimeout(() => {
        ACHIEVEMENTS.forEach(a => {
          if (!unlockedAchievements.includes(a.id) && a.check(newStats)) {
            setUnlockedAchievements(prev => [...prev, a.id]);
            setShowAchievement(a);
            achieveHideTimer.current = setTimeout(() => setShowAchievement(null), 2000);
          }
        });
      }, 2000);
    } else {
      // Unchecking: cancel pending achievement timer, dismiss popup, and revoke achievements that no longer qualify
      clearTimeout(achieveTimer.current);
      clearTimeout(achieveHideTimer.current);
      setShowAchievement(null);
      const newSessionIds = new Set(sessionDoneIds);
      newSessionIds.delete(milestoneId);
      setSessionDoneIds(newSessionIds);

      const newStats = getStats(newStreams, newSessionIds.size);
      setUnlockedAchievements(prev => prev.filter(id => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return achievement && achievement.check(newStats);
      }));
    }
  };

  const updateNote = (streamId, milestoneId, note) => {
    setStreams(prev => prev.map(s =>
      s.id === streamId
        ? { ...s, milestones: s.milestones.map(m => m.id === milestoneId ? { ...m, notes: note } : m) }
        : s
    ));
  };


  if (!loaded) {
    return (
      <div style={{
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        background: "#0f172a", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 16, fontWeight: 600, opacity: 0.5,
      }}>Loading...</div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", position: "relative" }}>
      {confettiTrigger > 0 && <Confetti key={confettiTrigger} color={confettiColor} />}
      <Toast {...toast} />

      {showAchievement && (
        <div onClick={() => { clearTimeout(achieveHideTimer.current); setShowAchievement(null); }} style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#78350f",
          padding: "16px 32px", borderRadius: 16, zIndex: 300, cursor: "pointer",
          boxShadow: "0 10px 40px rgba(245,158,11,0.4)",
          animation: "slideDown 0.5s cubic-bezier(0.34,1.56,0.64,1)", textAlign: "center",
        }}>
          <div style={{ fontSize: 36 }}>{showAchievement.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Achievement Unlocked!</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{showAchievement.title}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{showAchievement.desc}</div>
        </div>
      )}

      {/* XP Info Modal */}
      {showXpInfo && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowXpInfo(false)}>
          <div style={{
            background: "white", borderRadius: 20, padding: "28px 32px", maxWidth: 500, width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>How Points Work</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
              Every milestone you complete earns points. The points are weighted by
              priority — real-world work that unblocks the business scores higher
              than modeling work you could do from your couch. This nudges you
              toward the stuff that actually matters.
            </p>

            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: "0 0 10px" }}>Point Weights by Stream</h3>
            {WORKSTREAMS.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.priorityWhy}</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 100,
                  background: `${s.color}12`, color: s.color,
                }}>{Math.round(XP_PER_MILESTONE * s.xpMultiplier)} pts each</span>
              </div>
            ))}

            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: "20px 0 10px" }}>Your Journey: Dreamer → Owner</h3>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 8, top: 4, bottom: 4, width: 2, background: "#e2e8f0" }} />
              {LEVELS.map((l) => {
                const reached = xp >= l.xpNeeded;
                const isCurrent = l.level === currentLevel.level;
                return (
                  <div key={l.level} style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
                    position: "relative",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 100, flexShrink: 0,
                      background: reached ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#e2e8f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginLeft: -10, zIndex: 1,
                      border: isCurrent ? "3px solid #8b5cf6" : "none",
                      boxShadow: isCurrent ? "0 0 0 3px rgba(139,92,246,0.2)" : "none",
                    }}>
                      {reached && <span style={{ color: "white", fontSize: 9, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 20 }}>{l.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: isCurrent ? 800 : 600,
                        color: reached ? "#1e293b" : "#94a3b8",
                      }}>
                        Level {l.level}: {l.title} {isCurrent && <span style={{ color: "#8b5cf6" }}>← you</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{l.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{l.xpNeeded} pts</span>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowXpInfo(false)} style={{
              width: "100%", marginTop: 16, padding: "10px", borderRadius: 10,
              border: "none", background: "#1e293b", color: "white",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Got it</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "24px 32px 18px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#3b82f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, letterSpacing: 1,
            }}>RS</div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.5 }}>Reid & Shatto Holdings</span>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 0", letterSpacing: -0.5 }}>Launch Roadmap</h1>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, opacity: 0.5 }}>{stats.totalDone}/{stats.totalAll} milestones</div>
            <div style={{ fontSize: 13 }}>
              <span style={{ opacity: 0.5 }}>Session: </span>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>{sessionDoneIds.size} done</span>
            </div>
          </div>
        </div>

        <XpBar xp={xp} level={currentLevel} nextLevel={nextLevel} onClickPath={() => setShowXpInfo(true)} />

        {/* Badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedAchievements.includes(a.id);
            return (
              <div key={a.id} title={`${a.title}${unlocked ? " — Earned!" : " — " + a.desc}`} style={{
                width: 34, height: 34, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, cursor: "default",
                background: unlocked ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.08)",
                border: unlocked ? "1.5px solid rgba(251,191,36,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
                opacity: unlocked ? 1 : 0.35,
                transition: "all 0.3s",
                filter: unlocked ? "none" : "grayscale(1)",
              }}>
                {unlocked ? a.icon : "🔒"}
              </div>
            );
          })}
          <span style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginLeft: 4,
          }}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {[
            { id: "streams", label: "📋 Streams" },
            { id: "gantt", label: "📊 Gantt" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: view === t.id ? "rgba(255,255,255,0.2)" : "transparent",
              color: view === t.id ? "white" : "rgba(255,255,255,0.45)",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 32px 80px", maxWidth: 960, margin: "0 auto" }}>

        {view === "streams" && streams.map(stream => {
          const done = stream.milestones.filter(m => m.done).length;
          const total = stream.milestones.length;
          const isExpanded = expandedStream === stream.id;
          const urg = URGENCY_CONFIG[stream.urgency];
          const isComplete = done === total;

          return (
            <div key={stream.id} style={{
              background: isComplete ? `${stream.color}06` : "white",
              borderRadius: 14, marginBottom: 10,
              border: isComplete ? `2px solid ${stream.color}35` : isExpanded ? `2px solid ${stream.color}20` : "1px solid #e2e8f0",
              boxShadow: isExpanded ? `0 4px 16px ${stream.color}08` : "0 1px 2px rgba(0,0,0,0.04)",
              overflow: "hidden", transition: "all 0.3s", position: "relative",
            }}>
              {isComplete && (
                <div style={{
                  position: "absolute", top: 10, right: 14, fontSize: 10, fontWeight: 800,
                  color: stream.color, letterSpacing: 1, textTransform: "uppercase",
                  background: `${stream.color}12`, padding: "3px 10px", borderRadius: 100,
                }}>DONE</div>
              )}
              <div onClick={() => setExpandedStream(isExpanded ? null : stream.id)}
                style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                <ProgressRing done={done} total={total} color={stream.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16 }}>{stream.icon}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>{stream.name}</h3>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                      padding: "2px 8px", borderRadius: 100,
                      background: urg.bg, color: urg.text, border: `1px solid ${urg.border}`,
                    }}>{urg.label}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                    }}>{Math.round(XP_PER_MILESTONE * stream.xpMultiplier)} pts/task</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4 }}>{stream.description}</p>
                </div>
                <span style={{
                  fontSize: 18, color: "#94a3b8", transition: "transform 0.2s",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}>▾</span>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 20px 16px" }}>
                  {stream.milestones.map((m, i) => (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 0", position: "relative",
                      borderTop: i === 0 ? `1px solid ${stream.color}12` : "1px solid #f1f5f9",
                    }}>
                      <div onClick={() => toggleMilestone(stream.id, m.id)} style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                        border: m.done ? `2px solid ${stream.color}` : "2px solid #cbd5e1",
                        background: m.done ? stream.color : "white",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {m.done && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600,
                          color: m.done ? "#94a3b8" : "#1e293b",
                          textDecoration: m.done ? "line-through" : "none",
                        }}>{m.label}</div>
                        {m.notes && editingNote !== m.id && (
                          <div onClick={() => { setEditingNote(m.id); setNoteText(m.notes); }}
                            style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, cursor: "pointer", lineHeight: 1.4 }}>
                            {m.notes}
                          </div>
                        )}
                        {!m.notes && editingNote !== m.id && (
                          <div onClick={() => { setEditingNote(m.id); setNoteText(""); }}
                            style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2, cursor: "pointer" }}>+ note</div>
                        )}
                        {editingNote === m.id && (
                          <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                            <input value={noteText} onChange={e => setNoteText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { updateNote(stream.id, m.id, noteText); setEditingNote(null); }
                                if (e.key === "Escape") setEditingNote(null);
                              }}
                              autoFocus style={{
                                flex: 1, fontSize: 12, padding: "4px 8px",
                                border: "1px solid #cbd5e1", borderRadius: 6, outline: "none",
                              }} placeholder="Add a note..." />
                            <button onClick={() => { updateNote(stream.id, m.id, noteText); setEditingNote(null); }}
                              style={{
                                fontSize: 11, padding: "4px 10px", borderRadius: 6,
                                border: "none", background: stream.color, color: "white",
                                cursor: "pointer", fontWeight: 600,
                              }}>Save</button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {xpAnim && xpAnim.id === m.id && (
                          <span style={{
                            fontSize: 13, fontWeight: 800, color: stream.color,
                            animation: "floatUp 1.2s ease-out forwards",
                          }}>+{xpAnim.amount}</span>
                        )}
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textAlign: "right" }}>
                          {m.completedAt ? <span style={{ color: "#059669", fontWeight: 600 }}>{m.completedAt}</span> : m.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* GANTT VIEW */}
        {view === "gantt" && (() => {
          const monthIndex = (m) => {
            const [mon, yr] = m.split(" ");
            const mi = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(mon);
            return parseInt(yr) * 12 + mi;
          };
          const allTargets = streams.flatMap(s => s.milestones.map(m => m.target));
          const allIndices = allTargets.map(monthIndex);
          const minIdx = Math.min(...allIndices);
          const maxIdx = Math.max(...allIndices);
          const ganttMonths = [];
          for (let i = minIdx; i <= maxIdx; i++) {
            const yr = Math.floor(i / 12);
            const mo = i % 12;
            const label = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo] + " " + yr;
            ganttMonths.push({ label, index: i });
          }
          const colCount = ganttMonths.length;
          const now = new Date();
          const nowIdx = now.getFullYear() * 12 + now.getMonth();
          const todayPct = nowIdx >= minIdx && nowIdx <= maxIdx
            ? ((nowIdx - minIdx) + (now.getDate() / 30)) / colCount * 100
            : null;

          const ROW_H = 56;
          const LABEL_W = 320;
          const COL_W = 180;

          return (
            <div style={{ overflowX: "auto" }}>
              {/* Month headers */}
              <div style={{
                display: "flex", marginLeft: LABEL_W, marginBottom: 0,
                borderBottom: "2px solid #e2e8f0",
              }}>
                {ganttMonths.map((gm) => {
                  const isCurrent = gm.index === nowIdx;
                  return (
                    <div key={gm.label} style={{
                      width: COL_W, minWidth: COL_W, flexShrink: 0,
                      textAlign: "center", fontSize: 13, fontWeight: 700,
                      color: isCurrent ? "#1e293b" : "#64748b",
                      letterSpacing: 0.5, textTransform: "uppercase",
                      padding: "12px 0",
                      background: isCurrent ? "#eff6ff" : "transparent",
                      borderRadius: isCurrent ? "8px 8px 0 0" : 0,
                    }}>{gm.label}</div>
                  );
                })}
              </div>

              {/* Workstream groups */}
              {streams.map((stream, si) => {
                const done = stream.milestones.filter(m => m.done).length;
                const total = stream.milestones.length;
                const isCollapsed = ganttCollapsed[stream.id];
                return (
                  <div key={stream.id} style={{ marginBottom: 4 }}>
                    {/* Group header — click to collapse/expand */}
                    <div
                      onClick={() => setGanttCollapsed(prev => ({ ...prev, [stream.id]: !prev[stream.id] }))}
                      style={{
                        display: "flex", alignItems: "center",
                        background: `${stream.color}0c`,
                        borderTop: si === 0 ? "none" : "1px solid #e2e8f0",
                        cursor: "pointer", userSelect: "none",
                      }}
                    >
                      <div style={{
                        width: LABEL_W, flexShrink: 0,
                        padding: "12px 16px",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", transition: "transform 0.2s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                        <span style={{ fontSize: 18 }}>{stream.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: stream.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {stream.name}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                          {done}/{total}
                        </span>
                      </div>
                      <div style={{ flex: 1 }} />
                    </div>

                    {/* Milestone rows */}
                    {!isCollapsed && stream.milestones.map((m, mi) => {
                      const mIdx = monthIndex(m.target);
                      const colIdx = mIdx - minIdx;
                      const isPast = mIdx < nowIdx && !m.done;
                      const xp = Math.round(XP_PER_MILESTONE * stream.xpMultiplier);
                      const tooltipLines = [m.label, `Target: ${m.target}  ·  ${xp} XP`, m.notes, m.completedAt ? `Done: ${m.completedAt}` : ""].filter(Boolean);
                      return (
                        <div key={m.id} style={{
                          display: "flex", alignItems: "stretch",
                          minHeight: ROW_H,
                          background: mi % 2 === 0 ? "white" : "#f8fafc",
                          borderBottom: "1px solid #f1f5f9",
                        }}>
                          {/* Milestone label — full readable text, wraps to 2 lines */}
                          <div
                            className="gantt-tooltip-wrap"
                            style={{
                              width: LABEL_W, flexShrink: 0,
                              padding: "8px 12px 8px 44px",
                              display: "flex", alignItems: "center", gap: 10,
                              position: "relative",
                            }}
                          >
                            <div
                              onClick={() => toggleMilestone(stream.id, m.id)}
                              style={{
                                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                border: m.done ? `2px solid ${stream.color}` : "2px solid #cbd5e1",
                                background: m.done ? stream.color : "white",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              {m.done && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{
                              fontSize: 13, fontWeight: 400, lineHeight: 1.4,
                              color: m.done ? "#94a3b8" : isPast ? "#dc2626" : "#334155",
                              textDecoration: m.done ? "line-through" : "none",
                            }}>
                              {m.label}
                            </span>
                            {/* Tooltip */}
                            <div className="gantt-tooltip" style={{
                              position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)",
                              background: "#1e293b", color: "white", padding: "10px 14px",
                              borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                              width: 280, zIndex: 100, pointerEvents: "none",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                              whiteSpace: "pre-wrap",
                            }}>
                              {tooltipLines.map((line, i) => (
                                <div key={i} style={{
                                  fontWeight: i === 0 ? 700 : 400,
                                  color: i === 0 ? "white" : "#cbd5e1",
                                  marginTop: i > 0 ? 4 : 0,
                                }}>{line}</div>
                              ))}
                            </div>
                          </div>

                          {/* Grid + bar */}
                          <div style={{ position: "relative", display: "flex", flex: 1 }}>
                            {ganttMonths.map((gm) => (
                              <div key={gm.label} style={{
                                width: COL_W, minWidth: COL_W, flexShrink: 0,
                                borderLeft: "1px solid #e8ecf0",
                                background: gm.index === nowIdx ? "#eff6ff30" : "transparent",
                              }} />
                            ))}

                            {/* Today line */}
                            {todayPct !== null && (
                              <div style={{
                                position: "absolute", top: 0, bottom: 0,
                                left: `${todayPct * COL_W * colCount / 100}px`, width: 2,
                                background: "#ef4444", zIndex: 2, opacity: 0.5,
                              }} />
                            )}

                            {/* The bar — clean colored block, no text */}
                            <div
                              className="gantt-tooltip-wrap"
                              onClick={() => toggleMilestone(stream.id, m.id)}
                              style={{
                                position: "absolute",
                                left: colIdx * COL_W + 6,
                                width: Math.max(COL_W - 12, 60),
                                top: "50%", transform: "translateY(-50%)", height: 28,
                                background: m.done
                                  ? `${stream.color}30`
                                  : isPast
                                    ? "#ef4444"
                                    : stream.color,
                                borderRadius: 6,
                                cursor: "pointer",
                                border: m.done ? `2px solid ${stream.color}60` : isPast ? "2px solid #dc2626" : "none",
                                boxShadow: m.done ? "none" : "0 1px 4px rgba(0,0,0,0.12)",
                              }}
                            >
                              {/* Tooltip */}
                              <div className="gantt-tooltip" style={{
                                position: "absolute", left: "50%", bottom: "calc(100% + 8px)", transform: "translateX(-50%)",
                                background: "#1e293b", color: "white", padding: "10px 14px",
                                borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                                width: 280, zIndex: 100, pointerEvents: "none",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                                whiteSpace: "pre-wrap",
                              }}>
                                {tooltipLines.map((line, i) => (
                                  <div key={i} style={{
                                    fontWeight: i === 0 ? 700 : 400,
                                    color: i === 0 ? "white" : "#cbd5e1",
                                    marginTop: i > 0 ? 4 : 0,
                                  }}>{line}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            </div>
          );
        })()}


      </div>

      <style>{`
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-30px); } }
        @keyframes slideDown { 0% { opacity: 0; transform: translateX(-50%) translateY(-20px); } 100% { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}
