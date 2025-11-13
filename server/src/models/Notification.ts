import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true }, // recipient
    type: { type: String, required: true }, // e.g. 'message'
    fromId: { type: String }, // actor (sender for messages)
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
