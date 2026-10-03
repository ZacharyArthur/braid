const assert = require('node:assert');
const { categoryUrl, allCategories } = require(require('node:path').resolve('categories.js'));
assert.strictEqual(categoryUrl('Hello, World!'), '/category/hello-world');
assert.strictEqual(categoryUrl('  Node.js Tips '), '/category/nodejs-tips');
assert.strictEqual(allCategories().length, 3);
console.log('ok');
