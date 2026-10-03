const { slugify, titleCase } = require('./utils/text');

function postUrl(post) {
  return `/posts/${post.id}/${slugify(post.title)}`;
}

function postHeading(post) {
  return titleCase(post.title);
}

module.exports = { postUrl, postHeading };
