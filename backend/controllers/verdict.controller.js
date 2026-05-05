import CommunityVerdict from "../models/communityVerdictSchema.js"
import CredibilityScore from "../models/CredibilityScore.js"
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getVerdicts = async (req, res) => {
  try {
    const { communityId } = req.params;

    const verdicts = await CommunityVerdict.find({ communityId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profilePhoto");

    // auto-close expired
    const now = new Date();
    for (const v of verdicts) {
      if (v.status === "open" && v.expiresAt && v.expiresAt < now) {
        await closeVerdict(v);
      }
    }

    const fresh = await CommunityVerdict.find({ communityId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profilePhoto");

    res.json(fresh);
  } catch (err) {
    console.error("getVerdicts:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createVerdict = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { topic, durationHours = 24 } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const verdict = await CommunityVerdict.create({
      communityId,
      topic: topic.trim(),
      createdBy: req.user._id,
      expiresAt,
      status: "open",
    });

    await verdict.populate("createdBy", "name profilePhoto");

    res.status(201).json(verdict);
  } catch (err) {
    console.error("createVerdict:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// CAST vote
// ─────────────────────────────────────────────────────────────────
export const castVote = async (req, res) => {
  try {
    const { verdictId } = req.params;
    const { side } = req.body;
    const userId = req.user._id.toString();

    if (!["for", "against"].includes(side)) {
      return res.status(400).json({ message: "Side must be 'for' or 'against'" });
    }

    const verdict = await CommunityVerdict.findById(verdictId);
    if (!verdict) return res.status(404).json({ message: "Verdict not found" });

    if (verdict.status === "closed") {
      return res.status(400).json({ message: "Voting is closed" });
    }

    if (verdict.expiresAt && verdict.expiresAt < new Date()) {
      await closeVerdict(verdict);
      return res.status(400).json({ message: "Voting ended" });
    }

    // prevent double vote
    const already = verdict.voters.find(
      (v) => v.userId.toString() === userId
    );

    if (already) {
      return res.status(400).json({ message: "Already voted" });
    }

    // weighted voting
    let weight = 1;
    try {
      const cred = await CredibilityScore.findOne({ userId });
      const score = cred?.data?.total ?? 0;

      if (score >= 85) weight = 3;
      else if (score >= 70) weight = 2;
      else if (score >= 50) weight = 1.5;
    } catch {}

    verdict.voters.push({ userId, side });

    if (side === "for") verdict.forVotes += weight;
    else verdict.againstVotes += weight;

    await verdict.save();

    res.json({
      forVotes: verdict.forVotes,
      againstVotes: verdict.againstVotes,
      totalVoters: verdict.voters.length,
    });
  } catch (err) {
    console.error("castVote:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// MANUAL close
// ─────────────────────────────────────────────────────────────────
export const closeVerdictManually = async (req, res) => {
  try {
    const { verdictId } = req.params;

    const verdict = await CommunityVerdict.findById(verdictId);
    if (!verdict) return res.status(404).json({ message: "Verdict not found" });

    if (verdict.status === "closed") {
      return res.status(400).json({ message: "Already closed" });
    }

    const closed = await closeVerdict(verdict);
    res.json(closed);
  } catch (err) {
    console.error("closeVerdictManually:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// INTERNAL close + GROQ AI summary
// ─────────────────────────────────────────────────────────────────
const closeVerdict = async (verdict) => {
  verdict.status = "closed";

  const total = verdict.forVotes + verdict.againstVotes;

  let result = "inconclusive";
  let resultLabel = "Community was divided — no clear verdict";

  if (total > 0) {
    const forPct = Math.round((verdict.forVotes / total) * 100);
    const againstPct = 100 - forPct;

    if (forPct >= 60) {
      result = "for";
      resultLabel = `Community ruled: Claims supported — ${forPct}% agreed`;
    } else if (againstPct >= 60) {
      result = "against";
      resultLabel = `Community ruled: Claims unverified — ${againstPct}% disagreed`;
    } else {
      resultLabel = `Community split — ${forPct}% for, ${againstPct}% against`;
    }
  }

  verdict.result = result;
  verdict.resultLabel = resultLabel;

  // ✅ GROQ AI summary
  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: `Topic: "${verdict.topic}"
Result: ${resultLabel}
Write ONE neutral sentence explaining this verdict. No opinions.`,
        },
      ],
      max_tokens: 80,
    });

    verdict.summary =
      completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.log("Groq summary failed");
  }

  await verdict.save();
  return verdict;
};