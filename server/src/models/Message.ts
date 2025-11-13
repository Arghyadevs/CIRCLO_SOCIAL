import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    fromId: { type: String, required: true },
    toId: { type: String, required: true, index: true },
    text: { type: String },
    mediaUrl: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
