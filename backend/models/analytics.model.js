// models/Analytics.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const analyticsSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Daily aggregation index
analyticsSchema.index({ post: 1, date: 1 }, { unique: true });

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;
