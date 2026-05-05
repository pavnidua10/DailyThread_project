import Groq from "groq-sdk";
import DebateArgument from "../models/DebateArgument.js";
import DebateSummary from "../models/DebateSummary.js";
import CredibilityScore from "../models/CredibilityScore.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export const getDebate = async (req, res) => {
  try {
    const args = await DebateArgument.find({ articleId: req.params.id })
      .populate("authorId", "name profilePhoto _id")
      .sort({ createdAt: -1 });

    const summary = await DebateSummary.findOne({ articleId: req.params.id });

    res.json({ arguments: args, summary: summary || null });
  } catch (err) {
    console.error("getDebate:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const postArgument = async (req, res) => {
  try {
    const { side, text } = req.body;

    if (!["for", "against"].includes(side)) {
      return res.status(400).json({ message: "Side must be 'for' or 'against'" });
    }
    if (!text?.trim()) {
      return res.status(400).json({ message: "Argument text is required" });
    }

    // Snapshot the author's credibility score at post time
    // so it's preserved even if their score changes later
    let credibilityScore = 0;
    try {
      const cred = await CredibilityScore.findOne({ userId: req.user._id });
      credibilityScore = cred?.data?.total ?? 0;
    } catch { /* non-blocking — default to 0 */ }

    const arg = await DebateArgument.create({
      articleId:       req.params.id,
      authorId:        req.user._id,
      side,
      text:            text.trim(),
      credibilityScore,
      upvotes:         [],
      downvotes:       [],
    });

    await arg.populate("authorId", "name profilePhoto _id");
    res.status(201).json(arg);
  } catch (err) {
    console.error("postArgument:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /articles/:id/debate/:argId/vote
// Upvote or downvote an argument
// Body: { vote: "up" | "down" }
// ─────────────────────────────────────────────────────────────────
export const voteArgument = async (req, res) => {
  try {
    const { vote } = req.body;
    const userId   = req.user._id.toString();

    if (!["up", "down"].includes(vote)) {
      return res.status(400).json({ message: "Vote must be 'up' or 'down'" });
    }

    const arg = await DebateArgument.findById(req.params.argId);
    if (!arg) return res.status(404).json({ message: "Argument not found" });

    if (arg.authorId.toString() === userId) {
      return res.status(400).json({ message: "Cannot vote on your own argument" });
    }

    // Toggle — remove existing vote first, then apply new one
    arg.upvotes   = arg.upvotes.filter((id) => id.toString() !== userId);
    arg.downvotes = arg.downvotes.filter((id) => id.toString() !== userId);

    if (vote === "up")   arg.upvotes.push(userId);
    if (vote === "down") arg.downvotes.push(userId);

    await arg.save();
    res.json({ upvotes: arg.upvotes.length, downvotes: arg.downvotes.length });
  } catch (err) {
    console.error("voteArgument:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const summarize = async (req, res) => {
  try {
    const args = await DebateArgument.find({ articleId: req.params.id })
      .sort({ upvotes: -1 })
      .limit(20);

    const forTop = args
      .filter((a) => a.side === "for")
      .slice(0, 5)
      .map((a) => a.text)
      .join("\n");

    const againstTop = args
      .filter((a) => a.side === "against")
      .slice(0, 5)
      .map((a) => a.text)
      .join("\n");

    if (!forTop && !againstTop) {
      return res.status(400).json({ message: "Not enough arguments to summarize" });
    }

    const prompt = `
You are an impartial debate referee. Below are the top arguments from a debate.

FOR arguments:
${forTop || "(none yet)"}

AGAINST arguments:
${againstTop || "(none yet)"}

Write a 2-sentence neutral summary of the strongest FOR arguments.
Then write a 2-sentence neutral summary of the strongest AGAINST arguments.
Format your response as JSON: { "for": "...", "against": "..." }
Do not take sides. Be concise and factual.
    `.trim();

    const aiRes = await groq.chat.completions.create({
      model:           "llama-3.3-70b-versatile",
      max_tokens:      300,
      temperature:     0.3,
      messages: [
        {
          role:    "system",
          content: "You are an impartial debate referee. Always respond with valid JSON only. No markdown, no preamble.",
        },
        {
          role:    "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    let summary = { for: "", against: "", updatedAt: new Date() };
    try {
      const text   = aiRes.choices[0]?.message?.content || "";
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      summary      = { ...parsed, updatedAt: new Date() };
    } catch {
      summary = {
        for:       "Could not parse summary.",
        against:   "Could not parse summary.",
        updatedAt: new Date(),
      };
    }

    await DebateSummary.findOneAndUpdate(
      { articleId: req.params.id },
      { articleId: req.params.id, ...summary },
      { upsert: true, new: true }
    );

    res.json(summary);
  } catch (err) {
    console.error("summarize:", err);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};