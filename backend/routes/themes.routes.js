const express = require("express");
const { body } = require("express-validator");
const {getUserThemes, createTheme, updateTheme, activateTheme, deleteTheme} = require("../services/theme.service");
const {authenticate} = require("../middlewares/auth.middleware");

const router = express.Router();

// Blogger only – Story 5. [file:1]
router.use(authenticate);

router.get("/", getUserThemes);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Theme name is required"),
    body("baseTheme")
      .optional()
      .isIn(["light", "dark", "blue", "green", "purple"])
      .withMessage("Invalid base theme"),
  ],
  createTheme
);

router.put(
  "/:id",
  [body("name").optional().trim().notEmpty().withMessage("Name required")],
  updateTheme
);

router.patch("/:id/activate", activateTheme);

router.delete("/:id", deleteTheme);

module.exports = router;
