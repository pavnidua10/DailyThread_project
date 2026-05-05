import React, { useEffect, useState, useCallback } from 'react';
import API from "../utils/api";
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

export let refreshMyProfile = () => {};

/* ─────────────────────────────────────────────────────────────────
   STYLES
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
    --radius:    16px;
    --shadow:    0 4px 32px rgba(15,14,23,.08);
    --shadow-lg: 0 12px 48px rgba(15,14,23,.14);
  }

  .profile-root { font-family:'DM Sans',sans-serif; background:var(--paper); min-height:100vh; color:var(--ink); }

  .profile-banner { position:relative; height:220px; background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#c8553d 100%); overflow:hidden; }
  .profile-banner::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .profile-banner-blob { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(200,85,61,.35) 0%,transparent 70%); top:-120px; right:-80px; pointer-events:none; }

  .profile-card { position:relative; background:var(--white); border-radius:24px; box-shadow:var(--shadow-lg); margin:-64px 32px 0; padding:40px 40px 32px; border:1px solid var(--border); }
  @media(max-width:640px){ .profile-card { margin:-48px 12px 0; padding:28px 20px 24px; } }

  .avatar-wrap { position:relative; width:120px; height:120px; flex-shrink:0; }
  .avatar-ring { position:absolute; inset:-4px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); z-index:0; }
  .avatar-inner { position:relative; z-index:1; width:120px; height:120px; border-radius:50%; overflow:hidden; background:linear-gradient(135deg,#1a1a2e,#c8553d); border:3px solid var(--white); display:flex; align-items:center; justify-content:center; }
  .avatar-inner img { width:100%; height:100%; object-fit:cover; }
  .avatar-letter { font-family:'Playfair Display',serif; font-size:42px; font-weight:900; color:var(--white); }
  .avatar-actions { position:absolute; bottom:4px; right:4px; display:flex; gap:5px; z-index:10; }
  .avatar-btn { width:28px; height:28px; border-radius:50%; background:var(--white); border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.12); transition:transform .15s,box-shadow .15s; }
  .avatar-btn:hover { transform:scale(1.12); box-shadow:0 4px 14px rgba(0,0,0,.18); }
  .avatar-uploading { position:absolute; inset:0; border-radius:50%; background:rgba(255,255,255,.72); display:flex; align-items:center; justify-content:center; z-index:12; font-size:11px; font-weight:600; color:var(--accent); letter-spacing:.04em; }

  .profile-name { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; letter-spacing:-.02em; line-height:1.1; color:var(--ink); }
  .profile-email { font-size:14px; color:var(--muted); font-weight:400; margin-top:2px; }
  .profile-bio { font-size:15px; color:#555; line-height:1.6; margin-top:8px; font-style:italic; }

  .stats-row { display:flex; gap:32px; margin-top:20px; padding-top:20px; border-top:1px solid var(--border); flex-wrap:wrap; }
  .stat-item { display:flex; flex-direction:column; gap:2px; }
  .stat-num { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--accent); line-height:1; }
  .stat-label { font-size:12px; color:var(--muted); font-weight:500; letter-spacing:.06em; text-transform:uppercase; }

  .btn-edit { padding:10px 22px; background:var(--ink); color:var(--white); border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s,transform .15s; white-space:nowrap; }
  .btn-edit:hover { background:var(--accent); transform:translateY(-1px); }
  .btn-save { padding:10px 22px; background:var(--accent); color:var(--white); border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s,transform .15s; }
  .btn-save:hover { background:#b04432; transform:translateY(-1px); }
  .btn-cancel { padding:10px 22px; background:transparent; color:var(--muted); border:1.5px solid var(--border); border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:border-color .2s,color .2s; }
  .btn-cancel:hover { border-color:var(--ink); color:var(--ink); }

  .edit-field label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .edit-field input, .edit-field textarea { width:100%; border:1.5px solid var(--border); border-radius:10px; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:15px; color:var(--ink); background:var(--paper); transition:border-color .2s,box-shadow .2s; outline:none; resize:vertical; box-sizing:border-box; }
  .edit-field input:focus, .edit-field textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(200,85,61,.12); }
  .msg-success { font-size:13px; color:#2d7d5a; font-weight:500; }

  .tabs-wrap { display:flex; gap:4px; background:var(--cream); border-radius:14px; padding:5px; width:fit-content; margin:36px auto 32px; overflow-x:auto; }
  .tab-btn { padding:10px 22px; border-radius:10px; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:var(--muted); cursor:pointer; transition:background .2s,color .2s,box-shadow .2s; white-space:nowrap; }
  .tab-btn.active { background:var(--white); color:var(--ink); box-shadow:0 2px 10px rgba(15,14,23,.1); }

  .articles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:24px; padding:0 0 48px; }
  .empty-state { grid-column:1/-1; text-align:center; padding:64px 20px; color:var(--muted); }
  .empty-icon { font-size:48px; margin-bottom:12px; opacity:.4; }
  .empty-state p { font-size:16px; font-weight:500; }

  .profile-outer { max-width:900px; margin:0 auto; padding-bottom:64px; }

  .cred-panel { background:var(--white); border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow); padding:28px; margin:0 0 24px; }
  .cred-tier-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:999px; font-size:13px; font-weight:700; letter-spacing:.02em; }
  .cred-arc-wrap { display:flex; flex-direction:column; align-items:center; }
  .cred-bar-track { height:7px; border-radius:999px; background:var(--cream); overflow:hidden; flex:1; }
  .cred-bar-fill { height:100%; border-radius:999px; transition:width .8s cubic-bezier(.4,0,.2,1); }

  .achievement-badge { display:flex; flex-direction:column; align-items:center; gap:5px; padding:14px 10px; border-radius:14px; border:1px solid var(--border); background:var(--paper); min-width:80px; transition:transform .15s,box-shadow .15s; }
  .achievement-badge:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(15,14,23,.1); }
  .achievement-badge.locked { opacity:.4; filter:grayscale(1); }

  .timeline-item { display:flex; gap:14px; padding:12px 0; border-bottom:1px solid var(--border); }
  .timeline-item:last-child { border-bottom:none; }
  .timeline-icon { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation:fadeUp .4s ease both; }
`;

const TIERS = [
  { min: 85, label: 'Authority', color: '#7C3AED', bg: '#EDE9FE', icon: '◆' },
  { min: 70, label: 'Verified Voice', color: '#0369A1', bg: '#E0F2FE', icon: '✦' },
  { min: 50, label: 'Contributor', color: '#065F46', bg: '#D1FAE5', icon: '●' },
  { min: 30, label: 'Emerging', color: '#92400E', bg: '#FEF3C7', icon: '○' },
  { min: 0, label: 'Newcomer', color: '#6B7280', bg: '#F3F4F6', icon: '·' },
];
function getTier(score) { return TIERS.find(t => score >= t.min) || TIERS[4]; }

const BREAKDOWN_META = [
  { key: 'articleQuality', label: 'Article quality', max: 30, icon: '✍️', desc: 'Based on avg rating of your published articles' },
  { key: 'sourceAccuracy', label: 'Source accuracy', max: 25, icon: '📎', desc: 'How often you cite verified sources' },
  { key: 'communityTrust', label: 'Community trust', max: 20, icon: '👥', desc: 'Upvotes & endorsements from peers' },
  { key: 'consistencyBonus', label: 'Consistency', max: 15, icon: '📅', desc: 'Regular posting, no moderation flags' },
  { key: 'debateScore', label: 'Debate quality', max: 10, icon: '⚖️', desc: 'Net votes on your debate arguments' },
];

const ACHIEVEMENTS = [
  { id: 'first_article', icon: '✍️', label: 'First Article', desc: 'Published your first article', check: (d) => d.articlesPublished >= 1 },
  { id: 'five_articles', icon: '📚', label: '5 Articles', desc: 'Published 5 articles', check: (d) => d.articlesPublished >= 5 },
  { id: 'trusted', icon: '✦', label: 'Trusted', check: (d) => d.total >= 70 },
  { id: 'sourced', icon: '📎', label: 'Source Champ', desc: 'Full source accuracy score', check: (d) => d.breakdown?.sourceAccuracy >= 23 },
  { id: 'consistent', icon: '🔥', label: 'Consistent', desc: 'Full consistency score', check: (d) => d.breakdown?.consistencyBonus >= 13 },
  { id: 'debater', icon: '⚖️', label: 'Debater', desc: 'Earned debate score points', check: (d) => d.breakdown?.debateScore >= 5 },
  { id: 'authority', icon: '◆', label: 'Authority', desc: 'Reached Authority tier (85+)', check: (d) => d.total >= 85 },
  { id: 'community_loved', icon: '❤️', label: 'Community Loved', desc: '20+ peer endorsements', check: (d) => d.endorsedBy >= 20 },
];

function ScoreArc({ score, color, size = 100 }) {
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

function CredibilityPanel({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBreakdown, setActiveBreakdown] = useState(null);

  useEffect(() => {
    if (!userId) return;
    API.get(`/auth/${userId}/credibility`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="cred-panel" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:160, gap:10 }}>
      <div style={{ width:20, height:20, border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'var(--muted)', fontSize:13 }}>Computing your credibility…</span>
    </div>
  );
  if (!data) return null;

  const tier = getTier(data.total);
  const nextTier = TIERS[Math.max(0, TIERS.findIndex(t => data.total >= t.min) - 1)];
  const pointsToNext = nextTier && nextTier.min > data.total ? nextTier.min - data.total : 0;

  return (
    <div className="cred-panel fade-up">
      {/* same as your existing panel */}
    </div>
  );
}

function AchievementsPanel({ credData }) {
  if (!credData) return null;
  return <div className="cred-panel fade-up" style={{ marginBottom:24 }}></div>;
}

const ACTIVITY_CONFIG = {
  article_published: { icon:'✍️', color:'#0369A1', bg:'#E0F2FE', label:'Published an article' },
  debate_argument: { icon:'⚖️', color:'#7C3AED', bg:'#EDE9FE', label:'Argued in debate' },
  verdict_vote: { icon:'🗳️', color:'#065F46', bg:'#D1FAE5', label:'Voted on a verdict' },
  community_joined: { icon:'👥', color:'#D97706', bg:'#FEF3C7', label:'Joined a community' },
  endorsement_received: { icon:'⭐', color:'#C8553D', bg:'#FEF3C7', label:'Received endorsement' },
};

function ActivityTimeline({ userId }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    API.get(`/api/users/${userId}/activity`)
      .then(r => setActivity(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div style={{ textAlign:'center', padding:24, color:'var(--muted)', fontSize:13 }}>Loading activity…</div>;
  if (!activity.length) return <div style={{ textAlign:'center', padding:24, color:'var(--muted)', fontSize:13 }}>No activity yet. Start contributing!</div>;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {activity.slice(0, 10).map((item, i) => {
        const cfg = ACTIVITY_CONFIG[item.type] || ACTIVITY_CONFIG.article_published;
        return (
          <div key={i} className="timeline-item">
            <div className="timeline-icon" style={{ background:cfg.bg }}>
              <span style={{ fontSize:14 }}>{cfg.icon}</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, color:'var(--ink)', fontWeight:500 }}>
                {cfg.label}{item.title ? ` — ` : ''}<span style={{ fontStyle:'italic', color:cfg.color }}>{item.title || ''}</span>
              </p>
              {item.meta && <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--muted)' }}>{item.meta}</p>}
              <p style={{ margin:'3px 0 0', fontSize:11, color:'var(--muted)' }}>{new Date(item.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name:'', bio:'', email:'', profilePhoto:'', followers:[], following:[] });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('credibility');
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [uploadingPhoto, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [credData, setCredData] = useState(null);

  const fetchMyProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, articlesRes, savedRes] = await Promise.all([
        API.get('/profiles/me'),
        API.get('/articles/articles/by-author'),
        API.get('/articles/articles/saved'),
      ]);
      const u = profileRes.data;
      setUserId(u._id);
      setProfile({
        name: u.name || '',
        bio: u.bio || '',
        email: u.email || '',
        profilePhoto: u.profilePhoto || '',
        followers: u.followers || [],
        following: u.following || []
      });
      setArticles(articlesRes.data || []);
      setSavedArticles(savedRes.data || []);
      if (u._id) {
        API.get(`/users/${u._id}/credibility`).then(r => setCredData(r.data)).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  refreshMyProfile = fetchMyProfile;

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profiles/profile', { name: profile.name, bio: profile.bio });
      setMessage('Profile updated!');
      setIsEditing(false);
      fetchMyProfile();
    } catch {
      setMessage('Failed to update profile.');
    }
  };

  const handleSaveToggle = async () => {
    try {
      const r = await API.get('/articles/articles/saved');
      setSavedArticles(r.data);
    } catch {}
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("profilePhoto", file);

      const res = await API.post("/auth/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((p) => ({
        ...p,
        profilePhoto: res.data.profilePhoto || "",
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await API.delete("/auth/profile-image");
      setProfile((p) => ({ ...p, profilePhoto: '' }));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const tier = credData ? getTier(credData.total) : null;

  const TABS = [
    { key:'credibility', label:'⭐ Credibility' },
    { key:'achievements', label:'🏅 Achievements' },
    { key:'activity', label:'📋 Activity' },
    { key:'articles', label:'✍️ Your Articles' },
    { key:'saved', label:'🔖 Saved' },
  ];

  const getImageUrl = (photoPath) => {
    if (!photoPath) return "";
    if (photoPath.startsWith("http")) return photoPath;
    return `http://localhost:5001${photoPath}`;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-root">
        <div className="profile-banner"><div className="profile-banner-blob" /></div>

        <div className="profile-outer">
          <div className="profile-card">
            <div style={{ display:'flex', gap:32, alignItems:'flex-start', flexWrap:'wrap' }}>
              <div className="avatar-wrap" style={{ marginTop:-56 }}>
                <div className="avatar-ring" />
                <div className="avatar-inner">
                  {profile.profilePhoto ? (
                    <img src={getImageUrl(profile.profilePhoto)} alt="Profile" />
                  ) : (
                    <span className="avatar-letter">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="avatar-btn" title="Change photo">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display:'none' }}
                    />
                    <FaPencilAlt size={11} color="#c8553d" />
                  </label>

                  {profile.profilePhoto && (
                    <button
                      className="avatar-btn"
                      onClick={handleDeletePhoto}
                      title="Remove photo"
                      type="button"
                    >
                      <FaTrash size={11} color="#c8553d" />
                    </button>
                  )}
                </div>

                {uploadingPhoto && <div className="avatar-uploading">Uploading…</div>}
              </div>

              <div style={{ flex:1, minWidth:220 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                  <div>
                    <h2 className="profile-name">{profile.name || 'Your Name'}</h2>
                    <p className="profile-email">{profile.email}</p>

                    {tier && credData && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, background:tier.bg, color:tier.color, fontSize:12, fontWeight:700, padding:'3px 12px', borderRadius:999 }}>
                        {tier.icon} {credData.total} · {tier.label}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <button className="btn-edit" onClick={() => setIsEditing(true)} type="button">
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} style={{ marginTop:20, display:'flex', flexDirection:'column', gap:16 }}>
                    <div className="edit-field">
                      <label>Name</label>
                      <input type="text" name="name" value={profile.name} onChange={handleChange} />
                    </div>
                    <div className="edit-field">
                      <label>Bio</label>
                      <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      <button type="submit" className="btn-save">Save Changes</button>
                      <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                    {message && <p className="msg-success">{message}</p>}
                  </form>
                ) : (
                  <>
                    <p className="profile-bio">{profile.bio || 'No bio added yet.'}</p>
                    <div className="stats-row">
                      {[
                        { num: articles.length, label: 'Articles' },
                        { num: profile.followers.length, label: 'Followers' },
                        { num: profile.following.length, label: 'Following' },
                        { num: credData?.total ?? '—', label: 'Cred Score' },
                      ].map(({ num, label }) => (
                        <div key={label} className="stat-item">
                          <span className="stat-num">{num}</span>
                          <span className="stat-label">{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="tabs-wrap">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'credibility' && <CredibilityPanel userId={userId} />}
          {activeTab === 'achievements' && <AchievementsPanel credData={credData} />}

          {activeTab === 'activity' && (
            <div className="cred-panel fade-up">
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, margin:'0 0 4px', color:'var(--ink)' }}>Activity</h3>
              <p style={{ fontSize:13, color:'var(--muted)', margin:'0 0 20px' }}>Your recent contributions across the platform</p>
              <ActivityTimeline userId={userId} />
            </div>
          )}

          {(activeTab === 'articles' || activeTab === 'saved') && (
            <div className="articles-grid">
              {activeTab === 'articles' &&
                (articles.length === 0
                  ? <div className="empty-state"><div className="empty-icon">📝</div><p>You haven't written any articles yet.</p></div>
                  : articles.map(a => <ArticleCard key={a._id} article={a} currentUserId={null} onSaveToggle={handleSaveToggle} isSavedTab={false} />))
              }

              {activeTab === 'saved' &&
                (savedArticles.length === 0
                  ? <div className="empty-state"><div className="empty-icon">🔖</div><p>No saved articles yet.</p></div>
                  : savedArticles.map(a => <ArticleCard key={a._id} article={a} currentUserId={null} onSaveToggle={handleSaveToggle} isSavedTab={true} />))
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;