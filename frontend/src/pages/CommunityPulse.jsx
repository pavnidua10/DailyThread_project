
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

// ─── Sentiment config ─────────────────────────────────────────────
const SENTIMENT_ZONES = [
  { min: 80, label: "Euphoric",    emoji: "🔥", color: "#7C3AED", bg: "#EDE9FE", textColor: "#5B21B6" },
  { min: 65, label: "Optimistic",  emoji: "😊", color: "#059669", bg: "#D1FAE5", textColor: "#065F46" },
  { min: 52, label: "Hopeful",     emoji: "🌤️", color: "#0284C7", bg: "#E0F2FE", textColor: "#0369A1" },
  { min: 45, label: "Neutral",     emoji: "😐", color: "#6B7280", bg: "#F3F4F6", textColor: "#374151" },
  { min: 32, label: "Tense",       emoji: "😟", color: "#D97706", bg: "#FEF3C7", textColor: "#92400E" },
  { min: 18, label: "Upset",       emoji: "😠", color: "#DC2626", bg: "#FEE2E2", textColor: "#991B1B" },
  { min: 0,  label: "Outraged",    emoji: "💢", color: "#7F1D1D", bg: "#FEE2E2", textColor: "#7F1D1D" },
];

function getZone(score) {
  return SENTIMENT_ZONES.find((z) => score >= z.min) || SENTIMENT_ZONES[SENTIMENT_ZONES.length - 1];
}

// ─── Tiny sparkline (SVG) ─────────────────────────────────────────
function Sparkline({ history, color, width = 280, height = 60 }) {
  if (!history?.length) return null;
  const scores = history.map((h) => h.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;

  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((s - min) / range) * height;
    return `${x},${y}`;
  });

  const areaPath = `M${pts.join("L")}L${width},${height}L0,${height}Z`;
  const linePath = `M${pts.join("L")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sparkg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkg)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {pts.length > 0 && (() => {
        const last = pts[pts.length - 1].split(",");
        return <circle cx={last[0]} cy={last[1]} r="4" fill={color} />;
      })()}
    </svg>
  );
}

// ─── Sentiment gauge (horizontal bar) ────────────────────────────
function SentimentGauge({ score, color }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div style={{ position: "relative" }}>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
      {/* Track */}
      <div style={{
        height: 12, borderRadius: 999,
        background: "linear-gradient(to right, #FCA5A5, #FCD34D, #6EE7B7)",
        position: "relative",
      }}>
        {/* Marker */}
        <div style={{
          position: "absolute",
          left: `${animated}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 20, height: 20,
          background: "#fff",
          border: `3px solid ${color}`,
          borderRadius: "50%",
          boxShadow: `0 0 0 4px ${color}22`,
          transition: "left 0.8s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 2,
        }} />
        {/* Center line */}
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: 1, background: "rgba(0,0,0,0.15)",
        }} />
      </div>
    </div>
  );
}

// ─── Donut breakdown ─────────────────────────────────────────────
function BreakdownBars({ breakdown }) {
  const items = [
    { key: "veryPositive", label: "Very positive", color: "#059669" },
    { key: "positive",     label: "Positive",      color: "#34D399" },
    { key: "neutral",      label: "Neutral",        color: "#9CA3AF" },
    { key: "negative",     label: "Negative",       color: "#F59E0B" },
    { key: "veryNegative", label: "Very negative",  color: "#EF4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(({ key, label, color }) => {
        const val = breakdown?.[key] ?? 0;
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#6B7280", minWidth: 90 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${val}%`, height: "100%", background: color, borderRadius: 999,
                transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 30, textAlign: "right" }}>{val}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Live pulse dot ───────────────────────────────────────────────
function LiveDot({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        display: "inline-block", width: 8, height: 8,
        borderRadius: "50%", background: color,
        animation: "pulseDot 1.5s ease-in-out infinite",
      }} />
      <style>{`@keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.3); }
      }`}</style>
      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>LIVE</span>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function CommunityPulse({ communityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchPulse = useCallback(async () => {
    try {
      const res = await axios.get(`/communities/${communityId}/pulse`);
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Pulse fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchPulse();
    // Poll every 30 seconds for live feel
    intervalRef.current = setInterval(fetchPulse, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchPulse]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
      <div style={{ width: 24, height: 24, border: "3px solid #3B82F6", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#6B7280", fontSize: 14 }}>Analyzing community sentiment...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>
      Not enough data to compute pulse yet. Come back after more discussions!
    </div>
  );

  const zone = getZone(data.currentScore);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Hero card */}
      <div style={{
        background: zone.bg, border: `1px solid ${zone.color}22`,
        borderRadius: 20, padding: "24px 28px",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ fontSize: 52 }}>{zone.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: zone.textColor }}>
              {zone.label}
            </h2>
            <LiveDot color={zone.color} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: zone.textColor, opacity: 0.75 }}>
            Based on {data.totalAnalyzed.toLocaleString()} recent posts & comments
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: zone.color, lineHeight: 1 }}>{data.currentScore}</div>
          <div style={{ fontSize: 11, color: zone.textColor, opacity: 0.6, marginTop: 2 }}>/ 100</div>
        </div>
      </div>

      {/* Gauge */}
      <div style={{
        background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px",
      }}>
        <h4 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Sentiment position</h4>
        <SentimentGauge score={data.currentScore} color={zone.color} />
      </div>

      {/* Sparkline + words row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>

        {/* Sparkline */}
        <div style={{
          background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Last 12 hours</h4>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>30-min intervals</span>
          </div>
          {data.history?.length > 1
            ? <Sparkline history={data.history} color={zone.color} />
            : <p style={{ fontSize: 13, color: "#9CA3AF" }}>Not enough history yet.</p>
          }
          {data.history?.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{data.history[0]?.time}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{data.history[data.history.length - 1]?.time}</span>
            </div>
          )}
        </div>

        {/* Top words */}
        <div style={{
          background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px",
        }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Trending words</h4>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginBottom: 6 }}>Positive</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(data.topPositive || []).map((w) => (
                <span key={w} style={{
                  fontSize: 11, background: "#D1FAE5", color: "#065F46",
                  padding: "2px 8px", borderRadius: 999,
                }}>{w}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginBottom: 6 }}>Negative</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(data.topNegative || []).map((w) => (
                <span key={w} style={{
                  fontSize: 11, background: "#FEE2E2", color: "#991B1B",
                  padding: "2px 8px", borderRadius: 999,
                }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{
        background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px",
      }}>
        <h4 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Sentiment breakdown</h4>
        <BreakdownBars breakdown={data.breakdown} />
      </div>

      <p style={{ fontSize: 11, color: "#D1D5DB", textAlign: "center", margin: 0 }}>
        Powered by NLP sentiment analysis · Auto-refreshes every 30s
      </p>
    </div>
  );
}

/**
 * ─── INTEGRATION into CommunityDetailPage.jsx ────────────────────
 *
 * 1. Import at top:
 *    import CommunityPulse from "./CommunityPulse";
 *
 * 2. Add "pulse" to tabs array:
 *    {["about", "discussion", "articles", "members", "pulse"].map(...)}
 *
 * 3. Add tab panel after the members block:
 *    {activeTab === "pulse" && (
 *      <CommunityPulse communityId={id} />
 *    )}
 */