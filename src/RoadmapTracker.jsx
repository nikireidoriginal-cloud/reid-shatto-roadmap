import { useState, useEffect } from "react";

const WORKSTREAMS = [
  {
    id: "legal",
    name: "Legal & Entity",
    color: "#2563eb",
    icon: "⚖️",
    urgency: "now",
    description: "File the LLC, get operational infrastructure in place. Zero dependency on model perfection.",
    milestones: [
      { id: "l1", label: "Find FL business attorney", target: "Feb 2026", done: false, notes: "Ask for recs in ETA / Searchfunder communities" },
      { id: "l2", label: "File LLC — Reid & Shatto Holdings", target: "Feb 2026", done: false, notes: "FL Sunbiz, check trademark availability" },
      { id: "l3", label: "EIN + business bank account", target: "Mar 2026", done: false, notes: "Chase Biz or Mercury" },
      { id: "l4", label: "Operating agreement drafted", target: "Mar 2026", done: false, notes: "Operator equity vesting structure baked in" },
      { id: "l5", label: "Insurance quotes (GL + WC)", target: "Mar 2026", done: false, notes: "Get 3 quotes, understand pool service requirements" },
      { id: "l6", label: "Trademark search — Reid & Shatto", target: "Mar 2026", done: false, notes: "" },
    ],
  },
  {
    id: "research",
    name: "Market Research",
    color: "#059669",
    icon: "🔍",
    urgency: "now",
    description: "Real-world validation that feeds your scenario builder. Prices, routes for sale, competitor gaps, zip-level demand.",
    milestones: [
      { id: "r1", label: "Scrape BizBuySell / pool route brokers — S. FL", target: "Feb 2026", done: false, notes: "What's the going rate per account? Per route?" },
      { id: "r2", label: "Competitor audit: top 20 by zip (Broward/Palm Beach)", target: "Mar 2026", done: false, notes: "Google Maps, Yelp — rating, review count, pricing signals" },
      { id: "r3", label: "Price validation: call 5-10 pool cos as 'customer'", target: "Mar 2026", done: false, notes: "Get real monthly service pricing by area" },
      { id: "r4", label: "Sister's market: Orange/Brevard pest control scan", target: "Mar 2026", done: false, notes: "Same playbook, different vertical" },
      { id: "r5", label: "Build target zip heatmap with real data", target: "Apr 2026", done: false, notes: "Feed into Market Research tab in app" },
      { id: "r6", label: "Talk to 2-3 pool route owners (buy-side diligence)", target: "Apr 2026", done: false, notes: "What do they wish they knew? Real churn #s?" },
    ],
  },
  {
    id: "strategy",
    name: "Strategic Architecture",
    color: "#d97706",
    icon: "🏗️",
    urgency: "next",
    description: "The big decisions: buy vs. build, capital allocation across verticals, sister partnership structure, operator pipeline.",
    milestones: [
      { id: "s1", label: "Buy vs. build decision matrix (pools)", target: "Mar 2026", done: false, notes: "Use scenario builder with REAL asking prices from research" },
      { id: "s2", label: "Capital allocation plan: how much for pools vs. pest vs. reserve", target: "Apr 2026", done: false, notes: "Model needs real inputs first" },
      { id: "s3", label: "Sister partnership structure — roles & equity", target: "Apr 2026", done: false, notes: "Orange County pest? Co-invest model?" },
      { id: "s4", label: "Trish operator agreement — term sheet draft", target: "Apr 2026", done: false, notes: "Use 5-year plan doc as starting point" },
      { id: "s5", label: "Decision gate: first acquisition target identified", target: "May 2026", done: false, notes: "This is the 'go' moment" },
      { id: "s6", label: "LOI on first route / business", target: "Jun 2026", done: false, notes: "" },
    ],
  },
  {
    id: "vendors",
    name: "Vendor & Tech Stack",
    color: "#7c3aed",
    icon: "🛠️",
    urgency: "later",
    description: "CRM, routing, billing, what you build vs. buy. Don't over-invest here until you have a route to run.",
    milestones: [
      { id: "v1", label: "Evaluate pool service CRMs (Skimmer, LMN, Jobber)", target: "Apr 2026", done: false, notes: "What do operators actually use?" },
      { id: "v2", label: "Route optimization — build vs. buy decision", target: "May 2026", done: false, notes: "Your strength, but don't gold-plate" },
      { id: "v3", label: "Billing/invoicing setup", target: "May 2026", done: false, notes: "Stripe? Square? CRM-integrated?" },
      { id: "v4", label: "Custom tech roadmap — what Reid & Shatto builds", target: "Jun 2026", done: false, notes: "Your competitive moat, but later" },
    ],
  },
  {
    id: "tool",
    name: "Modeling Tool",
    color: "#dc2626",
    icon: "📊",
    urgency: "ongoing",
    description: "The scenario builder is powerful. Keep iterating but don't let it become a substitute for real-world validation.",
    milestones: [
      { id: "t1", label: "Breakeven analysis — validate with real cost data", target: "Mar 2026", done: false, notes: "Stop tuning sliders, get real numbers in" },
      { id: "t2", label: "Market Research tab — connect to real data", target: "Apr 2026", done: false, notes: "The empty page needs to become the data entry point" },
      { id: "t3", label: "Pest control vertical model (for sister)", target: "Apr 2026", done: false, notes: "Adapt pool model — different unit economics" },
      { id: "t4", label: "Portfolio tab — multi-business roll-up view", target: "May 2026", done: false, notes: "This is the Reid & Shatto strategic view" },
      { id: "t5", label: "Operating Plan tab buildout", target: "Jun 2026", done: false, notes: "Connects scenario → actual ops plan" },
    ],
  },
];

const URGENCY_CONFIG = {
  now: { label: "DO NOW", bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  next: { label: "NEXT UP", bg: "#fffbeb", border: "#fcd34d", text: "#d97706" },
  later: { label: "CAN WAIT", bg: "#f0fdf4", border: "#86efac", text: "#059669" },
  ongoing: { label: "ONGOING", bg: "#eff6ff", border: "#93c5fd", text: "#2563eb" },
};

const FOCUS_ITEMS = [
  "Find a FL business attorney (ask in Searchfunder / ETA communities)",
  "File Reid & Shatto Holdings LLC on Sunbiz",
  "Scrape BizBuySell for pool routes in Broward + Palm Beach — get real asking prices",
  "Call 5 pool service companies as a potential customer — validate pricing",
];

function ProgressRing({ done, total, color, size = 48 }) {
  const pct = total === 0 ? 0 : done / total;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: 13, fontWeight: 700, fill: color }}
      >
        {done}/{total}
      </text>
    </svg>
  );
}

export default function RoadmapTracker() {
  const [streams, setStreams] = useState(WORKSTREAMS);
  const [expandedStream, setExpandedStream] = useState("legal");
  const [view, setView] = useState("streams"); // "streams" | "focus" | "timeline"
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  const toggleMilestone = (streamId, milestoneId) => {
    setStreams(prev => prev.map(s =>
      s.id === streamId
        ? { ...s, milestones: s.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m) }
        : s
    ));
  };

  const updateNote = (streamId, milestoneId, note) => {
    setStreams(prev => prev.map(s =>
      s.id === streamId
        ? { ...s, milestones: s.milestones.map(m => m.id === milestoneId ? { ...m, notes: note } : m) }
        : s
    ));
  };

  const totalDone = streams.reduce((a, s) => a + s.milestones.filter(m => m.done).length, 0);
  const totalAll = streams.reduce((a, s) => a + s.milestones.length, 0);

  const months = ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "32px 40px 24px",
        color: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, letterSpacing: 1,
          }}>RS</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.7 }}>
            Reid & Shatto Holdings
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 4px", letterSpacing: -0.5 }}>
          Business Launch Roadmap
        </h1>
        <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>
          {totalDone} of {totalAll} milestones complete
        </p>

        {/* Overall progress bar */}
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.1)", borderRadius: 100, height: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 100,
            background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
            width: `${totalAll === 0 ? 0 : (totalDone / totalAll) * 100}%`,
            transition: "width 0.5s ease",
          }} />
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {[
            { id: "focus", label: "🎯 This Week" },
            { id: "streams", label: "📋 Workstreams" },
            { id: "gantt", label: "📊 Gantt" },
            { id: "timeline", label: "📅 Timeline" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: view === t.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: view === t.id ? "white" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 40px 60px", maxWidth: 960, margin: "0 auto" }}>

        {/* FOCUS VIEW */}
        {view === "focus" && (
          <div>
            <div style={{
              background: "#fffbeb", border: "2px solid #fcd34d", borderRadius: 16,
              padding: "24px 28px", marginBottom: 24,
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#92400e", margin: "0 0 4px" }}>
                ⚠️ Honest Check-In
              </h2>
              <p style={{ fontSize: 15, color: "#78350f", margin: "8px 0 0", lineHeight: 1.6 }}>
                You're deep in the modeling tool because it's fun and you're great at it. But <strong>Streams 1 & 2 are the bottleneck</strong> — they require zero code and unblock everything else. The model gets 10x better once you feed it real prices, real asking rates, and real competitor data.
              </p>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 16px" }}>
              Top 4 Actions This Week
            </h2>
            {FOCUS_ITEMS.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "16px 20px", background: "white", borderRadius: 12,
                marginBottom: 8, border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "#2563eb", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                }}>{i + 1}</div>
                <span style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.5, paddingTop: 3 }}>{item}</span>
              </div>
            ))}

            <div style={{
              marginTop: 32, padding: "20px 24px", background: "white",
              borderRadius: 12, border: "1px solid #e2e8f0",
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#64748b", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Key Dependencies
              </h3>
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                <div>📊 <strong>Scenario Builder accuracy</strong> ← blocked by real market pricing data</div>
                <div>🏗️ <strong>Buy vs. build decision</strong> ← blocked by route broker pricing + LLC formation</div>
                <div>👩‍👩‍👧 <strong>Sister partnership structure</strong> ← blocked by pest control market research</div>
                <div>📝 <strong>Operator agreement</strong> ← blocked by attorney + operating agreement</div>
              </div>
            </div>
          </div>
        )}

        {/* STREAMS VIEW */}
        {view === "streams" && (
          <div>
            {streams.map(stream => {
              const done = stream.milestones.filter(m => m.done).length;
              const total = stream.milestones.length;
              const isExpanded = expandedStream === stream.id;
              const urg = URGENCY_CONFIG[stream.urgency];

              return (
                <div key={stream.id} style={{
                  background: "white", borderRadius: 16, marginBottom: 12,
                  border: isExpanded ? `2px solid ${stream.color}30` : "1px solid #e2e8f0",
                  boxShadow: isExpanded ? `0 4px 20px ${stream.color}10` : "0 1px 3px rgba(0,0,0,0.04)",
                  overflow: "hidden", transition: "all 0.2s",
                }}>
                  {/* Stream header */}
                  <div
                    onClick={() => setExpandedStream(isExpanded ? null : stream.id)}
                    style={{
                      padding: "20px 24px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 16,
                    }}
                  >
                    <ProgressRing done={done} total={total} color={stream.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{stream.icon}</span>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>{stream.name}</h3>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
                          padding: "3px 10px", borderRadius: 100,
                          background: urg.bg, color: urg.text, border: `1px solid ${urg.border}`,
                        }}>{urg.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", lineHeight: 1.4 }}>
                        {stream.description}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 20, color: "#94a3b8", transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}>▾</span>
                  </div>

                  {/* Milestones */}
                  {isExpanded && (
                    <div style={{ padding: "0 24px 20px" }}>
                      {stream.milestones.map((m, i) => (
                        <div key={m.id} style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 0",
                          borderTop: i === 0 ? `1px solid ${stream.color}15` : "1px solid #f1f5f9",
                        }}>
                          <div
                            onClick={() => toggleMilestone(stream.id, m.id)}
                            style={{
                              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                              border: m.done ? `2px solid ${stream.color}` : "2px solid #cbd5e1",
                              background: m.done ? stream.color : "white",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >
                            {m.done && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 600,
                              color: m.done ? "#94a3b8" : "#1e293b",
                              textDecoration: m.done ? "line-through" : "none",
                            }}>
                              {m.label}
                            </div>
                            {m.notes && editingNote !== m.id && (
                              <div
                                onClick={() => { setEditingNote(m.id); setNoteText(m.notes); }}
                                style={{
                                  fontSize: 12, color: "#94a3b8", marginTop: 3,
                                  cursor: "pointer", lineHeight: 1.4,
                                }}
                              >
                                {m.notes}
                              </div>
                            )}
                            {!m.notes && editingNote !== m.id && (
                              <div
                                onClick={() => { setEditingNote(m.id); setNoteText(""); }}
                                style={{ fontSize: 12, color: "#cbd5e1", marginTop: 3, cursor: "pointer" }}
                              >
                                + add note
                              </div>
                            )}
                            {editingNote === m.id && (
                              <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                                <input
                                  value={noteText}
                                  onChange={e => setNoteText(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") {
                                      updateNote(stream.id, m.id, noteText);
                                      setEditingNote(null);
                                    }
                                    if (e.key === "Escape") setEditingNote(null);
                                  }}
                                  autoFocus
                                  style={{
                                    flex: 1, fontSize: 12, padding: "4px 8px",
                                    border: "1px solid #cbd5e1", borderRadius: 6, outline: "none",
                                  }}
                                  placeholder="Add a note..."
                                />
                                <button
                                  onClick={() => { updateNote(stream.id, m.id, noteText); setEditingNote(null); }}
                                  style={{
                                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                                    border: "none", background: stream.color, color: "white",
                                    cursor: "pointer", fontWeight: 600,
                                  }}
                                >Save</button>
                              </div>
                            )}
                          </div>
                          <span style={{
                            fontSize: 12, color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}>
                            {m.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
                {ganttMonths.map((gm, i) => {
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
                            {ganttMonths.map((gm, gi) => (
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
                              title={m.notes || m.label}
                            >
                              <span style={{
                                fontSize: 11, fontWeight: 600,
                                color: m.done ? stream.color : "white",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                textDecoration: m.done ? "line-through" : "none",
                              }}>
                                {m.done ? "✓ " : isPast ? "⚠ " : ""}{m.target.split(" ")[0]}
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

        {/* TIMELINE VIEW */}
        {view === "timeline" && (
          <div>
            {months.map(month => {
              const items = streams.flatMap(s =>
                s.milestones
                  .filter(m => m.target === month)
                  .map(m => ({ ...m, streamName: s.name, streamColor: s.color, streamIcon: s.icon, streamId: s.id }))
              );
              if (items.length === 0) return null;
              return (
                <div key={month} style={{ marginBottom: 28 }}>
                  <h3 style={{
                    fontSize: 14, fontWeight: 800, color: "#64748b",
                    letterSpacing: 1, textTransform: "uppercase",
                    margin: "0 0 12px", paddingBottom: 8,
                    borderBottom: "2px solid #e2e8f0",
                  }}>
                    {month}
                  </h3>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 16px", background: "white", borderRadius: 10,
                      marginBottom: 6, border: "1px solid #e2e8f0",
                    }}>
                      <div
                        onClick={() => toggleMilestone(item.streamId, item.id)}
                        style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                          border: item.done ? `2px solid ${item.streamColor}` : "2px solid #cbd5e1",
                          background: item.done ? item.streamColor : "white",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {item.done && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: item.done ? "#94a3b8" : "#1e293b",
                        textDecoration: item.done ? "line-through" : "none",
                        flex: 1,
                      }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px",
                        borderRadius: 100, background: `${item.streamColor}15`,
                        color: item.streamColor,
                      }}>
                        {item.streamIcon} {item.streamName}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
