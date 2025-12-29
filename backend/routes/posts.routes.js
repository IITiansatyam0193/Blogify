const express = require("express");
const { body, query } = require("express-validator");
const {createPost, updatePost, getPosts, getPostById, searchPosts} = require("../services/post.service");
const {authenticate} = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const router = express.Router();

// Create post (blogger/admin only) – Story 1. [file:1]
router.post(
  "/",
  authenticate,
  uploadMiddleware.array("media", 10),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("status")
      .optional()
      .isIn(["draft", "published", "scheduled"])
      .withMessage("Invalid status"),
    body("scheduledAt")
      .optional()
      .isISO8601()
      .withMessage("scheduledAt must be a valid date"),
    body("visibility")
      .optional()
      .isIn(["public", "friends", "private"])
      .withMessage("Visibility must be 'public', 'friends', or 'private'"),
  ],
  createPost
);

// Update post – controlled by ownership.
router.put(
  "/:id",
  authenticate,
  uploadMiddleware.array("media", 10),
  [
    body("status")
      .optional()
      .isIn(["draft", "published", "scheduled"])
      .withMessage("Invalid status"),
    body("scheduledAt")
      .optional()
      .isISO8601()
      .withMessage("scheduledAt must be a valid date"),
    body("visibility")
      .optional()
      .isIn(["public", "friends", "private"])
      .withMessage("Visibility must be 'public', 'friends', or 'private'"),
  ],
  updatePost
);

// Public list of published posts.
router.get("/", getPosts);

router.get(
  "/search",
  [
    query("fromDate")
      .optional()
      .isISO8601()
      .withMessage("fromDate must be a valid date"),
    query("toDate")
      .optional()
      .isISO8601()
      .withMessage("toDate must be a valid date"),
    query("sortBy")
      .optional()
      .isIn(["date", "popularity"])
      .withMessage("sortBy must be 'date' or 'popularity'"),
  ],
  searchPosts
);

// Public single post (increments views, useful for analytics later). [file:1]
router.get("/:id", getPostById);

module.exports = router;
