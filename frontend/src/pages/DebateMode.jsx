

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const SIDES = {
  for: {
    label: "For",
    color: "#059669",
    bg: "#D1FAE5",
    border: "#A7F3D0",
    text: "#065F46",
    headerBg: "#ECFDF5",
    placeholder: "Make your case in support of this article...",
    icon: "↑",
  },
  against: {
    label: "Against",
    color: "#DC2626",
    bg: "#FEE2E2",
    border: "#FCA5A5",
    text: "#991B1B",
    headerBg: "#FFF1F2",
    placeholder: "Make your case against the claims in this article...",
    icon: "↓",
  },
};

// ─── Credibility chip (inline, minimal) ──────────────────────────
function CredChip({ score }) {
  if (!score) return null;
  const color = score >= 70 ? "#7C3AED" : score >= 50 ? "#0369A1" : "#6B7280";
  const bg    = score >= 70 ? "#EDE9FE" : score >= 50 ? "#E0F2FE" : "#F3F4F6";
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color, background: bg,
      padding: "1px 6px", borderRadius: 999, marginLeft: 6,
    }}>{score}</span>
  );
}

// ─── Single argument card ─────────────────────────────────────────
function ArgumentCard({ arg, side, currentUserId, onVote }) {
  const cfg = SIDES[side];
  const hasUpvoted   = arg.upvotes?.includes(currentUserId);
  const hasDownvoted = arg.downvotes?.includes(currentUserId);
  const netVotes     = (arg.upvotes?.length ?? 0) - (arg.downvotes?.length ?? 0);
  const isMe         = arg.authorId?._id === currentUserId;

  return (
    <div style={{
      background: "#fff", border: `1px solid ${cfg.border}`,
      borderRadius: 12, padding: "14px 16px",
      borderLeft: `3px solid ${cfg.color}`,
    }}>
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <img
          src={arg.authorId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(arg.authorId?.name || "?")}&size=32`}
          alt=""
          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
          {isMe ? "You" : arg.authorId?.name}
        </span>
        <CredChip score={arg.credibilityScore} />
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>
          {new Date(arg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Argument text */}
      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1F2937", lineHeight: 1.6 }}>{arg.text}</p>

      {/* Vote row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => onVote(arg._id, "up")}
          disabled={isMe}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: hasUpvoted ? cfg.bg : "transparent",
            border: `1px solid ${hasUpvoted ? cfg.color : "#E5E7EB"}`,
            color: hasUpvoted ? cfg.color : "#6B7280",
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
            cursor: isMe ? "not-allowed" : "pointer",
            opacity: isMe ? 0.5 : 1,
          }}
        >
          ▲ {arg.upvotes?.length ?? 0}
        </button>
        <button
          onClick={() => onVote(arg._id, "down")}
          disabled={isMe}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: hasDownvoted ? "#FEE2E2" : "transparent",
            border: `1px solid ${hasDownvoted ? "#DC2626" : "#E5E7EB"}`,
            color: hasDownvoted ? "#DC2626" : "#6B7280",
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
            cursor: isMe ? "not-allowed" : "pointer",
            opacity: isMe ? 0.5 : 1,
          }}
        >
          ▼ {arg.downvotes?.length ?? 0}
        </button>
        <span style={{ fontSize: 11, color: netVotes > 0 ? "#059669" : netVotes < 0 ? "#DC2626" : "#9CA3AF", marginLeft: 4 }}>
          {netVotes > 0 ? "+" : ""}{netVotes} net
        </span>
      </div>
    </div>
  );
}

// ─── Submit box ───────────────────────────────────────────────────
function SubmitBox({ side, onSubmit, loading, userSide }) {
  const [text, setText] = useState("");
  const cfg = SIDES[side];
  const disabled = loading || (userSide && userSide !== side);

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSubmit(side, text.trim());
    setText("");
  };

  return (
    <div style={{
      background: cfg.headerBg, border: `1px solid ${cfg.border}`,
      borderRadius: 12, padding: "14px 16px", marginTop: 12,
    }}>
      {disabled && userSide && userSide !== side ? (
        <p style={{ fontSize: 13, color: cfg.text, margin: 0, opacity: 0.7 }}>
          You already argued {SIDES[userSide].label}. Each user picks one side per article.
        </p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={cfg.placeholder}
            rows={3}
            style={{
              width: "100%", border: `1px solid ${cfg.border}`, borderRadius: 8,
              padding: "10px 12px", fontSize: 13, color: "#1F2937",
              resize: "none", outline: "none", fontFamily: "inherit",
              background: "#fff", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: cfg.color, opacity: 0.75 }}>
              Your credibility score affects argument visibility
            </span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              style={{
                background: cfg.color, color: "#fff",
                border: "none", borderRadius: 8, padding: "8px 18px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                opacity: !text.trim() || loading ? 0.5 : 1,
              }}
            >
              {loading ? "Posting..." : `Argue ${cfg.label}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AI Referee summary ───────────────────────────────────────────
function RefereeSummary({ summary, onRequestSummary, loading }) {
  if (!summary && !loading) {
    return (
      <div style={{
        background: "#F8F7FF", border: "1px dashed #C4B5FD",
        borderRadius: 16, padding: "20px 24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
        <p style={{ fontSize: 14, color: "#6D28D9", margin: "0 0 12px", fontWeight: 600 }}>
          AI Referee not active yet
        </p>
        <p style={{ fontSize: 13, color: "#8B5CF6", margin: "0 0 16px" }}>
          Once enough arguments are posted, request an impartial summary of the strongest points from each side.
        </p>
        <button
          onClick={onRequestSummary}
          style={{
            background: "#7C3AED", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Request AI Summary
        </button>
      </div>
    );
  }

  if (loading) return (
    <div style={{
      background: "#F8F7FF", border: "1px solid #C4B5FD",
      borderRadius: 16, padding: "24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
      <p style={{ fontSize: 14, color: "#7C3AED" }}>AI Referee is reading all arguments...</p>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12, gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: "#7C3AED",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
    </div>
  );

  return (
    <div style={{
      background: "#F8F7FF", border: "1px solid #C4B5FD",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🤖</span>
        <div>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#4C1D95" }}>AI Referee Summary</h4>
          <span style={{ fontSize: 11, color: "#8B5CF6" }}>
            Updated {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : "recently"}
          </span>
        </div>
        <button
          onClick={onRequestSummary}
          style={{
            marginLeft: "auto", fontSize: 11, background: "transparent",
            border: "1px solid #C4B5FD", color: "#7C3AED", borderRadius: 6,
            padding: "4px 10px", cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{
          background: "#ECFDF5", border: "1px solid #A7F3D0",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#065F46", marginBottom: 6 }}>
            ✅ Strongest FOR arguments
          </div>
          <p style={{ fontSize: 13, color: "#1F2937", margin: 0, lineHeight: 1.6 }}>{summary.for}</p>
        </div>
        <div style={{
          background: "#FFF1F2", border: "1px solid #FCA5A5",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>
            ❌ Strongest AGAINST arguments
          </div>
          <p style={{ fontSize: 13, color: "#1F2937", margin: 0, lineHeight: 1.6 }}>{summary.against}</p>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "#A78BFA", margin: "12px 0 0", textAlign: "center" }}>
        This summary is AI-generated and impartial. It does not reflect Daily Thread's views.
      </p>
    </div>
  );
}

// ─── Side column ─────────────────────────────────────────────────
function SideColumn({ side, args, currentUserId, userSide, onSubmit, onVote, submitLoading }) {
  const cfg = SIDES[side];
  const sorted = [...args].sort((a, b) =>
    (b.upvotes?.length - b.downvotes?.length) - (a.upvotes?.length - a.downvotes?.length)
  );

  return (
    <div>
      {/* Column header */}
      <div style={{
        background: cfg.headerBg, border: `1px solid ${cfg.border}`,
        borderRadius: 12, padding: "14px 18px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          fontSize: 20, fontWeight: 800, color: cfg.color,
          width: 32, height: 32, borderRadius: "50%", background: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{cfg.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: cfg.text }}>{cfg.label}</div>
          <div style={{ fontSize: 11, color: cfg.color, opacity: 0.75 }}>{args.length} argument{args.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Arguments */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.length === 0 && (
          <div style={{
            textAlign: "center", padding: "24px 16px",
            border: `1px dashed ${cfg.border}`, borderRadius: 12,
            color: cfg.text, opacity: 0.5, fontSize: 13,
          }}>
            No {cfg.label.toLowerCase()} arguments yet.<br />Be the first.
          </div>
        )}
        {sorted.map((arg) => (
          <ArgumentCard
            key={arg._id}
            arg={arg}
            side={side}
            currentUserId={currentUserId}
            onVote={onVote}
          />
        ))}
      </div>

      {/* Submit */}
      <SubmitBox
        side={side}
        onSubmit={onSubmit}
        loading={submitLoading}
        userSide={userSide}
      />
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────
export default function DebateMode({ articleId, currentUserId }) {
  const [args, setArgs]               = useState([]);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitLoading, setSubmit]    = useState(false);
  const [summaryLoading, setSumLoad]  = useState(false);

  // Determine if user already picked a side
  const userSide = args.find((a) => a.authorId?._id === currentUserId)?.side || null;

  const fetchDebate = useCallback(async () => {
    try {
      const res = await axios.get(`/api/articles/${articleId}/debate`);
      setArgs(res.data.arguments || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { fetchDebate(); }, [fetchDebate]);

  const handleSubmit = async (side, text) => {
    try {
      setSubmit(true);
      await axios.post(`/api/articles/${articleId}/debate`, { side, text }, { withCredentials: true });
      await fetchDebate();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmit(false);
    }
  };

  const handleVote = async (argId, vote) => {
    try {
      await axios.post(`/api/articles/${articleId}/debate/${argId}/vote`, { vote }, { withCredentials: true });
      await fetchDebate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummarize = async () => {
    try {
      setSumLoad(true);
      const res = await axios.post(`/api/articles/${articleId}/debate/summarize`, {}, { withCredentials: true });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSumLoad(false);
    }
  };

  const forArgs     = args.filter((a) => a.side === "for");
  const againstArgs = args.filter((a) => a.side === "against");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, gap: 12 }}>
      <div style={{ width: 22, height: 22, border: "3px solid #3B82F6", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#FAFAFA", border: "1px solid #E5E7EB",
        borderRadius: 14, padding: "16px 20px",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
            ⚖️ Debate Mode
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
            Pick a side. Make your case. Votes surface the best arguments.
            {userSide && <span style={{ color: SIDES[userSide].color, marginLeft: 6 }}>
              You argued: {SIDES[userSide].label}
            </span>}
          </p>
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: "#111827" }}>{args.length}</div>
          <div style={{ fontSize: 11 }}>arguments</div>
        </div>
      </div>

      {/* AI Referee */}
      <RefereeSummary
        summary={summary}
        onRequestSummary={handleSummarize}
        loading={summaryLoading}
      />

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SideColumn
          side="for"
          args={forArgs}
          currentUserId={currentUserId}
          userSide={userSide}
          onSubmit={handleSubmit}
          onVote={handleVote}
          submitLoading={submitLoading}
        />
        <SideColumn
          side="against"
          args={againstArgs}
          currentUserId={currentUserId}
          userSide={userSide}
          onSubmit={handleSubmit}
          onVote={handleVote}
          submitLoading={submitLoading}
        />
      </div>
    </div>
  );
}

/**
 * ─── INTEGRATION into ArticleDetailPage ──────────────────────────
 *
 * 1. Import:
 *    import DebateMode from "./DebateMode";
 *
 * 2. Add a "Debate" tab in the article's tab bar alongside Comments:
 *    const [tab, setTab] = useState("comments"); // or "debate"
 *
 * 3. Render below the article body:
 *    {tab === "debate" && (
 *      <DebateMode articleId={article._id} currentUserId={currentUserId} />
 *    )}
 */