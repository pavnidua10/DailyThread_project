
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach(c => (map[c._id] = { ...c, replies: [] }));
  comments.forEach(c => {
    if (c.parentId) {
      map[c.parentId] && map[c.parentId].replies.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  return roots;
}

const ArticleDiscussion = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch comments for the article
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/discussions/${articleId}`, { withCredentials: true });
        setComments(res.data);
      } catch (err) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  // Handle new top-level comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `/discussions/${articleId}`,
        { content: comment },
        { withCredentials: true }
      );
      setComment('');
      // Refresh comments
      const res = await axios.get(`/discussions/${articleId}`, { withCredentials: true });
      setComments(res.data);
    } catch (err) {
      setError('Failed to post comment. Are you logged in?');
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `/discussions/${articleId}`,
        { content: replyContent, parentId },
        { withCredentials: true }
      );
      setReplyContent('');
      setReplyingTo(null);
      // Refresh comments
      const res = await axios.get(`/discussions/${articleId}`, { withCredentials: true });
      setComments(res.data);
    } catch (err) {
      setError('Failed to post reply. Are you logged in?');
    }
  };

  // Recursive rendering of comments and replies
  const renderComments = (commentsTree) => (
    commentsTree.map((c) => (
      <div key={c._id} className="mb-2 ml-0 md:ml-4 p-2 border rounded">
        <div className="text-sm text-gray-600">{c.userId?.name || 'User'}:</div>
        <div>{c.content}</div>
        <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
        <button
          className="text-blue-600 text-xs mt-1"
          onClick={() => setReplyingTo(c._id)}
        >
          Reply
        </button>
        {replyingTo === c._id && (
          <form
            onSubmit={e => handleReplySubmit(e, c._id)}
            className="mt-2"
          >
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Write a reply..."
              required
            />
            <div className="flex gap-2 mt-1">
              <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                Post Reply
              </button>
              <button
                type="button"
                className="px-2 py-1 bg-gray-300 text-xs rounded"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {/* Render replies recursively */}
        {c.replies && c.replies.length > 0 && (
          <div className="ml-4 mt-2">
            {renderComments(c.replies)}
          </div>
        )}
      </div>
    ))
  );

  // Build nested comment tree
  const commentsTree = buildCommentTree(comments);

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Discussion</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Write a comment..."
          required
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Post
        </button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <div>
          {commentsTree.length === 0 && <div className="text-gray-500">No comments yet.</div>}
          {renderComments(commentsTree)}
        </div>
      )}
    </div>
  );
};

export default ArticleDiscussion;
