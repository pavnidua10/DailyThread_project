import { useState } from "react";
import ArticleReview from "./ArticleReview";
import ArticleDiscussion from "./ArticleDiscussion";
import DebateMode from "../pages/DebateMode"

const FullArticleModal = ({ article, onClose, currentUserId }) => {
  const [tab, setTab] = useState("comments");

  if (!article) return null;

  const imageSrc = article.imageUrl || article.urlToImage;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-40 z-50 flex items-center justify-center p-4">
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

            <div className="mb-4 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setTab("comments")}
                  className={`pb-3 font-semibold text-sm border-b-2 transition ${
                    tab === "comments"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  Comments
                </button>

                <button
                  onClick={() => setTab("debate")}
                  className={`pb-3 font-semibold text-sm border-b-2 transition ${
                    tab === "debate"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  Debate
                </button>
              </div>
            </div>

            {tab === "comments" && (
              <ArticleDiscussion articleId={article._id} />
            )}

            {tab === "debate" && (
              <DebateMode
                articleId={article._id}
                currentUserId={currentUserId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FullArticleModal;