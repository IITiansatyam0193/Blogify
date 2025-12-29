const { validationResult } = require("express-validator");
const Tag = require("../models/tag.model");
const Post = require("../models/post.model");
const slugify = require("../utilities/slugify");

exports.createTag = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name } = req.body;

    const existing = await Tag.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists",
      }); // Story 2: no duplicate names. [file:1]
    }

    const tag = await Tag.create({
      name: name.trim(),
      slug: slugify(name),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tag,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    if (name) {
      const existing = await Tag.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name already exists",
        });
      }
      tag.name = name.trim();
      tag.slug = slugify(name);
    }

    await tag.save();

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: tag,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inUse = await Post.exists({ tags: id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a tag that is assigned to a post",
      }); // Story 2 negative condition. [file:1]
    }

    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({
      success: true,
      data: tags,
    });
  } catch (err) {
    next(err);
  }
};

exports.mergeTags = async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.body;

    if (!sourceId || !targetId || sourceId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Valid sourceId and targetId are required",
      });
    }

    const source = await Tag.findById(sourceId);
    const target = await Tag.findById(targetId);

    if (!source || !target) {
      return res.status(404).json({
        success: false,
        message: "Source or target tag not found",
      });
    }

    await Post.updateMany(
      { tags: sourceId },
      { $addToSet: { tags: targetId }, $pull: { tags: sourceId } }
    );

    await Tag.findByIdAndDelete(sourceId);

    res.json({
      success: true,
      message: "Tags merged successfully",
    });
  } catch (err) {
    next(err);
  }
};
