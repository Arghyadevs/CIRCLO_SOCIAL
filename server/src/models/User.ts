import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
  clerkId: string;
  username?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  links?: string[];
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDoc extends IUser, Document {}

const UserSchema = new Schema<IUserDoc>(
  {
    clerkId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    username: { 
      type: String, 
      unique: true, 
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/
    },
    name: { 
      type: String,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    avatarUrl: { type: String },
    bio: { 
      type: String,
      maxlength: 500
    },
    links: [{ 
      type: String,
      maxlength: 200
    }],
    isVerified: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
// Replace single-field text index with combined text index for better search coverage
UserSchema.index({ username: 'text', name: 'text' });

export default mongoose.model<IUserDoc>('User', UserSchema);