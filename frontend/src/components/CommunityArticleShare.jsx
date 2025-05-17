import React, { useState } from 'react';
import axios from 'axios';

const CommunityArticleShare = ({ communityId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`/community/${communityId}/articles`, { title, content, imageUrl });
    setTitle('');
    setContent('');
    setImageUrl('');
    alert('Article shared!');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <input
        type="text"
        placeholder="Article Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Share Article
      </button>
    </form>
  );
};

export default CommunityArticleShare;
