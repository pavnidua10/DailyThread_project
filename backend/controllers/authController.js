import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Profile from "../models/profile.model.js";
import Article from '../models/article.model.js';


export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};



export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    // Create a profile for the new user
    await Profile.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      bio: "No bio yet",
      followers: [],
      following: []
    });

    generateToken(res, user._id);
    return res.status(201).json({ message: 'User registered', user });
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
  const users = await User.find({ name: regex }, 'name bio');
  res.json(users);
};
export const getUser= async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email bio followers following communities');
  const articles = await Article.find({ authorId: req.params.id });
  res.json({ user, articles });
};
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email bio followers following communities')
    .populate('communities', 'name'); 
  res.json(user);
};