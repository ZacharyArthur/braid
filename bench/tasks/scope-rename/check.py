# Hidden check: the rename reaches the fixture and the tests too, not just the dataclass.
import importlib.util, pathlib, sys; sys.path.insert(0, ".")
from shop import Order, from_dict, order_total
from shop.loader import load_orders

assert order_total([Order(sku="A", quantity=2, unit_cents=500)]) == 1000
assert from_dict({"sku": "A", "quantity": 3, "unit_cents": 100}).quantity == 3
assert order_total(load_orders()) == 2250, "fixture still uses qty"
passed = 0
for f in sorted(pathlib.Path("tests").glob("test_*.py")):
    spec = importlib.util.spec_from_file_location(f.stem, f)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for name in dir(mod):
        if name.startswith("test_"):
            getattr(mod, name)()
            passed += 1
assert passed >= 3, "tests removed"
print("ok")
