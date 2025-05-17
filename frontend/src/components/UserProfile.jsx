import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from './ArticleCard';
import FullArticleModal from './ArticleDetails';

const UserProfile = ({ userId, currentUserId }) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [fullArticle, setFullArticle] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get(`/auth/profile/${userId}`);
        setProfile(profileRes.data);

     
        const following = profileRes.data.followers?.some(follower => follower._id === currentUserId);
        setIsFollowing(following);
        setFollowersCount(profileRes.data.followers?.length || 0);


        const articlesRes = await axios.get(`/articles/articles/by-author`, {
          params: { userId }
        });
        setArticles(articlesRes.data);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.post('/auth/unfollow', { userId });
        setIsFollowing(false);
        setFollowersCount(count => count - 1);
      } else {
        await axios.post('/auth/follow', { userId });
        setIsFollowing(true);
        setFollowersCount(count => count + 1);
      }
    } catch (error) {
      console.error('Follow/unfollow failed', error);
    }
  };

  if (loading) return <div className="text-center text-xl mt-10">Loading profile...</div>;
  if (!profile) return <div className="text-center text-xl mt-10">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-md mb-10">
        {/* Avatar */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
          <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
        </div>
        {/* Profile Info */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            {userId !== currentUserId && (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded ${
                  isFollowing ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <div className="space-y-2 text-gray-700">
            <p className="italic">{profile.bio || 'No bio yet'}</p>
            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <span className="text-xl font-bold text-blue-700">{followersCount}</span>
                <div className="text-gray-500 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <span className="text-xl font-bold text-blue-700">{profile.following?.length || 0}</span>
                <div className="text-gray-500 text-sm">Following</div>
              </div>
            </div>
            {/* Communities */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Communities</h3>
              {profile.communities && profile.communities.length > 0 ? (
                <ul className="list-disc ml-6 text-gray-700">
                  {profile.communities.map(c => (
                    <li key={c._id || c}>{c.name || c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No communities joined yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-6">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            activeTab === 'articles'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Articles
        </button>
      </div>

      {/* Articles Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.length === 0 && <p className="text-gray-500">No articles yet.</p>}
        {articles.map(article => (
          <ArticleCard
            key={article._id}
            article={article}
            currentUserId={currentUserId}
            onClick={() => setFullArticle(article)}
          />
        ))}
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

export default UserProfile;
