const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post.model");

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files on validation error
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(file.path, () => {});
        });
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, content, categories, tags, status, scheduledAt, visibility, coverImageUrl, themeId } = req.body;
    const media = [];

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        media.push({
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          type: file.mimetype.startsWith("image/") ? "image" : "video",
          size: file.size,
        });
      });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      categories: categories || [],
      tags: tags || [],
      status: status || "draft",
      scheduledAt,
      visibility: visibility || "public",
      coverImageUrl,
      themeId: themeId || null,
      media,
    });

    // Story 1 validation
    if (post.status === "published" && !post.isPublishable()) {
      // Delete post and files if invalid
      await Post.findByIdAndDelete(post._id);
      post.media.forEach((m) => {
        fs.unlink(`uploads/${m.filename}`, () => {});
      });
      return res.status(400).json({
        success: false,
        message: "Cannot publish a post without title and content",
      });
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const {
      title,
      content,
      categories,
      tags,
      status,
      scheduledAt,
      coverImageUrl,
      media,
      themeId,
    } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (String(post.author) !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to edit this post" });
    }

    if (req.files && req.files.length > 0) {
      // Delete existing media
      post.media.forEach((m) => {
        fs.unlink(`uploads/${m.filename}`, () => {});
      });
      
      // Add new media
      post.media = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image/") ? "image" : "video",
        size: file.size,
      }));
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (categories !== undefined) post.categories = categories;
    if (tags !== undefined) post.tags = tags;
    if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;
    if (media !== undefined) post.media = media;
    if (status !== undefined) post.status = status;
    if (scheduledAt !== undefined) post.scheduledAt = scheduledAt;
    if (themeId !== undefined) post.themeId = themeId || null;

    if (post.status === "published" && !post.isPublishable()) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish a post without title and content",
      });
    } // Story 1 validation. [file:1]

    await post.save();

    res.json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: "published" };

    const [items, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .populate("themeId")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const viewerId = req.user ? req.user.id : null;

    const post = await Post.findById(id)
      .populate("author", "name email friends")
      .populate("themeId");
    if (!post || post.status !== "published") {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Visibility check (Story 6)
    const author = post.author;
    const isAuthor = viewerId && String(author._id) === viewerId;
    const isFriend =
      viewerId && author.friends.some((fid) => String(fid) === String(viewerId));

    if (post.visibility === "private" && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: "This post is restricted. You must be the author to view this content.",
        authorId: author._id
      });
    }
    if (post.visibility === "friends" && !isAuthor && !isFriend) {
      return res.status(403).json({
        success: false,
        message: "This post is restricted. You must be a friend of the author to view this content.",
        authorId: author._id
      });
    }

    // Populate theme fallback if missing
    if (!post.themeId) {
      const Theme = require("../models/theme.model");
      const authorTheme = await Theme.findOne({ user: author._id, isActive: true });
      if (authorTheme) {
        post.themeId = authorTheme;
      }
    }

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.searchPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      keyword,
      categoryId,
      tagId,
      fromDate,
      toDate,
      sortBy, // "date" | "popularity"
    } = req.query;

    const filter = { status: "published" };

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }

    if (categoryId) {
      filter.categories = categoryId;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy === "popularity") {
      sort = { popularityScore: -1, createdAt: -1 };
    } else if (sortBy === "date") {
      sort = { createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .populate("themeId")
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

