import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["clients", "projects"],
    index: true,
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 180,
    default: "",
  },
  imageUrl: {
    type: String,
    required: true,
    maxlength: 2_000,
  },
  publicId: {
    type: String,
    required: true,
    maxlength: 255,
    unique: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

galleryItemSchema.index({ category: 1, createdAt: -1, _id: -1 });

const GalleryItem = mongoose.models.GalleryItem
  || mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
