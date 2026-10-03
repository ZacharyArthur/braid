function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { slugify, titleCase };
