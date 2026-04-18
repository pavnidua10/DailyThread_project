import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
 
const CommunityPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);
  const [joiningId, setJoiningId] = useState(null); // track which card is joining
 
  const [memberQuery, setMemberQuery] = useState("");
  const [moderatorQuery, setModeratorQuery] = useState("");
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const [moderatorSuggestions, setModeratorSuggestions] = useState([]);
 
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    interests: "",
    rules: "",
    members: [],
    moderators: [],
  });
 
  const [toast, setToast] = useState(null);
 
  const navigate = useNavigate();
 
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
 
  useEffect(() => {
    fetchMyCommunities();
    fetchSuggestedCommunities();
  }, []);
 
  const fetchMyCommunities = async () => {
    try {
      const res = await API.get("/communities/my", { withCredentials: true });
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const fetchSuggestedCommunities = async () => {
    try {
      const res = await API.get("/communities/suggested", { withCredentials: true });
      setSuggestedCommunities(res.data);
    } catch (err) {
      console.error(err);
    }
  };
 
  // ── Join a suggested community ──────────────────────────────────
  const handleJoinSuggested = async (communityId) => {
    try {
      setJoiningId(communityId);
      // Same route pattern as CommunityDetailPage
      await API.post("/communities/join", { communityId }, { withCredentials: true });
      showToast("Joined community!");
      fetchMyCommunities();
      fetchSuggestedCommunities();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to join", "error");
    } finally {
      setJoiningId(null);
    }
  };
 
  // ── User search for member/moderator fields ─────────────────────
  const searchUser = async (query, type) => {
    if (!query.trim()) {
      type === "members" ? setMemberSuggestions([]) : setModeratorSuggestions([]);
      return;
    }
    try {
      const res = await API.get(`/auth/search?query=${query}`, { withCredentials: true });
      type === "members" ? setMemberSuggestions(res.data) : setModeratorSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };
 
  // FIX: type is always "members" or "moderators" (plural, matching formData keys)
  const addUser = (user, type) => {
    setFormData((prev) => {
      const alreadyExists = prev[type].some((u) => u._id === user._id);
      if (alreadyExists) return prev;
      return { ...prev, [type]: [...prev[type], user] };
    });
    if (type === "members") {
      setMemberQuery("");
      setMemberSuggestions([]);
    } else {
      setModeratorQuery("");
      setModeratorSuggestions([]);
    }
  };
 
  const removeUser = (id, type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((u) => u._id !== id),
    }));
  };
 
  // ── Create community ────────────────────────────────────────────
  const handleCreateCommunity = async () => {
    if (!formData.name.trim()) {
      showToast("Community name is required", "error");
      return;
    }
    try {
      await API.post(
        "/communities",
        {
          name: formData.name,
          description: formData.description,
          interests: formData.interests.split(",").map((i) => i.trim()).filter(Boolean),
          rules: formData.rules.split(",").map((r) => r.trim()).filter(Boolean),
          members: formData.members.map((u) => u._id),
          moderators: formData.moderators.map((u) => u._id),
        },
        { withCredentials: true }
      );
      setShowModal(false);
      showToast("Community created!");
      fetchMyCommunities();
      setFormData({ name: "", description: "", interests: "", rules: "", members: [], moderators: [] });
      setMemberQuery("");
      setModeratorQuery("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create", "error");
    }
  };
 
  const closeModal = () => {
    setShowModal(false);
    setMemberSuggestions([]);
    setModeratorSuggestions([]);
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
 
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
 
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {toast.msg}
        </div>
      )}
 
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Communities</h1>
          <p className="text-gray-500">Communities you have joined</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          + Create Community
        </button>
      </div>
 
      {/* My Communities grid */}
      {communities.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          You haven't joined any communities yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div
              key={community._id}
              onClick={() => navigate(`/communities/${community._id}`)}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">{community.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
              <div className="text-sm text-gray-500">
                👥 {community.members?.length || 0} members
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* ── Suggested Communities ── OUTSIDE modal, below my communities */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold mb-2">Suggested Communities</h2>
        <p className="text-gray-500 mb-6">Discover communities you might like</p>
 
        {suggestedCommunities.length === 0 ? (
          <p className="text-gray-400">No suggestions available right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedCommunities.map((community) => (
              <div
                key={community._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h3
                  onClick={() => navigate(`/communities/${community._id}`)}
                  className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600 transition"
                >
                  {community.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                {community.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {community.interests.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    👥 {community.members?.length || 0} members
                  </span>
                  <button
                    onClick={() => handleJoinSuggested(community._id)}
                    disabled={joiningId === community._id}
                    className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
                  >
                    {joiningId === community._id ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {/* ── Create Community Modal ── */}
      {showModal && (
        // Backdrop — click outside to close
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start overflow-auto py-10 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white w-full max-w-4xl p-10 rounded-3xl shadow-2xl border">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-semibold">Create Community</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
 
            <div className="grid grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Community Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Interests (comma separated)"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
 
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border rounded-lg px-4 py-3 mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
 
            <input
              type="text"
              placeholder="Rules (comma separated)"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
 
            {/* Members search */}
            <h3 className="text-xl font-semibold mt-8 mb-4">Add Members (Optional)</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={memberQuery}
                onChange={(e) => {
                  setMemberQuery(e.target.value);
                  searchUser(e.target.value, "members"); // FIX: "members" not "member"
                }}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {memberSuggestions.length > 0 && (
                <div className="absolute bg-white border w-full mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  {memberSuggestions.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => addUser(user, "members")}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Member chips */}
            {formData.members.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {formData.members.map((user) => (
                  <div key={user._id} className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
                    <img
                      src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{user.name}</span>
                    <button onClick={() => removeUser(user._id, "members")} className="text-red-500 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
 
            {/* Moderators search */}
            <h3 className="text-xl font-semibold mt-8 mb-4">Add Moderators (Optional)</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={moderatorQuery}
                onChange={(e) => {
                  setModeratorQuery(e.target.value);
                  searchUser(e.target.value, "moderators"); // FIX: "moderators" not "moderator"
                }}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {moderatorSuggestions.length > 0 && (
                <div className="absolute bg-white border w-full mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  {moderatorSuggestions.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => addUser(user, "moderators")}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Moderator chips — FIX: was missing entirely */}
            {formData.moderators.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {formData.moderators.map((user) => (
                  <div key={user._id} className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-full">
                    <img
                      src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{user.name}</span>
                    <button onClick={() => removeUser(user._id, "moderators")} className="text-red-500 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
 
            {/* Modal actions */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default CommunityPage;