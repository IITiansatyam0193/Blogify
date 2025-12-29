module.exports = function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, "-");
};
