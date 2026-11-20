import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  detail: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180,
  },
  quote: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1_000,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: Number.isInteger,
  },
  instagramUrl: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2_000,
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

testimonialSchema.index({ createdAt: -1, _id: -1 });

const Testimonial = mongoose.models.Testimonial
  || mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
