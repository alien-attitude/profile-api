import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

export default async function connectToDatabase() {
  console.log("Connecting to MongoDB...");
  console.log("NODE_ENV:", NODE_ENV);
  console.log("DB_URI present:", !!DB_URI); // don't log the full URI in real logs

  if (!DB_URI) {
    throw new Error("DB_URI is not defined. Check your environment variables.");
  }

  try {
    await mongoose.connect(DB_URI, {
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