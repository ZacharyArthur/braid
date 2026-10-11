from dataclasses import dataclass


@dataclass
class Order:
    sku: str
    quantity: int
    unit_cents: int


def order_total(orders):
    """Total of a list of orders, in cents."""
    return sum(o.quantity * o.unit_cents for o in orders)


def from_dict(d):
    """Build an Order from one record of the partner feed."""
    return Order(sku=d["sku"], quantity=d["quantity"], unit_cents=d["unit_cents"])
