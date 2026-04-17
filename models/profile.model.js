import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        gender: {
            type: String,
            required: true,
        },
        gender_probability: {
            type: Number,
            required: true,
        },
        sample_size: {
            type: Number,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        age_group: {
            type: String,
            required: true,
            enum: ["child", "teenager", "adult", "senior"],
        },
        country_id: {
            type: String,
            required: true,
        },
        country_probability: {
            type: Number,
            required: true,
        },
        created_at: {
            type: Date,
            required: true,
        },
    },
    {
        // Disable the default _id and __v in output — we manage our own id field
        versionKey: false,
    }
);

// Transform output to use our custom id field, not MongoDB's _id
profileSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    },
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;