import Profile from '../models/profile.model.js';
import User from '../models/user.js'; 

export const createProfile = async (req, res) => {
 
  const userId = req.user._id;
  const { name,email, bio } = req.body;

  try {
    const existing = await Profile.findOne({ userId });
    if (existing) return res.status(400).json({ error: 'Profile already exists' });

    const profile = await Profile.create({
      userId,
      name,
      bio,
      email,
      followers: [],
      following:[],
    });

    return res.status(201).json(profile);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  const userId = req.user._id;

  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
      ...profile.toObject(),
      email: user.email, 
       followers: user.followers || [],
      following: user.following || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const followReporter = async (req, res) => {
    const userId = req.user._id;
  const { reporterId } = req.params;

  try {
    const reporterProfile = await Profile.findOne({ userId: reporterId });

    if (!reporterProfile || !reporterProfile.isReporter) {
      return res.status(400).json({ error: 'User is not a reporter' });
    }

    if (reporterProfile.followers.includes(userId)) {
      return res.status(400).json({ error: 'Already following this reporter' });
    }

    reporterProfile.followers.push(userId);
    await reporterProfile.save();

    return res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


export const getProfile= async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      isReporter: user.isReporter,
     
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { name, bio} = req.body;

  try {
   
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

  
    profile.name = name || profile.name; 
    profile.bio = bio || profile.bio;
    await profile.save();

    return res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


