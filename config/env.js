import { config } from "dotenv";

// Default to "development" if NODE_ENV is not set
const nodeEnv = process.env.NODE_ENV || "development";

// Load .env.<NODE_ENV>.local (e.g., .env.development.local or .env.production.local)
config({ path: `.env.${nodeEnv}.local` });

export const { PORT, DB_URI, NODE_ENV, SERVER_URL } = process.env;