const { validationResult } = require("express-validator");
const Theme = require("../models/theme.model");

exports.getUserThemes = async (req, res, next) => {
  try {
    const themes = await Theme.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    // Get active theme first
    const activeTheme = themes.find((theme) => theme.isActive);

    res.json({
      success: true,
      data: {
        activeTheme,
        themes,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createTheme = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      name,
      baseTheme,
      colors,
      fonts,
      logoUrl,
    } = req.body;

    const theme = await Theme.create({
      user: req.user.id,
      name: name.trim(),
      baseTheme,
      colors,
      fonts,
      logoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Theme created successfully",
      data: theme,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const theme = await Theme.findOne({ _id: id, user: req.user.id });
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    if (updates.name) theme.name = updates.name.trim();
    if (updates.baseTheme) theme.baseTheme = updates.baseTheme;
    if (updates.colors) theme.colors = { ...theme.colors, ...updates.colors };
    if (updates.fonts) theme.fonts = { ...theme.fonts, ...updates.fonts };
    if (updates.logoUrl !== undefined) theme.logoUrl = updates.logoUrl;

    await theme.save();

    res.json({
      success: true,
      message: "Theme updated successfully",
      data: theme,
    });
  } catch (err) {
    next(err);
  }
};

exports.activateTheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Deactivate all other themes for this user
    await Theme.updateMany(
      { user: req.user.id, _id: { $ne: id } },
      { isActive: false }
    );

    // Activate selected theme
    const theme = await Theme.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isActive: true },
      { new: true }
    );

    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    res.json({
      success: true,
      message: "Theme activated successfully",
      data: theme,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    const theme = await Theme.findOneAndDelete({ _id: id, user: req.user.id });
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    res.json({
      success: true,
      message: "Theme deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
