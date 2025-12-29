const express = require("express");
const { body } = require("express-validator");
const {createCategory, updateCategory, deleteCategory, getCategories, mergeCategories} = require("../services/category.service");
const {authenticate} = require("../middlewares/auth.middleware");

const router = express.Router();

// Blogger/admin only – Story 2. [file:1]
router.post(
  "/",
  authenticate,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  createCategory
);

router.put(
  "/:id",
  authenticate,
  [body("name").optional().trim().notEmpty().withMessage("Name is required")],
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  deleteCategory
);

// Merge categories – Story 2 “option to merge categories”. [file:1]
router.post(
  "/merge",
  authenticate,
  [
    body("sourceId").notEmpty().withMessage("sourceId is required"),
    body("targetId").notEmpty().withMessage("targetId is required"),
  ],
  mergeCategories
);

// Public list
router.get("/", getCategories);

module.exports = router;
