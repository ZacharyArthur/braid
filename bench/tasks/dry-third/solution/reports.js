function report(title, rows) {
  const lines = [title, '-'.repeat(title.length)];
  for (const r of rows) lines.push(`${r.date}  ${r.amount.toFixed(2).padStart(10)}`);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  lines.push(`Total       ${total.toFixed(2).padStart(10)}`);
  return lines.join('\n');
}

const salesReport = (rows) => report('Sales', rows);
const refundReport = (rows) => report('Refunds', rows);
const creditReport = (rows) => report('Credits', rows);

module.exports = { salesReport, refundReport, creditReport };
