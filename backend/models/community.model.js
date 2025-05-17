import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  interests: [String],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rules: [String]

});

export default mongoose.model('Community', communitySchema);
