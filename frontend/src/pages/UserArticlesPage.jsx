import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
const UserArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserArticles = async () => {
      try {
        const response = await axios.get('/articles/articles/by-author');
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching user articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserArticles();
  }, []);

 
if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Articles</h1>
      {articles.length === 0 ? (
        <p>You haven't written any articles yet.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article._id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <p className="text-gray-600">{article.content.slice(0, 100)}...</p>
              <p className="text-sm text-gray-500">
                Published on {new Date(article.publishedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserArticlesPage;
