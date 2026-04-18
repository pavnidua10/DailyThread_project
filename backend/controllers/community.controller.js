import Community from '../models/community.model.js';
import User from '../models/user.js';
import Article from '../models/article.model.js';
import CommunityDiscussion from '../models/communityDiscussion.js';

export const searchCommunities = async (req, res) => {
  const { query } = req.query;
  const regex = new RegExp(query, 'i');
  const communities = await Community.find({
    $or: [{ name: regex }, { description: regex }, { interests: regex }]
  }).populate('members', 'name').populate('moderators', 'name');
  res.json(communities);
};

export const createCommunity = async (req, res) => {
  const {
    name,
    description,
    interests,
    rules,
    members = [],
    moderators = [],
  } = req.body;

  const uniqueMembers = [...new Set([req.user._id.toString(), ...members])];
  const uniqueModerators = [
    ...new Set([req.user._id.toString(), ...moderators]),
  ];

  const community = await Community.create({
    name,
    description,
    interests,
    rules,
    owner: req.user._id,
    moderators: uniqueModerators,
    members: uniqueMembers,
  });

  // Add community to all members' profiles
  await User.updateMany(
    { _id: { $in: uniqueMembers } },
    { $addToSet: { communities: community._id } }
  );

  res.json(community);
};
export const isOwner = (community, userId) => {
  return community.owner.toString() === userId.toString();
};

export const isModerator = (community, userId) => {
  return community.moderators.some(
    (m) => m.toString() === userId.toString()
  );
};

export const isMember = (community, userId) => {
  return community.members.some(
    (m) => m.toString() === userId.toString()
  );
};

export const joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user._id;
  await Community.findByIdAndUpdate(communityId, { $addToSet: { members: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { communities: communityId } });

  const community = await Community.findById(communityId)
    .populate('members', 'name email')
    .populate('moderators', 'name email');
  res.json({ message: 'Joined community', community });
};

export const leaveCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user._id;

  const community = await Community.findById(communityId);

  if (isOwner(community, userId)) {
    return res.status(400).json({
      message: "Owner cannot leave. Transfer ownership first.",
    });
  }

  await Community.findByIdAndUpdate(communityId, {
    $pull: { members: userId, moderators: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { communities: communityId },
  });

  res.json({ message: "Left community" });
};

export const transferOwnership = async (req, res) => {
  const { communityId, newOwnerId } = req.body;

  const community = await Community.findById(communityId);

  if (!isOwner(community, req.user._id)) {
    return res.status(403).json({ message: "Only owner can transfer ownership" });
  }

  community.owner = newOwnerId;

  if (!community.moderators.includes(newOwnerId)) {
    community.moderators.push(newOwnerId);
  }

  await community.save();

  res.json({ message: "Ownership transferred" });
};

export const getCommunity = async (req, res) => {
  const { id } = req.params;
  const community = await Community.findById(id)
    .populate('members', 'name email')
    .populate('moderators', 'name email');
  const articles = await Article.find({ communityId: id }).populate('authorId', 'name',"email");
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
 const discussions = await CommunityDiscussion.find({
  communityId: req.params.id,
})
  .populate("author", "name email profilePhoto")
  .populate("article")
  .sort({ createdAt: 1 });
  res.json(discussions);
};

export const postDiscussion = async (req, res) => {
  const { id } = req.params;
  const { message, article } = req.body; 

  const discussion = await CommunityDiscussion.create({
    communityId: id,
    author: req.user._id,
    message,
    article 
  });
  await discussion.populate('author', 'name email profilePhoto');
  await discussion.populate('article'); 
  res.json(discussion);
};



export const shareArticleToCommunity = async (req, res) => {
  try {
    const {
      articleId,
      title,
      url,
      description,
      imageUrl,
      source,
      publishedAt,
    } = req.body;

  const communityId = req.params.communityId || req.params.id;

if (!communityId) {
  return res.status(400).json({ message: "Community ID missing" });
}

    let article;

    // 🔹 CASE 1: Sharing existing internal article
    if (articleId) {
      const original = await Article.findById(articleId);
      if (!original) {
        return res.status(404).json({ message: "Article not found" });
      }

      article = await Article.create({
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
        sharedBy: req.user._id,
      });
    }

    else {
      article = await Article.create({
        title,
        url,
        description,
        content: description || "",
        imageUrl,
        source,
        publishedAt,
        communityId,
        sharedBy: req.user._id,
        external: true,
      });
    }


    await CommunityDiscussion.create({
      communityId,
      author: req.user._id,
      message: "", 
      article: article._id, 
    });

    const populatedArticle = await Article.findById(article._id)
      .populate("authorId", "name email profilePhoto")
      .populate("sharedBy", "name email profilePhoto");

    return res.json({
      message: "Article shared successfully",
      article: populatedArticle,
    });
  } catch (error) {
    console.error("Error sharing article:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      members: req.user._id,
    });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const kickMember = async (req, res) => {
  const { communityId, userId } = req.body;

  const community = await Community.findById(communityId);
  if (!community) return res.status(404).json({ message: "Not found" });

  // Only owner or moderator
  if (
    !isOwner(community, req.user._id) &&
    !isModerator(community, req.user._id)
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Cannot kick owner
  if (isOwner(community, userId)) {
    return res.status(400).json({ message: "Cannot remove owner" });
  }

  await Community.findByIdAndUpdate(communityId, {
    $pull: { members: userId, moderators: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { communities: communityId },
  });

  res.json({ message: "Member removed" });
};
export const addModerator = async (req, res) => {
  const { communityId, userId } = req.body;

  const community = await Community.findById(communityId);

  if (!isOwner(community, req.user._id)) {
    return res.status(403).json({ message: "Only owner can add moderators" });
  }

  await Community.findByIdAndUpdate(communityId, {
    $addToSet: { moderators: userId },
  });

  res.json({ message: "Moderator added" });
};
export const removeModerator = async (req, res) => {
  const { communityId, userId } = req.body;

  const community = await Community.findById(communityId);

  if (!isOwner(community, req.user._id)) {
    return res.status(403).json({ message: "Only owner can remove moderators" });
  }

  if (isOwner(community, userId)) {
    return res.status(400).json({ message: "Owner cannot be removed" });
  }

  await Community.findByIdAndUpdate(communityId, {
    $pull: { moderators: userId },
  });

  res.json({ message: "Moderator removed" });
};
export const getSuggestedCommunities = async (req, res) => {
  try {
    const userId = req.user._id;

    const communities = await Community.find({
      members: { $ne: userId } // NOT a member
    }).limit(6); // optional limit

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};