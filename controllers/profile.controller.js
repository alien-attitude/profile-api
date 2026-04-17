import {v7 as uuidv7} from 'uuid';
import Profile from '../models/profile.model.js';
import fetchProfileData from "../services/externalApis.service.js";

/**
 * POST /api/profiles
 * Create a new profile by name, calling external APIs
 */
export async function createProfile(req, res){
    try {
        const { name } = req.body;

        // Validate: name must be present and a non-empty string
        if (name === undefined || name === null) {
            return res.status(400).json({
                status: "error",
                message: "name is required",
            });
        }

        if (typeof name !== "string") {
            return res.status(422).json({
                status: "error",
                message: "name must be a string",
            });
        }

        const trimmedName = name.trim().toLowerCase();

        if (trimmedName === "") {
            return res.status(400).json({
                status: "error",
                message: "name cannot be empty",
            });
        }

        // Check if profile already exists (case-insensitive via stored lowercase)
        const existing = await Profile.findOne({ name: trimmedName });
        if (existing) {
            return res.status(200).json({
                status: "success",
                message: "Profile already exists",
                data: existing.toJSON(),
            });
        }

        // Fetch data from all three external APIs in parallel
        const profileData = await fetchProfileData(trimmedName);

        // Build and save the new profile
        const profile = new Profile({
            id: uuidv7(),
            name: trimmedName,
            ...profileData,
            created_at: new Date(),
        });

        await profile.save();

        return res.status(201).json({
            status: "success",
            data: profile.toJSON(),
        });
    } catch (error) {
        // External API failures
        if (error.statusCode === 502) {
            return res.status(502).json({
                status: "error",
                message: error.message,
            });
        }

        console.error("createProfile error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

/**
 * GET /api/profiles/:id
 * Get a single profile by its UUID
 */
export async function getProfileById (req, res){
    try {
        const { id } = req.params;

        const profile = await Profile.findOne({ id });
        if (!profile) {
            return res.status(404).json({
                status: "error",
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            status: "success",
            data: profile.toJSON(),
        });
    } catch (error) {
        console.error("getProfileById error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

/**
 * GET /api/profiles
 * Get all profiles with optional filters: gender, country_id, age_group
 */
export async function getAllProfiles (req, res) {
    try {
        const { gender, country_id, age_group } = req.query;

        // Build a case-insensitive filter object
        const filter = {};

        if (gender) {
            filter.gender = { $regex: new RegExp(`^${gender}$`, "i") };
        }
        if (country_id) {
            filter.country_id = { $regex: new RegExp(`^${country_id}$`, "i") };
        }
        if (age_group) {
            filter.age_group = { $regex: new RegExp(`^${age_group}$`, "i") };
        }

        const profiles = await Profile.find(filter, {
            _id: 0,
            id: 1,
            name: 1,
            gender: 1,
            age: 1,
            age_group: 1,
            country_id: 1,
        });

        return res.status(200).json({
            status: "success",
            count: profiles.length,
            data: profiles.map((p) => p.toJSON()),
        });
    } catch (error) {
        console.error("getAllProfiles error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

/**
 * DELETE /api/profiles/:id
 * Delete a profile by its UUID — returns 204 No Content
 */
export async function deleteProfile (req, res) {
    try {
        const { id } = req.params;

        const result = await Profile.findOneAndDelete({ id });
        if (!result) {
            return res.status(404).json({
                status: "error",
                message: "Profile not found",
            });
        }

        res.json({
            status: "success",
            message: "Profile deleted",
        });
    } catch (error) {
        console.error("deleteProfile error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

