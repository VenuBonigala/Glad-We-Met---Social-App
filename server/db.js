import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Get the MongoDB connection string from environment variables
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('MONGO_URI is not defined in your .env file.');
      process.exit(1); // Exit the process with an error
    }

    // Attempt to connect to the database
    await mongoose.connect(mongoURI);

    // Note: We don't log "MongoDB connected" here.
    // We listen for the 'open' event in index.js to confirm.

  } catch (err) {
    // Log any connection errors
    console.error('Database connection failed:', err.message);
    // Exit the process with a failure code
    process.exit(1);
  }
};

export default connectDB;