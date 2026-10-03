import re

def is_valid_email(address):
    return re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", address) is not None
