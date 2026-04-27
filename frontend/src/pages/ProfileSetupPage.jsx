import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from "../utils/api";

import ArticleCard from '../components/ArticleCard';
import FullArticleModal from '../components/ArticleDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

export let refreshMyProfile = () => {};

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    email: '',
    profilePhoto: '',
    followers: [],
    following: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

const fetchMyProfile = async () => {
  try {
    setLoading(true);

    const [profileRes, articlesRes, savedRes] = await Promise.all([
      API.get('/profiles/me'),
      API.get('/articles/articles/by-author'),
      API.get('/articles/articles/saved'),
    ]);

    setProfile({
      name: profileRes.data.name || '',
      bio: profileRes.data.bio || '',
      email: profileRes.data.email || '',
      profilePhoto: profileRes.data.profilePhoto || '',
      followers: profileRes.data.followers || [],
      following: profileRes.data.following || [],
    });

    setArticles(articlesRes.data || []);
    setSavedArticles(savedRes.data || []);
  } catch (error) {
    console.error('Error fetching profile:', error);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  } finally {
    setLoading(false);
  }
};

  refreshMyProfile = fetchMyProfile;

  useEffect(() => {
    fetchMyProfile();
  }, []);

  /* ================= EDIT PROFILE ================= */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await   API.put('/profiles/profile', {
        name: profile.name,
        bio: profile.bio,
      });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchMyProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  /* ================= SIGN OUT ================= */
  const handleSignOut = () => {
    setUser(null);
  };

  /* ================= REFRESH SAVED ================= */
  const handleArticleSaveToggle = async () => {
    try {
      const savedRes = await API.get('/articles/articles/saved');
      setSavedArticles(savedRes.data);
    } catch (error) {
      console.error('Error refreshing saved articles:', error);
    }
  };

  /* ================= UPLOAD PROFILE PHOTO ================= */
  const handlePhotoChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'your_upload_preset_here'); // replace with your preset

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name_here/image/upload`, // replace with your cloud name
        {
          method: 'POST',
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        // Save to backend
        await API.put('/profiles/profile', { profilePhoto: result.secure_url });
        setProfile({ ...profile, profilePhoto: result.secure_url });
      }
    } catch (error) {
      console.error('Profile photo upload failed', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await API.put('/profiles/profile', { profilePhoto: '' });
      setProfile({ ...profile, profilePhoto: '' });
    } catch (error) {
      console.error('Delete profile photo failed', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* PROFILE PHOTO */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center shadow-md">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-white">
                {profile.name ? profile.name[0].toUpperCase() : 'U'}
              </span>
            )}

            {/* Upload / Delete Icons */}
            <div className="absolute bottom-1 right-1 flex gap-2">
              <label className="bg-white p-1 rounded-full shadow cursor-pointer hover:bg-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <FaPencilAlt className="text-blue-600" />
              </label>
              {profile.profilePhoto && (
                <button
                  onClick={handleDeletePhoto}
                  className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                >
                  <FaTrash className="text-red-500" />
                </button>
              )}
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-full">
                <span className="text-blue-600 text-sm animate-pulse">Uploading...</span>
              </div>
            )}
          </div>

          {/* PROFILE INFO */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
                {message && <p className="text-green-600 text-sm">{message}</p>}
              </form>
            ) : (
              <div className="space-y-2 text-gray-700">
                <p className="text-gray-600">{profile.email}</p>
                <p className="italic">{profile.bio || 'No bio added yet.'}</p>
                <div className="flex gap-10 mt-4">
                  <div>
                    <span className="text-xl font-bold text-blue-600">{profile.followers.length}</span>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-blue-600">{profile.following.length}</span>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex justify-center gap-6 mb-8">
        {['articles', 'saved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab === 'articles' ? 'Your Articles' : 'Saved Articles'}
          </button>
        ))}
      </div>

      {/* ================= ARTICLES GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'articles' &&
          (articles.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-10">No articles created yet.</div>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserId={null}
                onSaveToggle={handleArticleSaveToggle}
                isSavedTab={false}
              />
            ))
          ))}

        {activeTab === 'saved' &&
          (savedArticles.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-10">No saved articles yet.</div>
          ) : (
            savedArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserId={null}
                onSaveToggle={handleArticleSaveToggle}
                isSavedTab={true}
              />
            ))
          ))}
      </div>
    </div>
  );
};

export default ProfilePage;