const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const Post = require("../models/post.model");

// View public profile (+ public blogs)
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user ? req.user.id : null;

    const user = await User.findById(userId).select("name email friends");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isFriend =
      viewerId &&
      user.friends.some((fid) => String(fid) === String(viewerId));

    // public posts always visible, friends-only only if friends
    const visibilityFilter = ["public"];
    if (isFriend) visibilityFilter.push("friends");

    const posts = await Post.find({
      author: userId,
      status: "published",
      visibility: { $in: visibilityFilter },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        profile: {
          id: user._id,
          name: user.name,
          // email optional to expose
        },
        isFriend,
        publicPosts: posts, // includes friend-only if isFriend
      },
    });
  } catch (err) {
    next(err);
  }
};

// Explore all public blogs of user (no auth needed)
exports.getPublicBlogsOfUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      author: userId,
      status: "published",
      visibility: "public",
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

// Send friend request
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const fromId = req.user.id;
    const { toUserId } = req.body;

    if (fromId === toUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    const [fromUser, toUser] = await Promise.all([
      User.findById(fromId),
      User.findById(toUserId),
    ]);

    if (!toUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const alreadyFriends = fromUser.friends.some(
      (fid) => String(fid) === toUserId
    );
    if (alreadyFriends) {
      return res.status(400).json({
        success: false,
        message: "You are already friends",
      });
    }

    const existingOutgoing = fromUser.outgoingRequests.find(
      (r) => String(r.from) === fromId && String(toUserId) // not strictly necessary
    );
    const existingIncoming = toUser.incomingRequests.find(
      (r) => String(r.from) === fromId && r.status === "pending"
    );
    if (existingOutgoing || existingIncoming) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    fromUser.outgoingRequests.push({ from: fromId });
    toUser.incomingRequests.push({ from: fromId });

    await Promise.all([fromUser.save(), toUser.save()]);

    res.json({
      success: true,
      message: "Friend request sent",
    });
  } catch (err) {
    next(err);
  }
};

// Accept / reject friend request
exports.respondToFriendRequest = async (req, res, next) => {
  try {
    const { fromUserId } = req.body;
    const { action } = req.params; // "accept" or "reject"
    const currentUserId = req.user.id;

    if (!["accept", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    const [currentUser, fromUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(fromUserId),
    ]);

    if (!fromUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const incomingReq = currentUser.incomingRequests.find(
      (r) => String(r.from) === fromUserId && r.status === "pending"
    );
    if (!incomingReq) {
      return res.status(400).json({
        success: false,
        message: "No pending request from this user",
      });
    }

    incomingReq.status = action === "accept" ? "accepted" : "rejected";

    const outgoingReq = fromUser.outgoingRequests.find(
      (r) => String(r.from) === fromUserId && r.status === "pending"
    );
    if (outgoingReq) outgoingReq.status = incomingReq.status;

    if (action === "accept") {
      if (
        !currentUser.friends.some((fid) => String(fid) === fromUserId)
      ) {
        currentUser.friends.push(fromUserId);
      }
      if (
        !fromUser.friends.some((fid) => String(fid) === currentUserId)
      ) {
        fromUser.friends.push(currentUserId);
      }
    }

    await Promise.all([currentUser.save(), fromUser.save()]);

    res.json({
      success: true,
      message: `Friend request ${action}ed`,
    });
  } catch (err) {
    next(err);
  }
};

// View & manage friends list
exports.getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "name email"
    );

    res.json({
      success: true,
      data: user.friends,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!friend) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.friends = user.friends.filter((fid) => String(fid) !== friendId);
    friend.friends = friend.friends.filter((fid) => String(fid) !== userId);

    await Promise.all([user.save(), friend.save()]);

    res.json({
      success: true,
      message: "Friend removed",
    });
  } catch (err) {
    next(err);
  }
};
