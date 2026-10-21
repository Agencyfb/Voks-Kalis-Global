import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  category: { type: String, required: true, enum: ["estates", "land", "shortlets", "commercial"] },
  purpose: { type: String, required: true, enum: ["sale", "rent", "shortlet"] },
  price: { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  propertyTitle: { type: String, trim: true, maxlength: 120, default: "" },
  propertyAddress: { type: String, trim: true, maxlength: 300, default: "" },
  rootOfTitle: { type: String, trim: true, maxlength: 500, default: "" },
  previousOwner: { type: String, trim: true, maxlength: 160, default: "" },
  ownershipType: { type: String, enum: ["", "individual", "community", "family"], default: "" },
  description: { type: String, required: true, trim: true, maxlength: 1500 },
  beds: { type: Number, default: null, min: 0 },
  baths: { type: Number, default: null, min: 0 },
  areaSqm: { type: Number, default: null, min: 0 },
  features: { type: String, trim: true, maxlength: 500, default: "" },
  landmarks: { type: String, trim: true, maxlength: 500, default: "" },
  landUse: { type: String, enum: ["", "commercial", "residential", "industrial"], default: "" },
  image: { type: String, required: true, maxlength: 2_000 },
  images: {
    type: [{
      url: { type: String, trim: true, maxlength: 2_000, default: "" },
      publicId: { type: String, trim: true, maxlength: 255, default: "" },
      data: { type: String, maxlength: 4_000_000 },
      name: { type: String, required: true, maxlength: 160 },
      type: { type: String, required: true, enum: ["image/jpeg", "image/png", "image/webp"] },
      bytes: { type: Number, min: 0, default: 0 },
    }],
    default: [],
  },
  documents: {
    type: [{
      publicId: { type: String, trim: true, maxlength: 255, default: "" },
      resourceType: { type: String, enum: ["raw", "image"], default: "raw" },
      format: { type: String, trim: true, maxlength: 20, default: "" },
      data: { type: String, maxlength: 8_000_000 },
      name: { type: String, required: true, maxlength: 160 },
      type: { type: String, required: true, enum: ["application/pdf", "image/jpeg", "image/png", "image/webp"] },
      bytes: { type: Number, min: 0, default: 0 },
    }],
    default: [],
  },
  declarationAcceptedAt: { type: Date, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedAgent: { type: String, trim: true, maxlength: 120, default: "" },
  status: { type: String, enum: ["pending", "approved", "declined", "sold"], default: "pending", index: true },
  paymentStatus: { type: String, enum: ["in-progress", "paid"], default: "in-progress" },
  soldBy: { type: String, trim: true, maxlength: 120, default: "" },
  soldAt: { type: Date, default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);

export default Property;