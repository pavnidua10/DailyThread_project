import Discussion from "../models/communityDiscussion.model.js";
import SourceVerification from '../models/sourceVerificationSchema.model.js'
import axios from "axios";

export const CLAIM_TYPE_LABELS = {
  personal_experience: { label: "Personal Experience", color: "#0284C7", bg: "#E0F2FE", icon: "👤" },
  cited_source:        { label: "Cited Source",        color: "#059669", bg: "#D1FAE5", icon: "📎" },
  insider_claim:       { label: "Insider Claim",       color: "#7C3AED", bg: "#EDE9FE", icon: "🔍" },
  opinion:             { label: "Opinion",             color: "#D97706", bg: "#FEF3C7", icon: "💬" },
  general:             { label: "General",             color: "#6B7280", bg: "#F3F4F6", icon: "•"  },
};


const extractDomain = (url) => {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`)
      .hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};


export const getDiscussions = async (req, res) => {
  try {
    const { communityId } = req.params;

    const discussions = await Discussion.find({ communityId })
      .sort({ createdAt: 1 })
      .populate("author", "name profilePhoto _id")
      .populate("article")
      .populate("sourceVerification");

    res.json(discussions);
  } catch (err) {
    console.error("getDiscussions:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createDiscussion = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { message, claimType = "general", sourceUrl, articleId } = req.body;

    if (!message?.trim() && !articleId) {
      return res.status(400).json({ message: "Message or article required" });
    }

    const validTypes = Object.keys(CLAIM_TYPE_LABELS);
    const resolvedClaimType = validTypes.includes(claimType)
      ? claimType
      : "general";

    let sourceVerificationId = null;

    // verify source (if exists)
    if (sourceUrl?.trim()) {
      const domain = extractDomain(sourceUrl);

      if (domain) {
        let cached = await SourceVerification.findOne({ domain });

        if (!cached) {
          try {
            await axios.post(
              `${process.env.BASE_URL}/api/verify-source`,
              { url: sourceUrl }
            );
            cached = await SourceVerification.findOne({ domain });
          } catch {}
        }

        if (cached) sourceVerificationId = cached._id;
      }
    }

    const discussion = await Discussion.create({
      communityId,
      author: req.user._id,
      message: message?.trim(),
      article: articleId || undefined,
      claimType: resolvedClaimType,
      sourceUrl: sourceUrl?.trim() || undefined,
      sourceVerification: sourceVerificationId || undefined,
    });

    await discussion.populate("author", "name profilePhoto _id");
    await discussion.populate("article");
    await discussion.populate("sourceVerification");

    res.status(201).json(discussion);
  } catch (err) {
    console.error("createDiscussion:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const voteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { vote } = req.body;
    const userId = req.user._id.toString();

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ message: "Not found" });

    if (discussion.author.toString() === userId) {
      return res.status(400).json({ message: "Cannot vote on your own post" });
    }

    discussion.upvotes = discussion.upvotes.filter(
      (id) => id.toString() !== userId
    );
    discussion.downvotes = discussion.downvotes.filter(
      (id) => id.toString() !== userId
    );

    if (vote === "up") discussion.upvotes.push(userId);
    if (vote === "down") discussion.downvotes.push(userId);

    await discussion.save();

    res.json({
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length,
    });
  } catch (err) {
    console.error("voteDiscussion:", err);
    res.status(500).json({ message: "Server error" });
  }
};