const mongoose = require("mongoose");

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      unique: true, // prevent duplicates - Story 2. [file:1]
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
