const express = require("express");
const { body } = require("express-validator");
const {addComment, getCommentsForPost, updateComment, deleteComment, voteComment, reportComment} = require("../services/comment.service");
const {authenticate} = require("../middlewares/auth.middleware");

const router = express.Router();

// Add comment (reader/blogger) – Story 4. [file:1]
router.post(
  "/",
  authenticate,
  [
    body("postId").notEmpty().withMessage("postId is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  addComment
);

// Get approved comments for a post – public.
router.get("/post/:postId", getCommentsForPost);

// Update comment
router.put(
  "/:id",
  authenticate,
  [body("content").trim().notEmpty().withMessage("Content is required")],
  updateComment
);

// Delete comment – blogger/admin.
router.delete(
  "/:id",
  authenticate,
  deleteComment
);

// Upvote / downvote comment – any logged-in user.
router.post(
  "/:id/vote",
  authenticate,
  [body("type").notEmpty().withMessage("type is required")],
  voteComment
);

// Report comment – any logged-in user.
router.post(
  "/:id/report",
  authenticate,
  reportComment
);

module.exports = router;
