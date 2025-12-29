const mongoose = require("mongoose");

const { Schema } = mongoose;

const themeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Theme name is required"],
      trim: true,
    },
    baseTheme: {
      type: String,
      enum: ["light", "dark", "blue", "green", "purple"], // customizable themes. [file:1]
      default: "light",
    },
    colors: {
      primary: {
        type: String,
        default: "#1976d2",
      },
      secondary: {
        type: String,
        default: "#dc004e",
      },
      background: {
        type: String,
        default: "#ffffff",
      },
      surface: {
        type: String,
        default: "#f5f5f5",
      },
    },
    fonts: {
      heading: {
        type: String,
        default: "Roboto",
      },
      body: {
        type: String,
        default: "Roboto",
      },
    },
    logoUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    }, // only one active theme per blogger
  },
  { timestamps: true }
);

const Theme = mongoose.model("Theme", themeSchema);

module.exports = Theme;
