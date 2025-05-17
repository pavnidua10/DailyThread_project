import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';

const CommunityDetailPage = ({ currentUserId }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [articles, setArticles] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('discussion');
  const [userArticles, setUserArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [isMember, setIsMember] = useState(false);

  const chatContainerRef = useRef(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [discussions]);

  useEffect(() => {
    if (location.state && location.state.scrollToArticles) {
      setActiveTab('articles');
    }
  }, [location.state]);

  useEffect(() => {
    fetchCommunity();
    fetchDiscussions();
    fetchUserArticles();
    
  }, [id, currentUserId]);

  const fetchCommunity = async () => {
    const res = await axios.get(`/community/${id}`);
    setCommunity(res.data.community);
    setArticles(res.data.articles);
    setIsMember(res.data.community.members.some(m => m._id === currentUserId));
  };

  const fetchDiscussions = async () => {
    const res = await axios.get(`/community/${id}/discussions`);
    setDiscussions(res.data);
  };

  const fetchUserArticles = async () => {
    const res = await axios.get('/articles/articles/by-author');
    setUserArticles(res.data.filter(a => !a.communityId || a.communityId !== id));
  };

  const handleJoin = async () => {
    await axios.post('/community/join', { communityId: id });
    navigate(`/communities/${id}`);
    setIsMember(true);
    fetchCommunity();
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await axios.post(`/community/${id}/discussions`, { message: newMessage });
    setNewMessage('');
    fetchDiscussions();
  };

  const handleShareArticle = async (e) => {

    if (!selectedArticle) return;
    console.log("handleShareArticle called", selectedArticle);


    await axios.post(`/community/${id}/share-article`, { articleId: selectedArticle });

    try {
      const res = await axios.post(`/community/${id}/discussions`, { article: selectedArticle, message: "shared an article" });
      console.log('Discussion created:', res.data);
    } catch (err) {
      console.error('Failed to create discussion:', err.response ? err.response.data : err);
      alert('Failed to create discussion: ' + (err.response?.data?.message || err.message));
    }

    setSelectedArticle('');

    
    if (!window.location.pathname.includes(`/communities/${id}`)) {
      navigate(`/communities/${id}`, { state: { scrollToArticles: false } });
     
    } else {
     
      await fetchDiscussions();
      setActiveTab('discussion');
    }
  };

  if (!community) return <div>Loading...</div>;

  if (!isMember) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{community.name}</h2>
        <p className="mb-4">{community.description}</p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          onClick={handleJoin}
        >
          Join Community
        </button>
      </div>
    );
  }

  return (
    
    <div className="max-w-3xl mx-auto p-6">
      <button
  onClick={() => navigate('/communities')}
  className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
  aria-label="Back to Communities"
>
  ← Back to Communities
</button>

      <h2 className="text-2xl font-bold mb-2">{community.name}</h2>
      <p className="mb-2">{community.description}</p>
      <div className="mb-2 text-sm text-gray-600">
        <strong>Moderators:</strong> {community.moderators.map(m => m.name).join(', ')}
      </div>
      <div className="mb-2 text-sm text-gray-700">
        <strong>Members:</strong> {community.members.length}
      </div>
      <div className="mb-4">
        <h4 className="font-bold">Community Rules</h4>
        <ul className="list-disc ml-6">
          {community.rules && community.rules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'discussion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'members' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'articles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('articles')}
        >
          Articles
        </button>
      </div>
      {activeTab === 'discussion' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Discussion</h3>
          <div
            className="space-y-2 mb-4 overflow-y-auto bg-gray-50 rounded p-2"
            style={{ maxHeight: 320, minHeight: 120 }}
            ref={chatContainerRef}
          >
            {discussions.length === 0 ? (
              <p className="text-gray-500 mb-4">Start a conversation!</p>
            ) : (
              discussions.map(d => (
                <div
                  key={d._id}
                  className={`flex ${d.author?._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 mb-1 max-w-full ${
                      d.author?._id === currentUserId
                        ? 'bg-blue-100 border border-blue-200 self-end'
                        : 'bg-gray-100 border border-gray-200 self-start'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 text-gray-500">
                      {d.author?.name || 'Anonymous'}
                    </div>
                    {d.article ? (
                      <div className="w-full max-w-md">
                        <ArticleCard 
                          article={d.article} 
                          currentUserId={currentUserId}
                          className="shadow-none border-none"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-800">{d.message}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      
          <form onSubmit={handlePostMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 border p-2 rounded"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Send
            </button>
          </form>
     
          <div className="mt-4 flex gap-2 items-center">
  <select
    value={selectedArticle}
    onChange={e => setSelectedArticle(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">Share your article in chat</option>
    {userArticles.map(a => (
      <option key={a._id} value={a._id}>{a.title}</option>
    ))}
  </select>
  <button
    type="button"
    className="bg-green-600 text-white px-4 py-2 rounded"
    disabled={!selectedArticle}
    onClick={handleShareArticle}
  >
    Share in Chat
  </button>
</div>

        </div>
      )}
      {activeTab === 'members' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Members</h3>
          <ul className="list-disc ml-6">
            {community.members.map(m => (
              <li key={m._id || m}>{m.name || m}</li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === 'articles' && (
        <>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Articles in this Community</h3>
            {articles.length === 0 && <p className="text-gray-500">No articles yet.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityDetailPage;

