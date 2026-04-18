import mongoose from 'mongoose';

// In-memory fallback
export const memDB = { users: new Map(), chats: new Map(), tokens: new Map() };
export let mongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('⚡ No MONGO_URI — using in-memory DB (data resets on restart)');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    mongoConnected = true;
    console.log('✅ MongoDB connected');
    mongoose.connection.on('disconnected', () => { mongoConnected = false; });
    mongoose.connection.on('reconnected', () => { mongoConnected = true; });
  } catch (err) {
    console.warn(`⚠️  MongoDB failed (${err.message}) — using in-memory DB`);
  }
}
