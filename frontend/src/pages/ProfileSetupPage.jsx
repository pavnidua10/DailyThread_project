
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SignOutButton from '../components/signout';
import { useUser } from '../Context/UserContext'; 
import ArticleCard from '../components/ArticleCard'; 
import FullArticleModal from '../components/ArticleDetails'; 
import LoadingSpinner from '../components/LoadingSpinner';

export let refreshMyProfile = () => {};

const ProfilePage = () => {
  const { user, setUser } = useUser(); 
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    email: '',
    followers: [],
    following: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [fullArticle, setFullArticle] = useState(null);

 
  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, articlesRes, savedRes] = await Promise.all([
        axios.get('/profiles/me'),
        axios.get('/articles/articles/by-author'),
        axios.get('/articles/articles/saved'),
      ]);
      

      setProfile({
        name: profileRes.data.name,
        bio: profileRes.data.bio,
        email: profileRes.data.email,
        followers: profileRes.data.followers || [],
        following: profileRes.data.following || [],
      });
      setArticles(articlesRes.data);
      setSavedArticles(savedRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  refreshMyProfile = fetchMyProfile;

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/profiles/profile', profile);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchMyProfile(); 
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const handleSignOut = () => {
    setUser(null); 
  };

  const handleArticleSaveToggle = async () => {
    try {
      const savedRes = await axios.get('/articles/articles/saved');
      setSavedArticles(savedRes.data);
    } catch (error) {
      console.error('Error refreshing saved articles:', error);
    }
  };

  // if (loading) return <div className="text-center text-xl mt-10">Loading profile...</div>;
if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-md mb-10">
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
          <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
        </div>
        {/* Profile Info */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
            <div className="flex gap-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Edit
                </button>
              )}
              <SignOutButton onSignOut={handleSignOut} />
            </div>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-md px-3 py-2"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
            </form>
          ) : (
            <div className="space-y-2 text-gray-700">
              <p className="text-lg font-semibold">{profile.name}</p>
              <p className="text-gray-600">{profile.email}</p>
              <p className="italic">{profile.bio || 'No bio yet'}</p>
              <div className="flex gap-8 mt-4">
                <div className="text-center">
                  <span className="text-xl font-bold text-blue-700">{profile.followers.length}</span>
                  <div className="text-gray-500 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-blue-700">{profile.following.length}</span>
                  <div className="text-gray-500 text-sm">Following</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-6">
        {['articles', 'saved'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab === 'articles' ? 'Your Articles' : 'Saved Articles'}
          </button>
        ))}
      </div>

      {/* Articles Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'articles' && (
          articles.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 text-lg py-8">
              No articles created yet.
            </div>
          ) : (
            articles.map(article => (
              <ArticleCard
                key={article._id}
                article={article}
                onSaveToggle={handleArticleSaveToggle}
                isSavedTab={false}
              />
            ))
          )
        )}
        {activeTab === 'saved' && (
          savedArticles.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 text-lg py-8">
              No saved articles yet.
            </div>
          ) : (
            savedArticles.map(article => (
              <ArticleCard
                key={article._id}
                article={article}
                onSaveToggle={handleArticleSaveToggle}
                isSavedTab={true}
              />
            ))
          )
        )}
      </div>

      {/* Full Article Modal */}
      {fullArticle && (
        <FullArticleModal
          article={fullArticle}
          onClose={() => setFullArticle(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
