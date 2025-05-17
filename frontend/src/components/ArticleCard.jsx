
import { useState } from 'react';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react'; 
import axios from 'axios';
import { toast } from 'sonner';
import FullArticleModal from './ArticleDetails'; 
import ArticleReview from './ArticleReview';
import ArticleDiscussion from './ArticleDiscussion';
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({ article, onSaveToggle, currentUserId, isSavedTab, className = '' }) => {
  const isUserArticle = !!article.authorId && article.external !== true;

  const [saved, setSaved] = useState(!!isSavedTab);
  const [showModal, setShowModal] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const navigate = useNavigate();

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSavedTab || saved) {
        await axios.post('/articles/unsave', { articleId: article._id, url: article.url });
        setSaved(false);
        toast.success('Removed from saved');
        if (onSaveToggle) onSaveToggle();
      } else {
        if (isUserArticle) {
          await axios.post(`/articles/save`, { articleId: article._id });
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

  const handleCardClick = () => {
    if (isUserArticle) setShowModal(true);
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    setShowShare((prev) => !prev);
    if (!showShare && communities.length === 0) {
      try {
        const res = await axios.get('/community/search?query=');
        const userCommunities = res.data.filter(c =>
          c.members.some(m => m === currentUserId || m._id === currentUserId)
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
      let res = await axios.post(`/community/${selectedCommunity}/share-article`, 
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

      const sharedArticleId = res.data.article._id;

      // Try to post to discussion, but don't treat as fatal if it fails
      try {
        await axios.post(`/community/${selectedCommunity}/discussions`, {
          article: sharedArticleId,
          message: "shared an article"
        });
      } catch (err) {
        toast.warning('Article shared, but failed to post in discussion.');
      }

      toast.success('Article shared to community!');
      setShowShare(false);
      setSelectedCommunity('');

      navigate(`/communities/${selectedCommunity}`, {
        state: {
          sharedArticleId: sharedArticleId,
        },
      });

    } catch (err) {
      toast.error('Failed to share article');
    }
  };

  const previewText = isUserArticle
    ? (article.content?.slice(0, 200) || article.description?.slice(0, 200) || '')
    : (article.content || article.description || '');

  return (
    <>
      <div
        className={`relative border p-4 rounded-lg shadow space-y-4 hover:bg-gray-50 transition ${className}`}
        onClick={handleCardClick}
        style={{ cursor: isUserArticle ? 'pointer' : 'default' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{article.title}</h2>
            <p className="text-sm text-gray-600">{article.source?.name || article.source}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSave}>
              {(isSavedTab || saved)
                ? <BookmarkCheck className="text-blue-500" />
                : <Bookmark />
              }
            </button>
            <button
              className="ml-1"
              title="Share to Community"
              onClick={handleShareClick}
            >
              <Share2 className="text-green-600" />
            </button>
          </div>
        </div>
        {article.imageUrl || article.urlToImage ? (
          <img
            src={article.imageUrl || article.urlToImage}
            alt={article.title}
            className="w-full h-40 object-cover rounded mb-2"
          />
        ) : null}

        <p className="text-gray-700">
          {previewText}
          {isUserArticle && (
            (article.content && article.content.length > 200) ||
            (article.description && article.description.length > 200)
          ) && (
            <span
              className="text-blue-500 underline text-sm ml-1 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              ...Read More
            </span>
          )}
          {!isUserArticle && article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline text-sm ml-1"
              onClick={e => e.stopPropagation()}
            >
              Read more
            </a>
          )}
        </p>

        {isUserArticle && (
          <div className="mt-4 space-y-2">
            <ArticleReview articleId={article._id} />
            <ArticleDiscussion articleId={article._id} />
          </div>
        )}

        {showShare && (
          <div className="absolute bg-white border rounded p-2 shadow top-10 right-4 z-10 max-w-xs w-full">
            {communities.length === 0 ? (
              <div className="text-gray-500 px-2 py-1">
                You have not joined any community yet
              </div>
            ) : (
              <>
                <select
                  value={selectedCommunity}
                  onChange={e => setSelectedCommunity(e.target.value)}
                  className="border p-1 rounded mb-2 w-full"
                >
                  <option value="">Select Community</option>
                  {communities.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
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
      {showModal && isUserArticle && (
        <FullArticleModal
          article={article}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ArticleCard;

