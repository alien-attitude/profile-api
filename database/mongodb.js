import mongoose from "mongoose";
import { MONGODB_URI, NODE_ENV } from "../config/env.js";

export default async function connectToDatabase() {
  console.log("Connecting to MongoDB...");
  console.log("NODE_ENV:", NODE_ENV);
  console.log("MONGODB_URI present:", !!MONGODB_URI); // don't log the full URI in real logs

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Check your environment variables.");
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      // optional: set explicit options if needed
      // serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connection state:", mongoose.connection.readyState); // 1 = connected
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}