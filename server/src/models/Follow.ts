import mongoose, { Schema } from 'mongoose';

const FollowSchema = new Schema(
  {
    followerId: { type: String, required: true, index: true },
    followeeId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

export default mongoose.model('Follow', FollowSchema);
