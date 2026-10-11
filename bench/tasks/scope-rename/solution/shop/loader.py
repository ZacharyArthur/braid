import json
from pathlib import Path

from .orders import from_dict

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def load_orders(name="orders.json"):
    """Load sample orders from the partner feed (used by the demo and the tests)."""
    return [from_dict(d) for d in json.loads((FIXTURES / name).read_text())]
