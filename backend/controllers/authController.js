import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Profile from "../models/profile.model.js";
import Article from '../models/article.model.js';
import DebateArgument from '../models/DebateArgument.js'
import CredibilityScore from '../models/CredibilityScore.js';
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};



export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await Profile.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      bio: "No bio yet",
      followers: [],
      following: [],
    });

    generateToken(res, user._id);

    return res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateToken(res, user._id);
    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};
export const followUser = async (req, res) => {
  const { userId } = req.body;
  const currentUser = req.user._id;
  await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUser } });
  await User.findByIdAndUpdate(currentUser, { $addToSet: { following: userId } });
  res.json({ message: 'Followed user' });
};

export const unfollowUser = async (req, res) => {
  const { userId } = req.body;
  const currentUser = req.user._id;
  await User.findByIdAndUpdate(userId, { $pull: { followers: currentUser } });
  await User.findByIdAndUpdate(currentUser, { $pull: { following: userId } });
  res.json({ message: 'Unfollowed user' });
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const regex = new RegExp(query, 'i');
  const users = await User.find({ name: regex }, 'name email bio followers following communities profilePhoto');
  res.json(users);
};
export const getUser= async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email bio followers following communities profilePhoto');
  const articles = await Article.find({ authorId: req.params.id });
  res.json({ user, articles });
};
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email bio followers following communities profilePhoto')
    .populate('communities', 'name'); 
    const articles = await Article.find({ authorId: req.params.id });
  res.json({ user, articles });
};

export const getCredibility = async (req, res) => {
  try {
    const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cached = await CredibilityScore.findOne({ 
      userId, 
      updatedAt: { $gt: new Date(Date.now() - 86400000) } 
    });
    if (cached) return res.json(cached.data);

    const [user, articles, debateArgs] = await Promise.all([
      User.findById(userId),
      Article.find({ authorId: userId }),
      DebateArgument.find({ "authorId._id": userId }),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const articlesPublished = articles.length;
    const totalUpvotes = articles.reduce((s, a) => s + (a.upvotes?.length || 0), 0);
    const avgRating = articles.length
      ? articles.reduce((s, a) => s + (a.rating || 0), 0) / articles.length
      : 0;
    const flaggedCount = user.moderationFlags || 0;
    const daysAsMember = Math.max(1, (Date.now() - user.createdAt) / 86400000);
    const netDebateVotes = debateArgs.reduce(
      (s, a) => s + (a.upvotes?.length || 0) - (a.downvotes?.length || 0), 0
    );

    const breakdown = {
      articleQuality:   Math.round(Math.min(30, (avgRating / 5) * 30)),
      sourceAccuracy:   Math.round(Math.min(25, (articles.filter(a => a.source).length / Math.max(1, articlesPublished)) * 25)),
      communityTrust:   Math.round(Math.min(20, totalUpvotes / 10)),
      consistencyBonus: Math.round(Math.max(0, Math.min(15, (articlesPublished / (daysAsMember / 7)) * 3) - flaggedCount * 5)),
      debateScore:      Math.round(Math.min(10, Math.max(0, netDebateVotes / 5))),
    };

    const total = Math.min(100, Math.max(0, Object.values(breakdown).reduce((s, v) => s + v, 0)));

    const scoreData = {
      total, breakdown, articlesPublished,
      flaggedCount, endorsedBy: totalUpvotes,
      joinedDaysAgo: Math.round(daysAsMember),
    };

    await CredibilityScore.findOneAndUpdate(
      { userId },
      { userId, data: scoreData, updatedAt: new Date() },
      { upsert: true }
    );

    res.json(scoreData);
  } catch (err) {
    console.error("getCredibility error:", err);
    res.status(500).json({ message: "Failed to compute credibility score" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: imageUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profilePhoto: user.profilePhoto,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: "" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile photo removed successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};