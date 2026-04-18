
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/user.js";
import Community from "./models/community.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear old data
    await User.deleteMany({});
    await Community.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create Users
    const users = await User.insertMany([
      {
        name: "Ali Khan",
        email: "ali@example.com",
        password: hashedPassword,
      },
      {
        name: "Sara Ahmed",
        email: "sara@example.com",
        password: hashedPassword,
      },
      {
        name: "John Smith",
        email: "john@example.com",
        password: hashedPassword,
      },
    ]);

    console.log("Users created");

    const [user1, user2, user3] = users;

    // Create Communities
    await Community.insertMany([
      {
        name: "Tech Enthusiasts",
        description:
          "A place for tech lovers to share and discuss the latest in technology.",
        interests: ["technology", "gadgets", "programming"],
        owner: user1._id,
        moderators: [user1._id],
        members: [user1._id, user2._id],
        rules: ["Be respectful", "No spam", "Stay on topic"],
      },
      {
        name: "Pakistan vs India Tension",
        description:
          "Discuss the ongoing issues and developments between Pakistan and India.",
        interests: ["politics", "international relations"],
        owner: user2._id,
        moderators: [user2._id],
        members: [user2._id, user1._id],
        rules: ["No hate speech", "Respect all opinions"],
      },
      {
        name: "Climate Change",
        description:
          "Community focused on climate change awareness and activism.",
        interests: ["environment", "climate"],
        owner: user3._id,
        moderators: [user3._id],
        members: [user3._id],
        rules: ["Share verified info", "Be constructive"],
      },
    ]);

    console.log("Communities created");

    await mongoose.disconnect();
    console.log("Seeding completed");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();