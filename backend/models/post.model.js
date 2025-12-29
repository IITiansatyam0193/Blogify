const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    content: { type: String, required: [true, "Content is required"] },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },

    coverImageUrl: String,
    media: [
      {
        filename: {
          type: String, // "2025-12-28T10-00-00-000Z-image.jpg"
          required: true,
        },
        path: {
          type: String, // "/uploads/2025-12-28T10-00-00-000Z-image.jpg"
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        size: {
          type: Number, // bytes
          required: true,
        },
      },
    ],
    views: { type: Number, default: 0 },
    themeId: { type: Schema.Types.ObjectId, ref: "Theme" },
    popularityScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.methods.isPublishable = function () {
  return Boolean(this.title && this.content);
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
