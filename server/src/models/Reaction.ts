import mongoose, { Schema } from 'mongoose';

const ReactionSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['love', 'laugh', 'angry', 'smile'], required: true },
  },
  { timestamps: true }
);
ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Reaction', ReactionSchema);
