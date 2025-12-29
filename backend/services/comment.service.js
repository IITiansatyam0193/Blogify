const { validationResult } = require("express-validator");
const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

// Add comment – required fields check (Story 4). [file:1]
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { postId, content, parentCommentId } = req.body;
    const post = await Post.findById(postId);
    
    if (!post || post.status !== "published") {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user.id,
      content: content.trim(),
      parentComment: parentCommentId || null,
      isDeleted: false,  // Always visible initially
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment.populate('author', 'name'),
    });
  } catch (err) {
    next(err);
  }
};

// Get ALL comments (no status filter)
exports.getCommentsForPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({
      post: postId,
      isDeleted: false,  // Only hide deleted ones
    })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

// Delete comment (blog author only)
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate('post');
    
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Blog author OR comment author can delete
    if (String(comment.post.author) !== req.user.id && String(comment.author._id) !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Upvote / downvote – cannot vote own comment. [file:1]
exports.voteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // "up" | "down"

    if (!["up", "down"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be 'up' or 'down'",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (String(comment.author) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot upvote or downvote your own comment",
      }); // Story 4 negative. [file:1]
    }

    const userId = req.user.id;

    comment.upvotes = comment.upvotes.filter(
      (uid) => String(uid) !== userId
    );
    comment.downvotes = comment.downvotes.filter(
      (uid) => String(uid) !== userId
    );

    if (type === "up") {
      comment.upvotes.push(userId);
    } else {
      comment.downvotes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: "Vote recorded",
      data: {
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Report inappropriate comment. [file:1]
exports.reportComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    comment.reports.push({
      user: req.user.id,
      reason: reason || "",
    });

    await comment.save();

    res.json({
      success: true,
      message: "Comment reported successfully",
    });
  } catch (err) {
    next(err);
  }
};
