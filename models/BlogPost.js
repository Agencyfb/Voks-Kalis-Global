import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 140,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    unique: true,
  },
  sourceSlug: {
    type: String,
    trim: true,
    maxlength: 140,
    unique: true,
    sparse: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  eyebrow: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180,
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 400,
  },
  image: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2_000,
  },
  imageAlt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180,
  },
  imagePublicId: {
    type: String,
    trim: true,
    maxlength: 255,
    default: "",
  },
  readTime: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
    validate: Number.isInteger,
  },
  published: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: "Voks Journal",
  },
  contentHtml: {
    type: String,
    required: true,
    maxlength: 80_000,
  },
  status: {
    type: String,
    required: true,
    enum: ["draft", "published"],
    default: "draft",
    index: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

blogPostSchema.index({ status: 1, isDeleted: 1, featured: -1, publishedAt: -1 });

const BlogPost = mongoose.models.BlogPost
  || mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
