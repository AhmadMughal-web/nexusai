import mongoose from 'mongoose';

const msgSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, default: 'New Search', maxlength: 100 },
  messages:  [msgSchema],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);
