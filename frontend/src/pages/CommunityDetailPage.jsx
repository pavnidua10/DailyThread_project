import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";


const TIERS = [
  { min: 85, label: "Authority",      color: "#7C3AED", bg: "#EDE9FE", icon: "◆" },
  { min: 70, label: "Verified Voice", color: "#0369A1", bg: "#E0F2FE", icon: "✦" },
  { min: 50, label: "Contributor",    color: "#065F46", bg: "#D1FAE5", icon: "●" },
  { min: 30, label: "Emerging",       color: "#92400E", bg: "#FEF3C7", icon: "○" },
  { min: 0,  label: "Newcomer",       color: "#6B7280", bg: "#F3F4F6", icon: "·" },
];
const BREAKDOWN_META = [
  { key: "articleQuality",   label: "Article quality",  max: 30 },
  { key: "sourceAccuracy",   label: "Source accuracy",  max: 25 },
  { key: "communityTrust",   label: "Community trust",  max: 20 },
  { key: "consistencyBonus", label: "Consistency",      max: 15 },
  { key: "debateScore",      label: "Debate quality",   max: 10 },
];
function getTier(score) { return TIERS.find((t) => score >= t.min) || TIERS[4]; }
function MiniBar({ value, max, color }) {
  return (
    <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 999 }}>
      <div style={{ width: `${Math.min(100, Math.round((value / max) * 100))}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.6s ease" }} />
    </div>
  );
}
function CredibilityPopover({ data, onClose }) {
  const tier = getTier(data.total);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: "absolute", zIndex: 1000, top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", width: 290, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "18px 18px 14px" }}>
      <div style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)", width: 13, height: 13, background: "#fff", border: "1px solid #E5E7EB", borderRight: "none", borderBottom: "none", rotate: "45deg" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: tier.color, lineHeight: 1 }}>{data.total}</div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>/ 100</div>
        </div>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: tier.bg, color: tier.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, marginBottom: 4 }}>{tier.icon} {tier.label}</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>{data.articlesPublished} articles · {data.endorsedBy} endorsements</div>
          {data.flaggedCount > 0 && <div style={{ fontSize: 10, color: "#EF4444", marginTop: 2 }}>⚑ {data.flaggedCount} flag(s)</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BREAKDOWN_META.map(({ key, label, max }) => {
          const val = data.breakdown?.[key] ?? 0;
          return (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: "#374151", flex: 1 }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: tier.color }}>{val}<span style={{ color: "#D1D5DB" }}>/{max}</span></span>
              </div>
              <MiniBar value={val} max={max} color={tier.color} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F3F4F6", fontSize: 10, color: "#9CA3AF", textAlign: "center" }}>Score updates every 24 hours · Member for {data.joinedDaysAgo} days</div>
    </div>
  );
}
function CredibilityBadge({ userId }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!userId) return;
    axios.get(`/users/${userId}/credibility`).then((r) => setData(r.data)).catch(() => {});
  }, [userId]);
  if (!data) return null;
  const tier = getTier(data.total);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: tier.bg, color: tier.color, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, border: `1px solid ${tier.color}22`, cursor: "pointer", whiteSpace: "nowrap" }}>
        {tier.icon} {data.total} <span style={{ fontWeight: 400, opacity: 0.75 }}>{tier.label}</span>
      </button>
      {open && <CredibilityPopover data={data} onClose={() => setOpen(false)} />}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════
// CLAIM TYPE CONFIG
// ═════════════════════════════════════════════════════════════════
const CLAIM_TYPES = {
  general:             { label: "General",             color: "#6B7280", bg: "#F3F4F6", icon: "•"  },
  personal_experience: { label: "Personal Experience", color: "#0284C7", bg: "#E0F2FE", icon: "👤" },
  cited_source:        { label: "Cited Source",        color: "#059669", bg: "#D1FAE5", icon: "📎" },
  insider_claim:       { label: "Insider Claim",       color: "#7C3AED", bg: "#EDE9FE", icon: "🔍" },
  opinion:             { label: "Opinion",             color: "#D97706", bg: "#FEF3C7", icon: "💬" },
};

const SOURCE_TIER_CONFIG = {
  verified: { label: "Government / Academic",  color: "#059669", bg: "#D1FAE5", icon: "✅" },
  credible: { label: "Established News",        color: "#0284C7", bg: "#E0F2FE", icon: "📰" },
  unknown:  { label: "Unknown Source",          color: "#9CA3AF", bg: "#F3F4F6", icon: "❓" },
  flagged:  { label: "Flagged Source",          color: "#DC2626", bg: "#FEE2E2", icon: "⚠️" },
};

// ═════════════════════════════════════════════════════════════════
// SOURCE BADGE (shown on messages that have a verified source)
// ═════════════════════════════════════════════════════════════════
function SourceBadge({ verification }) {
  if (!verification) return null;
  const cfg = SOURCE_TIER_CONFIG[verification.tier] || SOURCE_TIER_CONFIG.unknown;
  return (
    <a href={verification.url} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 999, textDecoration: "none", border: `1px solid ${cfg.color}22` }}>
      {cfg.icon} {cfg.label}
    </a>
  );
}

// ═════════════════════════════════════════════════════════════════
// COMMUNITY PULSE
// ═════════════════════════════════════════════════════════════════
const SENTIMENT_ZONES = [
  { min: 80, label: "Euphoric",   emoji: "🔥", color: "#7C3AED", bg: "#EDE9FE", textColor: "#5B21B6" },
  { min: 65, label: "Optimistic", emoji: "😊", color: "#059669", bg: "#D1FAE5", textColor: "#065F46" },
  { min: 52, label: "Hopeful",    emoji: "🌤️", color: "#0284C7", bg: "#E0F2FE", textColor: "#0369A1" },
  { min: 45, label: "Neutral",    emoji: "😐", color: "#6B7280", bg: "#F3F4F6", textColor: "#374151" },
  { min: 32, label: "Tense",      emoji: "😟", color: "#D97706", bg: "#FEF3C7", textColor: "#92400E" },
  { min: 18, label: "Upset",      emoji: "😠", color: "#DC2626", bg: "#FEE2E2", textColor: "#991B1B" },
  { min: 0,  label: "Outraged",   emoji: "💢", color: "#7F1D1D", bg: "#FEE2E2", textColor: "#7F1D1D" },
];
function getPulseZone(score) { return SENTIMENT_ZONES.find((z) => score >= z.min) || SENTIMENT_ZONES[6]; }
function Sparkline({ history, color }) {
  if (!history?.length) return null;
  const W = 260, H = 52;
  const scores = history.map((h) => h.score);
  const min = Math.min(...scores, 0), max = Math.max(...scores, 100), range = max - min || 1;
  const pts = scores.map((s, i) => `${(i / Math.max(scores.length - 1, 1)) * W},${H - ((s - min) / range) * H}`);
  const last = pts[pts.length - 1]?.split(",");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.15" /><stop offset="100%" stopColor={color} stopOpacity="0.01" /></linearGradient></defs>
      <path d={`M${pts.join("L")}L${W},${H}L0,${H}Z`} fill="url(#sg)" />
      <path d={`M${pts.join("L")}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="4" fill={color} />}
    </svg>
  );
}
function CommunityPulse({ communityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const iv = useRef(null);
  const fetch = useCallback(async () => {
    try { const r = await axios.get(`/communities/${communityId}/pulse`); setData(r.data); setLastUpdated(new Date()); }
    catch { } finally { setLoading(false); }
  }, [communityId]);
  useEffect(() => { fetch(); iv.current = setInterval(fetch, 30000); return () => clearInterval(iv.current); }, [fetch]);
  if (loading) return <div className="flex items-center justify-center h-48 gap-3"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className="text-gray-500 text-sm">Analyzing community sentiment...</span></div>;
  if (!data) return <div className="text-center py-16 text-gray-400 text-sm">Not enough activity yet to compute pulse. Come back after more discussions!</div>;
  const zone = getPulseZone(data.currentScore);
  return (
    <div className="flex flex-col gap-4">
      <div style={{ background: zone.bg, border: `1px solid ${zone.color}22`, borderRadius: 20, padding: "22px 26px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 44 }}>{zone.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: zone.textColor }}>{zone.label}</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: zone.color, display: "inline-block", animation: "pulseDot 1.5s ease-in-out infinite" }} />
              LIVE<style>{`@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: zone.textColor, opacity: 0.7 }}>Based on {data.totalAnalyzed?.toLocaleString()} recent posts{lastUpdated && ` · ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}</p>
        </div>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 38, fontWeight: 800, color: zone.color, lineHeight: 1 }}>{data.currentScore}</div><div style={{ fontSize: 10, color: zone.textColor, opacity: 0.6 }}>/ 100</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex justify-between mb-3"><h4 className="text-sm font-semibold text-gray-700">Last 12 hours</h4><span className="text-xs text-gray-400">30-min intervals</span></div>
          {data.history?.length > 1 ? <Sparkline history={data.history} color={zone.color} /> : <p className="text-sm text-gray-400">Not enough history yet.</p>}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Trending words</h4>
          <div className="mb-3"><div style={{ fontSize: 10, color: "#059669", fontWeight: 600, marginBottom: 5 }}>Positive</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(data.topPositive || []).map((w) => <span key={w} style={{ fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "2px 7px", borderRadius: 999 }}>{w}</span>)}</div></div>
          <div><div style={{ fontSize: 10, color: "#DC2626", fontWeight: 600, marginBottom: 5 }}>Negative</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(data.topNegative || []).map((w) => <span key={w} style={{ fontSize: 10, background: "#FEE2E2", color: "#991B1B", padding: "2px 7px", borderRadius: 999 }}>{w}</span>)}</div></div>
        </div>
      </div>
      <p className="text-xs text-gray-300 text-center">Powered by NLP sentiment analysis · Auto-refreshes every 30s</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// VERDICT PANEL
// ═════════════════════════════════════════════════════════════════
const VERDICT_RESULT_CONFIG = {
  for:          { color: "#059669", bg: "#D1FAE5", icon: "✅" },
  against:      { color: "#DC2626", bg: "#FEE2E2", icon: "❌" },
  inconclusive: { color: "#D97706", bg: "#FEF3C7", icon: "⚖️" },
};

function VerdictCard({ verdict, currentUserId, onVote }) {
  const isOpen    = verdict.status === "open";
  const total     = verdict.forVotes + verdict.againstVotes;
  const forPct    = total > 0 ? Math.round((verdict.forVotes / total) * 100) : 50;
  const hasVoted  = verdict.voters?.some((v) => v.userId === currentUserId || v.userId?._id === currentUserId);
  const myVote    = verdict.voters?.find((v) => v.userId === currentUserId || v.userId?._id === currentUserId)?.side;
  const resultCfg = verdict.result ? VERDICT_RESULT_CONFIG[verdict.result] : null;
  const timeLeft  = verdict.expiresAt ? Math.max(0, Math.round((new Date(verdict.expiresAt) - Date.now()) / 3600000)) : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-800">{verdict.topic}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            By {verdict.createdBy?.name} · {verdict.voters?.length || 0} votes
            {isOpen && timeLeft !== null && <span className="ml-2 text-orange-500">⏱ {timeLeft}h left</span>}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Result banner (closed verdicts) */}
      {!isOpen && resultCfg && (
        <div style={{ background: resultCfg.bg, border: `1px solid ${resultCfg.color}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: resultCfg.color }}>{resultCfg.icon} {verdict.resultLabel}</p>
          {verdict.summary && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#374151" }}>{verdict.summary}</p>}
        </div>
      )}

      {/* Vote bar */}
      {total > 0 && (
        <div className="mb-3">
          <div style={{ height: 8, borderRadius: 999, background: "#FEE2E2", overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${forPct}%`, height: "100%", background: "#059669", borderRadius: 999, transition: "width 0.6s ease" }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-700 font-medium">For {forPct}%</span>
            <span className="text-red-600 font-medium">Against {100 - forPct}%</span>
          </div>
        </div>
      )}

      {/* Voting buttons (open verdicts, not yet voted) */}
      {isOpen && !hasVoted && (
        <div className="flex gap-2">
          <button onClick={() => onVote(verdict._id, "for")}
            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-sm font-semibold py-2 rounded-xl transition">
            ✅ Support
          </button>
          <button onClick={() => onVote(verdict._id, "against")}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold py-2 rounded-xl transition">
            ❌ Oppose
          </button>
        </div>
      )}
      {isOpen && hasVoted && (
        <p className="text-xs text-center text-gray-400">You voted <span className={myVote === "for" ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>{myVote}</span></p>
      )}
    </div>
  );
}

function VerdictPanel({ communityId, currentUserId, isMod, isOwner }) {
  const [verdicts, setVerdicts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [topic, setTopic]             = useState("");
  const [duration, setDuration]       = useState(24);
  const [creating, setCreating]       = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchVerdicts = async () => {
    try { const r = await axios.get(`/api/communities/${communityId}/verdicts`, { withCredentials: true }); setVerdicts(r.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchVerdicts(); }, [communityId]);

  const handleCreateVerdict = async () => {
    if (!topic.trim()) return;
    try {
      setCreating(true);
      await axios.post(`/api/communities/${communityId}/verdicts`, { topic: topic.trim(), durationHours: duration }, { withCredentials: true });
      showToast("Verdict created!");
      setTopic(""); setShowCreate(false); fetchVerdicts();
    } catch (err) { showToast(err.response?.data?.message || "Failed to create verdict", "error"); }
    finally { setCreating(false); }
  };

  const handleVote = async (verdictId, side) => {
    try {
      await axios.post(`/api/communities/${communityId}/verdicts/${verdictId}/vote`, { side }, { withCredentials: true });
      showToast(`Voted ${side}!`); fetchVerdicts();
    } catch (err) { showToast(err.response?.data?.message || "Failed to vote", "error"); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {toast && <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-800">⚖️ Community Verdicts</h3>
          <p className="text-sm text-gray-500">Members vote on disputed claims. Credibility-weighted results.</p>
        </div>
        {(isMod || isOwner) && (
          <button onClick={() => setShowCreate((s) => !s)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            + New Verdict
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (isMod || isOwner) && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h4 className="font-semibold text-gray-700 mb-3">Create a verdict topic</h4>
          <input value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. FSSAI safety claims are credible"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 bg-white" />
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600">Voting duration:</label>
            {[12, 24, 48].map((h) => (
              <button key={h} onClick={() => setDuration(h)}
                style={{ background: duration === h ? "#2563EB" : "#fff", color: duration === h ? "#fff" : "#374151" }}
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition">
                {h}h
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateVerdict} disabled={creating || !topic.trim()}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition">
              {creating ? "Creating..." : "Create Verdict"}
            </button>
            <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Verdict cards */}
      {verdicts.length === 0
        ? <div className="text-center py-16 text-gray-400 text-sm">No verdicts yet. Moderators can create one when a disputed claim needs community judgement.</div>
        : verdicts.map((v) => <VerdictCard key={v._id} verdict={v} currentUserId={currentUserId} onVote={handleVote} />)
      }
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// LEADERBOARD PANEL
// ═════════════════════════════════════════════════════════════════
const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#CD7C2F"];

function LeaderboardPanel({ communityId, isMod, isOwner }) {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  const fetchLeaderboard = async () => {
    try { const r = await axios.get(`/api/communities/${communityId}/leaderboard`, { withCredentials: true }); setEntries(r.data); }
    catch { } finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try { await axios.post(`/api/communities/${communityId}/leaderboard/refresh`, {}, { withCredentials: true }); await fetchLeaderboard(); }
    catch { setLoading(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, [communityId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-800">🏅 Trusted Voices This Week</h3>
          <p className="text-sm text-gray-500">Top contributors ranked by credibility score</p>
        </div>
        {(isMod || isOwner) && (
          <button onClick={handleRefresh} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">↻ Refresh</button>
        )}
      </div>

      {entries.length === 0
        ? <div className="text-center py-12 text-gray-400 text-sm">Not enough member activity to build a leaderboard yet.</div>
        : (
          <div className="flex flex-col gap-3">
            {entries.map((entry, idx) => {
              const tier = getTier(entry.credibilityScore);
              const rankColor = RANK_COLORS[idx] || "#E5E7EB";
              return (
                <div key={entry.userId} onClick={() => navigate(`/profile/${entry.userId}`)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4">
                  {/* Rank */}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: idx < 3 ? rankColor + "22" : "#F9FAFB", border: `2px solid ${idx < 3 ? rankColor : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: idx < 3 ? rankColor : "#9CA3AF" }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${entry.rank}`}
                    </span>
                  </div>
                  {/* Avatar */}
                  <img src={entry.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&size=40`}
                    alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 truncate">{entry.name}</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: tier.bg, color: tier.color, fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999 }}>
                        {tier.icon} {entry.credibilityScore} {tier.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.articlesThisWeek} article{entry.articlesThisWeek !== 1 ? "s" : ""} this week</p>
                  </div>
                  {/* Score bar */}
                  <div style={{ width: 60, textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: tier.color, lineHeight: 1 }}>{entry.credibilityScore}</div>
                    <div style={{ fontSize: 9, color: "#9CA3AF" }}>/ 100</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      <p className="text-xs text-gray-300 text-center">Refreshed hourly · Based on articles, upvotes & debate quality</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// ENHANCED SEND BOX (with claim type + source URL)
// ═════════════════════════════════════════════════════════════════
function EnhancedSendBox({ onSend }) {
  const [message, setMessage]       = useState("");
  const [claimType, setClaimType]   = useState("general");
  const [sourceUrl, setSourceUrl]   = useState("");
  const [verification, setVerif]    = useState(null);
  const [verifying, setVerifying]   = useState(false);
  const [showAdvanced, setAdv]      = useState(false);

  const verifySource = async (url) => {
    if (!url.trim()) { setVerif(null); return; }
    setVerifying(true);
    try {
      const r = await axios.get(`/api/verify-source?url=${encodeURIComponent(url)}`, { withCredentials: true });
      setVerif(r.data);
    } catch { setVerif(null); } finally { setVerifying(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend({ message: message.trim(), claimType, sourceUrl: sourceUrl.trim() || undefined });
    setMessage(""); setClaimType("general"); setSourceUrl(""); setVerif(null); setAdv(false);
  };

  const cfg = CLAIM_TYPES[claimType];
  const srcCfg = verification ? SOURCE_TIER_CONFIG[verification.tier] : null;

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white px-4 py-3">
      {/* Claim type selector */}
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {Object.entries(CLAIM_TYPES).map(([key, c]) => (
          <button type="button" key={key} onClick={() => setClaimType(key)}
            style={{ background: claimType === key ? c.bg : "transparent", color: claimType === key ? c.color : "#9CA3AF", border: `1px solid ${claimType === key ? c.color + "44" : "#E5E7EB"}`, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, cursor: "pointer", transition: "all 0.15s" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Message input */}
      <div className="flex items-center gap-2">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder={`Write a message... (${cfg.label})`}
          className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        <button type="button" onClick={() => setAdv((a) => !a)}
          title="Add source URL"
          style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E7EB", background: showAdvanced ? "#EFF6FF" : "#fff", color: showAdvanced ? "#2563EB" : "#9CA3AF", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>
          📎
        </button>
        <button type="submit" disabled={!message.trim()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow hover:scale-105 transition disabled:opacity-40">
          Send
        </button>
      </div>

      {/* Source URL (advanced) */}
      {showAdvanced && (
        <div className="mt-2 flex items-center gap-2">
          <input type="url" value={sourceUrl}
            onChange={(e) => { setSourceUrl(e.target.value); verifySource(e.target.value); }}
            placeholder="Paste source URL (optional)..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
          {verifying && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          {srcCfg && !verifying && (
            <span style={{ fontSize: 10, fontWeight: 600, color: srcCfg.color, background: srcCfg.bg, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
              {srcCfg.icon} {srcCfg.label}
            </span>
          )}
        </div>
      )}
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════
// USER SEARCH INPUT (unchanged)
// ═════════════════════════════════════════════════════════════════
const UserSearchInput = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async (q) => {
    if (!q.trim()) { setSuggestions([]); return; }
    try { setLoading(true); const res = await axios.get(`/auth/search?query=${q}`, { withCredentials: true }); setSuggestions(res.data); }
    catch { } finally { setLoading(false); }
  };
  return (
    <div className="relative">
      <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); search(e.target.value); }} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {loading && <div className="absolute right-3 top-3.5"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {suggestions.length > 0 && (
        <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((user) => (
            <div key={user._id} onClick={() => { onSelect(user); setQuery(""); setSuggestions([]); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════
const CommunityDetailPage = ({ currentUserId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatRef = useRef(null);

  const [community, setCommunity]   = useState(null);
  const [articles, setArticles]     = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab]   = useState("about");
  const [joining, setJoining]       = useState(false);
  const [actionLoading, setAction]  = useState(false);
  const [toast, setToast]           = useState(null);

  const [showAddMemberModal,  setShowAddMemberModal]  = useState(false);
  const [selectedMembers,     setSelectedMembers]     = useState([]);
  const [addMemberLoading,    setAddMemberLoading]    = useState(false);
  const [showAddModModal,     setShowAddModModal]     = useState(false);
  const [selectedMods,        setSelectedMods]        = useState([]);
  const [addModLoading,       setAddModLoading]       = useState(false);
  const [showTransferModal,   setShowTransferModal]   = useState(false);
  const [transferUser,        setTransferUser]        = useState(null);
  const [transferLoading,     setTransferLoading]     = useState(false);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { fetchCommunity(); fetchDiscussions(); }, [id]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [discussions]);

  const fetchCommunity = async () => {
    try { const r = await axios.get(`/communities/${id}`); setCommunity(r.data.community); setArticles(r.data.articles || []); }
    catch (e) { console.error(e); }
  };
  const fetchDiscussions = async () => {
    try { const r = await axios.get(`/communities/${id}/discussions`); setDiscussions(r.data); }
    catch (e) { console.error(e); }
  };

  const isMember = community?.members?.some((m) => m._id?.toString() === currentUserId);
  const isMod    = community?.moderators?.some((m) => m._id?.toString() === currentUserId);
  const isOwner  = community?.owner?.toString() === currentUserId;

  const handleJoin = async () => {
    try { setJoining(true); await axios.post(`/communities/join`, { communityId: id }, { withCredentials: true }); await fetchCommunity(); showToast("Joined community!"); }
    catch { showToast("Failed to join", "error"); } finally { setJoining(false); }
  };
  const handleLeave = async () => {
    if (!window.confirm("Leave this community?")) return;
    try { setAction(true); await axios.post(`/communities/leave`, { communityId: id }, { withCredentials: true }); showToast("Left community"); navigate("/communities"); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setAction(false); }
  };

  // Enhanced send with claim type + source
  const handleSend = async ({ message, claimType, sourceUrl }) => {
    try {
      await axios.post(`/communities/${id}/discussions`, { message, claimType, sourceUrl }, { withCredentials: true });
      fetchDiscussions();
    } catch (e) { console.error(e); }
  };

  const handleShareArticle = async (article) => {
    try { await axios.post(`/communities/${id}/share-article`, { articleId: article._id }, { withCredentials: true }); showToast("Shared!"); fetchDiscussions(); setActiveTab("discussion"); }
    catch { showToast("Failed to share", "error"); }
  };
  const handleAddMembers = async () => {
    if (!selectedMembers.length) return;
    try { setAddMemberLoading(true); await Promise.all(selectedMembers.map((u) => axios.post(`/communities/${id}/invite`, { userId: u._id }, { withCredentials: true }))); showToast(`${selectedMembers.length} member(s) added!`); setSelectedMembers([]); setShowAddMemberModal(false); fetchCommunity(); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setAddMemberLoading(false); }
  };
  const handleAddModerators = async () => {
    if (!selectedMods.length) return;
    try { setAddModLoading(true); await Promise.all(selectedMods.map((u) => axios.post(`/communities/add-moderator`, { communityId: id, userId: u._id }, { withCredentials: true }))); showToast(`${selectedMods.length} moderator(s) promoted!`); setSelectedMods([]); setShowAddModModal(false); fetchCommunity(); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setAddModLoading(false); }
  };
  const handleKick = async (userId, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try { setAction(true); await axios.post(`/communities/kick`, { communityId: id, userId }, { withCredentials: true }); showToast(`${name} removed`); fetchCommunity(); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setAction(false); }
  };
  const handleRemoveMod = async (userId, name) => {
    if (!window.confirm(`Remove ${name} as mod?`)) return;
    try { setAction(true); await axios.post(`/communities/remove-moderator`, { communityId: id, userId }, { withCredentials: true }); showToast(`${name} removed as mod`); fetchCommunity(); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setAction(false); }
  };
  const handleTransfer = async () => {
    if (!transferUser || !window.confirm("Transfer ownership? This is irreversible.")) return;
    try { setTransferLoading(true); await axios.post(`/communities/transfer-ownership`, { communityId: id, newOwnerId: transferUser._id }, { withCredentials: true }); showToast("Ownership transferred"); setShowTransferModal(false); setTransferUser(null); fetchCommunity(); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); } finally { setTransferLoading(false); }
  };

  if (!community) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const memberIsMod   = (mId) => community.moderators?.some((m) => m._id?.toString() === mId);
  const memberIsOwner = (mId) => community.owner?.toString() === mId;
  const memberIds = new Set(community.members.map((m) => m._id?.toString()));
  const modIds    = new Set(community.moderators.map((m) => m._id?.toString()));

  const TABS = [
    { key: "about",       label: "About"       },
    { key: "discussion",  label: "Discussion"  },
    { key: "articles",    label: "Articles"    },
    { key: "members",     label: "Members"     },
    { key: "verdicts",    label: "⚖️ Verdicts"  },
    { key: "leaderboard", label: "🏅 Leaderboard" },
    { key: "pulse",       label: "Pulse", live: true },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      {toast && <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>{toast.msg}</div>}

      {/* Join banner */}
      {!isMember && (
        <div className="sticky top-4 z-50 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
            <div><p className="text-lg font-semibold">Join {community.name}</p><p className="text-sm opacity-90">Unlock full discussions, verdicts & exclusive articles.</p></div>
            <button onClick={handleJoin} disabled={joining} className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">{joining ? "Joining..." : "Join"}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-10 mb-8 border border-gray-100">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">{community.name}</h1>
            <p className="text-gray-600 text-lg mb-6 max-w-2xl">{community.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>👥 {community.members.length} members</span>
              <span>📚 {articles.length} articles</span>
              {community.interests?.length > 0 && <span>🏷️ {community.interests.join(", ")}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isMember && !isOwner && <button onClick={handleLeave} disabled={actionLoading} className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition">Leave Community</button>}
            {(isMod || isOwner) && <button onClick={() => setShowAddMemberModal(true)} className="text-sm text-green-600 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition">👤 Add Member</button>}
            {isOwner && <button onClick={() => setShowAddModModal(true)} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">🛡️ Add Moderator</button>}
            {isOwner && <button onClick={() => setShowTransferModal(true)} className="text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition">🔑 Transfer Ownership</button>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8 gap-6 overflow-x-auto">
        {TABS.map(({ key, label, live }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`pb-4 font-semibold relative transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === key ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`}>
            {live && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block", animation: "pulseDot 1.5s ease-in-out infinite" }} />}
            {label}
            {activeTab === key && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── ABOUT ── */}
      {activeTab === "about" && (
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-lg">Community Rules</h3>
            {community.rules?.length ? <ul className="list-disc ml-6 text-gray-600 space-y-2">{community.rules.map((r, i) => <li key={i}>{r}</li>)}</ul> : <p className="text-gray-400 text-sm">No rules set.</p>}
          </div>
          {community.interests?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-lg">Interests</h3>
              <div className="flex flex-wrap gap-2">{community.interests.map((i, idx) => <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{i}</span>)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── DISCUSSION ── */}
      {activeTab === "discussion" && (
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[680px] overflow-hidden">
          {!isMember && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl">
              <p className="text-gray-700 mb-4 font-medium">Join this community to participate</p>
              <button onClick={handleJoin} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition">Join Community</button>
            </div>
          )}
          <div className="px-6 py-4 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-800">Community Discussion</h2>
            <p className="text-xs text-gray-400">Tag your posts by type · Attach sources to boost credibility</p>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gray-50">
            {(isMember ? discussions : discussions.slice(0, 3)).map((d) => {
              const isMe = d.author?._id === currentUserId;
              const claimCfg = CLAIM_TYPES[d.claimType] || CLAIM_TYPES.general;
              return (
                <div key={d._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md w-fit rounded-2xl px-4 py-3 shadow-sm ${isMe ? "bg-blue-50 rounded-br-none" : "bg-white rounded-bl-none"}`}>
                    {/* Author + credibility */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-xs font-semibold opacity-70">{isMe ? "You" : d.author?.name}</p>
                      {d.author?._id && <CredibilityBadge userId={d.author._id} />}
                    </div>
                    {/* Claim type tag */}
                    {d.claimType && d.claimType !== "general" && (
                      <div className="mb-1.5">
                        <span style={{ fontSize: 10, fontWeight: 600, color: claimCfg.color, background: claimCfg.bg, padding: "1px 7px", borderRadius: 999 }}>
                          {claimCfg.icon} {claimCfg.label}
                        </span>
                      </div>
                    )}
                    {/* Message / article */}
                    {d.article
                      ? <ArticleCard article={d.article} currentUserId={currentUserId} isChatView={true} className="shadow-none border border-gray-200" />
                      : <p className="text-sm text-gray-800">{d.message}</p>}
                    {/* Source badge */}
                    {d.sourceVerification && (
                      <div className="mt-1.5"><SourceBadge verification={{ ...d.sourceVerification, url: d.sourceUrl }} /></div>
                    )}
                    {/* Vote row */}
                    {!isMe && (
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => axios.post(`/communities/${id}/discussions/${d._id}/vote`, { vote: "up" }, { withCredentials: true }).then(fetchDiscussions)}
                          className="text-xs text-gray-400 hover:text-green-600 transition">▲ {d.upvotes?.length || 0}</button>
                        <button onClick={() => axios.post(`/communities/${id}/discussions/${d._id}/vote`, { vote: "down" }, { withCredentials: true }).then(fetchDiscussions)}
                          className="text-xs text-gray-400 hover:text-red-500 transition">▼ {d.downvotes?.length || 0}</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isMember && <EnhancedSendBox onSend={handleSend} />}
        </div>
      )}

      {/* ── ARTICLES ── */}
      {activeTab === "articles" && (
        <div className="relative">
          {!isMember && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl"><button onClick={handleJoin} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Join to view all articles</button></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(isMember ? articles : articles.slice(0, 2)).map((article) => (
              <div key={article._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100">
                {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition" />}
                <div className="p-6">
                  <h3 onClick={() => navigate(`/articles/${article._id}`)} className="text-xl font-bold mb-2 group-hover:text-blue-600 transition cursor-pointer">{article.title}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{article.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2"><span>{article.authorId?.name}</span>{article.authorId?._id && <CredibilityBadge userId={article.authorId._id} />}</div>
                    {isMember && <button onClick={() => handleShareArticle(article)} className="text-blue-500 hover:text-blue-700 font-medium text-xs border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50 transition">📤 Share</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MEMBERS ── */}
      {activeTab === "members" && (
        <div className="space-y-3">
          {community.members.map((member) => {
            const mId = member._id?.toString();
            const modStatus = memberIsMod(mId), ownerStatus = memberIsOwner(mId), isMe = mId === currentUserId;
            return (
              <div key={member._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                <div onClick={() => navigate(`/profile/${member._id}`)} className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg">{member.name}</p>
                    <CredibilityBadge userId={member._id} />
                    {ownerStatus && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Owner</span>}
                    {modStatus && !ownerStatus && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Mod</span>}
                    {isMe && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">You</span>}
                  </div>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                {!isMe && !ownerStatus && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    {(isOwner || isMod) && <button onClick={() => handleKick(mId, member.name)} disabled={actionLoading} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Kick</button>}
                    {isOwner && !modStatus && <button onClick={() => { setSelectedMods([member]); setShowAddModModal(true); }} className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Make Mod</button>}
                    {isOwner && modStatus && <button onClick={() => handleRemoveMod(mId, member.name)} disabled={actionLoading} className="text-xs text-orange-500 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition">Remove Mod</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── VERDICTS (NEW) ── */}
      {activeTab === "verdicts" && (
        <VerdictPanel communityId={id} currentUserId={currentUserId} isMod={isMod} isOwner={isOwner} />
      )}

      {/* ── LEADERBOARD (NEW) ── */}
      {activeTab === "leaderboard" && (
        <LeaderboardPanel communityId={id} isMod={isMod} isOwner={isOwner} />
      )}

      {/* ── PULSE ── */}
      {activeTab === "pulse" && <CommunityPulse communityId={id} />}

      {/* ── MODALS (unchanged) ── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddMemberModal(false); setSelectedMembers([]); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1"><h2 className="text-xl font-bold">Add Members</h2><button onClick={() => { setShowAddMemberModal(false); setSelectedMembers([]); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button></div>
            <p className="text-gray-500 text-sm mb-5">Search and invite users to this community.</p>
            <UserSearchInput placeholder="Search by name or email..." onSelect={(user) => { if (!selectedMembers.find((u) => u._id === user._id) && !memberIds.has(user._id)) setSelectedMembers((p) => [...p, user]); }} />
            {selectedMembers.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{selectedMembers.map((u) => <div key={u._id} className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full"><img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt="" className="w-5 h-5 rounded-full" /><span className="text-sm font-medium">{u.name}</span><button onClick={() => setSelectedMembers((p) => p.filter((x) => x._id !== u._id))} className="text-red-400 text-xs ml-1">✕</button></div>)}</div>}
            <div className="flex gap-3 mt-6"><button onClick={handleAddMembers} disabled={addMemberLoading || !selectedMembers.length} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">{addMemberLoading ? "Adding..." : `Add ${selectedMembers.length || ""} Member${selectedMembers.length !== 1 ? "s" : ""}`}</button><button onClick={() => { setShowAddMemberModal(false); setSelectedMembers([]); }} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button></div>
          </div>
        </div>
      )}
      {showAddModModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModModal(false); setSelectedMods([]); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1"><h2 className="text-xl font-bold">Add Moderators</h2><button onClick={() => { setShowAddModModal(false); setSelectedMods([]); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button></div>
            <p className="text-gray-500 text-sm mb-5">Search for members to promote as moderators.</p>
            <UserSearchInput placeholder="Search members by name..." onSelect={(user) => { if (modIds.has(user._id) || selectedMods.find((u) => u._id === user._id)) return; setSelectedMods((p) => [...p, user]); }} />
            {selectedMods.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{selectedMods.map((u) => <div key={u._id} className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full"><img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt="" className="w-5 h-5 rounded-full" /><span className="text-sm font-medium">{u.name}</span><button onClick={() => setSelectedMods((p) => p.filter((x) => x._id !== u._id))} className="text-red-400 text-xs ml-1">✕</button></div>)}</div>}
            <div className="flex gap-3 mt-6"><button onClick={handleAddModerators} disabled={addModLoading || !selectedMods.length} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">{addModLoading ? "Promoting..." : `Promote ${selectedMods.length || ""} to Mod${selectedMods.length !== 1 ? "s" : ""}`}</button><button onClick={() => { setShowAddModModal(false); setSelectedMods([]); }} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button></div>
          </div>
        </div>
      )}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowTransferModal(false); setTransferUser(null); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1"><h2 className="text-xl font-bold">Transfer Ownership</h2><button onClick={() => { setShowTransferModal(false); setTransferUser(null); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button></div>
            <p className="text-red-500 text-sm mb-5">⚠️ This is irreversible. You will lose owner privileges.</p>
            <UserSearchInput placeholder="Search members by name..." onSelect={(user) => { if (memberIds.has(user._id)) setTransferUser(user); }} />
            {transferUser && <div className="flex items-center gap-3 mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"><img src={transferUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(transferUser.name)}`} alt="" className="w-9 h-9 rounded-full object-cover" /><div className="flex-1"><p className="font-medium text-sm">{transferUser.name}</p><p className="text-xs text-gray-500">{transferUser.email}</p></div><button onClick={() => setTransferUser(null)} className="text-gray-400 text-xs">✕</button></div>}
            <div className="flex gap-3 mt-6"><button onClick={handleTransfer} disabled={transferLoading || !transferUser} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition">{transferLoading ? "Transferring..." : "Transfer Ownership"}</button><button onClick={() => { setShowTransferModal(false); setTransferUser(null); }} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetailPage;