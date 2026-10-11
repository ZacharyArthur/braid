from shop import Order, from_dict, order_total
from shop.loader import load_orders


def test_total():
    assert order_total([Order(sku="A", quantity=2, unit_cents=500)]) == 1000


def test_from_dict():
    assert from_dict({"sku": "A", "quantity": 3, "unit_cents": 100}).quantity == 3


def test_fixture_total():
    assert order_total(load_orders()) == 2250
