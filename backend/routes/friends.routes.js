const express = require("express");
const { body } = require("express-validator");
const {
  getUserProfile,
  getPublicBlogsOfUser,
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getPendingRequests,
} = require("../services/friend.service");
const { authenticate } = require("../middlewares/auth.middleware");
const {authenticateOptional} = require("../middlewares/authOptional.middleware")

const router = express.Router();

// Public profile & public blogs (login optional)
router.get("/user/:userId/profile", authenticateOptional, getUserProfile);
router.get("/user/:userId/blogs", getPublicBlogsOfUser);

// Below require login
router.use(authenticate);

// send friend request
router.post(
  "/request",
  [body("toUserId").notEmpty().withMessage("toUserId is required")],
  sendFriendRequest
);

// accept / reject
router.post(
  "/request/:action",
  [body("fromUserId").notEmpty().withMessage("fromUserId is required")],
  respondToFriendRequest
);

// friends list
router.get("/list", getFriends);

// pending requests
router.get("/requests", getPendingRequests);

// remove friend
router.delete("/remove/:friendId", removeFriend);

module.exports = router;
