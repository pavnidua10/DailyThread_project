// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import ArticleCard from '../components/ArticleCard';
// import { useParams } from 'react-router-dom';

// const HomePage = () => {
//   const [headlines, setHeadlines] = useState([]);
//   const [topArticles, setTopArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('headlines');
//   const { communityId } = useParams();
//   useEffect(() => {
//     const fetchArticles = async () => {
//       try {
//         const headlinesRes = await axios.get('/articles/headlines');
//         const topArticlesRes = await axios.get('/articles/top-rated');  
//         setHeadlines(headlinesRes.data.articles);
//         if (!topArticlesRes.data.articles?.length) {
//           const allArticlesRes = await axios.get('/articles/get-articles');
//           setTopArticles(allArticlesRes.data);
//         } else {
//           setTopArticles(topArticlesRes.data.articles);
//         }
//       } catch (err) {
//         setError('Failed to fetch articles');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticles();
//   }, []);

//   if (loading) return <p className="text-center mt-4">Loading...</p>;
//   if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

//   const renderArticles = (articles) => articles.map((article, idx) => (
//     <ArticleCard key={idx} article={article}  communityId={communityId}/>
//   ));

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Articles</h1>

//       <div className="mb-6">
//         <button
//           onClick={() => setActiveTab('headlines')}
//           className={`px-4 py-2 mr-4 rounded-lg ${activeTab === 'headlines' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//         >
//           Top Headlines
//         </button>
//         <button
//           onClick={() => setActiveTab('articles')}
//           className={`px-4 py-2 rounded-lg ${activeTab === 'articles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//         >
//           Top Articles
//         </button>
//       </div>

//       <div className="grid gap-6">
//         {activeTab === 'headlines' ? renderArticles(headlines) : renderArticles(topArticles)}
//       </div>
//     </div>
//   );
// };

// export default HomePage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { useParams } from 'react-router-dom';
import { useUser } from '../Context/UserContext'; // <-- Adjust path as needed

const HomePage = () => {
  const [headlines, setHeadlines] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('headlines');
  const { communityId } = useParams();
  const { user } = useUser(); // <-- Get current user

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const headlinesRes = await axios.get('/articles/headlines');
        const topArticlesRes = await axios.get('/articles/top-rated');
        setHeadlines(headlinesRes.data.articles);
        if (!topArticlesRes.data.articles?.length) {
          const allArticlesRes = await axios.get('/articles/get-articles');
          setTopArticles(allArticlesRes.data);
        } else {
          setTopArticles(topArticlesRes.data.articles);
        }
      } catch (err) {
        setError('Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  // Use a unique key for each article (internal: _id, external: url, fallback: idx)
  const renderArticles = (articles) =>
    articles.map((article, idx) => (
      <ArticleCard
        key={article._id || article.url || idx}
        article={article}
        currentUserId={user?._id}
        communityId={communityId}
      />
    ));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
     

      <div className="mb-6">
        <button
          onClick={() => setActiveTab('headlines')}
          className={`px-4 py-2 mr-4 rounded-lg ${activeTab === 'headlines' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Top Headlines
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'articles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Top Articles
        </button>
      </div>

      <div className="grid gap-6">
        {activeTab === 'headlines'
          ? renderArticles(headlines)
          : renderArticles(topArticles)}
      </div>
    </div>
  );
};

export default HomePage;
