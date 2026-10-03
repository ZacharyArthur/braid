const assert = require('node:assert');
const r = require(require('node:path').resolve('reports.js'));
const rows = [{ date: '2026-01-03', amount: 12.5 }, { date: '2026-01-04', amount: 100 }];
const body = '2026-01-03       12.50\n2026-01-04      100.00\nTotal           112.50';
assert.strictEqual(r.salesReport(rows), `Sales\n-----\n${body}`);
assert.strictEqual(r.refundReport(rows), `Refunds\n-------\n${body}`);
assert.strictEqual(r.creditReport(rows), `Credits\n-------\n${body}`);
console.log('ok');
