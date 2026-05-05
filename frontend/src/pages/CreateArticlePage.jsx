import React, { useState } from 'react';
import axios from 'axios';

const CLOUD_NAME     = "dachmhgyt";
const UPLOAD_PRESET  = "unsigned_articles"; 

const existingCategories = ['Politics','Sports','Technology','Health','MentalHealth','Finance','Education'];
const existingTags       = ['India','World','Startup','Environment','Science','Covid','AI'];

const CreateArticle = () => {
  const [formData, setFormData] = useState({
    title: '', content: '', source: '', category: '', region: '', tags: '',
  });
  const [image,               setImage]               = useState(null);
  const [imageUrl,            setImageUrl]             = useState('');
  const [uploading,           setUploading]            = useState(false);
  const [suggestedCategories, setSuggestedCategories]  = useState([]);
  const [suggestedTags,       setSuggestedTags]        = useState([]);
  const [success,             setSuccess]              = useState('');
  const [error,               setError]                = useState('');

  // ── direct browser → Cloudinary upload, no backend involved ──
  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET);

      const res    = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );
      const result = await res.json();

      if (result.secure_url) {
        setImageUrl(result.secure_url);
      } else {
        setError('Image upload failed');
      }
    } catch {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      if (files?.[0]) { setImage(files[0]); uploadToCloudinary(files[0]); }
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'category') {
      setSuggestedCategories(existingCategories.filter(c => c.toLowerCase().startsWith(value.toLowerCase())));
    }
    if (name === 'tags') {
      const lastTag = value.split(',').pop().trim();
      setSuggestedTags(existingTags.filter(t => t.toLowerCase().startsWith(lastTag.toLowerCase())));
    }
  };

  const handleCategoryClick = (value) => { setFormData({ ...formData, category: value }); setSuggestedCategories([]); };
  const handleTagClick = (value) => {
    const arr = formData.tags.split(',').map(t => t.trim());
    arr[arr.length - 1] = value;
    setFormData({ ...formData, tags: arr.join(', ') });
    setSuggestedTags([]);
  };
  const handleRemoveImage = () => { setImage(null); setImageUrl(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    if (image && !imageUrl) { setError('Please wait for the image to finish uploading.'); return; }
    try {
      const articleData = { ...formData };
      if (imageUrl) articleData.imageUrl = imageUrl;
      await axios.post('/articles/articles', articleData);
      setSuccess('Article created successfully');
      setFormData({ title:'', content:'', source:'', category:'', region:'', tags:'' });
      setImage(null); setImageUrl('');
    } catch {
      setError('Error creating article');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Create Article</h1>

        {success && <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-700">{success}</div>}
        {error   && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Title</label>
            <input type="text" name="title" placeholder="Enter headline" value={formData.title}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" required />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Content</label>
            <textarea name="content" placeholder="Write your article content here..." value={formData.content}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded h-32 transition" required />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Source</label>
            <input type="text" name="source" placeholder="Source (optional)" value={formData.source}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" />
          </div>

          <div className="relative">
            <label className="block mb-1 font-semibold text-gray-700">Category</label>
            <input type="text" name="category" placeholder="Category" value={formData.category}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" autoComplete="off" />
            {suggestedCategories.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded w-full mt-1 shadow max-h-40 overflow-y-auto">
                {suggestedCategories.map((cat, i) => <li key={i} className="p-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleCategoryClick(cat)}>{cat}</li>)}
              </ul>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Region</label>
            <input type="text" name="region" placeholder="Region (India/International)" value={formData.region}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" />
          </div>

          <div className="relative">
            <label className="block mb-1 font-semibold text-gray-700">Tags</label>
            <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags}
              onChange={handleChange} className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" autoComplete="off" />
            {suggestedTags.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded w-full mt-1 shadow max-h-40 overflow-y-auto">
                {suggestedTags.map((tag, i) => <li key={i} className="p-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleTagClick(tag)}>{tag}</li>)}
              </ul>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange}
              className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 rounded transition" />
            {uploading && <p className="text-blue-600 text-sm mt-2 animate-pulse">Uploading image...</p>}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-4">
                <img src={imageUrl} alt="Uploaded" className="w-24 h-24 object-cover rounded shadow" />
                <button type="button" onClick={handleRemoveImage} className="text-red-500 hover:underline text-sm">Remove</button>
              </div>
            )}
          </div>

          <div>
            <button type="submit" disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow transition disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticle;