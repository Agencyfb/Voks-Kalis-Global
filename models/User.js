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
    city: { type: String, trim: true, maxlength: 100, default: "" },
    country: { type: String, trim: true, maxlength: 100, default: "" },
    agency: { type: String, trim: true, maxlength: 160, default: "" },
    registrationNumber: { type: String, trim: true, maxlength: 100, default: "" },
    specialty: { type: String, trim: true, maxlength: 120, default: "" },
    yearsExperience: { type: String, trim: true, maxlength: 40, default: "" },
    serviceAreas: { type: String, trim: true, maxlength: 300, default: "" },
    bio: { type: String, trim: true, maxlength: 1000, default: "" },
    profilePhoto: { type: String, maxlength: 2_000, default: "" },
    profilePhotoPublicId: { type: String, maxlength: 255, default: "" },
    showPhone: { type: Boolean, default: true },
    emailInquiries: { type: Boolean, default: true },
    jobTitle: { type: String, trim: true, maxlength: 120, default: "" },
    department: { type: String, trim: true, maxlength: 120, default: "" },
    submissionNotifications: { type: Boolean, default: true },
    salesNotifications: { type: Boolean, default: true },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    propertyPurpose: { type: String, trim: true, maxlength: 40, default: "Buy a home" },
    preferredPropertyType: { type: String, trim: true, maxlength: 60, default: "Residential" },
    preferredCategory: { type: String, trim: true, maxlength: 60, default: "House" },
    preferredLocation: { type: String, trim: true, maxlength: 160, default: "" },
    minimumBudget: { type: Number, min: 0, default: null },
    maximumBudget: { type: Number, min: 0, default: null },
    preferredBedrooms: { type: String, trim: true, maxlength: 40, default: "Any" },
    buyingTimeline: { type: String, trim: true, maxlength: 60, default: "Within 6 months" },
    mustHaveAmenities: [{ type: String, trim: true, maxlength: 80 }],
    preferenceEmailNotifications: { type: Boolean, default: true },
    passwordHash: {
        type: String,
        required: true
    },
    passwordSalt: {
        type: String,
        required: true
    },
    loginFailedAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    loginLockUntil: {
        type: Date,
        default: null
    },
    role:{
        type: String,
        default: "buyer",
        enum: ["buyer", "admin", "agent", "landlord"]
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;