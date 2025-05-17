import Article from '../models/article.model.js';
import Review from '../models/review.model.js';
import User from '../models/user.js';
import axios from 'axios';
import Discussion from '../models/discussion.model.js';
import SavedArticle from '../models/savedArticle.model.js';

export const createArticle = async (req, res) => {
  try {
    const { title, content, source, category, region, tags, imageUrl } = req.body;
    const publishedAt = Date.now();

    const article = new Article({
      title,
      content,
      authorId: req.user._id,
      publishedAt,
      source,
      category,
      region,
      tags,
      imageUrl, 
    });

    await article.save();
    res.status(201).json({ message: 'Article created', article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch articles', error: error.message });
  }
};

export const getArticlesByAuthor = async (req, res) => {
  try {

    const authorId = req.query.userId || req.user.id;
    const articles = await Article.find({ authorId ,$or: [
    { sharedBy: { $exists: false } },
    { sharedBy: null }
  ]}).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const editArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const updates = req.body;

    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized to edit this article' });

    const updatedArticle = await Article.findByIdAndUpdate(articleId, updates, { new: true });
    res.status(200).json({ message: 'Article updated', updatedArticle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized to delete this article' });

    await Article.findByIdAndDelete(articleId);
    res.status(200).json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMyReview = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const userId = req.userId;
    const review = await Review.findOne({ articleId, reviewerId: userId });
    res.json(review); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitOrUpdateReview = async (req, res) => {
  try {
    const { articleId, accuracy, comment } = req.body;
    const userId = req.userId;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (!article.authorId || !userId) {
      return res.status(400).json({ error: 'Invalid author or user' });
    }
    if (article.authorId.toString() === userId.toString()) {
      return res.status(403).json({ error: "You can't review your own article" });
    }

    const review = await Review.findOneAndUpdate(
      { articleId, reviewerId: userId },
      { accuracy, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

  
    const reviews = await Review.find({ articleId });
    const totalReviews = reviews.length;
    const averageAccuracy = reviews.reduce((sum, r) => sum + r.accuracy, 0) / totalReviews;
    await Article.findByIdAndUpdate(articleId, { averageAccuracy, totalReviews });

    res.status(201).json({ message: 'Review submitted or updated', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const getReviews = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const reviews = await Review.find({ articleId }).populate('reviewerId', 'name'); // Populate reviewerId field with 'name'
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getTopHeadlines = async (req, res) => {
  try {
    const { country = 'us', category = '', pageSize = 10, q = '', region = '', page = '' } = req.query;

    let articles = [];

    if (country !== 'in') {
      
      const params = {
        country,
        apiKey: process.env.NEWS_API_KEY,
        pageSize,
      };
      if (category) params.category = category;
      if (q) params.q = q;

      const response = await axios.get(`https://newsapi.org/v2/top-headlines`, { params });

      articles = response.data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
      }));
    } else {
   
      const params = {
        country: "in",
        apikey: process.env.NEWSDATA_API_KEY,
        language: "en",
      };
      if (category) params.category = category;
      if (q) params.q = q;
      if (region) params.region = region;
     
      if (page) params.page = page;

     

      const response = await axios.get("https://newsdata.io/api/1/news", { params });

      articles = (response.data.results || []).map((article) => ({
        title: article.title,
        description: article.description,
        url: article.link,
        source: article.source_id || "NewsData",
        imageUrl: article.image_url,
        publishedAt: article.pubDate,
      }));
      res.status(200).json({ articles, nextPage: response.data.nextPage || null });
      return;
    }

    res.status(200).json({ articles });
  } catch (error) {
    console.error("Headline Fetch Error:", error.message, error.response?.data);
    res.status(500).json({
      message: 'Failed to fetch headlines',
      error: error.message,
      details: error.response?.data,
    });
  }
};


export const getSavedArticles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedArticles',
        populate: { path: 'authorId', select: 'name' }
      });

    const savedExternals = await SavedArticle.find({ userId: req.user._id });

    const result = [
      ...user.savedArticles.map(a => ({ ...a.toObject(), source: 'internal' })),
      ...savedExternals.map(s => ({ 
        ...s.toObject(), 
        source: 'external',
        external: true 
      }))
    ];

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const saveArticle = async (req, res) => {
  try {
    const { articleId, title, url, description, imageUrl, source, publishedAt } = req.body;

    if (articleId) {
   
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { savedArticles: articleId } },
        { new: true }
      ).populate('savedArticles');
      return res.json({ message: 'Article saved', savedArticles: user.savedArticles });
    } else {
 
      const existing = await SavedArticle.findOne({ 
        userId: req.user._id, 
        url: url 
      });
      if (existing) return res.status(400).json({ message: 'Article already saved' });

     const saved = await SavedArticle.create({
  userId: req.user._id,
  title,
  url,
  description,
  imageUrl,
  source,
  publishedAt,
  external: true
});

      return res.json({ message: 'External article saved', saved });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const getTopRatedArticles = async (req, res) => {
  try {
    const topArticles = await Review.aggregate([
      {
        $group: {
          _id: '$articleId',
          avgAccuracy: { $avg: '$accuracy' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgAccuracy: -1, reviewCount: -1 } 
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: '_id',
          as: 'article'
        }
      },
      {
        $unwind: '$article'
      },
      {
        $project: {
          _id: 0,
          article: 1,
          avgAccuracy: 1,
          reviewCount: 1
        }
      }
    ]);

    res.status(200).json({ articles: topArticles.map(item => ({ ...item.article, avgAccuracy: item.avgAccuracy })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated articles' });
  }
};

export const getRelevantArticles = async (req, res) => {
  try {
    const { tag } = req.query; 

  
    const topRated = await Review.aggregate([
      {
        $group: {
          _id: '$articleId',
          avgAccuracy: { $avg: '$accuracy' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgAccuracy: -1, reviewCount: -1 }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: '_id',
          as: 'article'
        }
      },
      { $unwind: '$article' },
      {
        $match: tag
          ? { 'article.tags': tag }
          : {} 
      },
      {
        $project: {
          _id: 0,
          article: 1,
          avgAccuracy: 1,
          reviewCount: 1
        }
      }
    ]);

    
    if (topRated.length > 0) {
      return res.status(200).json({
        articles: topRated.map(item => ({
          ...item.article,
          avgAccuracy: item.avgAccuracy
        }))
      });
    }

    
    const query = tag ? { tags: tag } : {};
    const fallbackArticles = await Article.find(query).sort({ createdAt: -1 });

    res.status(200).json({ articles: fallbackArticles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch relevant articles' });
  }
};


export const unsaveArticle = async (req, res) => {
  const { articleId, url } = req.body;

  try {

    if (articleId) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { savedArticles: articleId } }
      );
    }

   
    if (url) {
      await SavedArticle.findOneAndDelete({
        userId: req.user._id,
        url: url
      });
    }

    res.json({ message: 'Article unsaved' });
  } catch (error) {
    console.error('Error unsaving article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
