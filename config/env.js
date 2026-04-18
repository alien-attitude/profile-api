import { config as loadEnvFromFile } from "dotenv";

// Read existing NODE_ENV (can be set by cross-env or the host)
const NODE_ENV = process.env.NODE_ENV || "development";

// Only load from .env.*.local files when NOT in production
if (NODE_ENV !== "production") {
  // This is for local usage / dev convenience
  const envFile = `.env.${NODE_ENV}.local`;
  console.log(`Loading environment variables from ${envFile}`);
  loadEnvFromFile({ path: envFile });
} else {
  // In production, we expect the environment to be provided by the host
  console.log("Running in production; relying on host environment variables only");
}

// Now simply export from process.env (works in both cases)
export const {
  PORT,
  MONGODB_URI,
  SERVER_URL,
} = process.env;

// Optional: quick sanity log (booleans only)
console.log("Env sanity check:", {
  NODE_ENV,
  PORT: !!PORT,
  SERVER_URL: !!SERVER_URL,
  MONGODB_URI: !!MONGODB_URI,
});

export { NODE_ENV };