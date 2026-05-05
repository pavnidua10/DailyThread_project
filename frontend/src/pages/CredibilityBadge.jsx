
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// ─── Tier config ──────────────────────────────────────────────────
const TIERS = [
  { min: 85, label: "Authority",      color: "#7C3AED", bg: "#EDE9FE", icon: "◆" },
  { min: 70, label: "Verified Voice", color: "#0369A1", bg: "#E0F2FE", icon: "✦" },
  { min: 50, label: "Contributor",    color: "#065F46", bg: "#D1FAE5", icon: "●" },
  { min: 30, label: "Emerging",       color: "#92400E", bg: "#FEF3C7", icon: "○" },
  { min: 0,  label: "Newcomer",       color: "#6B7280", bg: "#F3F4F6", icon: "·" },
];

const BREAKDOWN_META = [
  { key: "articleQuality",   label: "Article quality",    max: 30, desc: "Avg rating across published articles" },
  { key: "sourceAccuracy",   label: "Source accuracy",    max: 25, desc: "How reliably cited sources check out" },
  { key: "communityTrust",   label: "Community trust",    max: 20, desc: "Peer upvotes & endorsements received" },
  { key: "consistencyBonus", label: "Consistency",        max: 15, desc: "Regular contributions, no moderation flags" },
  { key: "debateScore",      label: "Debate quality",     max: 10, desc: "Reasoned arguments in debate mode" },
];

export function getTier(score) {
  return TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1];
}

// ─── Radial arc SVG ──────────────────────────────────────────────
function ScoreArc({ score, color, size = 64 }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r; // half circle
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={size * 0.09}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.09}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Score text */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="700"
        fill={color}
        fontFamily="'DM Sans', sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

// ─── Mini bar ────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 999 }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ─── Popover card ────────────────────────────────────────────────
function CredibilityPopover({ data, onClose }) {
  const tier = getTier(data.total);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        zIndex: 1000,
        top: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: 300,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: "20px 20px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Arrow */}
      <div style={{
        position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
        width: 14, height: 14, background: "#fff", border: "1px solid #E5E7EB",
        borderRight: "none", borderBottom: "none", rotate: "45deg",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <ScoreArc score={data.total} color={tier.color} size={72} />
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: tier.bg, color: tier.color,
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
            marginBottom: 4,
          }}>
            <span>{tier.icon}</span> {tier.label}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            {data.articlesPublished} articles · {data.endorsedBy} endorsements
          </div>
          {data.flaggedCount > 0 && (
            <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>
              ⚑ {data.flaggedCount} flag{data.flaggedCount > 1 ? "s" : ""} on record
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {BREAKDOWN_META.map(({ key, label, max, desc }) => {
          const val = data.breakdown?.[key] ?? 0;
          return (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: tier.color }}>
                  {val}<span style={{ color: "#D1D5DB", fontWeight: 400 }}>/{max}</span>
                </span>
              </div>
              <MiniBar value={val} max={max} color={tier.color} />
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{desc}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: "1px solid #F3F4F6",
        fontSize: 11, color: "#9CA3AF", textAlign: "center",
      }}>
        Score updates every 24 hours · Member for {data.joinedDaysAgo} days
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────
export default function CredibilityBadge({ userId, score: scoreProp, size = "md", showPopover = true }) {
  const [data, setData] = useState(scoreProp || null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(!scoreProp);

  useEffect(() => {
    if (scoreProp) { setData(scoreProp); return; }
    if (!userId) return;
    axios.get(`/users/${userId}/credibility`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId, scoreProp]);

  if (loading) return (
    <span style={{ display: "inline-block", width: 48, height: 20, background: "#F3F4F6", borderRadius: 999 }} />
  );
  if (!data) return null;

  const tier = getTier(data.total);
  const sizeMap = { sm: { fontSize: 10, px: 6, py: 2 }, md: { fontSize: 12, px: 8, py: 3 }, lg: { fontSize: 14, px: 10, py: 4 } };
  const s = sizeMap[size];

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => showPopover && setOpen((o) => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: tier.bg, color: tier.color,
          fontSize: s.fontSize, fontWeight: 600,
          padding: `${s.py}px ${s.px}px`, borderRadius: 999,
          border: `1px solid ${tier.color}22`,
          cursor: showPopover ? "pointer" : "default",
          fontFamily: "'DM Sans', sans-serif",
          transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        }}
        title="Credibility score"
      >
        <span>{tier.icon}</span>
        <span>{data.total}</span>
        {size !== "sm" && <span style={{ fontWeight: 400, opacity: 0.75 }}>{tier.label}</span>}
      </button>
      {open && showPopover && (
        <CredibilityPopover data={data} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}

/**
 * ─── CredibilityProfilePanel ─────────────────────────────────────
 * Larger version for a user's own profile page.
 * Usage: <CredibilityProfilePanel userId={currentUserId} />
 */
export function CredibilityProfilePanel({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    axios.get(`/auth/${userId}/credibility`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ background: "#F9FAFB", borderRadius: 16, padding: 24, height: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "3px solid #3B82F6", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!data) return null;

  const tier = getTier(data.total);

  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 20,
      padding: "28px 28px 20px", fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>Credibility score</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
            How much the community trusts your contributions
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: tier.bg, color: tier.color,
          fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 999,
          border: `1px solid ${tier.color}30`,
        }}>
          {tier.icon} {tier.label}
        </div>
      </div>

      {/* Arc + stats */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreArc score={data.total} color={tier.color} size={100} />
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>out of 100</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", paddingTop: 8 }}>
          {[
            { label: "Articles published", value: data.articlesPublished },
            { label: "Peer endorsements",  value: data.endorsedBy },
            { label: "Flags on record",    value: data.flaggedCount, danger: data.flaggedCount > 0 },
            { label: "Days as member",     value: data.joinedDaysAgo },
          ].map(({ label, value, danger }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: danger ? "#EF4444" : "#111827" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Score breakdown
        </div>
        {BREAKDOWN_META.map(({ key, label, max }) => {
          const val = data.breakdown?.[key] ?? 0;
          const pct = Math.round((val / max) * 100);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#374151", minWidth: 140 }}>{label}</span>
              <MiniBar value={val} max={max} color={tier.color} />
              <span style={{ fontSize: 13, fontWeight: 600, color: tier.color, minWidth: 32, textAlign: "right" }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: "#D1D5DB", textAlign: "right" }}>
        Recalculated daily · Last updated today
      </div>
    </div>
  );
}