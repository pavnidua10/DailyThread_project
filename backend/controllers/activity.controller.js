// controllers/activity.controller.js

import Article from "../models/article.model.js";
import DebateArgument from "../models/DebateArgument.js";
import CommunityVerdict from "../models/communityVerdictSchema.js";
import Community from "../models/community.model.js";
import User from "../models/user.js";

// ─────────────────────────────────────────────────────────
// GET USER ACTIVITY
// ─────────────────────────────────────────────────────────
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const [articles, debateArgs, verdicts, communities] =
      await Promise.all([
        Article.find({ authorId: userId })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("title createdAt category"),

        DebateArgument.find({ authorId: userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("articleId", "title"),

        CommunityVerdict.find({ "voters.userId": userId })
          .sort({ createdAt: -1 })
          .limit(10),

        Community.find({ members: userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("name createdAt"),
      ]);

    const feed = [];

    // Articles
    articles.forEach((a) => {
      feed.push({
        type: "article_published",
        title: a.title,
        date: a.createdAt,
        meta: a.category ? `Category: ${a.category}` : null,
      });
    });

    // Debate
    debateArgs.forEach((d) => {
      feed.push({
        type: "debate_argument",
        title: d.articleId?.title || "an article",
        date: d.createdAt,
        meta: `Argued ${
          d.side === "for" ? "in support" : "against"
        } · ${d.upvotes?.length || 0} upvotes`,
      });
    });

    // Verdict votes
    verdicts.forEach((v) => {
      const voterEntry = v.voters.find(
        (vt) => vt.userId?.toString() === userId
      );

      feed.push({
        type: "verdict_vote",
        title: v.topic,
        date: v.createdAt,
        meta: voterEntry ? `Voted: ${voterEntry.side}` : null,
      });
    });

    // Communities
    communities.forEach((c) => {
      feed.push({
        type: "community_joined",
        title: c.name,
        date: c.createdAt,
        meta: null,
      });
    });

    feed.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(feed.slice(0, 20));
  } catch (err) {
    console.error("getUserActivity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// GET ARTICLES BY AUTHOR (PUBLIC)
// ─────────────────────────────────────────────────────────
export const getArticlesByAuthor = async (req, res) => {
  try {
    const { userId } = req.params;

    const articles = await Article.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .populate("authorId", "name profilePhoto");

    res.json(articles);
  } catch (err) {
    console.error("getArticlesByAuthor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// FOLLOW USER
// ─────────────────────────────────────────────────────────
export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id.toString();

    if (targetId === myId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: myId },
    });

    await User.findByIdAndUpdate(myId, {
      $addToSet: { following: targetId },
    });

    res.json({ message: "Followed" });
  } catch (err) {
    console.error("followUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// UNFOLLOW USER
// ─────────────────────────────────────────────────────────
export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id.toString();

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: myId },
    });

    await User.findByIdAndUpdate(myId, {
      $pull: { following: targetId },
    });

    res.json({ message: "Unfollowed" });
  } catch (err) {
    console.error("unfollowUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};