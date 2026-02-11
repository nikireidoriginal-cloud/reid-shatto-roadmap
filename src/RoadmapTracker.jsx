import { useState, useEffect, useCallback, useRef } from "react";

// ============ GAME CONFIG ============
const XP_PER_MILESTONE = 50;

const ACHIEVEMENTS = [
  { id: "first_move", title: "First Move", desc: "Complete your first milestone", icon: "🚀", check: (s) => s.totalDone >= 1 },
  { id: "legal_eagle", title: "Legal Eagle", desc: "Complete all Legal & Entity milestones", icon: "⚖️", check: (s) => s.streamDone.legal === s.streamTotal.legal },
  { id: "boots_on_ground", title: "Boots on the Ground", desc: "Complete 3 Market Research milestones", icon: "🥾", check: (s) => s.streamDone.research >= 3 },
  { id: "streak_3", title: "On a Roll", desc: "Complete 3 milestones in one session", icon: "🔥", check: (s) => s.sessionDone >= 3 },
  { id: "streak_5", title: "Unstoppable", desc: "Complete 5 milestones in one session", icon: "⚡", check: (s) => s.sessionDone >= 5 },
  { id: "half_way", title: "Halfway There", desc: "Complete 50% of all milestones", icon: "🏔️", check: (s) => s.totalDone >= s.totalAll / 2 },
  { id: "real_numbers", title: "Reality Check", desc: "Complete price validation + competitor audit", icon: "📞", check: (s) => s.milestoneDone.r2 && s.milestoneDone.r3 },
  { id: "strategy_unlocked", title: "Strategist", desc: "Complete all 'DO NOW' streams", icon: "🧠", check: (s) => s.streamDone.legal === s.streamTotal.legal && s.streamDone.research === s.streamTotal.research },
  { id: "full_clear", title: "Reid & Shatto is Real", desc: "Complete every milestone", icon: "🏆", check: (s) => s.totalDone === s.totalAll },
];

const WORKSTREAMS = [
  {
    id: "legal", name: "Legal & Entity", color: "#2563eb", icon: "⚖️", urgency: "now",
    xpMultiplier: 1.5, priorityLabel: "High priority", priorityWhy: "Unblocks everything — no business exists without this",
    description: "File the LLC, get operational infrastructure in place.",
    milestones: [
      { id: "l1", label: "Research 3 FL business attorneys", target: "Feb 2026", done: false, notes: "Look for: LLC formation + M&A experience, SMB/search fund clients. Try: FL Bar Lawyer Referral (floridabar.org/lawyerreferral), Searchfunder.com forums, ETA community recs. Budget ~$2-5K for formation + operating agreement." },
      { id: "l1b", label: "Schedule consultations with top 2 picks", target: "Feb 2026", done: false, notes: "Most offer free 30-min consults. Ask about: LLC vs S-Corp, vesting structures for operator equity, pool service industry-specific liability, timeline to file." },
      { id: "l1c", label: "Retain attorney", target: "Feb 2026", done: false, notes: "Get engagement letter signed. Confirm they can handle: LLC filing, operating agreement, future asset purchase agreements." },
      { id: "l2", label: "File LLC — Reid & Shatto Holdings", target: "Mar 2026", done: false, notes: "FL Sunbiz (dos.fl.gov/sunbiz). Attorney should handle this. Check trademark availability first." },
      { id: "l3", label: "EIN + business bank account", target: "Mar 2026", done: false, notes: "EIN: irs.gov (instant online). Bank: Mercury (mercury.com) for modern biz banking, or Chase Business Complete." },
      { id: "l4", label: "Operating agreement drafted", target: "Mar 2026", done: false, notes: "Attorney drafts. Must include: member roles, operator equity vesting schedule (4yr w/ 1yr cliff?), profit distribution, exit provisions." },
      { id: "l5", label: "Insurance quotes (GL + WC)", target: "Mar 2026", done: false, notes: "Get 3 quotes. Try: Next Insurance (nextinsurance.com), Thimble, local FL agent. Pool service needs GL + Workers Comp." },
      { id: "l6", label: "Trademark search — Reid & Shatto", target: "Mar 2026", done: false, notes: "USPTO TESS search (tmsearch.uspto.gov). Attorney can file if clear. ~$250-350 per class." },
    ],
  },
  {
    id: "research", name: "Market Research", color: "#059669", icon: "🔍", urgency: "now",
    xpMultiplier: 2.0, priorityLabel: "Highest priority", priorityWhy: "Real data makes every other decision 10x better",
    description: "Real-world data that makes your scenario builder actually accurate.",
    milestones: [
      { id: "r1", label: "Scrape BizBuySell / route brokers — S. FL", target: "Feb 2026", done: false, notes: "What's the going rate per account?" },
      { id: "r2", label: "Competitor audit: top 20 by zip (Broward/PB)", target: "Mar 2026", done: false, notes: "Google Maps, Yelp — ratings, pricing signals" },
      { id: "r3", label: "Price validation: call 5-10 pool cos", target: "Mar 2026", done: false, notes: "Get real monthly pricing by area" },
      { id: "r4", label: "Sister's market: Orange/Brevard pest scan", target: "Mar 2026", done: false, notes: "Same playbook, different vertical" },
      { id: "r5", label: "Build target zip heatmap with real data", target: "Apr 2026", done: false, notes: "Feed into Market Research tab" },
      { id: "r6", label: "Talk to 2-3 pool route owners", target: "Apr 2026", done: false, notes: "Real churn #s, what they wish they knew" },
    ],
  },
  {
    id: "strategy", name: "Strategic Architecture", color: "#d97706", icon: "🏗️", urgency: "next",
    xpMultiplier: 1.0, priorityLabel: "Standard", priorityWhy: "Important but needs real data inputs first",
    description: "Buy vs. build, capital allocation, sister partnership, operator pipeline.",
    milestones: [
      { id: "s1", label: "Buy vs. build decision matrix (pools)", target: "Mar 2026", done: false, notes: "Use scenario builder with REAL asking prices" },
      { id: "s2", label: "Capital allocation plan across verticals", target: "Apr 2026", done: false, notes: "Model needs real inputs first" },
      { id: "s3", label: "Sister partnership — roles & equity", target: "Apr 2026", done: false, notes: "Orange County pest? Co-invest?" },
      { id: "s4", label: "Trish operator agreement — term sheet", target: "Apr 2026", done: false, notes: "5-year plan doc as starting point" },
      { id: "s5", label: "First acquisition target identified", target: "May 2026", done: false, notes: "The 'go' moment" },
      { id: "s6", label: "LOI on first route / business", target: "Jun 2026", done: false, notes: "" },
    ],
  },
  {
    id: "vendors", name: "Vendor & Tech Stack", color: "#7c3aed", icon: "🛠️", urgency: "later",
    xpMultiplier: 0.8, priorityLabel: "Lower priority", priorityWhy: "Don't need this until you have a route to run",
    description: "CRM, routing, billing. Don't over-invest until you have a route.",
    milestones: [
      { id: "v1", label: "Evaluate pool CRMs (Skimmer, Jobber, etc)", target: "Apr 2026", done: false, notes: "" },
      { id: "v2", label: "Route optimization — build vs. buy", target: "May 2026", done: false, notes: "" },
      { id: "v3", label: "Billing/invoicing setup", target: "May 2026", done: false, notes: "" },
      { id: "v4", label: "Custom tech roadmap for R&S", target: "Jun 2026", done: false, notes: "" },
    ],
  },
  {
    id: "tool", name: "Modeling Tool", color: "#dc2626", icon: "📊", urgency: "ongoing",
    xpMultiplier: 0.5, priorityLabel: "Lowest priority", priorityWhy: "Fun but seductive — real-world work moves the needle more",
    description: "Powerful but seductive. Lower points — real-world work scores higher.",
    milestones: [
      { id: "t1", label: "Breakeven — validate with real cost data", target: "Mar 2026", done: false, notes: "" },
      { id: "t2", label: "Market Research tab — real data", target: "Apr 2026", done: false, notes: "" },
      { id: "t3", label: "Pest control vertical model", target: "Apr 2026", done: false, notes: "" },
      { id: "t4", label: "Portfolio tab — multi-biz roll-up", target: "May 2026", done: false, notes: "" },
      { id: "t5", label: "Operating Plan tab buildout", target: "Jun 2026", done: false, notes: "" },
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

function Confetti({ active, color }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
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
  }, [active, color]);

  if (!active) return null;
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
          <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Lvl {level.level}: {level.title}</span>
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

export default function RoadmapTracker() {
  const [streams, setStreams] = useState(WORKSTREAMS);
  const [expandedStream, setExpandedStream] = useState("legal");
  const [view, setView] = useState("streams");
  const [toast, setToast] = useState({ message: "", visible: false, color: "" });
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiColor, setConfettiColor] = useState("#3b82f6");
  const [sessionDone, setSessionDone] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [xpAnim, setXpAnim] = useState(null);
  const [showXpInfo, setShowXpInfo] = useState(false);

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
  const stats = getStats(streams, sessionDone);

  const showToast = useCallback((message, color) => {
    setToast({ message, visible: true, color });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const fireConfetti = useCallback((color) => {
    setConfettiColor(color);
    setConfettiActive(false);
    requestAnimationFrame(() => setConfettiActive(true));
    setTimeout(() => setConfettiActive(false), 2500);
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
      const newSessionDone = sessionDone + 1;
      setSessionDone(newSessionDone);
      setXpAnim({ id: milestoneId, amount: earnedXp });
      setTimeout(() => setXpAnim(null), 1200);

      const ptsLabel = earnedXp + " pts";
      const tag = stream.xpMultiplier >= 2 ? " — highest priority!" : stream.xpMultiplier >= 1.5 ? " — high priority!" : stream.xpMultiplier < 1 ? " — do the real-world stuff for more" : "";
      showToast(`+${ptsLabel}${tag}`, stream.color);
      fireConfetti(stream.color);

      const newXp = calcXp(newStreams);
      const newLevel = [...LEVELS].reverse().find(l => newXp >= l.xpNeeded);
      if (newLevel && newLevel.level > currentLevel.level) {
        setTimeout(() => {
          showToast(`LEVEL UP → ${newLevel.emoji} ${newLevel.title}!`, "#8b5cf6");
          fireConfetti("#8b5cf6");
        }, 1500);
      }

      const newStats = getStats(newStreams, newSessionDone);
      setTimeout(() => {
        ACHIEVEMENTS.forEach(a => {
          if (!unlockedAchievements.includes(a.id) && a.check(newStats)) {
            setUnlockedAchievements(prev => [...prev, a.id]);
            setShowAchievement(a);
            setTimeout(() => setShowAchievement(null), 4000);
          }
        });
      }, 2000);
    }
  };

  const updateNote = (streamId, milestoneId, note) => {
    setStreams(prev => prev.map(s =>
      s.id === streamId
        ? { ...s, milestones: s.milestones.map(m => m.id === milestoneId ? { ...m, notes: note } : m) }
        : s
    ));
  };

  const months = ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", position: "relative" }}>
      <Confetti active={confettiActive} color={confettiColor} />
      <Toast {...toast} />

      {showAchievement && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#78350f",
          padding: "16px 32px", borderRadius: 16, zIndex: 300,
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
                        Lvl {l.level}: {l.title} {isCurrent && <span style={{ color: "#8b5cf6" }}>← you</span>}
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
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>{sessionDone} done</span>
            </div>
          </div>
        </div>

        <XpBar xp={xp} level={currentLevel} nextLevel={nextLevel} onClickPath={() => setShowXpInfo(true)} />

        <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
          {[
            { id: "streams", label: "📋 Streams" },
            { id: "gantt", label: "📊 Gantt" },
            { id: "timeline", label: "📅 Timeline" },
            { id: "achievements", label: `🏅 ${unlockedAchievements.length}/${ACHIEVEMENTS.length}` },
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

          const ROW_H = 36;
          const LABEL_W = 260;

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
                      flex: `0 0 ${100 / colCount}%`, minWidth: 140,
                      textAlign: "center", fontSize: 12, fontWeight: 700,
                      color: isCurrent ? "#1e293b" : "#94a3b8",
                      letterSpacing: 0.5, textTransform: "uppercase",
                      padding: "10px 0",
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
                return (
                  <div key={stream.id} style={{ marginBottom: 4 }}>
                    {/* Group header */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      background: `${stream.color}08`,
                      borderTop: si === 0 ? "none" : "1px solid #e2e8f0",
                    }}>
                      <div style={{
                        width: LABEL_W, flexShrink: 0,
                        padding: "10px 16px",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <span style={{ fontSize: 16 }}>{stream.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: stream.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {stream.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                          {done}/{total}
                        </span>
                      </div>
                      <div style={{ flex: 1 }} />
                    </div>

                    {/* Milestone rows */}
                    {stream.milestones.map((m, mi) => {
                      const mIdx = monthIndex(m.target);
                      const colIdx = mIdx - minIdx;
                      const isPast = mIdx < nowIdx && !m.done;
                      return (
                        <div key={m.id} style={{
                          display: "flex", alignItems: "center",
                          height: ROW_H,
                          background: mi % 2 === 0 ? "white" : "#fafbfc",
                          borderBottom: "1px solid #f1f5f9",
                        }}>
                          {/* Milestone label */}
                          <div style={{
                            width: LABEL_W, flexShrink: 0,
                            padding: "0 16px 0 44px",
                            display: "flex", alignItems: "center", gap: 8,
                            overflow: "hidden",
                          }}>
                            <div
                              onClick={() => toggleMilestone(stream.id, m.id)}
                              style={{
                                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                border: m.done ? `2px solid ${stream.color}` : "2px solid #cbd5e1",
                                background: m.done ? stream.color : "white",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              {m.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span
                              title={m.label}
                              style={{
                                fontSize: 12, fontWeight: 600, lineHeight: 1.3,
                                color: m.done ? "#94a3b8" : isPast ? "#dc2626" : "#334155",
                                textDecoration: m.done ? "line-through" : "none",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}
                            >
                              {m.label}
                            </span>
                          </div>

                          {/* Grid + bar */}
                          <div style={{ flex: 1, position: "relative", height: "100%", display: "flex" }}>
                            {ganttMonths.map((gm) => (
                              <div key={gm.label} style={{
                                flex: `0 0 ${100 / colCount}%`, minWidth: 140,
                                borderLeft: "1px solid #f1f5f9",
                                background: gm.index === nowIdx ? "#eff6ff40" : "transparent",
                              }} />
                            ))}

                            {/* Today line */}
                            {todayPct !== null && (
                              <div style={{
                                position: "absolute", top: 0, bottom: 0,
                                left: `${todayPct}%`, width: 2,
                                background: "#ef4444", zIndex: 2, opacity: 0.4,
                              }} />
                            )}

                            {/* The bar */}
                            <div style={{
                              position: "absolute",
                              left: `calc(${(colIdx / colCount) * 100}% + 8px)`,
                              width: `calc(${(1 / colCount) * 100}% - 16px)`,
                              top: 7, height: ROW_H - 14,
                              background: m.done
                                ? `${stream.color}25`
                                : isPast
                                  ? `linear-gradient(90deg, #ef4444, ${stream.color})`
                                  : stream.color,
                              borderRadius: 5,
                              cursor: "pointer",
                              display: "flex", alignItems: "center",
                              padding: "0 10px",
                              overflow: "hidden",
                              border: m.done ? `1.5px solid ${stream.color}50` : isPast ? "1.5px solid #fca5a5" : "none",
                              boxShadow: m.done ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
                            }}
                              onClick={() => toggleMilestone(stream.id, m.id)}
                              title={`${m.label}${m.notes ? "\n" + m.notes : ""}${m.completedAt ? "\nDone: " + m.completedAt : ""}`}
                            >
                              <span style={{
                                fontSize: 11, fontWeight: 600,
                                color: m.done ? stream.color : "white",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                textDecoration: m.done ? "line-through" : "none",
                              }}>
                                {m.done ? "✓ " : isPast ? "! " : ""}{m.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{
                display: "flex", gap: 24, marginTop: 20, padding: "12px 0",
                justifyContent: "center", fontSize: 12, color: "#64748b",
                borderTop: "1px solid #e2e8f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 10, borderRadius: 3, background: "#3b82f6", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }} />
                  On Track
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 10, borderRadius: 3, background: "linear-gradient(90deg, #ef4444, #3b82f6)" }} />
                  Overdue
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 10, borderRadius: 3, background: "#3b82f640", border: "1px solid #3b82f660" }} />
                  Complete
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 2, height: 14, background: "#ef4444", opacity: 0.5 }} />
                  Today
                </div>
              </div>
            </div>
          );
        })()}

        {view === "timeline" && months.map(month => {
          const items = streams.flatMap(s =>
            s.milestones.filter(m => m.target === month)
              .map(m => ({ ...m, streamName: s.name, streamColor: s.color, streamIcon: s.icon, streamId: s.id, xpMult: s.xpMultiplier }))
          );
          if (items.length === 0) return null;
          const monthDone = items.filter(i => i.done).length;
          return (
            <div key={month} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e2e8f0" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>{month}</h3>
                <span style={{ fontSize: 12, color: monthDone === items.length ? "#059669" : "#94a3b8", fontWeight: 600 }}>
                  {monthDone}/{items.length} {monthDone === items.length ? "✓" : ""}
                </span>
              </div>
              {items.map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", background: "white", borderRadius: 10,
                  marginBottom: 5, border: "1px solid #e2e8f0",
                }}>
                  <div onClick={() => toggleMilestone(item.streamId, item.id)} style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: item.done ? `2px solid ${item.streamColor}` : "2px solid #cbd5e1",
                    background: item.done ? item.streamColor : "white",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: item.done ? "#94a3b8" : "#1e293b",
                    textDecoration: item.done ? "line-through" : "none", flex: 1,
                  }}>{item.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 100, background: `${item.streamColor}12`, color: item.streamColor,
                  }}>{item.streamIcon} {item.streamName}</span>
                </div>
              ))}
            </div>
          );
        })}

        {view === "achievements" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {ACHIEVEMENTS.map(a => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <div key={a.id} style={{
                  background: unlocked ? "linear-gradient(135deg, #fffbeb, #fef3c7)" : "white",
                  border: unlocked ? "2px solid #fbbf24" : "1px solid #e2e8f0",
                  borderRadius: 14, padding: "18px",
                  opacity: unlocked ? 1 : 0.45, transition: "all 0.3s",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: unlocked ? "#92400e" : "#64748b" }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: unlocked ? "#a16207" : "#94a3b8", marginTop: 3 }}>{a.desc}</div>
                  {unlocked && <div style={{ fontSize: 10, fontWeight: 700, color: "#d97706", marginTop: 6, letterSpacing: 1 }}>UNLOCKED</div>}
                  {!unlocked && <div style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1", marginTop: 6 }}>Locked</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-30px); } }
        @keyframes slideDown { 0% { opacity: 0; transform: translateX(-50%) translateY(-20px); } 100% { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}
