const express = require("express");
const { body } = require("express-validator");
const {createTag, updateTag, deleteTag, getTags, mergeTags} = require("../services/tag.service");
const {authenticate} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  createTag
);

router.put(
  "/:id",
  authenticate,
  [body("name").optional().trim().notEmpty().withMessage("Name is required")],
  updateTag
);

router.delete(
  "/:id",
  authenticate,
  deleteTag
);

router.post(
  "/merge",
  authenticate,
  [
    body("sourceId").notEmpty().withMessage("sourceId is required"),
    body("targetId").notEmpty().withMessage("targetId is required"),
  ],
  mergeTags
);

router.get("/", getTags);

module.exports = router;
