import csv

with open("sales.csv", newline="") as f:
    print(sum(float(row["amount"]) for row in csv.DictReader(f)))
