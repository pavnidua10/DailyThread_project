

import Community from '../models/community.model.js';
import User from '../models/user.js';
import Article from '../models/article.model.js';
import Discussion from '../models/communityDiscussion.model.js';

export const searchCommunities = async (req, res) => {
  const { query } = req.query;
  const regex = new RegExp(query, 'i');
  const communities = await Community.find({
    $or: [{ name: regex }, { description: regex }, { interests: regex }]
  }).populate('members', 'name').populate('moderators', 'name');
  res.json(communities);
};

export const createCommunity = async (req, res) => {
  const { name, description, interests, rules } = req.body;
  const community = await Community.create({
    name,
    description,
    interests,
    rules,
    moderators: [req.user._id],
    members: [req.user._id],
  });
  await User.findByIdAndUpdate(req.user._id, { $push: { communities: community._id } });
  res.json(community);
};

export const joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user._id;
  await Community.findByIdAndUpdate(communityId, { $addToSet: { members: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { communities: communityId } });

  const community = await Community.findById(communityId)
    .populate('members', 'name')
    .populate('moderators', 'name');
  res.json({ message: 'Joined community', community });
};

export const leaveCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user._id;
  await Community.findByIdAndUpdate(communityId, { $pull: { members: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { communities: communityId } });
  res.json({ message: 'Left community' });
};

export const getCommunity = async (req, res) => {
  const { id } = req.params;
  const community = await Community.findById(id)
    .populate('members', 'name')
    .populate('moderators', 'name');
  const articles = await Article.find({ communityId: id }).populate('authorId', 'name');
  res.json({ community, articles });
};

export const inviteToCommunity = async (req, res) => {
  const { userId } = req.body;
  const community = await Community.findById(req.params.id);
  if (!community.moderators.includes(req.user._id)) return res.status(403).json({ message: 'Only moderators can invite.' });
  await Community.findByIdAndUpdate(req.params.id, { $addToSet: { members: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { communities: community._id } });
  res.json({ message: 'User invited' });
};

export const addArticleToCommunity = async (req, res) => {
  const { title, content, imageUrl } = req.body;
  const { id } = req.params;
  const article = new Article({
    title,
    content,
    imageUrl,
    authorId: req.user._id,
    communityId: id,
  });
  await article.save();
  res.json(article);
};


export const getDiscussions = async (req, res) => {
  const { id } = req.params;
  const discussions = await Discussion.find({ communityId: id })
    .populate('author', 'name')
    .populate('article')
    .sort({ createdAt: 1 });
  res.json(discussions);
};

export const postDiscussion = async (req, res) => {
  const { id } = req.params;
  const { message, article } = req.body; 

  const discussion = await Discussion.create({
    communityId: id,
    author: req.user._id,
    message,
    article 
  });
  await discussion.populate('author', 'name');
  await discussion.populate('article'); 
  res.json(discussion);
};



export const shareArticleToCommunity = async (req, res) => {
  try {
    const { articleId, title, url, description, imageUrl, source, publishedAt } = req.body;
    const { communityId } = req.params;

    if (articleId) {
     
      const original = await Article.findById(articleId);
      if (!original) return res.status(404).json({ message: "Article not found" });
     
      const shared = new Article({
        title: original.title,
        content: original.content,
        imageUrl: original.imageUrl,
        authorId: original.authorId,
        communityId,
        source: original.source,
        category: original.category,
        region: original.region,
        tags: original.tags,
        external: original.external || false,
        url: original.url,
        publishedAt: original.publishedAt,
      });
      await shared.save();
     
      return res.json({ message: 'Article shared to community', article: shared });
    } else {
    
      const article = await Article.create({
        title,
        url,
        description,
        content: description || '',
        imageUrl,
        source,
        publishedAt,
        communityId,
        sharedBy: req.user._id, 
        external: true
      });
      return res.json({ message: 'External article shared to community', article });
    }
  } catch (error) {
    console.error('Error sharing article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const isMember = async (req, res) => {
  const { id } = req.params; 
  const userId = req.user._id;
  const community = await Community.findById(id);
  if (!community) return res.status(404).json({ isMember: false });
  const isMember = community.members.some(
    m => m.toString() === userId.toString()
  );
  res.json({ isMember });
};
