import React from "react";

const ArticleList = ({
  title,
  list,
  expandedId,
  setExpandedId,
  onEdit,
  onDelete,
  onSaveToggle,
  isOwner,
}) => {
  return (
    <div className="my-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {list.length === 0 ? (
        <p className="text-gray-500">No articles to show.</p>
      ) : (
        <div className="space-y-4">
          {list.map((article) => (
            <div
              key={article._id}
              className="border p-4 rounded shadow bg-white"
            >
              <h3
                className="text-xl font-bold cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === article._id ? null : article._id)
                }
              >
                {article.title}
              </h3>
              {expandedId === article._id && (
                <p className="mt-2">{article.content}</p>
              )}
              <div className="mt-4 flex space-x-4">
                {isOwner && (
                  <>
                    <button
                      className="text-blue-600"
                      onClick={() => onEdit(article._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => onDelete(article._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  className="text-green-600"
                  onClick={() => onSaveToggle(article._id)}
                >
                  Save / Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
