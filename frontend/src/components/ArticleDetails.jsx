
import ArticleReview from './ArticleReview';
import ArticleDiscussion from './ArticleDiscussion';

const FullArticleModal = ({ article, onClose }) => {
  if (!article) return null;

  const imageSrc = article.imageUrl || article.urlToImage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative shadow-lg overflow-y-auto max-h-[90vh]">
       
        <button
          onClick={onClose}
          className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
          aria-label="Back"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
        <p className="text-sm text-gray-600 mb-2">{article.source}</p>

     
        {imageSrc && (
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full max-h-80 object-cover rounded mb-4"
          />
        )}

        <p className="mb-4 whitespace-pre-line">{article.content}</p>
        {article._id && (
          <>
            <div className="mb-4">
              <ArticleReview articleId={article._id} authorId={article.authorId} />
            </div>
            <ArticleDiscussion articleId={article._id} />
          </>
        )}
      </div>
    </div>
  );
};

export default FullArticleModal;
