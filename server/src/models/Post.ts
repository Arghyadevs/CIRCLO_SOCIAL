import mongoose, { Schema, Document } from 'mongoose';

export interface IPost {
  authorId: string;
  text: string;
  media: { url: string; type: 'image' | 'video' }[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  visibility: 'public' | 'followers' | 'private';
  hashtags: string[];
  mentions: string[];
  sharedFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDoc extends IPost, Document {}

const PostSchema = new Schema<IPostDoc>(
  {
    authorId: { 
      type: String, 
      required: true, 
      index: true 
    },
    text: { 
      type: String, 
      default: '',
      maxlength: 5000 
    },
    media: [
      {
        url: { type: String, required: true },
        type: { 
          type: String, 
          enum: ['image', 'video'], 
          default: 'image' 
        },
      },
    ],
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0, min: 0 },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    hashtags: [{ type: String, lowercase: true }],
    mentions: [{ type: String }],
    sharedFrom: { type: String }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
PostSchema.index({ createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ text: 'text' }); // Text search index
// Compound index for hashtag + recency queries
PostSchema.index({ hashtags: 1, createdAt: -1 });

export default mongoose.model<IPostDoc>('Post', PostSchema);