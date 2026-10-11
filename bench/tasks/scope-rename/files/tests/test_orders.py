from shop import Order, from_dict, order_total
from shop.loader import load_orders


def test_total():
    assert order_total([Order(sku="A", qty=2, unit_cents=500)]) == 1000


def test_from_dict():
    assert from_dict({"sku": "A", "qty": 3, "unit_cents": 100}).qty == 3


def test_fixture_total():
    assert order_total(load_orders()) == 2250
