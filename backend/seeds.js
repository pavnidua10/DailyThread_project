
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from './models/community.model.js'; 

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function seedCommunities() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Community.deleteMany({});

    const communities = [
      {
        name: 'Tech Enthusiasts',
        description: 'A place for tech lovers to share and discuss the latest in technology.',
        interests: ['technology', 'gadgets', 'programming'],
        moderators: ['68272b94c1d33c68e9fe7a77'], 
        members: ['68272b94c1d33c68e9fe7a77','6820a61db46d0fa4dd21c89f'],
        rules: ['Be respectful', 'No spam', 'Stay on topic'],
      },
      {
        name: 'Pakistan vs India Tension',
        description: 'Discuss the ongoing issues and developments between Pakistan and India.',
        interests: ['politics', 'international relations', 'south asia'],
        moderators: ['6820a61db46d0fa4dd21c89f'],
        members: ['6820a61db46d0fa4dd21c89f','68272b94c1d33c68e9fe7a77'],
        rules: ['No hate speech', 'Respect all opinions', 'No misinformation'],
      },
      {
        name: 'Climate Change',
        description: 'Community focused on climate change awareness, science, and activism.',
        interests: ['environment', 'climate', 'sustainability'],
        moderators: ['681887ab7c7d18fbfe3147c7'],
        members: ['681887ab7c7d18fbfe3147c7'],
        rules: ['Share verified info', 'Be constructive', 'No spam'],
      },
    ];

    const created = await Community.insertMany(communities);
    console.log('Communities created:', created.map(c => c.name));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding communities:', error);
    process.exit(1);
  }
}

seedCommunities();
