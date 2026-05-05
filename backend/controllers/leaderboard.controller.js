import Leaderboard from "../models/leaderboardSchema.model.js";
import CredibilityScore from "../models/CredibilityScore.js"
import User from "../models/user.js";
import Article from "../models/article.model.js";
import Community from "../models/community.model.js";

const TIERS = [
  { min: 85, label: "Authority" },
  { min: 70, label: "Verified Voice" },
  { min: 50, label: "Contributor" },
  { min: 30, label: "Emerging" },
  { min: 0, label: "Newcomer" },
];

const getTierLabel = (score) => {
  return (TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1]).label;
};

// ✅ GET Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check cache (1 hour)
    const cached = await Leaderboard.findOne({
      communityId,
      updatedAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (cached) return res.json(cached.entries);

    // Get community
    const community = await Community.findById(communityId)
      .populate("members", "_id name profilePhoto");

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const memberIds = community.members.map((m) => m._id);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Weekly articles
    const weeklyArticles = await Article.find({
      authorId: { $in: memberIds },
      createdAt: { $gt: oneWeekAgo },
    });

    // Count map
    const weeklyCount = {};
    weeklyArticles.forEach((a) => {
      const id = a.authorId.toString();
      weeklyCount[id] = (weeklyCount[id] || 0) + 1;
    });

    // Credibility scores
    const scores = await CredibilityScore.find({
      userId: { $in: memberIds },
    });

    const scoreMap = {};
    scores.forEach((s) => {
      scoreMap[s.userId.toString()] = s.data?.total ?? 0;
    });

    // Build leaderboard
    const entries = community.members
      .map((member) => {
        const id = member._id.toString();
        const credibilityScore = scoreMap[id] ?? 0;

        return {
          userId: member._id,
          name: member.name,
          profilePhoto: member.profilePhoto || null,
          credibilityScore,
          tier: getTierLabel(credibilityScore),
          articlesThisWeek: weeklyCount[id] ?? 0,
        };
      })
      .sort(
        (a, b) =>
          b.credibilityScore - a.credibilityScore ||
          b.articlesThisWeek - a.articlesThisWeek
      )
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    // Cache result
    await Leaderboard.findOneAndUpdate(
      { communityId },
      { communityId, entries, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(entries);
  } catch (err) {
    console.error("getLeaderboard:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Refresh Leaderboard
export const refreshLeaderboard = async (req, res) => {
  try {
    await Leaderboard.deleteOne({ communityId: req.params.communityId });
    return getLeaderboard(req, res);
  } catch (err) {
    console.error("refreshLeaderboard:", err);
    res.status(500).json({ message: "Server error" });
  }
};