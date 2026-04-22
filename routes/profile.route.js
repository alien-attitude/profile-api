import express from "express";
const profileRoute = express.Router();
import {createProfile, getAllProfiles, getProfileById, deleteProfile, searchProfiles} from "../controllers/profile.controller.js";

// POST /api/profiles — create a new profile
profileRoute.post("/", createProfile)

// GET /api/profiles — list all profiles (with optional filters)
profileRoute.get("/", getAllProfiles)

// GET /api/profiles/search - natural language entry
profileRoute.get("/search", searchProfiles)

// GET /api/profiles/:id — get a single profile by UUID
profileRoute.get("/:id", getProfileById)

// DELETE /api/profiles/:id    — delete a profile by UUID
profileRoute.delete("/:id", deleteProfile)

export default profileRoute;