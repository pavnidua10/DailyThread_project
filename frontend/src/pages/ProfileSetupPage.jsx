import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from "../utils/api";

import ArticleCard from '../components/ArticleCard';
import FullArticleModal from '../components/ArticleDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

export let refreshMyProfile = () => {};

/* ── Inline styles / CSS injected once ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink:      #0f0e17;
    --paper:    #faf9f6;
    --cream:    #f3f0e8;
    --accent:   #c8553d;
    --accent2:  #e8a87c;
    --muted:    #8a8882;
    --border:   #e2ddd6;
    --white:    #ffffff;
    --radius:   16px;
    --shadow:   0 4px 32px rgba(15,14,23,.08);
    --shadow-lg:0 12px 48px rgba(15,14,23,.14);
  }

  .profile-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    min-height: 100vh;
    color: var(--ink);
  }

  /* ── HERO BANNER ── */
  .profile-banner {
    position: relative;
    height: 220px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #c8553d 100%);
    overflow: hidden;
  }
  .profile-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .profile-banner-blob {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,85,61,.35) 0%, transparent 70%);
    top: -120px;
    right: -80px;
    pointer-events: none;
  }

  /* ── MAIN CARD ── */
  .profile-card {
    position: relative;
    background: var(--white);
    border-radius: 24px;
    box-shadow: var(--shadow-lg);
    margin: -64px 32px 0;
    padding: 40px 40px 32px;
    border: 1px solid var(--border);
  }
  @media(max-width:640px){
    .profile-card { margin: -48px 12px 0; padding: 28px 20px 24px; }
  }

  /* ── AVATAR ── */
  .avatar-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  .avatar-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    z-index: 0;
  }
  .avatar-inner {
    position: relative;
    z-index: 1;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e, #c8553d);
    border: 3px solid var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar-inner img { width:100%; height:100%; object-fit:cover; }
  .avatar-letter {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 900;
    color: var(--white);
  }
  .avatar-actions {
    position: absolute;
    bottom: 4px;
    right: 4px;
    display: flex;
    gap: 5px;
    z-index: 10;
  }
  .avatar-btn {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--white);
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.12);
    transition: transform .15s, box-shadow .15s;
  }
  .avatar-btn:hover { transform: scale(1.12); box-shadow: 0 4px 14px rgba(0,0,0,.18); }
  .avatar-uploading {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(255,255,255,.72);
    display: flex; align-items: center; justify-content: center;
    z-index: 12;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: .04em;
  }

  /* ── PROFILE INFO ── */
  .profile-name {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -.02em;
    line-height: 1.1;
    color: var(--ink);
  }
  .profile-email {
    font-size: 14px;
    color: var(--muted);
    font-weight: 400;
    margin-top: 2px;
  }
  .profile-bio {
    font-size: 15px;
    color: #555;
    line-height: 1.6;
    margin-top: 8px;
    font-style: italic;
  }

  /* ── STATS ── */
  .stats-row {
    display: flex;
    gap: 32px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .stat-item { display: flex; flex-direction: column; gap: 2px; }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }
  .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

  /* ── EDIT BTN ── */
  .btn-edit {
    padding: 10px 22px;
    background: var(--ink);
    color: var(--white);
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s, transform .15s;
    white-space: nowrap;
  }
  .btn-edit:hover { background: var(--accent); transform: translateY(-1px); }

  /* ── EDIT FORM ── */
  .edit-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .edit-field input,
  .edit-field textarea {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--ink);
    background: var(--paper);
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    resize: vertical;
    box-sizing: border-box;
  }
  .edit-field input:focus,
  .edit-field textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(200,85,61,.12);
  }
  .btn-save {
    padding: 10px 22px;
    background: var(--accent);
    color: var(--white);
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: background .2s, transform .15s;
  }
  .btn-save:hover { background: #b04432; transform: translateY(-1px); }
  .btn-cancel {
    padding: 10px 22px;
    background: transparent;
    color: var(--muted);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: border-color .2s, color .2s;
  }
  .btn-cancel:hover { border-color: var(--ink); color: var(--ink); }
  .msg-success { font-size: 13px; color: #2d7d5a; font-weight: 500; }

  /* ── TABS ── */
  .tabs-wrap {
    display: flex;
    gap: 4px;
    background: var(--cream);
    border-radius: 14px;
    padding: 5px;
    width: fit-content;
    margin: 36px auto 32px;
  }
  .tab-btn {
    padding: 10px 28px;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
    cursor: pointer;
    transition: background .2s, color .2s, box-shadow .2s;
    white-space: nowrap;
  }
  .tab-btn.active {
    background: var(--white);
    color: var(--ink);
    box-shadow: 0 2px 10px rgba(15,14,23,.1);
  }

  /* ── ARTICLES GRID ── */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    padding: 0 0 48px;
  }
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 64px 20px;
    color: var(--muted);
  }
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: .4;
  }
  .empty-state p {
    font-size: 16px;
    font-weight: 500;
  }

  /* ── OUTER WRAPPER ── */
  .profile-outer {
    max-width: 900px;
    margin: 0 auto;
    padding-bottom: 64px;
  }
`;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '', bio: '', email: '', profilePhoto: '', followers: [], following: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, articlesRes, savedRes] = await Promise.all([
        API.get('/profiles/me'),
        API.get('/articles/articles/by-author'),
        API.get('/articles/articles/saved'),
      ]);
      setProfile({
        name: profileRes.data.name || '',
        bio: profileRes.data.bio || '',
        email: profileRes.data.email || '',
        profilePhoto: profileRes.data.profilePhoto || '',
        followers: profileRes.data.followers || [],
        following: profileRes.data.following || [],
      });
      setArticles(articlesRes.data || []);
      setSavedArticles(savedRes.data || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  refreshMyProfile = fetchMyProfile;

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profiles/profile', { name: profile.name, bio: profile.bio });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchMyProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const handleArticleSaveToggle = async () => {
    try {
      const savedRes = await API.get('/articles/articles/saved');
      setSavedArticles(savedRes.data);
    } catch (error) {
      console.error('Error refreshing saved articles:', error);
    }
  };

  const handlePhotoChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'your_upload_preset_here');
      const res = await fetch(`https://api.cloudinary.com/v1_1/dachmhgyt/image/upload`, {
        method: 'POST', body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        await API.put('/profiles/profile', { profilePhoto: result.secure_url });
        setProfile({ ...profile, profilePhoto: result.secure_url });
      }
    } catch (error) {
      console.error('Profile photo upload failed', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await API.put('/profiles/profile', { profilePhoto: '' });
      setProfile({ ...profile, profilePhoto: '' });
    } catch (error) {
      console.error('Delete profile photo failed', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-root">
        {/* ── BANNER ── */}
        <div className="profile-banner">
          <div className="profile-banner-blob" />
        </div>

        <div className="profile-outer">
          {/* ── PROFILE CARD ── */}
          <div className="profile-card">
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* AVATAR */}
              <div className="avatar-wrap" style={{ marginTop: -56 }}>
                <div className="avatar-ring" />
                <div className="avatar-inner">
                  {profile.profilePhoto
                    ? <img src={profile.profilePhoto} alt="Profile" />
                    : <span className="avatar-letter">{profile.name ? profile.name[0].toUpperCase() : 'U'}</span>
                  }
                </div>
                <div className="avatar-actions">
                  <label className="avatar-btn" title="Change photo">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    <FaPencilAlt size={11} color="#c8553d" />
                  </label>
                  {profile.profilePhoto && (
                    <button className="avatar-btn" onClick={handleDeletePhoto} title="Remove photo">
                      <FaTrash size={11} color="#c8553d" />
                    </button>
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="avatar-uploading">Uploading…</div>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <h2 className="profile-name">{profile.name || 'Your Name'}</h2>
                    <p className="profile-email">{profile.email}</p>
                  </div>
                  {!isEditing && (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="edit-field">
                      <label>Name</label>
                      <input type="text" name="name" value={profile.name} onChange={handleChange} />
                    </div>
                    <div className="edit-field">
                      <label>Bio</label>
                      <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button type="submit" className="btn-save">Save Changes</button>
                      <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                    {message && <p className="msg-success">{message}</p>}
                  </form>
                ) : (
                  <>
                    <p className="profile-bio">{profile.bio || 'No bio added yet.'}</p>
                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="stat-num">{articles.length}</span>
                        <span className="stat-label">Articles</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-num">{profile.followers.length}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-num">{profile.following.length}</span>
                        <span className="stat-label">Following</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="tabs-wrap">
            {['articles', 'saved'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'articles' ? '✍️  Your Articles' : '🔖  Saved'}
              </button>
            ))}
          </div>

          {/* ── GRID ── */}
          <div className="articles-grid">
            {activeTab === 'articles' && (
              articles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>You haven't written any articles yet.</p>
                </div>
              ) : articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  currentUserId={null}
                  onSaveToggle={handleArticleSaveToggle}
                  isSavedTab={false}
                />
              ))
            )}
            {activeTab === 'saved' && (
              savedArticles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔖</div>
                  <p>No saved articles yet.</p>
                </div>
              ) : savedArticles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  currentUserId={null}
                  onSaveToggle={handleArticleSaveToggle}
                  isSavedTab={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;