import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  postId: mongoose.Types.ObjectId;
  authorId: string;
  text: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDoc extends IComment, Document {}

const CommentSchema = new Schema<ICommentDoc>(
  {
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Post', 
      required: true, 
      index: true 
    },
    authorId: { 
      type: String, 
      required: true,
      index: true
    },
    text: { 
      type: String, 
      required: true,
      maxlength: 2000
    },
    likeCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Compound index for efficient queries
CommentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model<ICommentDoc>('Comment', CommentSchema);