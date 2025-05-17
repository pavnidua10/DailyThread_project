import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CommunityCard from '../components/CommunityCard';
import CommunitySearchBar from '../components/CommunitySearchBar';
import CreateCommunityForm from '../components/CreateCommunityForm';
import UserSearchBar from '../components/UserSearchBar';
import UserProfile from '../components/UserProfile';

const CommunityPage = ({ currentUserId }) => {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchedUserId, setSearchedUserId] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async (q = '') => {
    const res = await axios.get(`/community/search?query=${q}`);
    setCommunities(res.data);
  };

  const handleSearch = (q) => {
    setSearch(q);
    fetchCommunities(q);
  };

  const handleCommunityClick = (community) => {
    navigate(`/communities/${community._id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Communities</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <CommunitySearchBar value={search} onChange={handleSearch} />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Close' : 'Create Community'}
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowUserSearch(!showUserSearch)}
        >
          {showUserSearch ? 'Hide User Search' : 'Search Users'}
        </button>
      </div>

 
      {searchedUserId ? (
        <div>
          <button
            className="text-blue-600 mb-4"
            onClick={() => setSearchedUserId(null)}
          >
            ← Back to search
          </button>
          <UserProfile userId={searchedUserId} currentUserId={currentUserId} />
        </div>
      ) : (
        <>
          {showCreateForm && (
            <div className="mb-8">
              <CreateCommunityForm onCreated={fetchCommunities} />
            </div>
          )}
          {showUserSearch && (
            <div className="mb-8">
              <UserSearchBar onUserClick={setSearchedUserId} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {communities.map(com => (
              <CommunityCard
                key={com._id}
                community={com}
                onClick={() => handleCommunityClick(com)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityPage;
