import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    passwordSalt: {
        type: String,
        required: true
    },
    role:{
        type: String,
        default: "buyer",
        enum: ["buyer", "admin", "agent", "landlord"]
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;