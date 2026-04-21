import mongoose from 'mongoose';

// In-memory store — MongoDB na ho to yeh use hoga
export const inMemoryDB = {
  users: new Map(),
  chats: new Map(),
  tokens: new Map(),
};

export let isMongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('⚡ No MONGO_URI — using in-memory DB');
    console.log('   Data resets on server restart\n');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isMongoConnected = true;
    console.log('✅ MongoDB connected!\n');

    mongoose.connection.on('disconnected', () => {
      isMongoConnected = false;
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isMongoConnected = true;
      console.log('✅ MongoDB reconnected');
    });

  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️  MongoDB failed: ${err.message}`);
    console.warn('   Using in-memory DB instead\n');
  }
}
