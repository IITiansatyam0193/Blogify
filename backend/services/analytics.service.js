const { validationResult } = require("express-validator");
const Analytics = require("../models/analytics.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

// Track view (called from getPostById)
exports.trackView = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id || "anonymous";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await Analytics.findOneAndUpdate(
      {
        post: postId,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      },
      {
        $inc: { views: 1 },
        $addToSet: { uniqueVisitors: userId },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

// Blogger dashboard: all metrics
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = "30d" } = req.query; // 7d, 30d, 90d, all

    const posts = await Post.find({
      author: userId,
      status: "published",
    });

    const postIds = posts.map((p) => p._id);

    let analyticsData = [];
    if (period !== "all") {
      const days = { "7d": 7, "30d": 30, "90d": 90 }[period];
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      analyticsData = await Analytics.find({
        post: { $in: postIds },
        date: { $gte: startDate, $lte: endDate },
      }).populate("post", "title views");
    }

    // Total metrics
    const totalViews = await Post.aggregate([
      { $match: { author: userId, status: "published" } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const totalComments = await Comment.countDocuments({
      post: { $in: postIds },
      status: "approved",
    });

    res.json({
      success: true,
      data: {
        period,
        totalViews: totalViews[0]?.total || 0,
        totalPosts: posts.length,
        totalComments,
        recentAnalytics: analyticsData,
        topPosts: posts
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map((p) => ({
            id: p._id,
            title: p.title,
            views: p.views,
          })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Post-specific analytics
exports.getPostAnalytics = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("author");

    if (!post || String(post.author._id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this post's analytics",
      });
    }

    const analytics = await Analytics.find({ post: postId })
      .sort({ date: -1 })
      .limit(30);

    res.json({
      success: true,
      data: {
        post: {
          title: post.title,
          totalViews: post.views,
        },
        dailyAnalytics: analytics,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Set goals (e.g., target 1000 views)
exports.setGoal = async (req, res, next) => {
  try {
    // For now, store in user preferences or separate Goals model
    // Simplified: return success for frontend tracking
    res.json({
      success: true,
      message: "Goal set successfully",
    });
  } catch (err) {
    next(err);
  }
};
