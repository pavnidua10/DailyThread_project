import { useState } from 'react';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import FullArticleModal from './ArticleDetails';
import ArticleReview from './ArticleReview';
import ArticleDiscussion from './ArticleDiscussion';
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({
  article,
  onSaveToggle,
  currentUserId,
  isSavedTab,
  className = '',
  isChatView = false // ✅ NEW PROP
}) => {
  const isUserArticle = !!article.authorId && article.external !== true;

  const [saved, setSaved] = useState(!!isSavedTab);
  const [showModal, setShowModal] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const navigate = useNavigate();

  /* ================= SAVE ================= */

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSavedTab || saved) {
        await axios.post('/articles/unsave', {
          articleId: article._id,
          url: article.url
        });
        setSaved(false);
        toast.success('Removed from saved');
        if (onSaveToggle) onSaveToggle();
      } else {
        if (isUserArticle) {
          await axios.post('/articles/save', { articleId: article._id });
        } else {
          await axios.post('/articles/save', {
            title: article.title,
            url: article.url,
            description: article.description,
            imageUrl: article.imageUrl || article.urlToImage,
            source: article.source?.name || article.source,
            publishedAt: article.publishedAt,
          });
        }
        setSaved(true);
        toast.success('Saved!');
        if (onSaveToggle) onSaveToggle();
      }
    } catch (error) {
      toast.error('Failed to update saved status');
    }
  };

  /* ================= MODAL ================= */

  const handleCardClick = () => {
    if (isUserArticle && !isChatView) {
      setShowModal(true);
    }
  };

  /* ================= SHARE ================= */

  const handleShareClick = async (e) => {
    e.stopPropagation();
    setShowShare((prev) => !prev);

    if (!showShare && communities.length === 0) {
      try {
        const res = await axios.get('/communities/search?query=');
        const userCommunities = res.data.filter((c) =>
          c.members.some(
            (m) => m === currentUserId || m._id === currentUserId
          )
        );
        setCommunities(userCommunities);
      } catch (err) {
        toast.error('Failed to load communities');
      }
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!selectedCommunity) return;

    try {
      await axios.post(
        `/communities/${selectedCommunity}/share-article`,
        isUserArticle
          ? { articleId: article._id }
          : {
              title: article.title,
              url: article.url,
              description: article.description,
              imageUrl: article.imageUrl || article.urlToImage,
              source: article.source?.name || article.source,
              publishedAt: article.publishedAt,
            }
      );

      toast.success('Article shared to community!');
      setShowShare(false);
      setSelectedCommunity('');
      navigate(`/communities/${selectedCommunity}`);
    } catch (err) {
      toast.error('Failed to share article');
    }
  };

  /* ================= CONTENT LOGIC ================= */

  const fullContent = article.content || article.description || '';

  const previewText = isChatView
    ? fullContent // ✅ FULL article in chat
    : isUserArticle
    ? (article.content?.slice(0, 200) ||
        article.description?.slice(0, 200) ||
        '')
    : fullContent;

  /* ================= UI ================= */

  return (
    <>
      <div
        className={`relative border p-4 rounded-lg shadow space-y-4 hover:bg-gray-50 transition ${className}`}
        onClick={handleCardClick}
        style={{ cursor: isUserArticle && !isChatView ? 'pointer' : 'default' }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{article.title}</h2>
            <p className="text-sm text-gray-600">
              {article.source?.name || article.source}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={toggleSave}>
              {(isSavedTab || saved) ? (
                <BookmarkCheck className="text-blue-500" />
              ) : (
                <Bookmark />
              )}
            </button>

            {/* ❌ Hide share button in chat */}
            {!isChatView && (
              <button
                className="ml-1"
                title="Share to Community"
                onClick={handleShareClick}
              >
                <Share2 className="text-green-600" />
              </button>
            )}
          </div>
        </div>

        {/* IMAGE */}
        {(article.imageUrl || article.urlToImage) && (
          <img
            src={article.imageUrl || article.urlToImage}
            alt={article.title}
            className="w-full h-40 object-cover rounded mb-2"
          />
        )}

        {/* CONTENT */}
        <p className="text-gray-700 whitespace-pre-line">
          {previewText}

          {/* Read More only in normal tab */}
          {!isChatView &&
            isUserArticle &&
            ((article.content && article.content.length > 200) ||
              (article.description &&
                article.description.length > 200)) && (
              <span
                className="text-blue-500 underline text-sm ml-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
              >
                ...Read More
              </span>
            )}

          {/* External article link */}
          {!isChatView && !isUserArticle && article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline text-sm ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              Read more
            </a>
          )}
        </p>

        {/* ✅ Hide Review + ArticleDiscussion in chat */}
        {isUserArticle && !isChatView && (
          <div className="mt-4 space-y-2">
            <ArticleReview articleId={article._id} />
            <ArticleDiscussion articleId={article._id} />
          </div>
        )}

        {/* ❌ Hide share dropdown in chat */}
        {showShare && !isChatView && (
          <div className="absolute bg-white border rounded p-2 shadow top-10 right-4 z-10 max-w-xs w-full">
            {communities.length === 0 ? (
              <div className="text-gray-500 px-2 py-1">
                You have not joined any community yet
              </div>
            ) : (
              <>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="border p-1 rounded mb-2 w-full"
                >
                  <option value="">Select Community</option>
                  {communities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded w-full"
                  onClick={handleShare}
                  disabled={!selectedCommunity}
                >
                  Share
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ❌ Hide modal in chat */}
      {showModal && isUserArticle && !isChatView && (
        <FullArticleModal
          article={article}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ArticleCard;
