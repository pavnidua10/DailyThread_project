import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

// ─── Reusable user search input ───────────────────────────────────
const UserSearchInput = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q.trim()) { setSuggestions([]); return; }
    try {
      setLoading(true);
      const res = await axios.get(`/auth/search?query=${q}`, { withCredentials: true });
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-3 top-3.5">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((user) => (
            <div
              key={user._id}
              onClick={() => { onSelect(user); setQuery(""); setSuggestions([]); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
            >
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
const CommunityDetailPage = ({ currentUserId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatRef = useRef(null);

  const [community, setCommunity] = useState(null);
  const [articles, setArticles] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [joining, setJoining] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Add Member modal ──
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // ── Add Moderator modal ──
  const [showAddModModal, setShowAddModModal] = useState(false);
  const [selectedMods, setSelectedMods] = useState([]);
  const [addModLoading, setAddModLoading] = useState(false);

  // ── Transfer modal ──
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUser, setTransferUser] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchCommunity(); fetchDiscussions(); }, [id]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [discussions]);

  const fetchCommunity = async () => {
    try {
      const res = await axios.get(`/communities/${id}`);
      setCommunity(res.data.community);
      setArticles(res.data.articles || []);
    } catch (err) { console.error(err); }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await axios.get(`/communities/${id}/discussions`);
      setDiscussions(res.data);
    } catch (err) { console.error(err); }
  };

  // ─── Derived roles ────────────────────────────────────────────
  const isMember = community?.members?.some((m) => m._id?.toString() === currentUserId);
  const isMod = community?.moderators?.some((m) => m._id?.toString() === currentUserId);
  const isOwner = community?.owner?.toString() === currentUserId;

  // ─── Join / Leave ─────────────────────────────────────────────
  const handleJoin = async () => {
    try {
      setJoining(true);
      await axios.post(`/communities/join`, { communityId: id }, { withCredentials: true });
      await fetchCommunity();
      showToast("Joined community!");
    } catch (err) {
      showToast("Failed to join", "error");
    } finally { setJoining(false); }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this community?")) return;
    try {
      setActionLoading(true);
      await axios.post(`/communities/leave`, { communityId: id }, { withCredentials: true });
      showToast("Left community");
      navigate("/communities");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to leave", "error");
    } finally { setActionLoading(false); }
  };

  // ─── Send message ─────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await axios.post(`/communities/${id}/discussions`, { message: newMessage }, { withCredentials: true });
      setNewMessage("");
      fetchDiscussions();
    } catch (err) { console.error(err); }
  };

  // ─── Add Members (invite — mod/owner) ────────────────────────
  const handleAddMembers = async () => {
    if (!selectedMembers.length) return;
    try {
      setAddMemberLoading(true);
      await Promise.all(
        selectedMembers.map((u) =>
          axios.post(`/communities/${id}/invite`, { userId: u._id }, { withCredentials: true })
        )
      );
      showToast(`${selectedMembers.length} member(s) added!`);
      setSelectedMembers([]);
      setShowAddMemberModal(false);
      fetchCommunity();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add members", "error");
    } finally { setAddMemberLoading(false); }
  };

  // ─── Add Moderators (owner only) ─────────────────────────────
  const handleAddModerators = async () => {
    if (!selectedMods.length) return;
    try {
      setAddModLoading(true);
      await Promise.all(
        selectedMods.map((u) =>
          axios.post(`/communities/add-moderator`, { communityId: id, userId: u._id }, { withCredentials: true })
        )
      );
      showToast(`${selectedMods.length} moderator(s) promoted!`);
      setSelectedMods([]);
      setShowAddModModal(false);
      fetchCommunity();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add moderators", "error");
    } finally { setAddModLoading(false); }
  };

  // ─── Kick ─────────────────────────────────────────────────────
  const handleKick = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this community?`)) return;
    try {
      setActionLoading(true);
      await axios.post(`/communities/kick`, { communityId: id, userId }, { withCredentials: true });
      showToast(`${userName} removed`);
      fetchCommunity();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setActionLoading(false); }
  };

  // ─── Remove Moderator ─────────────────────────────────────────
  const handleRemoveMod = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} as moderator?`)) return;
    try {
      setActionLoading(true);
      await axios.post(`/communities/remove-moderator`, { communityId: id, userId }, { withCredentials: true });
      showToast(`${userName} removed as moderator`);
      fetchCommunity();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setActionLoading(false); }
  };

  // ─── Transfer Ownership ───────────────────────────────────────
  const handleTransfer = async () => {
    if (!transferUser) return;
    if (!window.confirm("Transfer ownership? You will lose owner privileges.")) return;
    try {
      setTransferLoading(true);
      await axios.post(`/communities/transfer-ownership`, { communityId: id, newOwnerId: transferUser._id }, { withCredentials: true });
      showToast("Ownership transferred");
      setShowTransferModal(false);
      setTransferUser(null);
      fetchCommunity();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setTransferLoading(false); }
  };

  // ─── Share article ────────────────────────────────────────────
  const handleShareArticle = async (article) => {
    try {
      await axios.post(`/communities/${id}/share-article`, { articleId: article._id }, { withCredentials: true });
      showToast("Article shared to discussion!");
      fetchDiscussions();
      setActiveTab("discussion");
    } catch (err) {
      showToast("Failed to share article", "error");
    }
  };

  if (!community) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const memberIsMod = (memberId) => community.moderators?.some((m) => m._id?.toString() === memberId);
  const memberIsOwner = (memberId) => community.owner?.toString() === memberId;
  const memberIds = new Set(community.members.map((m) => m._id?.toString()));
  const modIds = new Set(community.moderators.map((m) => m._id?.toString()));

  return (
    <div className="max-w-5xl mx-auto p-6 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Sticky Join Banner */}
      {!isMember && (
        <div className="sticky top-4 z-50 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">Join {community.name}</p>
              <p className="text-sm opacity-90">Unlock full discussions & exclusive articles.</p>
            </div>
            <button onClick={handleJoin} disabled={joining}
              className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold shadow hover:scale-105 transition">
              {joining ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-10 mb-8 border border-gray-100">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">{community.name}</h1>
            <p className="text-gray-600 text-lg mb-6 max-w-2xl">{community.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>👥 {community.members.length} members</span>
              <span>📚 {articles.length} articles</span>
              {community.interests?.length > 0 && <span>🏷️ {community.interests.join(", ")}</span>}
            </div>
          </div>

          {/* Owner / Mod controls */}
          <div className="flex flex-col gap-2 items-end">
            {isMember && !isOwner && (
              <button onClick={handleLeave} disabled={actionLoading}
                className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition">
                Leave Community
              </button>
            )}
            {(isMod || isOwner) && (
              <button onClick={() => setShowAddMemberModal(true)}
                className="text-sm text-green-600 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition">
                👤 Add Member
              </button>
            )}
            {isOwner && (
              <button onClick={() => setShowAddModModal(true)}
                className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
                🛡️ Add Moderator
              </button>
            )}
            {isOwner && (
              <button onClick={() => setShowTransferModal(true)}
                className="text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition">
                🔑 Transfer Ownership
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8 gap-8">
        {["about", "discussion", "articles", "members"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-4 font-semibold capitalize relative transition ${
              activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
            }`}>
            {tab}
            {activeTab === tab && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── ABOUT ── */}
      {activeTab === "about" && (
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-lg">Community Rules</h3>
            {community.rules?.length ? (
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                {community.rules.map((rule, idx) => <li key={idx}>{rule}</li>)}
              </ul>
            ) : <p className="text-gray-400 text-sm">No rules set.</p>}
          </div>
          {community.interests?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-lg">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {community.interests.map((i, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DISCUSSION ── */}
      {activeTab === "discussion" && (
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[650px] overflow-hidden">
          {!isMember && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl">
              <p className="text-gray-700 mb-4 font-medium">Join this community to participate in discussions</p>
              <button onClick={handleJoin} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
                Join Community
              </button>
            </div>
          )}
          <div className="px-6 py-4 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-800">Community Discussion</h2>
            <p className="text-sm text-gray-500">Share ideas, thoughts, and articles</p>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50">
            {(isMember ? discussions : discussions.slice(0, 3)).map((d) => {
              const isMe = d.author?._id === currentUserId;
              return (
                <div key={d._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md w-fit rounded-2xl px-4 py-3 shadow-sm ${
                    isMe ? "bg-blue-50 text-black rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"
                  }`}>
                    <p className="text-xs font-semibold mb-2 opacity-70">{isMe ? "You" : d.author?.name}</p>
                    {d.article ? (
                      <div className="max-w-2xl">
                        <ArticleCard article={d.article} currentUserId={currentUserId} isChatView={true} className="shadow-none border border-gray-200" />
                      </div>
                    ) : <p>{d.message}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {isMember && (
            <form onSubmit={handleSend} className="border-t bg-white px-4 py-4 flex items-center gap-3">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition">
                Send
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── ARTICLES ── */}
      {activeTab === "articles" && (
        <div className="relative">
          {!isMember && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
              <button onClick={handleJoin} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                Join to view all articles
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(isMember ? articles : articles.slice(0, 2)).map((article) => (
              <div key={article._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100">
                {article.imageUrl && (
                  <img src={article.imageUrl} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition" />
                )}
                <div className="p-6">
                  <h3 onClick={() => navigate(`/articles/${article._id}`)}
                    className="text-xl font-bold mb-2 group-hover:text-blue-600 transition cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{article.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.authorId?.name}</span>
                    {isMember && (
                      <button onClick={() => handleShareArticle(article)}
                        className="text-blue-500 hover:text-blue-700 font-medium text-xs border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50 transition">
                        📤 Share to Discussion
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MEMBERS ── */}
      {activeTab === "members" && (
        <div className="space-y-3">
          {community.members.map((member) => {
            const mId = member._id?.toString();
            const modStatus = memberIsMod(mId);
            const ownerStatus = memberIsOwner(mId);
            const isMe = mId === currentUserId;
            return (
              <div key={member._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                <div onClick={() => navigate(`/profile/${member._id}`)} className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{member.name}</p>
                    {ownerStatus && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Owner</span>}
                    {modStatus && !ownerStatus && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Mod</span>}
                    {isMe && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">You</span>}
                  </div>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                {!isMe && !ownerStatus && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    {(isOwner || isMod) && (
                      <button onClick={() => handleKick(mId, member.name)} disabled={actionLoading}
                        className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                        Kick
                      </button>
                    )}
                    {/* Quick promote from member row */}
                    {isOwner && !modStatus && (
                      <button
                        onClick={() => { setSelectedMods([member]); setShowAddModModal(true); }}
                        className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                        Make Mod
                      </button>
                    )}
                    {isOwner && modStatus && (
                      <button onClick={() => handleRemoveMod(mId, member.name)} disabled={actionLoading}
                        className="text-xs text-orange-500 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition">
                        Remove Mod
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD MEMBER MODAL ── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddMemberModal(false); setSelectedMembers([]); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold">Add Members</h2>
              <button onClick={() => { setShowAddMemberModal(false); setSelectedMembers([]); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-gray-500 text-sm mb-5">Search and invite users to this community.</p>

            <UserSearchInput
              placeholder="Search by name or email..."
              onSelect={(user) => {
                if (!selectedMembers.find((u) => u._id === user._id) && !memberIds.has(user._id)) {
                  setSelectedMembers((prev) => [...prev, user]);
                }
              }}
            />

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMembers.map((user) => (
                  <div key={user._id} className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full">
                    <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <button onClick={() => setSelectedMembers((prev) => prev.filter((u) => u._id !== user._id))}
                      className="text-red-400 text-xs ml-1">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={handleAddMembers} disabled={addMemberLoading || !selectedMembers.length}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                {addMemberLoading ? "Adding..." : `Add ${selectedMembers.length ? selectedMembers.length + " " : ""}Member${selectedMembers.length !== 1 ? "s" : ""}`}
              </button>
              <button onClick={() => { setShowAddMemberModal(false); setSelectedMembers([]); }}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MODERATOR MODAL ── */}
      {showAddModModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModModal(false); setSelectedMods([]); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold">Add Moderators</h2>
              <button onClick={() => { setShowAddModModal(false); setSelectedMods([]); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Search for members to promote as moderators.
            </p>

            <UserSearchInput
              placeholder="Search members by name..."
              onSelect={(user) => {
                // Skip if already a mod or already selected
                if (modIds.has(user._id) || selectedMods.find((u) => u._id === user._id)) return;
                setSelectedMods((prev) => [...prev, user]);
              }}
            />

            {selectedMods.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMods.map((user) => (
                  <div key={user._id} className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full">
                    <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <button onClick={() => setSelectedMods((prev) => prev.filter((u) => u._id !== user._id))}
                      className="text-red-400 text-xs ml-1">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={handleAddModerators} disabled={addModLoading || !selectedMods.length}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {addModLoading ? "Promoting..." : `Promote ${selectedMods.length ? selectedMods.length + " " : ""}to Mod${selectedMods.length !== 1 ? "s" : ""}`}
              </button>
              <button onClick={() => { setShowAddModModal(false); setSelectedMods([]); }}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSFER OWNERSHIP MODAL ── */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowTransferModal(false); setTransferUser(null); } }}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold">Transfer Ownership</h2>
              <button onClick={() => { setShowTransferModal(false); setTransferUser(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-red-500 text-sm mb-5">⚠️ This is irreversible. You will lose owner privileges.</p>

            <UserSearchInput
              placeholder="Search members by name..."
              onSelect={(user) => {
                if (memberIds.has(user._id)) setTransferUser(user);
              }}
            />

            {transferUser && (
              <div className="flex items-center gap-3 mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <img src={transferUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(transferUser.name)}`}
                  alt="" className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{transferUser.name}</p>
                  <p className="text-xs text-gray-500">{transferUser.email}</p>
                </div>
                <button onClick={() => setTransferUser(null)} className="text-gray-400 text-xs">✕</button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={handleTransfer} disabled={transferLoading || !transferUser}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition">
                {transferLoading ? "Transferring..." : "Transfer Ownership"}
              </button>
              <button onClick={() => { setShowTransferModal(false); setTransferUser(null); }}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityDetailPage;