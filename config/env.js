import { config } from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV !== "production") {
  config({ path: `.env.${NODE_ENV}.local` });
}

export const MONGODB_URI = process.env.MONGODB_URI;
export const PORT = process.env.PORT || 3000;
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
export const NODE_ENV_EXPORT = NODE_ENV;

// Sanity check
console.log("Env check:", {
  NODE_ENV,
  PORT: !!PORT,
  MONGODB_URI: !!MONGODB_URI,
});