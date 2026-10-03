const { slugify } = require('./utils/text');

const CATEGORIES = ['News', 'Node.js Tips', 'Hello, World!'];

function allCategories() {
  return [...CATEGORIES];
}

function categoryUrl(name) {
  return `/category/${slugify(name)}`;
}

module.exports = { allCategories, categoryUrl };
