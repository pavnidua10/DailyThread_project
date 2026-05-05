import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ArticleCard from "../components/ArticleCard";

/* ─────────────────────────────────────────────────────────────────
   STYLES — matches ProfilePage editorial aesthetic
───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink:       #0f0e17;
    --paper:     #faf9f6;
    --cream:     #f3f0e8;
    --accent:    #c8553d;
    --accent2:   #e8a87c;
    --muted:     #8a8882;
    --border:    #e2ddd6;
    --white:     #ffffff;
    --shadow:    0 4px 32px rgba(15,14,23,.08);
    --shadow-lg: 0 12px 48px rgba(15,14,23,.14);
  }

  .pub-root { font-family:'DM Sans',sans-serif; background:var(--paper); min-height:100vh; color:var(--ink); }

  /* BANNER */
  .pub-banner {
    position: relative; height: 200px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #c8553d 100%);
    overflow: hidden;
  }
  .pub-banner::before {
    content:''; position:absolute; inset:0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .pub-banner-blob {
    position:absolute; width:360px; height:360px; border-radius:50%;
    background:radial-gradient(circle,rgba(200,85,61,.3) 0%,transparent 70%);
    top:-100px; right:-60px; pointer-events:none;
  }

  /* PROFILE CARD */
  .pub-card {
    position:relative; background:var(--white); border-radius:24px;
    box-shadow:var(--shadow-lg); margin:-60px 32px 0;
    padding:36px 40px 28px; border:1px solid var(--border);
  }
  @media(max-width:640px){ .pub-card { margin:-44px 12px 0; padding:24px 18px 20px; } }

  /* AVATAR */
  .pub-avatar-wrap { position:relative; width:110px; height:110px; flex-shrink:0; }
  .pub-avatar-ring { position:absolute; inset:-4px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); z-index:0; }
  .pub-avatar-inner {
    position:relative; z-index:1; width:110px; height:110px;
    border-radius:50%; overflow:hidden; background:linear-gradient(135deg,#1a1a2e,#c8553d);
    border:3px solid var(--white); display:flex; align-items:center; justify-content:center;
  }
  .pub-avatar-inner img { width:100%; height:100%; object-fit:cover; }
  .pub-avatar-letter { font-family:'Playfair Display',serif; font-size:38px; font-weight:900; color:var(--white); }

  /* TYPOGRAPHY */
  .pub-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; letter-spacing:-.02em; line-height:1.1; color:var(--ink); margin:0; }
  .pub-email { font-size:13px; color:var(--muted); margin-top:2px; }
  .pub-bio { font-size:14px; color:#555; line-height:1.65; margin-top:8px; font-style:italic; }

  /* STATS ROW */
  .pub-stats { display:flex; gap:28px; margin-top:18px; padding-top:18px; border-top:1px solid var(--border); flex-wrap:wrap; }
  .pub-stat { display:flex; flex-direction:column; gap:2px; }
  .pub-stat-num { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:var(--accent); line-height:1; }
  .pub-stat-label { font-size:11px; color:var(--muted); font-weight:500; letter-spacing:.06em; text-transform:uppercase; }

  /* FOLLOW BUTTON */
  .btn-follow {
    padding:10px 24px; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    cursor:pointer; transition:all .2s; white-space:nowrap; border:none;
  }
  .btn-follow.following {
    background:transparent; color:var(--muted);
    border:1.5px solid var(--border);
  }
  .btn-follow.following:hover { border-color:#DC2626; color:#DC2626; }
  .btn-follow.not-following { background:var(--ink); color:var(--white); }
  .btn-follow.not-following:hover { background:var(--accent); transform:translateY(-1px); }

  /* TABS */
  .pub-tabs { display:flex; gap:4px; background:var(--cream); border-radius:14px; padding:5px; width:fit-content; margin:32px auto 28px; overflow-x:auto; }
  .pub-tab { padding:9px 20px; border-radius:10px; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:var(--muted); cursor:pointer; transition:all .2s; white-space:nowrap; }
  .pub-tab.active { background:var(--white); color:var(--ink); box-shadow:0 2px 10px rgba(15,14,23,.1); }

  /* OUTER */
  .pub-outer { max-width:900px; margin:0 auto; padding-bottom:64px; }

  /* PANELS */
  .pub-panel { background:var(--white); border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow); padding:28px; margin-bottom:20px; }

  /* CREDIBILITY */
  .cred-tier-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:700; }
  .cred-bar-track { height:7px; border-radius:999px; background:var(--cream); overflow:hidden; flex:1; }
  .cred-bar-fill { height:100%; border-radius:999px; transition:width .8s cubic-bezier(.4,0,.2,1); }

  /* ACHIEVEMENT BADGES */
  .ach-badge { display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 8px; border-radius:12px; border:1px solid var(--border); background:var(--paper); min-width:72px; }
  .ach-badge.locked { opacity:.3; filter:grayscale(1); }

  /* ARTICLES GRID */
  .pub-articles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
  .pub-empty { text-align:center; padding:48px 20px; color:var(--muted); }
  .pub-empty-icon { font-size:40px; margin-bottom:10px; opacity:.4; }

  /* TIMELINE */
  .timeline-item { display:flex; gap:12px; padding:11px 0; border-bottom:1px solid var(--border); }
  .timeline-item:last-child { border-bottom:none; }
  .timeline-icon { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px; }

  /* COMPARE TOOLTIP */
  .compare-bar { height:6px; border-radius:999px; background:var(--cream); overflow:hidden; flex:1; }
  .compare-fill { height:100%; border-radius:999px; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation:fadeUp .35s ease both; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

/* ─────────────────────────────────────────────────────────────────
   TIER CONFIG
───────────────────────────────────────────────────────────────── */
const TIERS = [
  { min: 85, label: 'Authority',      color: '#7C3AED', bg: '#EDE9FE', icon: '◆' },
  { min: 70, label: 'Verified Voice', color: '#0369A1', bg: '#E0F2FE', icon: '✦' },
  { min: 50, label: 'Contributor',    color: '#065F46', bg: '#D1FAE5', icon: '●' },
  { min: 30, label: 'Emerging',       color: '#92400E', bg: '#FEF3C7', icon: '○' },
  { min: 0,  label: 'Newcomer',       color: '#6B7280', bg: '#F3F4F6', icon: '·' },
];
function getTier(score) { return TIERS.find(t => score >= t.min) || TIERS[4]; }

const BREAKDOWN_META = [
  { key: 'articleQuality',   label: 'Article quality',  max: 30, icon: '✍️' },
  { key: 'sourceAccuracy',   label: 'Source accuracy',  max: 25, icon: '📎' },
  { key: 'communityTrust',   label: 'Community trust',  max: 20, icon: '👥' },
  { key: 'consistencyBonus', label: 'Consistency',      max: 15, icon: '📅' },
  { key: 'debateScore',      label: 'Debate quality',   max: 10, icon: '⚖️' },
];

const ACHIEVEMENTS = [
  { id: 'first_article',    icon: '✍️', label: 'First Article',   check: (d) => d.articlesPublished >= 1    },
  { id: 'five_articles',    icon: '📚', label: '5 Articles',      check: (d) => d.articlesPublished >= 5    },
  { id: 'trusted',          icon: '✦',  label: 'Trusted',         check: (d) => d.total >= 70               },
  { id: 'sourced',          icon: '📎', label: 'Source Champ',    check: (d) => d.breakdown?.sourceAccuracy >= 23 },
  { id: 'consistent',       icon: '🔥', label: 'Consistent',      check: (d) => d.breakdown?.consistencyBonus >= 13 },
  { id: 'debater',          icon: '⚖️', label: 'Debater',         check: (d) => d.breakdown?.debateScore >= 5 },
  { id: 'authority',        icon: '◆',  label: 'Authority',       check: (d) => d.total >= 85               },
  { id: 'community_loved',  icon: '❤️', label: 'Community Loved', check: (d) => d.endorsedBy >= 20          },
];

/* ─────────────────────────────────────────────────────────────────
   SCORE ARC SVG
───────────────────────────────────────────────────────────────── */
function ScoreArc({ score, color, size = 90 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#F3F4F6" strokeWidth={size*0.09} strokeLinecap="round" />
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={color} strokeWidth={size*0.09} strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
      <text x={cx} y={cy-2} textAnchor="middle" fontSize={size*0.22} fontWeight="800" fill={color} fontFamily="'Playfair Display',serif">{score}</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PUBLIC CREDIBILITY PANEL
   Shows score + breakdown but NOT the "how to improve" tips
   (those are private to the user's own profile)
───────────────────────────────────────────────────────────────── */
function PublicCredibilityPanel({ userId, userName }) {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    API.get(`/auth/${userId}/credibility`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [userId]);

  if (loading) return (
    <div className="pub-panel" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:140, gap:10 }}>
      <div style={{ width:18, height:18, border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <span style={{ color:'var(--muted)', fontSize:13 }}>Loading credibility…</span>
    </div>
  );
  if (!data) return null;

  const tier = getTier(data.total);

  return (
    <div className="pub-panel fade-up">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:10 }}>
        <div>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, margin:'0 0 3px', color:'var(--ink)' }}>
            {userName}'s Credibility
          </h3>
          <p style={{ fontSize:12, color:'var(--muted)', margin:0 }}>
            Earned through articles, sourcing, and community trust
          </p>
        </div>
        <div className="cred-tier-chip" style={{ background:tier.bg, color:tier.color }}>
          {tier.icon} {tier.label}
        </div>
      </div>

      {/* Arc + quick stats */}
      <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap', marginBottom:24 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <ScoreArc score={data.total} color={tier.color} size={100} />
          <span style={{ fontSize:10, color:'var(--muted)', marginTop:3 }}>out of 100</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px', flex:1, paddingTop:4 }}>
          {[
            { label:'Articles published', value:data.articlesPublished },
            { label:'Peer endorsements',  value:data.endorsedBy        },
            { label:'Member for',         value:`${data.joinedDaysAgo} days` },
            { label:'Flags on record',    value:data.flaggedCount, danger:data.flaggedCount > 0 },
          ].map(({ label, value, danger }) => (
            <div key={label}>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:18, fontWeight:700, color: danger ? '#DC2626' : 'var(--ink)', fontFamily:"'Playfair Display',serif" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
        <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:12 }}>Score breakdown</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {BREAKDOWN_META.map(({ key, label, max, icon }) => {
            const val  = data.breakdown?.[key] ?? 0;
            const pct  = Math.round((val / max) * 100);
            return (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:13 }}>{icon}</span>
                <span style={{ fontSize:12, color:'var(--ink)', minWidth:120 }}>{label}</span>
                <div className="cred-bar-track">
                  <div className="cred-bar-fill" style={{ width:`${pct}%`, background: pct >= 80 ? '#059669' : tier.color }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:tier.color, minWidth:36, textAlign:'right' }}>{val}/{max}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* What this score means for the reader */}
      <div style={{ marginTop:18, padding:'12px 16px', background:tier.bg, borderRadius:12, border:`1px solid ${tier.color}22` }}>
        <p style={{ margin:0, fontSize:12, color:tier.color, fontWeight:600 }}>
          {tier.icon} What this means for you as a reader
        </p>
        <p style={{ margin:'4px 0 0', fontSize:12, color:'var(--ink)', lineHeight:1.6 }}>
          {data.total >= 85 && `${userName} is a top-tier Authority. Their articles are consistently well-sourced and peer-validated. High confidence in their contributions.`}
          {data.total >= 70 && data.total < 85 && `${userName} is a Verified Voice with a proven track record. Their claims are generally reliable and well-cited.`}
          {data.total >= 50 && data.total < 70 && `${userName} is an active Contributor. Cross-reference their claims with sourced articles for best results.`}
          {data.total >= 30 && data.total < 50 && `${userName} is an Emerging voice. They're building their credibility — approach their claims with normal scrutiny.`}
          {data.total < 30  && `${userName} is new to the platform. Their contributions don't have a track record yet.`}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ACHIEVEMENTS (public view — shows locked badges too)
───────────────────────────────────────────────────────────────── */
function PublicAchievements({ userId, userName }) {
  const [data, setData]   = useState(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    if (!userId) return;
    API.get(`/users/${userId}/credibility`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [userId]);

  if (loading) return null;
  if (!data) return null;

  const unlocked = ACHIEVEMENTS.filter(a => a.check(data));
  const locked   = ACHIEVEMENTS.filter(a => !a.check(data));

  return (
    <div className="pub-panel fade-up">
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, margin:'0 0 3px', color:'var(--ink)' }}>Achievements</h3>
      <p style={{ fontSize:12, color:'var(--muted)', margin:'0 0 18px' }}>
        {userName} has unlocked {unlocked.length} of {ACHIEVEMENTS.length} badges
      </p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {[...unlocked, ...locked].map(({ id, icon, label, check }) => {
          const earned = check(data);
          return (
            <div key={id} className={`ach-badge${earned ? '' : ' locked'}`}>
              <span style={{ fontSize:20 }}>{icon}</span>
              <span style={{ fontSize:9, fontWeight:600, color:'var(--ink)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
              {earned && <span style={{ fontSize:8, color:'#059669', fontWeight:700 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ACTIVITY TIMELINE (public)
───────────────────────────────────────────────────────────────── */
const ACTIVITY_CONFIG = {
  article_published:    { icon:'✍️', color:'#0369A1', bg:'#E0F2FE', label:'Published an article'  },
  debate_argument:      { icon:'⚖️', color:'#7C3AED', bg:'#EDE9FE', label:'Argued in debate'      },
  verdict_vote:         { icon:'🗳️', color:'#065F46', bg:'#D1FAE5', label:'Voted on a verdict'    },
  community_joined:     { icon:'👥', color:'#D97706', bg:'#FEF3C7', label:'Joined a community'    },
  endorsement_received: { icon:'⭐', color:'#C8553D', bg:'#FEF3C7', label:'Received endorsement'  },
};

function PublicActivity({ userId }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoad]      = useState(true);

  useEffect(() => {
    if (!userId) return;
    API.get(`/users/${userId}/activity`)
      .then(r => setActivity(r.data || []))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [userId]);

  if (loading) return <div style={{ textAlign:'center', padding:24, color:'var(--muted)', fontSize:13 }}>Loading activity…</div>;
  if (!activity.length) return <div style={{ textAlign:'center', padding:24, color:'var(--muted)', fontSize:13 }}>No public activity yet.</div>;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {activity.slice(0, 8).map((item, i) => {
        const cfg = ACTIVITY_CONFIG[item.type] || ACTIVITY_CONFIG.article_published;
        return (
          <div key={i} className="timeline-item">
            <div className="timeline-icon" style={{ background:cfg.bg }}>
              <span>{cfg.icon}</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, color:'var(--ink)', fontWeight:500 }}>
                {cfg.label}{item.title ? ' — ' : ''}
                <span style={{ fontStyle:'italic', color:cfg.color }}>{item.title || ''}</span>
              </p>
              {item.meta && <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--muted)' }}>{item.meta}</p>}
              <p style={{ margin:'3px 0 0', fontSize:11, color:'var(--muted)' }}>
                {new Date(item.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
const PublicProfilePage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('credibility');
  const [articles, setArticles]   = useState([]);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoad] = useState(false);
  const [credData, setCredData]   = useState(null);

  // Fetch everything in parallel
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      API.get(`/profiles/${id}`),
      API.get(`/articles/articles/by-author/${id}`).catch(() => ({ data: [] })),
      API.get(`/users/${id}/credibility`).catch(() => ({ data: null })),
      API.get('/profiles/me').catch(() => ({ data: null })),
    ]).then(([profileRes, articlesRes, credRes, meRes]) => {
      setUser(profileRes.data);
      setArticles(articlesRes.data || []);
      setCredData(credRes.data);

      // Check if current user already follows this person
      const me = meRes.data;
      if (me && profileRes.data?.followers) {
        setFollowing(profileRes.data.followers.some(f => f === me._id || f?._id === me._id));
      }
    }).catch(err => {
      console.error(err);
      setError('User not found');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleFollow = useCallback(async () => {
    try {
      setFollowLoad(true);
      if (following) {
        await API.post(`/profiles/${id}/unfollow`);
        setFollowing(false);
        setUser(u => ({ ...u, followers: (u.followers || []).filter(f => f !== id) }));
      } else {
        await API.post(`/profiles/${id}/follow`);
        setFollowing(true);
        setUser(u => ({ ...u, followers: [...(u.followers || []), id] }));
      }
    } catch (e) { console.error(e); } finally { setFollowLoad(false); }
  }, [following, id]);

  if (loading) return <LoadingSpinner />;
  if (error)   return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'var(--ink)' }}>Profile Not Found</h2>
        <p style={{ color:'var(--muted)', marginTop:8 }}>The user you are looking for does not exist.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop:16, padding:'9px 20px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600 }}>← Go back</button>
      </div>
    </div>
  );
  if (!user) return null;

  const tier = credData ? getTier(credData.total) : null;

  const TABS = [
    { key:'credibility',  label:'⭐ Credibility'  },
    { key:'achievements', label:'🏅 Achievements'  },
    { key:'articles',     label:'✍️ Articles'      },
    { key:'activity',     label:'📋 Activity'      },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="pub-root">
        {/* BANNER */}
        <div className="pub-banner"><div className="pub-banner-blob" /></div>

        <div className="pub-outer">
          {/* PROFILE CARD */}
          <div className="pub-card">
            <div style={{ display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap' }}>

              {/* Avatar */}
              <div className="pub-avatar-wrap" style={{ marginTop:-52 }}>
                <div className="pub-avatar-ring" />
                <div className="pub-avatar-inner">
                  {user.profilePhoto
                    ? <img src={user.profilePhoto} alt={user.name} />
                    : <span className="pub-avatar-letter">{user.name?.[0]?.toUpperCase() || '?'}</span>
                  }
                </div>
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <h1 className="pub-name">{user.name}</h1>
                    <p className="pub-email">{user.email}</p>
                    {/* Credibility tier chip inline */}
                    {tier && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, background:tier.bg, color:tier.color, fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:999 }}>
                        {tier.icon} {credData.total} · {tier.label}
                      </div>
                    )}
                  </div>

                  {/* Follow button */}
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`btn-follow ${following ? 'following' : 'not-following'}`}
                  >
                    {followLoading ? '…' : following ? 'Following ✓' : '+ Follow'}
                  </button>
                </div>

                <p className="pub-bio">{user.bio || 'No bio added yet.'}</p>

                {/* Stats */}
                <div className="pub-stats">
                  {[
                    { num: articles.length,                label: 'Articles'    },
                    { num: user.followers?.length || 0,    label: 'Followers'   },
                    { num: user.following?.length || 0,    label: 'Following'   },
                    { num: credData?.total ?? '—',         label: 'Cred Score'  },
                    { num: credData?.endorsedBy ?? '—',    label: 'Endorsements'},
                  ].map(({ num, label }) => (
                    <div key={label} className="pub-stat">
                      <span className="pub-stat-num">{num}</span>
                      <span className="pub-stat-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="pub-tabs">
            {TABS.map(({ key, label }) => (
              <button key={key} className={`pub-tab${activeTab===key?' active':''}`} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'credibility'  && <PublicCredibilityPanel userId={id} userName={user.name} />}
          {activeTab === 'achievements' && <PublicAchievements userId={id} userName={user.name} />}

          {activeTab === 'articles' && (
            articles.length === 0
              ? <div className="pub-empty"><div className="pub-empty-icon">📝</div><p style={{ color:'var(--muted)', fontSize:15, fontWeight:500 }}>{user.name} hasn't published any articles yet.</p></div>
              : <div className="pub-articles-grid">
                  {articles.map(a => <ArticleCard key={a._id} article={a} currentUserId={null} />)}
                </div>
          )}

          {activeTab === 'activity' && (
            <div className="pub-panel fade-up">
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, margin:'0 0 3px', color:'var(--ink)' }}>Recent Activity</h3>
              <p style={{ fontSize:12, color:'var(--muted)', margin:'0 0 18px' }}>{user.name}'s contributions across the platform</p>
              <PublicActivity userId={id} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProfilePage;