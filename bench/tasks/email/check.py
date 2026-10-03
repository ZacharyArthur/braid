import sys; sys.path.insert(0, ".")
from validate import is_valid_email
for good in ["user@example.com", "first.last+tag@sub.example.org"]:
    assert is_valid_email(good), good
for bad in ["plainaddress", "@no-local.com", "two@@at.com", "spaces in@x.com", ""]:
    assert not is_valid_email(bad), bad
print("ok")
