import { config } from "dotenv";

// Default to "development" if NODE_ENV is not set
const nodeEnv = process.env.NODE_ENV || "development";

// Load .env.<NODE_ENV>.local (e.g., .env.development.local or .env.production.local)
config({ path: `.env.${nodeEnv}.local` });

export const { PORT, DB_URI, NODE_ENV, SERVER_URL } = process.env;

console.log("Env sanity check:", {
  NODE_ENV,
  PORT: !!process.env.PORT,
  SERVER_URL: !!process.env.SERVER_URL,
  DB_URI: !!process.env.DB_URI,
  // add any others you rely on, as booleans
});