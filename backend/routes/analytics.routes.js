const express = require("express");
const { body, param } = require("express-validator");
const {trackView, getDashboardMetrics, getPostAnalytics, setGoal} = require("../services/analytics.service");
const {authenticate} = require("../middlewares/auth.middleware");

const router = express.Router();

// Track view - called automatically from post views
router.post(
  "/track/:postId",
  authenticate, // optional auth for unique visitor tracking
  [param("postId").notEmpty()],
  trackView
);

// Blogger dashboard metrics - Story 7 Must Have. [file:1]
router.get(
  "/dashboard",
  authenticate,
  getDashboardMetrics
);

// Individual post analytics
router.get(
  "/post/:postId",
  authenticate,
  [param("postId").notEmpty()],
  getPostAnalytics
);

// Set goals
router.post(
  "/goals",
  authenticate,
  setGoal
);

module.exports = router;
