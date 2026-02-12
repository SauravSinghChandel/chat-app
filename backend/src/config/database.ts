import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error: ", error);
        process.exit(1);
        // Status code 1: failure
        // Status code 0: pass
    }
}
