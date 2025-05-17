import React, { useState, useEffect } from 'react';
import axios from 'axios';

const existingCategories = [
  'Politics', 'Sports', 'Technology', 'Health', 'MentalHealth', 'Finance', 'Education'
];
const existingTags = [
  'India', 'World', 'Startup', 'Environment', 'Science', 'Covid', 'AI'
];

const CreateArticle = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    category: '',
    region: '',
    tags: '',
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);

  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/config/cloudinary')
      .then(res => setCloudinaryConfig(res.data))
      .catch(() => setError('Could not load image upload config'));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      if (files && files[0]) {
        setImage(files[0]);
        uploadToCloudinary(files[0]);
      }
      return;
    }
    setFormData({ ...formData, [name]: value });

    if (name === 'category') {
      setSuggestedCategories(
        existingCategories.filter((cat) =>
          cat.toLowerCase().startsWith(value.toLowerCase())
        )
      );
    }

    if (name === 'tags') {
      const lastTag = value.split(',').pop().trim();
      setSuggestedTags(
        existingTags.filter((tag) =>
          tag.toLowerCase().startsWith(lastTag.toLowerCase())
        )
      );
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!cloudinaryConfig) {
      setError('Image upload config not loaded');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', cloudinaryConfig.uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setImageUrl(result.secure_url);
      } else {
        setError('Image upload failed');
      }
    } catch (err) {
      setError('Image upload failed');
    }
    setUploading(false);
  };

  const handleCategoryClick = (value) => {
    setFormData({ ...formData, category: value });
    setSuggestedCategories([]);
  };

  const handleTagClick = (value) => {
    const tagsArray = formData.tags.split(',').map((tag) => tag.trim());
    tagsArray[tagsArray.length - 1] = value;
    setFormData({ ...formData, tags: tagsArray.join(', ') });
    setSuggestedTags([]);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (image && !imageUrl) {
      setError('Please wait for the image to finish uploading.');
      return;
    }
    try {
      const articleData = { ...formData };
      if (imageUrl) articleData.imageUrl = imageUrl;

      await axios.post('/articles/articles', articleData);

      setSuccess('Article created successfully');
      setFormData({
        title: '',
        content: '',
        source: '',
        category: '',
        region: '',
        tags: '',
      });
      setImage(null);
      setImageUrl('');
    } catch (err) {
      setError('Error creating article');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Create Article</h1>
        {success && (
          <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-700 animate-fade-in">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700 animate-fade-in">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter headline"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
              required
            />
          </div>
          {/* Content */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Content</label>
            <textarea
              name="content"
              placeholder="Write your article content here..."
              value={formData.content}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded h-32 transition"
              required
            />
          </div>
          {/* Source */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Source</label>
            <input
              type="text"
              name="source"
              placeholder="Source (optional)"
              value={formData.source}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
            />
          </div>
          {/* Category */}
          <div className="relative">
            <label className="block mb-1 font-semibold text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
              autoComplete="off"
            />
            {suggestedCategories.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded w-full mt-1 shadow max-h-40 overflow-y-auto">
                {suggestedCategories.map((cat, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Region */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Region</label>
            <input
              type="text"
              name="region"
              placeholder="Region (India/International)"
              value={formData.region}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
            />
          </div>
          {/* Tags */}
          <div className="relative">
            <label className="block mb-1 font-semibold text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
              autoComplete="off"
            />
            {suggestedTags.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded w-full mt-1 shadow max-h-40 overflow-y-auto">
                {suggestedTags.map((tag, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition"
            />
            {uploading && (
              <p className="text-blue-600 text-sm mt-2 animate-pulse">Uploading image...</p>
            )}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-4">
                <img src={imageUrl} alt="Uploaded" className="w-24 h-24 object-cover rounded shadow" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {/* Submit */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow transition disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticle;
