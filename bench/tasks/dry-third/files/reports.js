function salesReport(rows) {
  const lines = ['Sales', '-----'];
  for (const r of rows) lines.push(`${r.date}  ${r.amount.toFixed(2).padStart(10)}`);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  lines.push(`Total       ${total.toFixed(2).padStart(10)}`);
  return lines.join('\n');
}

function refundReport(rows) {
  const lines = ['Refunds', '-------'];
  for (const r of rows) lines.push(`${r.date}  ${r.amount.toFixed(2).padStart(10)}`);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  lines.push(`Total       ${total.toFixed(2).padStart(10)}`);
  return lines.join('\n');
}

module.exports = { salesReport, refundReport };
