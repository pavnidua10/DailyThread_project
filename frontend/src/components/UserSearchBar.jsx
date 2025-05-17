import React, { useState } from 'react';
import axios from 'axios';

const UserSearchBar = ({ onUserClick, currentUserId, followingIds = [] }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState({}); 

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) return setUsers([]);
    setLoading(true);
    try {
      const res = await axios.get(`/auth/search?query=${q}`);
      setUsers(res.data);
    } catch (e) {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleFollow = async (userId) => {
    await axios.post('/auth/follow', { userId });
    setFollowed(prev => ({ ...prev, [userId]: true }));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search users by name..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        className="w-full border p-2 rounded mb-2"
      />
      {loading && <div className="text-gray-500 mb-2">Searching...</div>}
      <div>
        {users.length === 0 && query.length >= 2 && !loading && (
          <div className="text-gray-500">No users found.</div>
        )}
        {users.map(user => (
          <div
            key={user._id}
            className="border p-2 rounded mb-2 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition"
            onClick={() => onUserClick && onUserClick(user._id)}
          >
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500">{user.bio}</div>
            </div>
            {currentUserId !== user._id && (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={e => {
                  e.stopPropagation();
                  handleFollow(user._id);
                }}
                disabled={followed[user._id] || (followingIds && followingIds.includes(user._id))}
              >
                {followed[user._id] || (followingIds && followingIds.includes(user._id)) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchBar;
