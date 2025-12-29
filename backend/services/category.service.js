const { validationResult } = require("express-validator");
const Category = require("../models/category.model");
const Post = require("../models/post.model");
const slugify = require("../utilities/slugify");

exports.createCategory = async (req, res, next) => {
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

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      }); // no duplicates. [file:1]
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slugify(name),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (name) {
      const existing = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      category.name = name.trim();
      category.slug = slugify(name);
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inUse = await Post.exists({ categories: id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that is assigned to a post",
      }); // Story 2 negative condition. [file:1]
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// Merge categories: move posts from source to target and delete source.
exports.mergeCategories = async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.body;

    if (!sourceId || !targetId || sourceId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Valid sourceId and targetId are required",
      });
    }

    const source = await Category.findById(sourceId);
    const target = await Category.findById(targetId);

    if (!source || !target) {
      return res.status(404).json({
        success: false,
        message: "Source or target category not found",
      });
    }

    await Post.updateMany(
      { categories: sourceId },
      { $addToSet: { categories: targetId }, $pull: { categories: sourceId } }
    );

    await Category.findByIdAndDelete(sourceId);

    res.json({
      success: true,
      message: "Categories merged successfully",
    });
  } catch (err) {
    next(err);
  }
};
