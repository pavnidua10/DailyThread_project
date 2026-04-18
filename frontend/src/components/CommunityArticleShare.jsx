import React, { useState } from "react";
import axios from "axios";

const CommunityArticleShare = ({ communityId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `/communities/${communityId}/share-article`,
        { title, content, imageUrl },
        { withCredentials: true }
      );

      setTitle("");
      setContent("");
      setImageUrl("");
      setPreviewError(false);

      alert("Article shared!");
    } catch (err) {
      console.error(err);
      alert("Failed to share article");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded-2xl shadow border border-gray-100">

      <h2 className="text-xl font-semibold mb-2">Share Article</h2>

      <input
        type="text"
        placeholder="Article Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-gray-200 p-3 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <input
        type="text"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => {
          setImageUrl(e.target.value);
          setPreviewError(false);
        }}
        className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Image Preview */}
      {imageUrl && !previewError && (
        <img
          src={imageUrl}
          alt="preview"
          onError={() => setPreviewError(true)}
          className="w-full h-48 object-cover rounded-xl"
        />
      )}

      {previewError && (
        <p className="text-red-500 text-sm">
          ⚠️ Image could not be loaded. That website may block external usage.
        </p>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:scale-105 transition"
      >
        Share Article
      </button>
    </form>
  );
};

export default CommunityArticleShare;
