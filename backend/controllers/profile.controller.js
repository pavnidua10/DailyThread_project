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
    let profile = await Profile.findOne({ userId });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ✅ AUTO CREATE PROFILE IF NOT EXISTS
    if (!profile) {
      profile = await Profile.create({
        userId,
        name: user.name,
        bio: '',
        email: user.email,
        followers: [],
        following: [],
      });
    }

    return res.status(200).json({
      ...profile.toObject(),
      email: user.email,
      profilePhoto: user.profilePhoto || '',
      followers: user.followers || [],
      following: user.following || [],
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "name email profilePhoto followers following"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = await Profile.findOne({ userId });

    return res.status(200).json({
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      bio: profile?.bio || "",
      followers: user.followers || [],
      following: user.following || [],
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
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



export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const users = await User.find({
      _id: { $ne: currentUserId }, 
    })
      .select("name email username") 
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suggested users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name email isReporter profilePhoto bio"
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: req.file.path },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture updated",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};