import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('Missing MONGO_URI environment variable');
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
};

export default connectDB;