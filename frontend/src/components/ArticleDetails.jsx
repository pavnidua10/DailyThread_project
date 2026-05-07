import { useEffect, useMemo, useState } from "react";
import ArticleReview from "./ArticleReview";
import ArticleDiscussion from "./ArticleDiscussion";
import DebateMode from "../pages/DebateMode";

const TIERS = [
  { min: 85, label: 'Authority', color: '#7C3AED', bg: '#EDE9FE', icon: '◆' },
  { min: 70, label: 'Verified Voice', color: '#0369A1', bg: '#E0F2FE', icon: '✦' },
  { min: 50, label: 'Contributor', color: '#065F46', bg: '#D1FAE5', icon: '●' },
  { min: 30, label: 'Emerging', color: '#92400E', bg: '#FEF3C7', icon: '○' },
  { min: 0, label: 'Newcomer', color: '#6B7280', bg: '#F3F4F6', icon: '·' },
];

function getTier(score) {
  return TIERS.find((t) => score >= t.min) || TIERS[4];
}

const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --ink: #0f0e17;
    --paper: #faf9f6;
    --cream: #f3f0e8;
    --accent: #c8553d;
    --accent-dark: #a73f2d;
    --muted: #7b786f;
    --border: #dfd8cd;
    --white: #ffffff;
    --soft-shadow: 0 24px 80px rgba(15,14,23,.22);
    --radius-xl: 28px;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(15,14,23,.62);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    animation: overlayFadeIn .18s ease both;
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-container {
    background: var(--white);
    border-radius: var(--radius-xl);
    width: min(96vw, 1220px);
    max-width: 1220px;
    height: min(94vh, 980px);
    max-height: 94vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: var(--soft-shadow);
    animation: modalSlideUp .24s cubic-bezier(.16,1,.3,1) both;
    font-family: 'DM Sans', sans-serif;
    border: 1px solid rgba(223,216,205,.85);
  }

  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(22px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(223,216,205,.9);
  }

  .modal-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .modal-topbar-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 48vw;
  }

  .modal-topbar-subtitle {
    font-size: 11px;
    color: var(--muted);
    white-space: nowrap;
  }

  .modal-close,
  .modal-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--white);
    color: var(--ink);
    padding: 9px 14px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    transition: all .18s ease;
  }

  .modal-close:hover,
  .modal-back:hover {
    background: #fcfbf8;
    border-color: #cdbfae;
  }

  .modal-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(340px, 420px);
    min-height: 0;
    flex: 1;
  }

  .modal-main {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(223,216,205,.9);
    background: linear-gradient(to bottom, #fff 0%, #fffdf9 100%);
  }

  .modal-side {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fcfbf8;
  }

  .modal-scroll,
  .modal-side-scroll {
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: auto;
    scrollbar-color: #9b8e7d #efe9df;
  }

  .modal-scroll::-webkit-scrollbar,
  .modal-side-scroll::-webkit-scrollbar {
    width: 14px;
  }

  .modal-scroll::-webkit-scrollbar-track,
  .modal-side-scroll::-webkit-scrollbar-track {
    background: #efe9df;
    border-left: 1px solid #e2ddd6;
  }

  .modal-scroll::-webkit-scrollbar-thumb,
  .modal-side-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #b3a28f 0%, #8f7f6e 100%);
    border-radius: 999px;
    border: 3px solid #efe9df;
  }

  .modal-scroll::-webkit-scrollbar-thumb:hover,
  .modal-side-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #9d8b77 0%, #7e6e5f 100%);
  }

  .modal-hero {
    position: relative;
    width: 100%;
    height: clamp(280px, 34vh, 420px);
    overflow: hidden;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(223,216,205,.9);
  }

  .modal-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .modal-hero-gradient {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, rgba(15,14,23,.84) 0%, rgba(15,14,23,.42) 32%, rgba(15,14,23,.08) 70%),
      linear-gradient(to right, rgba(15,14,23,.18) 0%, transparent 40%);
  }

  .modal-hero-meta {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 28px 36px 30px;
    color: #fff;
  }

  .modal-hero-category,
  .modal-plain-category {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .09em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 999px;
    margin-bottom: 14px;
  }

  .modal-hero-category {
    background: rgba(200,85,61,.95);
    color: #fff;
  }

  .modal-hero-title,
  .modal-plain-title {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    line-height: 1.14;
    letter-spacing: -.01em;
    margin: 0;
  }

  .modal-hero-title {
    font-size: clamp(30px, 3vw, 46px);
    color: #fff;
    max-width: 16ch;
    text-shadow: 0 6px 24px rgba(0,0,0,.35);
  }

  .modal-header-plain {
    padding: 30px 36px 22px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(to bottom, #fff 0%, #fffcf8 100%);
  }

  .modal-plain-category {
    background: #FEE2E2;
    color: var(--accent);
  }

  .modal-plain-title {
    font-size: clamp(30px, 3vw, 44px);
    color: var(--ink);
    max-width: 17ch;
  }

  .modal-body {
    padding: 28px 36px 34px;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--cream);
    border: 1px solid var(--border);
    color: #625f57;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 11px;
    border-radius: 999px;
  }

  .author-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 18px;
    margin-bottom: 24px;
    box-shadow: 0 6px 24px rgba(15,14,23,.04);
  }

  .author-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a2e, #c8553d);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
    overflow: hidden;
    border: 2px solid var(--white);
    box-shadow: 0 2px 8px rgba(15,14,23,.12);
  }

  .author-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .author-info {
    flex: 1;
    min-width: 0;
  }

  .author-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .author-email {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .author-cred {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
    margin-top: 6px;
  }

  .author-date {
    font-size: 12px;
    color: var(--muted);
    text-align: right;
    flex-shrink: 0;
    line-height: 1.5;
  }

  .author-date-label {
    font-size: 10px;
    color: #b3a293;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 2px;
  }

  .article-lead {
    font-size: 18px;
    line-height: 1.8;
    color: #2c2b33;
    margin: 0 0 16px;
    font-weight: 500;
  }

  .article-text {
    font-size: 17px;
    line-height: 1.95;
    color: #2d2c35;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    white-space: pre-line;
    margin-bottom: 30px;
    padding-left: 22px;
    border-left: 4px solid #e9dfd3;
  }

  .external-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    color: var(--accent);
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
  }

  .external-link:hover {
    color: var(--accent-dark);
    text-decoration: underline;
  }

  .side-section {
    padding: 20px 20px 0;
  }

  .side-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 6px 20px rgba(15,14,23,.04);
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .09em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }

  .modal-tabs-wrap {
    padding: 18px 20px 0;
  }

  .modal-tabs-bar {
    display: flex;
    gap: 6px;
    background: #efe9df;
    border-radius: 14px;
    padding: 5px;
    margin-bottom: 14px;
  }

  .modal-tab {
    flex: 1;
    padding: 11px 16px;
    border: none;
    border-radius: 11px;
    background: transparent;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    transition: all .2s ease;
  }

  .modal-tab.active {
    background: var(--white);
    color: var(--ink);
    box-shadow: 0 2px 10px rgba(15,14,23,.08);
  }

  .modal-tab-content {
    padding: 0 20px 24px;
  }

  .helper-note {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 1080px) {
    .modal-container {
      width: min(98vw, 1100px);
      height: 95vh;
    }

    .modal-layout {
      grid-template-columns: 1fr;
    }

    .modal-main {
      border-right: none;
      border-bottom: 1px solid rgba(223,216,205,.9);
    }

    .modal-side {
      min-height: 360px;
      max-height: 48vh;
    }

    .modal-topbar-title {
      max-width: 56vw;
    }
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 8px;
    }

    .modal-container {
      width: 100%;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-topbar {
      padding: 12px 12px;
    }

    .modal-topbar-title {
      max-width: 40vw;
    }

    .modal-close,
    .modal-back {
      padding: 9px 11px;
      font-size: 12px;
    }

    .modal-hero {
      height: 250px;
    }

    .modal-hero-meta,
    .modal-header-plain,
    .modal-body {
      padding-left: 18px;
      padding-right: 18px;
    }

    .modal-body {
      padding-top: 20px;
      padding-bottom: 24px;
    }

    .author-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .author-date {
      width: 100%;
      text-align: left;
      padding-top: 4px;
    }

    .modal-tabs-wrap,
    .modal-tab-content,
    .side-section {
      padding-left: 14px;
      padding-right: 14px;
    }

    .modal-tab {
      font-size: 12px;
      padding: 10px 12px;
    }

    .article-lead {
      font-size: 16px;
    }

    .article-text {
      font-size: 15px;
      line-height: 1.82;
      padding-left: 14px;
    }

    .modal-scroll::-webkit-scrollbar,
    .modal-side-scroll::-webkit-scrollbar {
      width: 12px;
    }
  }
`;

const FullArticleModal = ({ article, onClose, currentUserId }) => {
  const [tab, setTab] = useState("comments");

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (!article) return null;

  const imageSrc = article.imageUrl || article.urlToImage;
  const author = typeof article.authorId === "object" ? article.authorId : null;
  const authorName = author?.name || article.authorName || null;
  const authorEmail = author?.email || article.authorEmail || null;
  const authorPhoto = author?.profilePhoto || null;
  const authorCred = author?.credibilityScore ?? null;
  const credTier = authorCred != null ? getTier(authorCred) : null;

  const publishedDate =
    article.publishedAt || article.createdAt
      ? new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const sourceName =
    typeof article.source === "object" ? article.source?.name : article.source;

  const articleBody = article.content || article.description || "";
  const articleLead = useMemo(() => {
    const text = (article.description || article.content || "").trim();
    if (!text) return null;
    return text.length > 220 ? `${text.slice(0, 220)}...` : text;
  }, [article.description, article.content]);

  return (
    <>
      <style>{MODAL_STYLES}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={article.title}
        >
          <div className="modal-topbar">
            <div className="modal-topbar-left">
              <button className="modal-back" onClick={onClose} aria-label="Close article modal">
                ← Back
              </button>
              <div style={{ minWidth: 0 }}>
                <div className="modal-topbar-title">{article.title}</div>
                <div className="modal-topbar-subtitle">
                  {publishedDate || "Article"} {sourceName ? `· ${sourceName}` : ""}
                </div>
              </div>
            </div>

            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="modal-layout">
            <div className="modal-main">
              <div className="modal-scroll">
                {imageSrc ? (
                  <div className="modal-hero">
                    <img src={imageSrc} alt={article.title} />
                    <div className="modal-hero-gradient" />
                    <div className="modal-hero-meta">
                      {article.category && (
                        <span className="modal-hero-category">{article.category}</span>
                      )}
                      <h2 className="modal-hero-title">{article.title}</h2>
                    </div>
                  </div>
                ) : (
                  <div className="modal-header-plain">
                    {article.category && (
                      <span className="modal-plain-category">{article.category}</span>
                    )}
                    <h2 className="modal-plain-title">{article.title}</h2>
                  </div>
                )}

                <div className="modal-body">
                  <div className="meta-row">
                    {sourceName && <span className="meta-pill">📰 {sourceName}</span>}
                    {publishedDate && <span className="meta-pill">📅 {publishedDate}</span>}
                    {article.region && <span className="meta-pill">🌍 {article.region}</span>}
                  </div>

                  {authorName && (
                    <div className="author-card">
                      <div className="author-avatar">
                        {authorPhoto ? (
                          <img src={authorPhoto} alt={authorName} />
                        ) : (
                          authorName[0].toUpperCase()
                        )}
                      </div>

                      <div className="author-info">
                        <p className="author-name">{authorName}</p>
                        {authorEmail && <p className="author-email">{authorEmail}</p>}
                        {credTier && (
                          <span
                            className="author-cred"
                            style={{ background: credTier.bg, color: credTier.color }}
                          >
                            {credTier.icon} {authorCred} · {credTier.label}
                          </span>
                        )}
                      </div>

                      {publishedDate && (
                        <div className="author-date">
                          <div className="author-date-label">Published</div>
                          {publishedDate}
                        </div>
                      )}
                    </div>
                  )}

                  {articleLead && articleBody !== articleLead && (
                    <p className="article-lead">{articleLead}</p>
                  )}

                  <p className="article-text">{articleBody}</p>

                  {!authorName && article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="external-link"
                    >
                      Read original article ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            <aside className="modal-side">
              <div className="modal-side-scroll">
                {article._id && (
                  <>
                    <div className="side-section">
                      <div className="side-card">
                        <p className="section-label">Rate this article</p>
                        <ArticleReview articleId={article._id} authorId={article.authorId} />
                      </div>
                    </div>

                    <div className="modal-tabs-wrap">
                      <div className="modal-tabs-bar">
                        {[
                          { key: "comments", label: "💬 Comments" },
                          { key: "debate", label: "⚖️ Debate" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            className={`modal-tab ${tab === key ? "active" : ""}`}
                            onClick={() => setTab(key)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="modal-tab-content">
                      {tab === "comments" && (
                        <ArticleDiscussion articleId={article._id} />
                      )}

                      {tab === "debate" && (
                        <DebateMode
                          articleId={article._id}
                          currentUserId={currentUserId}
                        />
                      )}
                    </div>
                  </>
                )}

                {!article._id && (
                  <div className="side-section">
                    <div className="side-card">
                      <p className="section-label">Discussion</p>
                      <p className="helper-note">
                        This article is external, so rating and internal debate are unavailable here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullArticleModal;