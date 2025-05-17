import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '../Context/UserContext';

const ArticleReview = ({ articleId, authorId }) => {
  const { user } = useUser();
  const [accuracy, setAccuracy] = useState(2.5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthor = user?._id === authorId;
// router.get(' /:articleId/reviews/me',protect,getMyReview)
// router.post('/review',protect, submitOrUpdateReview);
// router.get('/:articleId/reviews',protect, getReviews);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        axios.get(`/articles/${articleId}/reviews`),
        axios.get(`/articles/${articleId}/reviews/me`)
      ]);
      setReviews(allRes.data);
      setMyReview(myRes.data);
      if (myRes.data) {
        setAccuracy(myRes.data.accuracy);
        setComment(myRes.data.comment);
      } else {
        setAccuracy(2.5);
        setComment('');
      }
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [articleId, user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/articles/review', {
        articleId,
        accuracy,
        comment,
      });
      toast.success(myReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  if (!user) return null;
  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="p-4 border rounded bg-white shadow space-y-6">
      {isAuthor ? (
        <p className="text-red-500 font-medium">You cannot review your own article.</p>
      ) : myReview ? (
        <div>
          <p className="text-green-600 font-medium mb-2">
            You have already reviewed this article.
          </p>
          {/* If you want to allow updating the review, show the form: */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Update Accuracy Rating: {accuracy}/5</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <textarea
              placeholder="Update your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Review
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Accuracy Rating: {accuracy}/5</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={accuracy}
              onChange={(e) => setAccuracy(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* ✅ Reviews list */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">Community Reviews</h4>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              className="p-3 border border-gray-200 rounded bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.reviewerId?.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-medium">Accuracy: {r.accuracy}/5</p>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticleReview;
