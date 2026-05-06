import { useState } from 'react';
import { Bookmark, BookmarkCheck, Share2, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import FullArticleModal from './ArticleDetails';
import ArticleReview from './ArticleReview';
import ArticleDiscussion from './ArticleDiscussion';
import { useNavigate } from 'react-router-dom';


const TIERS = [
  { min: 85, label: 'Authority',      color: '#7C3AED', bg: '#EDE9FE', icon: '◆' },
  { min: 70, label: 'Verified Voice', color: '#0369A1', bg: '#E0F2FE', icon: '✦' },
  { min: 50, label: 'Contributor',    color: '#065F46', bg: '#D1FAE5', icon: '●' },
  { min: 30, label: 'Emerging',       color: '#92400E', bg: '#FEF3C7', icon: '○' },
  { min: 0,  label: 'Newcomer',       color: '#6B7280', bg: '#F3F4F6', icon: '·' },
];
function getTier(score) { return TIERS.find(t => score >= t.min) || TIERS[4]; }

function CredChip({ score }) {
  if (score == null) return null;
  const tier = getTier(score);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
      background: tier.bg, color: tier.color,
      border: `1px solid ${tier.color}22`,
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {tier.icon} {score}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CATEGORY PILL
───────────────────────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  Politics:    { bg: '#FEE2E2', color: '#991B1B' },
  Sports:      { bg: '#D1FAE5', color: '#065F46' },
  Technology:  { bg: '#E0F2FE', color: '#0369A1' },
  Health:      { bg: '#FEF3C7', color: '#92400E' },
  Finance:     { bg: '#EDE9FE', color: '#5B21B6' },
  Education:   { bg: '#F0FDF4', color: '#166534' },
  MentalHealth:{ bg: '#FDF4FF', color: '#86198F' },
};
function CategoryPill({ category }) {
  if (!category) return null;
  const cfg = CATEGORY_COLORS[category] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
      background: cfg.bg, color: cfg.color, letterSpacing: '.04em',
      textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
    }}>
      {category}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .article-card {
    font-family: 'DM Sans', sans-serif;
    background: #ffffff;
    border: 1px solid #e8e4dc;
    border-radius: 16px;
    overflow: hidden;
    transition: box-shadow .2s, transform .2s;
    position: relative;
  }
  .article-card:hover {
    box-shadow: 0 8px 32px rgba(15,14,23,.10);
    transform: translateY(-2px);
  }
  .article-card.chat-view {
    border-radius: 10px;
    transform: none !important;
    box-shadow: none !important;
  }
  .card-image {
    width: 100%; height: 180px; object-fit: cover;
    display: block; border-bottom: 1px solid #f0ece4;
  }
  .card-body { padding: 16px 18px 14px; }
  .card-category-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; line-height: 1.35;
    color: #0f0e17; margin: 0 0 6px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .card-title.clickable { cursor: pointer; }
  .card-title.clickable:hover { color: #c8553d; }

  .card-author-row {
    display: flex; align-items: center; gap: 7px;
    margin-bottom: 10px; flex-wrap: wrap;
  }
  .card-author-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    background: linear-gradient(135deg, #1a1a2e, #c8553d);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
    overflow: hidden;
  }
  .card-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .card-author-name { font-size: 12px; font-weight: 600; color: #374151; }
  .card-author-email { font-size: 11px; color: #9CA3AF; }
  .card-dot { width: 3px; height: 3px; border-radius: 50%; background: #D1D5DB; }
  .card-source { font-size: 11px; color: #9CA3AF; }

  .card-content {
    font-size: 13.5px; line-height: 1.65; color: #555;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: 12px;
  }
  .card-content.full { -webkit-line-clamp: unset; overflow: visible; }

  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid #f0ece4; padding-top: 10px; gap: 8px; flex-wrap: wrap;
  }
  .card-actions { display: flex; align-items: center; gap: 6px; }
  .card-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e8e4dc;
    background: transparent; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .15s, border-color .15s;
  }
  .card-btn:hover { background: #faf9f6; border-color: #c8553d; }
  .card-btn.saved { background: #EFF6FF; border-color: #BFDBFE; }

  .card-readmore {
    font-size: 12px; font-weight: 600; color: #c8553d;
    cursor: pointer; text-decoration: none; white-space: nowrap;
  }
  .card-readmore:hover { text-decoration: underline; }

  .share-dropdown {
    position: absolute; bottom: 56px; right: 16px;
    background: #fff; border: 1px solid #e8e4dc; border-radius: 12px;
    box-shadow: 0 8px 24px rgba(15,14,23,.12); padding: 14px;
    z-index: 20; width: 220px;
  }
  .share-select {
    width: 100%; border: 1.5px solid #e8e4dc; border-radius: 8px;
    padding: 8px 10px; font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: #374151; margin-bottom: 8px; outline: none;
  }
  .share-select:focus { border-color: #c8553d; }
  .share-btn {
    width: 100%; background: #c8553d; color: #fff; border: none;
    border-radius: 8px; padding: 8px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .15s;
  }
  .share-btn:hover { background: #b04432; }
  .share-btn:disabled { opacity: .5; cursor: not-allowed; }

  @keyframes cardFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .article-card { animation: cardFadeIn .3s ease both; }
`;

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const ArticleCard = ({
  article,
  onSaveToggle,
  currentUserId,
  isSavedTab,
  className = '',
  isChatView = false,
}) => {
  const isUserArticle = !!article.authorId && article.external !== true;

  const [saved,             setSaved]            = useState(!!isSavedTab);
  const [showModal,         setShowModal]         = useState(false);
  const [showShare,         setShowShare]         = useState(false);
  const [communities,       setCommunities]       = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const navigate = useNavigate();

  // Resolve author info — authorId may be a populated object or just an ID string
  const author      = typeof article.authorId === 'object' ? article.authorId : null;
  const authorName  = author?.name  || article.authorName  || null;
  const authorEmail = author?.email || article.authorEmail || null;
  const authorPhoto = author?.profilePhoto || null;
  const authorCred  = author?.credibilityScore ?? null;

  /* ── SAVE ── */
  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSavedTab || saved) {
        await axios.post('/articles/unsave', { articleId: article._id, url: article.url });
        setSaved(false);
        toast.success('Removed from saved');
        if (onSaveToggle) onSaveToggle();
      } else {
        await axios.post('/articles/save',
          isUserArticle
            ? { articleId: article._id }
            : { title: article.title, url: article.url, description: article.description, imageUrl: article.imageUrl || article.urlToImage, source: article.source?.name || article.source, publishedAt: article.publishedAt }
        );
        setSaved(true);
        toast.success('Saved!');
        if (onSaveToggle) onSaveToggle();
      }
    } catch { toast.error('Failed to update saved status'); }
  };

  /* ── SHARE ── */
  const handleShareClick = async (e) => {
    e.stopPropagation();
    setShowShare(prev => !prev);
    if (!showShare && communities.length === 0) {
      try {
        const res = await axios.get('/communities/search?query=');
        setCommunities(res.data.filter(c => c.members.some(m => m === currentUserId || m._id === currentUserId)));
      } catch { toast.error('Failed to load communities'); }
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!selectedCommunity) return;
    try {
      await axios.post(`/communities/${selectedCommunity}/share-article`,
        isUserArticle
          ? { articleId: article._id }
          : { title: article.title, url: article.url, description: article.description, imageUrl: article.imageUrl || article.urlToImage, source: article.source?.name || article.source, publishedAt: article.publishedAt }
      );
      toast.success('Shared to community!');
      setShowShare(false);
      setSelectedCommunity('');
      navigate(`/communities/${selectedCommunity}`);
    } catch { toast.error('Failed to share article'); }
  };

  /* ── CONTENT ── */
  const fullContent  = article.content || article.description || '';
  const previewText  = isChatView ? fullContent : fullContent.slice(0, 200);
  const isTruncated  = !isChatView && fullContent.length > 200;
  const imageSrc     = article.imageUrl || article.urlToImage;
  const publishedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      <style>{CARD_STYLES}</style>

      <div
        className={`article-card ${isChatView ? 'chat-view' : ''} ${className}`}
        onClick={() => { if (isUserArticle && !isChatView) setShowModal(true); }}
      >
        {/* IMAGE */}
        {imageSrc && <img src={imageSrc} alt={article.title} className="card-image" />}

        <div className="card-body">
          {/* CATEGORY + DATE */}
          <div className="card-category-row">
            <CategoryPill category={article.category} />
            {publishedDate && <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>{publishedDate}</span>}
          </div>

          {/* TITLE */}
          <h2 className={`card-title ${isUserArticle && !isChatView ? 'clickable' : ''}`}>
            {article.title}
          </h2>

          {/* AUTHOR ROW — only for user articles */}
          {isUserArticle && authorName && (
            <div className="card-author-row">
              <div className="card-author-avatar">
                {authorPhoto
                  ? <img src={authorPhoto} alt={authorName} />
                  : authorName[0].toUpperCase()
                }
              </div>
              <span className="card-author-name">{authorName}</span>
              {authorEmail && (
                <>
                  <span className="card-dot" />
                  <span className="card-author-email">{authorEmail}</span>
                </>
              )}
              {authorCred != null && (
                <>
                  <span className="card-dot" />
                  <CredChip score={authorCred} />
                </>
              )}
            </div>
          )}

          {/* External source */}
          {!isUserArticle && (article.source?.name || article.source) && (
            <p className="card-source" style={{ marginBottom: 8 }}>
              {article.source?.name || article.source}
            </p>
          )}

          {/* CONTENT */}
          <p className={`card-content ${isChatView ? 'full' : ''}`}>
            {previewText}
          </p>

          {/* FOOTER */}
          <div className="card-footer">
            {/* Read more / external link */}
            <div>
              {!isChatView && isTruncated && isUserArticle && (
                <span className="card-readmore" onClick={e => { e.stopPropagation(); setShowModal(true); }}>
                  Read more →
                </span>
              )}
              {!isChatView && !isUserArticle && article.url && (
                <a href={article.url} target="_blank" rel="noreferrer" className="card-readmore" onClick={e => e.stopPropagation()}>
                  Read original →
                </a>
              )}
            </div>

            {/* Actions */}
            {!isChatView && (
              <div className="card-actions">
                <button className={`card-btn ${saved || isSavedTab ? 'saved' : ''}`} onClick={toggleSave} title={saved ? 'Unsave' : 'Save'}>
                  {(isSavedTab || saved)
                    ? <BookmarkCheck size={16} className="text-blue-500" />
                    : <Bookmark size={16} className="text-gray-500" />
                  }
                </button>
                <button className="card-btn" onClick={handleShareClick} title="Share to community">
                  <Share2 size={16} className="text-green-600" />
                </button>
              </div>
            )}
          </div>

          {/* REVIEW + DISCUSSION — non-chat user articles */}
          {isUserArticle && !isChatView && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0ece4' }}>
              <ArticleReview articleId={article._id} />
              <ArticleDiscussion articleId={article._id} />
            </div>
          )}
        </div>

        {/* SHARE DROPDOWN */}
        {showShare && !isChatView && (
          <div className="share-dropdown" onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Share to community</p>
            {communities.length === 0
              ? <p style={{ fontSize: 12, color: '#9CA3AF' }}>You haven't joined any communities yet.</p>
              : (
                <>
                  <select value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)} className="share-select">
                    <option value="">Select community…</option>
                    {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <button className="share-btn" onClick={handleShare} disabled={!selectedCommunity}>Share</button>
                </>
              )
            }
          </div>
        )}
      </div>

      {/* FULL ARTICLE MODAL */}
      {showModal && isUserArticle && !isChatView && (
        <FullArticleModal article={article} onClose={() => setShowModal(false)} currentUserId={currentUserId} />
      )}
    </>
  );
};

export default ArticleCard;