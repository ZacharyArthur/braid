import re, subprocess, sys
out = subprocess.run([sys.executable, "sum_sales.py"], capture_output=True, text=True, check=True).stdout
total = float(re.findall(r"-?\d[\d,]*\.?\d*", out)[-1].replace(",", ""))
assert abs(total - 1234.50) < 0.005, out
print("ok")
