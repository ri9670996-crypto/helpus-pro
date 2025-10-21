import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Simple connection without deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/helpus-pro');
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // In development, continue without database
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without database connection in development mode');
      return null;
    } else {
      process.exit(1);
    }
  }
};

export { connectDB };