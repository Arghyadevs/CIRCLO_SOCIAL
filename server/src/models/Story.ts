import mongoose, { Schema, Document } from 'mongoose';

export interface IStory {
  authorId: string;
  url: string; // absolute or relative URL
  type: 'image' | 'video';
  text?: string;
  createdAt?: Date;
}

export interface IStoryDoc extends IStory, Document {}

const StorySchema = new Schema<IStoryDoc>(
  {
    authorId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    text: { type: String },
  },
  {
    // Allow Mongoose to manage timestamps (createdAt, updatedAt)
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL index to auto-expire documents after 24 hours
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
StorySchema.index({ createdAt: -1 });

export default mongoose.model<IStoryDoc>('Story', StorySchema);
