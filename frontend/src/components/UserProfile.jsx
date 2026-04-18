import React, { useEffect, useState } from "react";
import API from "../utils/api";
import ArticleCard from "./ArticleCard";
import FullArticleModal from "./ArticleDetails";

const UserProfile = ({ userId, currentUserId }) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articles");
  const [fullArticle, setFullArticle] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = userId === currentUserId;

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await API.get(`/profiles/${userId}`);
      const data = res.data;

      setProfile(data);

      const following = data.followers?.some(
        (f) => f === currentUserId || f._id === currentUserId
      );

      setIsFollowing(following);
      setFollowersCount(data.followers?.length || 0);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
    }
  };

  // ================= FETCH ARTICLES =================
  const fetchArticles = async () => {
    try {
      const res = await API.get(`/articles/articles/by-author`, {
        params: { userId },
      });
      setArticles(res.data);
    } catch {
      setArticles([]);
    }
  };

  // ================= FETCH SAVED ARTICLES =================
  const fetchSavedArticles = async () => {
    if (!isOwnProfile) return;

    try {
      const res = await API.get(`/articles/articles/saved`);
      setSavedArticles(res.data);
    } catch (error) {
      console.error("Saved articles fetch error:", error);
      setSavedArticles([]);
    }
  };

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    Promise.all([
      fetchProfile(),
      fetchArticles(),
      fetchSavedArticles(),
    ]).finally(() => setLoading(false));
  }, [userId, currentUserId]);

  // ================= FOLLOW / UNFOLLOW =================
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await API.post("/auth/unfollow", { userId });
        setIsFollowing(false);
        setFollowersCount((c) => c - 1);
      } else {
        await API.post("/auth/follow", { userId });
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  // ================= UI STATES =================
  if (loading)
    return (
      <div className="text-center mt-12 text-gray-500">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="text-center mt-12 text-gray-500">
        User not found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* ================= PROFILE HEADER ================= */}
      <div className="bg-white shadow-lg rounded-2xl p-8 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">

          <div className="w-28 h-28 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name?.[0]?.toUpperCase()
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{profile.name}</h2>

              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            <p className="text-gray-500 mt-1">{profile.email}</p>

            <p className="mt-4 italic text-gray-700">
              {profile.bio || "No bio yet"}
            </p>

            <div className="flex gap-10 mt-6">
              <div>
                <p className="text-xl font-bold text-blue-600">
                  {followersCount}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>

              <div>
                <p className="text-xl font-bold text-blue-600">
                  {profile.following?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-6 py-2 rounded-full ${
            activeTab === "articles"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Articles
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-6 py-2 rounded-full ${
              activeTab === "saved"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Saved
          </button>
        )}
      </div>

      {/* ================= ARTICLES ================= */}
      {activeTab === "articles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.length === 0 ? (
            <p className="text-gray-500">No articles yet.</p>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserId={currentUserId}
                onClick={() => setFullArticle(article)}
              />
            ))
          )}
        </div>
      )}

      {/* ================= SAVED ARTICLES ================= */}
      {activeTab === "saved" && isOwnProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedArticles.length === 0 ? (
            <p className="text-gray-500">
              You haven't saved any articles yet.
            </p>
          ) : (
            savedArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserId={currentUserId}
                onClick={() => setFullArticle(article)}
              />
            ))
          )}
        </div>
      )}

      {/* ================= MODAL ================= */}
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