import { useState } from "react";
import ArticleReview from "./ArticleReview";
import ArticleDiscussion from "./ArticleDiscussion";
import DebateMode from "../pages/DebateMode";


const TIERS = [
  { min: 85, label: 'Authority',      color: '#7C3AED', bg: '#EDE9FE', icon: '◆' },
  { min: 70, label: 'Verified Voice', color: '#0369A1', bg: '#E0F2FE', icon: '✦' },
  { min: 50, label: 'Contributor',    color: '#065F46', bg: '#D1FAE5', icon: '●' },
  { min: 30, label: 'Emerging',       color: '#92400E', bg: '#FEF3C7', icon: '○' },
  { min: 0,  label: 'Newcomer',       color: '#6B7280', bg: '#F3F4F6', icon: '·' },
];
function getTier(score) { return TIERS.find(t => score >= t.min) || TIERS[4]; }


const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --ink:    #0f0e17;
    --paper:  #faf9f6;
    --cream:  #f3f0e8;
    --accent: #c8553d;
    --muted:  #8a8882;
    --border: #e2ddd6;
    --white:  #ffffff;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(15,14,23,.55);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: overlayFadeIn .2s ease both;
  }
  @keyframes overlayFadeIn { from{opacity:0} to{opacity:1} }

  .modal-container {
    background: var(--white);
    border-radius: 24px;
    width: 100%; max-width: 760px;
    max-height: 92vh;
    overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 24px 80px rgba(15,14,23,.22);
    animation: modalSlideUp .3s cubic-bezier(.16,1,.3,1) both;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes modalSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* SCROLLABLE BODY */
  .modal-scroll { overflow-y: auto; flex: 1; }
  .modal-scroll::-webkit-scrollbar { width: 5px; }
  .modal-scroll::-webkit-scrollbar-track { background: var(--cream); }
  .modal-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

  /* HERO IMAGE */
  .modal-hero {
    position: relative; width: 100%; height: 280px;
    overflow: hidden; flex-shrink: 0;
  }
  .modal-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .modal-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 40%, rgba(15,14,23,.7) 100%);
  }
  .modal-hero-meta {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px 28px; color: #fff;
  }
  .modal-hero-category {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    background: var(--accent); color: #fff;
    padding: 3px 10px; border-radius: 999px; margin-bottom: 10px;
  }
  .modal-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 900; line-height: 1.2;
    color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,.3);
  }

  /* NO IMAGE HEADER */
  .modal-header-plain {
    padding: 28px 28px 20px;
    border-bottom: 1px solid var(--border);
  }
  .modal-plain-category {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    background: #FEE2E2; color: var(--accent);
    padding: 3px 10px; border-radius: 999px; margin-bottom: 12px;
  }
  .modal-plain-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 900; line-height: 1.25;
    color: var(--ink); margin: 0;
  }

  /* BACK BUTTON */
  .modal-back {
    position: absolute; top: 16px; left: 16px; z-index: 10;
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,.9); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.4); border-radius: 8px;
    padding: 6px 12px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: var(--ink); transition: background .15s;
  }
  .modal-back:hover { background: var(--white); }
  .modal-back.plain {
    position: static; background: transparent; border: none;
    padding: 0; color: var(--accent); margin-bottom: 16px;
    font-size: 13px;
  }
  .modal-back.plain:hover { text-decoration: underline; }

  /* ARTICLE BODY */
  .modal-body { padding: 24px 28px 0; }

  /* AUTHOR CARD */
  .author-card {
    display: flex; align-items: center; gap: 12px;
    background: var(--paper); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;
  }
  .author-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #1a1a2e, #c8553d);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 900; color: #fff;
    flex-shrink: 0; overflow: hidden; border: 2px solid var(--white);
    box-shadow: 0 2px 8px rgba(15,14,23,.12);
  }
  .author-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .author-info { flex: 1; min-width: 0; }
  .author-name {
    font-size: 14px; font-weight: 600; color: var(--ink);
    margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .author-email {
    font-size: 12px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .author-cred {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
    white-space: nowrap;
  }
  .author-date {
    font-size: 11px; color: var(--muted); text-align: right; flex-shrink: 0;
  }

  /* ARTICLE TEXT */
  .article-text {
    font-size: 16px; line-height: 1.8; color: #2d2c35;
    font-family: 'DM Sans', sans-serif; font-weight: 400;
    white-space: pre-line; margin-bottom: 28px;
    border-left: 3px solid var(--cream); padding-left: 20px;
  }

  /* SOURCE LINK */
  .source-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; color: var(--muted); font-weight: 500;
    background: var(--cream); padding: 4px 10px; border-radius: 999px;
    margin-bottom: 20px; border: 1px solid var(--border);
  }

  /* REVIEW SECTION */
  .review-section {
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    background: var(--paper);
  }
  .section-label {
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 14px;
  }

  /* TABS */
  .modal-tabs-bar {
    display: flex; gap: 2px;
    background: var(--cream); border-radius: 12px; padding: 4px;
    margin: 0 28px 20px;
  }
  .modal-tab {
    flex: 1; padding: 9px 16px; border: none; border-radius: 9px;
    background: transparent; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: var(--muted); transition: all .2s;
  }
  .modal-tab.active {
    background: var(--white); color: var(--ink);
    box-shadow: 0 2px 8px rgba(15,14,23,.08);
  }
  .modal-tab-content { padding: 0 28px 28px; }

  /* DIVIDER */
  .modal-divider { height: 1px; background: var(--border); margin: 0; }
`;

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
const FullArticleModal = ({ article, onClose, currentUserId }) => {
  const [tab, setTab] = useState("comments");

  if (!article) return null;

  const imageSrc    = article.imageUrl || article.urlToImage;
  const author      = typeof article.authorId === 'object' ? article.authorId : null;
  const authorName  = author?.name  || article.authorName  || null;
  const authorEmail = author?.email || article.authorEmail || null;
  const authorPhoto = author?.profilePhoto || null;
  const authorCred  = author?.credibilityScore ?? null;
  const credTier    = authorCred != null ? getTier(authorCred) : null;

  const publishedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const sourceName = typeof article.source === 'object'
    ? article.source?.name
    : article.source;

  return (
    <>
      <style>{MODAL_STYLES}</style>

      {/* OVERLAY — click outside to close */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>

          {/* ── HERO IMAGE or plain header ── */}
          {imageSrc ? (
            <div className="modal-hero">
              <img src={imageSrc} alt={article.title} />
              <div className="modal-hero-gradient" />

              {/* Back button over image */}
              <button className="modal-back" onClick={onClose}>
                ← Back
              </button>

              <div className="modal-hero-meta">
                {article.category && (
                  <span className="modal-hero-category">{article.category}</span>
                )}
                <h2 className="modal-hero-title">{article.title}</h2>
              </div>
            </div>
          ) : (
            <div className="modal-header-plain">
              <button className="modal-back plain" onClick={onClose}>← Back</button>
              {article.category && (
                <span className="modal-plain-category">{article.category}</span>
              )}
              <h2 className="modal-plain-title">{article.title}</h2>
            </div>
          )}

          {/* ── SCROLLABLE CONTENT ── */}
          <div className="modal-scroll">
            <div className="modal-body">

              {/* AUTHOR CARD */}
              {authorName && (
                <div className="author-card">
                  <div className="author-avatar">
                    {authorPhoto
                      ? <img src={authorPhoto} alt={authorName} />
                      : authorName[0].toUpperCase()
                    }
                  </div>
                  <div className="author-info">
                    <p className="author-name">{authorName}</p>
                    {authorEmail && <p className="author-email">{authorEmail}</p>}
                    {credTier && (
                      <span className="author-cred" style={{ background: credTier.bg, color: credTier.color, marginTop: 4, display: 'inline-flex' }}>
                        {credTier.icon} {authorCred} · {credTier.label}
                      </span>
                    )}
                  </div>
                  {publishedDate && (
                    <div className="author-date">
                      <div style={{ fontSize: 10, color: '#C4B5A5', marginBottom: 2 }}>Published</div>
                      {publishedDate}
                    </div>
                  )}
                </div>
              )}

              {/* SOURCE TAG (external articles) */}
              {!authorName && sourceName && (
                <span className="source-tag">
                  📰 {sourceName}
                  {publishedDate && <> · {publishedDate}</>}
                </span>
              )}

              {/* ARTICLE BODY TEXT */}
              <p className="article-text">{article.content || article.description}</p>
            </div>

            {/* ── REVIEW SECTION ── */}
            {article._id && (
              <>
                <div className="review-section">
                  <p className="section-label">Rate this article</p>
                  <ArticleReview articleId={article._id} authorId={article.authorId} />
                </div>

                <div className="modal-divider" />

                {/* ── TABS ── */}
                <div style={{ paddingTop: 20 }}>
                  <div className="modal-tabs-bar">
                    {[
                      { key: 'comments', label: '💬 Comments' },
                      { key: 'debate',   label: '⚖️ Debate'   },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        className={`modal-tab ${tab === key ? 'active' : ''}`}
                        onClick={() => setTab(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="modal-tab-content">
                    {tab === 'comments' && (
                      <ArticleDiscussion articleId={article._id} />
                    )}
                    {tab === 'debate' && (
                      <DebateMode
                        articleId={article._id}
                        currentUserId={currentUserId}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FullArticleModal;