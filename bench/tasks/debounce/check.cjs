const assert = require('node:assert');
const debounce = require(require('node:path').resolve('debounce.js'));
const calls = [];
const d = debounce((x) => calls.push(x), 50);
d(1); d(2); d(3);
setTimeout(() => assert.deepStrictEqual(calls, []), 20);
setTimeout(() => { assert.deepStrictEqual(calls, [3]); console.log('ok'); }, 150);
