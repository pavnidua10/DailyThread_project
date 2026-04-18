import React, { useEffect, useState } from "react";
import UserSearchBar from "../components/UserSearchBar";
import UserProfile from "../components/UserProfile";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const SearchUsersPage = ({ currentUserId }) => {
  const [activeTab, setActiveTab] = useState("users");

  // USERS
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchedUserId, setSearchedUserId] = useState(null);

  // COMMUNITIES
  const [communityQuery, setCommunityQuery] = useState("");
  const [communities, setCommunities] = useState([]);
  const [joiningId, setJoiningId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestedUsers();
    fetchAllCommunities();
  }, []);

  // ---------------- USERS ----------------

  const fetchSuggestedUsers = async () => {
    try {
      const res = await API.get("/profiles/suggested", {
        withCredentials: true,
      });
      setSuggestedUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- COMMUNITIES ----------------

  const fetchAllCommunities = async () => {
    try {
      const res = await API.get("/communities/search?query=");
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchCommunities = async () => {
    try {
      const res = await API.get(
        `/communities/search?query=${communityQuery}`
      );
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (communityId) => {
    try {
      setJoiningId(communityId);

      const res = await API.post("/communities/join", {
        communityId,
      });

      // update UI immediately
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === communityId
            ? { ...c, members: res.data.community.members }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const isUserMember = (community) => {
    return community.members?.some(
      (m) => m._id === currentUserId
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover</h1>
        <p className="text-gray-500">
          Find people and communities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-10 border-b pb-3">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2 ${
            activeTab === "users"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Users
        </button>

        <button
          onClick={() => setActiveTab("communities")}
          className={`pb-2 ${
            activeTab === "communities"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Communities
        </button>
      </div>

      {/* ================= USERS TAB ================= */}
      {activeTab === "users" && (
        <>
          {searchedUserId ? (
            <>
              <button
                className="text-blue-600 mb-6 hover:underline"
                onClick={() => setSearchedUserId(null)}
              >
                ← Back
              </button>

              <UserProfile
                userId={searchedUserId}
                currentUserId={currentUserId}
              />
            </>
          ) : (
            <>
              <div className="mb-10">
                <UserSearchBar onUserClick={setSearchedUserId} />
              </div>

              <h2 className="text-2xl font-semibold mb-6">
                Suggested Users
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white shadow-md rounded-xl p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={
                          user.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${user.name}`
                        }
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSearchedUserId(user._id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ================= COMMUNITIES TAB ================= */}
      {activeTab === "communities" && (
        <>
          {/* Search */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder="Search communities..."
              value={communityQuery}
              onChange={(e) =>
                setCommunityQuery(e.target.value)
              }
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={searchCommunities}
              className="bg-blue-600 text-white px-6 rounded-lg"
            >
              Search
            </button>
          </div>

          {/* Community List */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const joined = isUserMember(community);

              return (
                <div
                  key={community._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {community.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {community.description}
                  </p>

                  <div className="text-sm text-gray-500 mb-4">
                    👥 {community.members?.length || 0} members
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        navigate(`/communities/${community._id}`)
                      }
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </button>

                    {joined ? (
                      <button className="bg-gray-200 px-4 py-2 rounded-lg text-sm">
                        Joined
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleJoin(community._id)
                        }
                        disabled={
                          joiningId === community._id
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        {joiningId === community._id
                          ? "Joining..."
                          : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchUsersPage;